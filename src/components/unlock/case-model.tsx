// The ONLY module that imports three / @react-three/fiber. Loaded with React.lazy from case-stage.tsx so
// the 3D chunk stays out of the initial bundle; everything else talks to it through props.
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ACESFilmicToneMapping, AmbientLight, Box3, CanvasTexture, DirectionalLight, Euler, Group, MathUtils, Mesh, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, PointLight, Scene, SRGBColorSpace, Texture, Vector3, WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { drawBadge, drawStripe, type CaseDecal } from '@/lib/case-decals';
import { LID_NODE, LID_OPEN_DELTA, SOURCE_HUE, CASE_REST_Y as REST_Y, CASE_TILT_X as TILT_X, type CaseInspect } from '@/lib/case-model';
import { tintAlbedo } from '@/lib/tint-albedo';
import type { Phase } from '@/lib/unlock-state';

export type CaseModelProps = {
  url: string;
  /** Target hue for the yellow paint; SOURCE_HUE leaves the original texture untouched. */
  hue: number;
  /** Front-panel badge + stripe; omitted = plain case. */
  decal?: CaseDecal;
  phase: Phase;
  startedAt: number;
  reducedMotion: boolean;
  frameloop: 'always' | 'demand';
  onReady: () => void;
  onError: (error: unknown) => void;
  /** Vertical offset of the case in world units (the camera sees ≈2 units); negative moves it down. */
  caseY?: number;
  /** Longest side of the case in world units (the camera sees ≈2 units vertically). */
  fit?: number;
  /** Idle inspect: drag to rotate, tap to rattle. Shared with the DOM hit target. */
  inspect?: RefObject<CaseInspect>;
};

const IDLE_SPIN = 0.1;
/** Default longest side of the fitted case in world units (inventory preview, exported images). */
const FIT_SIZE = 1.45;
const DEFAULT_CASE_Y = -0.15;
/** While opening, the case drifts down a little so the rising lid stays inside the frame. */
const OPEN_DROP = 0.35;
const OPEN_TILT_X = 0.5;
const CAMERA = { fov: 32, position: [0, 0.5, 3.5] as [number, number, number] };

const tintCache = new Map<string, HTMLCanvasElement>();

