// Step 3 of `npm run model:build`: attach the packed WebP textures to the raw GLB, quantize,
// and write public/models/csgo-case.v1.glb. No Draco/meshopt/KTX2 → three's GLTFLoader needs no decoders.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, prune, quantize } from '@gltf-transform/functions';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const raw = resolve(root, 'tools/model/build/case-raw.glb');
const texDir = resolve(root, 'tools/model/build/textures');
const out = resolve(root, 'public/models/csgo-case.v1.glb');
const SIZE_LIMIT = 3 * 1024 * 1024;
const REQUIRED_NODES = ['Case_Btm', 'Case_Top'];

for (const file of [raw, `${texDir}/Top_albedo.webp`, `${texDir}/Btm_albedo.webp`]) {
  if (!existsSync(file)) { console.error(`Missing ${file} — run the previous model:build steps first.`); process.exit(1); }
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(raw);
const gltfRoot = doc.getRoot();

// FBX2glTF emits a 1×1 placeholder normal map for the unresolved external textures; drop it.
for (const texture of gltfRoot.listTextures()) texture.dispose();
doc.createExtension(EXTTextureWebP).setRequired(true);

const texture = (name) => doc.createTexture(name).setImage(readFileSync(resolve(texDir, `${name}.webp`))).setMimeType('image/webp');

let assigned = 0;
for (const material of gltfRoot.listMaterials()) {
  const side = /top/i.test(material.getName()) ? 'Top' : /btm|bottom/i.test(material.getName()) ? 'Btm' : null;
  if (!side) { console.warn(`Skipping material ${material.getName()} (no Top/Btm in its name)`); continue; }
  const orm = texture(`${side}_orm`);
  material
    .setBaseColorTexture(texture(`${side}_albedo`)).setBaseColorFactor([1, 1, 1, 1])
    .setNormalTexture(texture(`${side}_normal`))
    .setMetallicRoughnessTexture(orm).setMetallicFactor(1).setRoughnessFactor(1)
    .setOcclusionTexture(orm);
  assigned++;
}
if (assigned !== 2) { console.error(`Expected 2 materials (Top/Btm), textured ${assigned}.`); process.exit(1); }

await doc.transform(dedup(), prune(), quantize());
await io.write(out, doc);

const names = gltfRoot.listNodes().map((node) => node.getName());
const missing = REQUIRED_NODES.filter((name) => !names.includes(name));
const size = statSync(out).size;
console.log(`nodes: ${names.join(', ')}`);
console.log(`materials: ${gltfRoot.listMaterials().map((m) => m.getName()).join(', ')}`);
console.log(`extensions: ${gltfRoot.listExtensionsUsed().map((e) => e.extensionName).join(', ')}`);
console.log(`wrote ${out} (${(size / 1024 / 1024).toFixed(2)} MB)`);
if (missing.length) { console.error(`Missing required nodes: ${missing.join(', ')}`); process.exit(1); }
if (size > SIZE_LIMIT) { console.error(`GLB is over 3 MB — rerun pack-textures.py with 512 and build again.`); process.exit(1); }
