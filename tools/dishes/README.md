# Clone dish photos from Kho tiếp tế

One-time import of public catalog data and sprites from https://truanayangi.com/dishes. The app does **not** call that site at runtime.

```sh
python3 tools/dishes/import.py
```

Needs Python 3 with Pillow. Writes:

- `public/food-*.webp` — lunch atlases for image ids 0–131
- `public/items/{id}-{slug}.webp` — sliced stills for drinks, snacks, extras
- `src/lib/items/drinks.ts`, `snacks.ts`, `desserts.ts`, `street-snacks.ts`, `asia-foods.ts`

`tools/dishes/cache/` holds the downloaded JS chunk and full atlases; it is gitignored.