function tintedTexture(original: Texture, hue: number): Texture {
  const image = original.image as (CanvasImageSource & { width?: number; height?: number }) | null;
  if (!image || hue === SOURCE_HUE) return original;
  const width = Number(image.width ?? 1024), height = Number(image.height ?? 1024);
  const key = `${original.uuid}:${hue}`;
  let canvas = tintCache.get(key);
  if (!canvas) { canvas = tintAlbedo(image, width, height, hue); tintCache.set(key, canvas); }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = original.flipY;
  texture.wrapS = original.wrapS; texture.wrapT = original.wrapT;
  texture.channel = original.channel;
  texture.anisotropy = original.anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

type BuiltCase = { fitted: Group; lid: Group | null; lidClosed: number; dispose: () => void };

/**
 * Clone the loaded scene with its own (optionally tinted) materials, hang the lid on a hinge at the body's
 * top-back edge, close it, stamp the case's decals on the front panel and fit everything into a `fit` box.
 */
function buildCase(gltf: GLTF, hue: number, fit = FIT_SIZE, decal?: CaseDecal): BuiltCase {
  const root = gltf.scene.clone(true);
  const owned: { materials: MeshStandardMaterial[]; textures: Texture[]; meshes: Mesh[] } = { materials: [], textures: [], meshes: [] };
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const source = object.material as MeshStandardMaterial;
    const material = source.clone();
    if (material.map) { const tinted = tintedTexture(material.map, hue); if (tinted !== material.map) { material.map = tinted; owned.textures.push(tinted); } }
    object.material = material;
    owned.materials.push(material);
  });
  // The FBX poses the lid partly open (−30° about X) and hinged at the body's top-back edge, but the quantizer
  // moved the lid's origin to the plate's centre. Rebuild that hinge from the body's bounds, hang the lid on a
  // pivot there and rotate back by the authored angle so it lies flat (closed).
  let lid: Group | null = null;
  let lidClosed = 0;
  let body: Mesh | null = null;
  const lidNode = root.getObjectByName(LID_NODE);
  if (lidNode?.parent) {
    root.updateMatrixWorld(true);
    const parent = lidNode.parent;
    const bodyNode = parent.children.find((child) => child !== lidNode && !['Lock', 'Fastener'].includes(child.name) && child.getObjectByProperty('type', 'Mesh'));
    body = (bodyNode?.getObjectByProperty('type', 'Mesh') as Mesh | undefined) ?? null;
    const box = new Box3().setFromObject(bodyNode ?? lidNode);
    const lidBox = new Box3().setFromObject(lidNode);
    const hinge = bodyNode ? new Vector3((box.min.x + box.max.x) / 2, box.max.y, box.min.z) : new Vector3((lidBox.min.x + lidBox.max.x) / 2, lidBox.min.y, lidBox.min.z);
    const pivot = new Group();
    pivot.position.copy(parent.worldToLocal(hinge.clone()));
    parent.add(pivot);
    pivot.attach(lidNode);
    lidClosed = -lidNode.rotation.x;
    pivot.rotation.x = lidClosed;
    lid = pivot;
  }
  root.updateMatrixWorld(true);
  // Decals are projected onto the body's front face (max z) in the clone's space, which is still identity here.
  if (decal && body) {
    const box = new Box3().setFromObject(body);
    const center = box.getCenter(new Vector3());
    const width = box.max.x - box.min.x, height = box.max.y - box.min.y;
    const stamp = (canvas: HTMLCanvasElement, position: Vector3, rotationZ: number, size: Vector3) => {
      const texture = canvasTexture(canvas);
      const material = new MeshStandardMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: 0.75, metalness: 0.05 });
      const mesh = new Mesh(new DecalGeometry(body!, position, new Euler(0, 0, rotationZ), size), material);
      root.add(mesh);
      owned.textures.push(texture); owned.materials.push(material); owned.meshes.push(mesh);
    };
    stamp(drawBadge(decal), new Vector3(center.x - width * 0.01, center.y + height * 0.03, box.max.z), 0, new Vector3(width * 0.3, width * 0.3, height * 0.8));
    stamp(drawStripe(decal), new Vector3(center.x + width * 0.36, center.y, box.max.z), -0.5, new Vector3(width * 0.16, height * 2.2, height * 0.8));
  }
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const scale = fit / Math.max(size.x, size.y, size.z, 1e-6);
  const fitted = new Group();
  fitted.add(root);
  root.position.copy(center).multiplyScalar(-scale);
  root.scale.setScalar(scale);
  const dispose = () => { owned.meshes.forEach((m) => m.geometry.dispose()); owned.materials.forEach((m) => m.dispose()); owned.textures.forEach((t) => t.dispose()); };
  return { fitted, lid, lidClosed, dispose };
}

const easeOutBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const nearestTurn = (current: number, target: number) => target + Math.round((current - target) / (Math.PI * 2)) * Math.PI * 2;

function addLights(scene: Scene) {
  const key = new DirectionalLight('#fff2d6', 2.6); key.position.set(3, 4, 5);
  const fill = new DirectionalLight('#dfe8ff', 0.9); fill.position.set(-4, 2, 3);
  const rim = new DirectionalLight('#7fb0ff', 0.8); rim.position.set(-3, 1, -2);
  scene.add(new AmbientLight('#ffffff', 0.9), key, fill, rim);
}

export type CaseImageDef = { id: string; hue: number; decal?: CaseDecal };

