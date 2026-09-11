# Case model pipeline

The 3D case shown in the inventory and on the unlock screen is **"CS:GO Case" by artfreex**
(https://sketchfab.com/3d-models/csgo-case-1d0b7a108aa64a3394ae21c88b8ae23f), licensed
**CC BY 4.0**. The committed asset is `public/models/csgo-case.v1.glb` (≈1–2 MB, 1024px WebP
textures, quantized). The raw download (FBX + 4096px textures, ~57 MB) is **not** committed.

## Rebuilding the GLB

1. Log in to Sketchfab, download the model as **Source / FBX** and unzip it so that
   `tools/model/source/source/model.fbx` and `tools/model/source/textures/CSGO_Case_*.{jpeg,png}` exist.
2. `npm run model:build` — runs, in order:
   - `convert-fbx.mjs`: FBX → `tools/model/build/case-raw.glb` with facebookincubator/FBX2glTF
     (installed on demand under `tools/model/build/.fbx2gltf`, never a project dependency).
   - `pack-textures.py` (Python 3 + Pillow): 4096 → 1024px WebP; packs AO/roughness/metallic into one ORM map.
     Pass a size to override: `python3 tools/model/pack-textures.py 512`.
   - `build-glb.mjs`: attaches textures to the `CSGO_Case_Top` / `CSGO_Case_Btm` materials, quantizes, writes
     `public/models/csgo-case.v1.glb`, fails if the lid node is missing or the file exceeds 3 MB.
   - `inspect-lid.mjs`: prints node transforms; the lid `Case_Top` pivots at its own origin on the body's
     top-back edge (`rotation.x = 0` closed, negative opens). Constants live in `src/lib/case-model.ts`.
3. Bump the filename version (`csgo-case.v2.glb` + `CASE_MODEL_URL`) whenever the asset changes, because
   Vercel caches `/models/*` for a day.

## Case images (`public/cases/*.webp`)

The inventory tiles and the loading fallback use a pre-rendered picture of each tinted, decal-stamped case,
exported from the app itself so it matches the 3D model pixel for pixel:

1. `npm run dev`, then open `http://127.0.0.1:5173/?render=cases`.
2. Wait for every case image, click each `<id>.webp` link and save it into `public/cases/`.

Re-export whenever the model, the tints (`src/lib/cases.ts`) or the decals (`src/lib/case-decals.ts`) change.
Without a GLB the app still works: it shows these images (or `public/case.png` if they are missing too).
