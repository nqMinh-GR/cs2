// Step 1 of `npm run model:build`: FBX → raw GLB (geometry, UVs, node/material names).
// Uses facebookincubator/FBX2glTF via the `fbx2gltf` npm wrapper, installed on demand into
// tools/model/build/.fbx2gltf so the 35 MB tool never becomes a project dependency.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { platform } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const src = resolve(root, 'tools/model/source/source/model.fbx');
const outDir = resolve(root, 'tools/model/build');
const out = resolve(outDir, 'case-raw.glb');
const toolDir = resolve(outDir, '.fbx2gltf');
const binName = { linux: 'Linux/FBX2glTF', darwin: 'Darwin/FBX2glTF', win32: 'Windows_NT/FBX2glTF.exe' }[platform()];

if (!existsSync(src)) {
  console.error(`Missing ${src}\nDownload "CS:GO Case" by artfreex (Sketchfab, CC BY 4.0) and unzip it into tools/model/source/ — see tools/model/README.md.`);
  process.exit(1);
}
if (!binName) {
  console.error(`No FBX2glTF binary for platform ${platform()}. Convert the FBX to GLB elsewhere and save it as ${out}.`);
  process.exit(1);
}
mkdirSync(toolDir, { recursive: true });
const bin = resolve(toolDir, 'node_modules/fbx2gltf/bin', binName);
if (!existsSync(bin)) {
  console.log('Installing fbx2gltf@0.9.7-p1 into tools/model/build/.fbx2gltf …');
  execFileSync('npm', ['install', '--prefix', toolDir, '--no-save', '--no-package-lock', '--no-audit', '--no-fund', 'fbx2gltf@0.9.7-p1'], { stdio: 'inherit' });
}
const result = spawnSync(bin, ['--input', src, '--output', out, '--binary'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Wrote ${out}`);
