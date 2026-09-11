# Trưa Nay Ăn Gì 🍜

[Tiếng Việt](README.md) · **English**

**Official website: [truanayangi.com](https://truanayangi.com/)**

Can't decide what to eat for lunch? Open the **inventory**, pick a container (main dishes, drinks, sharing plates, vegetarian, desserts, street snacks, or by cuisine), unlock it and let the reel choose — a UI modelled on Counter-Strike 2's *Unlock Container* screen.

This is a static frontend: no login, no backend. Preferences (budget, vegetarian filter, your own dish list) live in browser cookies.

## Run locally

You need **Node.js 24.x** (22.12 minimum) and **npm**.

```sh
git clone https://github.com/truanayangi-com/truanayangi.git
cd truanayangi
npm install
npm run dev
```

Open [127.0.0.1:5173](http://127.0.0.1:5173). No `.env` or external services. If the port is busy: `npm run dev -- --port 5188`.

```sh
npm test          # Run checks (node --test)
npm run typecheck # TypeScript
npm run build     # Production build into dist/
npm run preview   # Preview the build at http://127.0.0.1:4173
```

## Deploy to Vercel

`vercel.json` is included (Vite framework, `npm run build`, `dist/`, cache headers, `noindex`).

1. Import the repository in Vercel (**Add New → Project**). Vite is detected automatically and npm is used because of `package-lock.json`.
2. No environment variables are needed. Node 24 comes from `engines` in `package.json`.
3. Click **Deploy** and check the preview URL before attaching a domain.

From your machine: `npx vercel@latest` (log in with your Vercel account) or `npx vercel@latest build` to validate the configuration.

## The 3D case

The container shown in the inventory and on the unlock screen is **"CS:GO Case" by artfreex** (Sketchfab, CC BY 4.0), converted to `public/models/csgo-case.v1.glb` (≈1 MB). One model serves every case; the paint is recolored per case in the browser. Without the GLB or WebGL2 the app shows the static `public/case.png` instead.

Each case carries its own badge and paint stripe (`src/lib/case-decals.ts`). The inventory tiles and the loading fallback (`public/cases/*.webp`) are exported from the app via `/?render=cases`. Rebuilding the GLB from the original FBX and exporting the images: see [tools/model/README.md](tools/model/README.md).

## Data and artwork

- Lunch dishes live in `src/lib/foods.ts` (each tagged with a `cuisine` used by the cuisine cases). Atlas photos are `public/food-*.webp` (ids 0–131); cloned stills live in `public/items/`.
- Drinks, sharing plates, desserts, street snacks and extra vegetarian dishes live in `src/lib/items/` with WebP photos when [Kho tiếp tế](https://truanayangi.com/dishes) has a sprite; local-only entries keep SVG glyphs.
- Re-clone artwork: `python3 tools/dishes/import.py` (see [tools/dishes/README.md](tools/dishes/README.md)).
- Cookies store: language, sound, per-case budget/vegetarian choices, and the "My dishes" list. Clearing cookies resets them.

## GitHub Pages and the official website

GitHub Pages only redirects to https://truanayangi.com/. Publish only `pages-redirect/` to `gh-pages`; the app source in `main` is for local use or a Vercel deployment.

## Contributing

Issues and fork PRs to `main` are welcome in Vietnamese or English, drafts included. For code changes, run `npm test` and `npm run build` when you can.

## Origin and attribution

Transferred from `nagisanzenin/truanayangi` with its Git history intact. See [ATTRIBUTION.md](ATTRIBUTION.md) for authorship, the 3D model, font and sound credits. Fan-made; not affiliated with Valve.
