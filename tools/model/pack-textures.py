#!/usr/bin/env python3
"""Step 2 of `npm run model:build`: shrink the 4096px PBR maps to 1024px WebP.

Per side (Top = lid, Btm = body):
  albedo  -> <side>_albedo.webp   (sRGB base color)
  normal  -> <side>_normal.webp   (OpenGL +Y, the glTF convention; no flip)
  ORM     -> <side>_orm.webp      R = ambient occlusion, G = roughness, B = metallic
"""
from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install pillow")

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "tools/model/source/textures"
OUT = ROOT / "tools/model/build/textures"
SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 1024


def load(name: str, mode: str) -> Image.Image:
    path = SRC / name
    if not path.exists():
        sys.exit(f"Missing texture {path} — see tools/model/README.md")
    return Image.open(path).convert(mode).resize((SIZE, SIZE), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for side in ("Top", "Btm"):
        albedo = load(f"CSGO_Case_{side}_albedo.jpeg", "RGB")
        albedo.save(OUT / f"{side}_albedo.webp", "WEBP", quality=85, method=6)
        normal = load(f"CSGO_Case_{side}_normal.png", "RGB")
        normal.save(OUT / f"{side}_normal.webp", "WEBP", quality=92, method=6)
        ao = load(f"CSGO_Case_{side}_AO.jpeg", "L")
        rough = load(f"CSGO_Case_{side}_roughness.jpeg", "L")
        metal = load(f"CSGO_Case_{side}_metallic.jpeg", "L")
        Image.merge("RGB", (ao, rough, metal)).save(OUT / f"{side}_orm.webp", "WEBP", quality=88, method=6)
    total = sum(p.stat().st_size for p in OUT.glob("*.webp"))
    for p in sorted(OUT.glob("*.webp")):
        print(f"{p.name:20s} {p.stat().st_size // 1024:5d} KB")
    print(f"textures total {total / 1024 / 1024:.2f} MB at {SIZE}px")


if __name__ == "__main__":
    main()
