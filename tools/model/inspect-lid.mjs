// Step 4 of `npm run model:build`: print node transforms and mesh bounds so the lid constants in
// src/lib/case-model.ts can be checked. The lid (Case_Top) pivots at its own origin, which sits on the
// body's top-back edge: rotation.x = 0 is closed, negative X rotation opens it.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const file = process.argv[2] ? resolve(process.argv[2]) : resolve(root, 'public/models/csgo-case.v1.glb');
if (!existsSync(file)) { console.error(`Missing ${file}`); process.exit(1); }

const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(file);
const fmt = (v) => `[${v.map((x) => Number(x.toFixed(4))).join(', ')}]`;
const eulerX = (q) => Number((2 * Math.atan2(q[0], q[3])).toFixed(3)); // X-only quaternions

for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  const line = [`${node.getName().padEnd(10)} t=${fmt(node.getTranslation())} rotX=${eulerX(node.getRotation())}rad s=${fmt(node.getScale())}`];
  if (mesh) {
    const position = mesh.listPrimitives()[0]?.getAttribute('POSITION');
    if (position) line.push(`  bbox min=${fmt(position.getMin([]))} max=${fmt(position.getMax([]))} verts=${position.getCount()}`);
  }
  console.log(line.join('\n'));
}
const lid = doc.getRoot().listNodes().find((node) => node.getName() === 'Case_Top');
if (lid) console.log(`\nCase_Top rest rotation.x = ${eulerX(lid.getRotation())} rad (0 = closed). src/lib/case-model.ts uses LID_CLOSED_X / LID_OPEN_X.`);