/** Offscreen render of every case (closed, 3/4 view, transparent) → data URLs. Used to export public/cases/*.webp. */
export function renderCaseImages(gltf: GLTF, defs: CaseImageDef[], width = 768, height = 576): Record<string, string> {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 1.1;
  addLights(scene);
  const camera = new PerspectiveCamera(CAMERA.fov, width / height, 0.1, 20);
  camera.position.set(...CAMERA.position);
  camera.lookAt(0, 0, 0);
  const out: Record<string, string> = {};
  for (const def of defs) {
    const { fitted, dispose } = buildCase(gltf, def.hue, 1.6, def.decal);
    fitted.rotation.set(TILT_X, REST_Y, 0);
    fitted.position.y = -0.08;
    scene.add(fitted);
    renderer.render(scene, camera);
    try { out[def.id] = renderer.domElement.toDataURL('image/webp', 0.92); } catch { /* unsupported: skip */ }
    scene.remove(fitted);
    dispose();
  }
  environment.dispose(); pmrem.dispose();
  renderer.dispose(); renderer.forceContextLoss();
  return out;
}

/** Dev helper page (`?render=cases`): shows the exported images with download links. */
export function CaseSheet({ url, defs }: { url: string; defs: CaseImageDef[] }) {
  const gltf = useLoader(GLTFLoader, url);
  const [images, setImages] = useState<Record<string, string>>({});
  useEffect(() => { setImages(renderCaseImages(gltf, defs)); }, [gltf, defs]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, padding: 24 }}>
      {defs.map((def) => (
        <figure key={def.id} style={{ margin: 0, background: '#1a2028', padding: 8 }}>
          {images[def.id] && <img src={images[def.id]} alt={def.id} data-case-id={def.id} style={{ width: '100%', display: 'block' }} />}
          <figcaption style={{ fontSize: 12, marginTop: 6 }}>{images[def.id] ? <a href={images[def.id]} download={`${def.id}.webp`} style={{ color: '#f5c542' }}>{def.id}.webp</a> : `${def.id} — rendering…`}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Environment() {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 1.1;
    invalidate();
    return () => { scene.environment = null; environment.dispose(); pmrem.dispose(); };
  }, [gl, scene, invalidate]);
  return null;
}

function CaseMesh({ url, hue, decal, phase, startedAt, reducedMotion, onReady, caseY = DEFAULT_CASE_Y, fit = FIT_SIZE, inspect }: Omit<CaseModelProps, 'frameloop' | 'onError'>) {
  const gltf = useLoader(GLTFLoader, url);
  const built = useMemo(() => buildCase(gltf, hue, fit, decal), [gltf, hue, fit, decal]);
  useEffect(() => () => built.dispose(), [built]);
  const pivot = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const invalidate = useThree((state) => state.invalidate);

  // Report readiness from the first rendered frame so the fallback image only fades once pixels exist.
  const announced = useRef(false);
  useLayoutEffect(() => { announced.current = false; }, [built]);
  useEffect(() => { invalidate(); }, [phase, hue, invalidate]);
  useEffect(() => {
    if (!inspect) return;
    inspect.current.invalidate = invalidate;
    return () => { inspect.current.invalidate = undefined; };
  }, [inspect, invalidate]);

  useFrame((_, delta) => {
    const group = pivot.current;
    if (!group) return;
    if (!announced.current) { announced.current = true; onReady(); }
    const dt = Math.min(delta, 0.05);
    const lid = built.lid;
    const closed = built.lidClosed;
    const busy = phase === 'unlocking' || phase === 'spinning' || phase === 'settled';
    if (!busy) {
      const pose = inspect?.current;
      if (pose) {
        if (!pose.dragging) {
          pose.velY *= Math.exp(-2.8 * dt);
          pose.velX *= Math.exp(-3.4 * dt);
          pose.rotY += pose.velY * dt;
          pose.rotX = MathUtils.clamp(pose.rotX + pose.velX * dt, -0.55, 0.7);
          if (!pose.touched && !reducedMotion) pose.rotY += dt * IDLE_SPIN;
          pose.rotX = MathUtils.damp(pose.rotX, TILT_X, pose.touched ? 1.15 : 6, dt);
        }
        pose.shake *= Math.exp(-7 * dt);
        group.rotation.y = pose.rotY;
        group.rotation.x = pose.rotX;
        group.rotation.z = pose.shake > 0.02 ? Math.sin(performance.now() * 0.055) * 0.05 * pose.shake : MathUtils.damp(group.rotation.z, 0, 10, dt);
        group.position.y = MathUtils.damp(group.position.y, pose.dragging ? 0.045 : 0, 8, dt);
        group.scale.setScalar(MathUtils.damp(group.scale.x, 1, 6, dt));
        if (lid) lid.rotation.x = MathUtils.damp(lid.rotation.x, closed, 8, dt);
        if (light.current) light.current.intensity = MathUtils.damp(light.current.intensity, 0, 8, dt);
        return;
      }
      if (!reducedMotion) group.rotation.y += dt * IDLE_SPIN;
      group.rotation.x = MathUtils.damp(group.rotation.x, TILT_X, 6, dt);
      group.rotation.z = MathUtils.damp(group.rotation.z, 0, 8, dt);
      group.position.y = MathUtils.damp(group.position.y, 0, 6, dt);
      group.scale.setScalar(MathUtils.damp(group.scale.x, 1, 6, dt));
      if (lid) lid.rotation.x = MathUtils.damp(lid.rotation.x, closed, 8, dt);
      if (light.current) light.current.intensity = MathUtils.damp(light.current.intensity, 0, 8, dt);
      return;
    }
    const t = performance.now() - startedAt;
    if (reducedMotion) { group.rotation.y = MathUtils.damp(group.rotation.y, nearestTurn(group.rotation.y, REST_Y), 6, dt); return; }
    // 0–1200 ms: settle to the 3/4 front view and grow slightly.
    group.rotation.y = MathUtils.damp(group.rotation.y, nearestTurn(group.rotation.y, REST_Y), 4, dt);
    group.scale.setScalar(1 + 0.04 * easeInOut(MathUtils.clamp(t / 1200, 0, 1)));
    // 1100–1500 ms: a quick rattle before the latch gives.
    group.rotation.z = t > 1100 && t < 1500 ? Math.sin(t * 0.06) * 0.018 * (1 - (t - 1100) / 400) : 0;
    // 1500–2100 ms: the lid swings open on its hinge, the case tips toward the camera, the interior lights up.
    const open = MathUtils.clamp((t - 1500) / 600, 0, 1);
    if (lid) lid.rotation.x = closed + LID_OPEN_DELTA * (open > 0 ? easeOutBack(open) : 0);
    group.rotation.x = TILT_X + (OPEN_TILT_X - TILT_X) * easeInOut(open);
    group.position.y = -OPEN_DROP * easeInOut(MathUtils.clamp((t - 1200) / 900, 0, 1));
    if (light.current) light.current.intensity = 7 * open;
  });

  return (
    <group position={[0, caseY, 0]}>
      <group ref={pivot} rotation={[TILT_X, REST_Y, 0]}>
        <primitive object={built.fitted} />
        <pointLight ref={light} color="#ffd27a" position={[0, 0.55, 0.35]} intensity={0} distance={4} decay={2} />
      </group>
    </group>
  );
}

export default function CaseModel(props: CaseModelProps) {
  const { frameloop, onError } = props;
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={frameloop}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={CAMERA}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); onError(new Error('WebGL context lost')); }); }}
    >
      <Environment />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.6} color="#fff2d6" />
      <directionalLight position={[-4, 2, 3]} intensity={0.9} color="#dfe8ff" />
      <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#7fb0ff" />
      <spotLight position={[0, 3.2, 2.2]} angle={0.55} penumbra={0.7} intensity={4} color="#ffffff" />
      <CaseMesh {...props} />
    </Canvas>
  );
}
