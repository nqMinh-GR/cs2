#!/usr/bin/env python3
"""One-time clone of truanayangi.com dish photos + extras into this repo.

Reads the public dishes page JS bundle (no runtime API client), downloads atlas
WebP files, slices sprites for image ids >= 132 into public/items/, copies the
0–131 lunch atlases into public/, and writes generated item TypeScript.
"""
from __future__ import annotations

import json
import re
import unicodedata
import urllib.request
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path(__file__).resolve().parent / "cache"
PUBLIC = ROOT / "public"
ITEMS_DIR = PUBLIC / "items"
ORIGIN = "https://truanayangi.com"
UA = "truanayangi-community-clone/1.0"

# Local authored items kept when the site has no counterpart.
# Filled from the TS sources at runtime via a tiny parse of name: '...'

ALIASES = {
    "nuoc dua tuoi": "nuoc dua",
    "cold brew": "ca phe u lanh",
    "chocolate da": "cacao sua",
    "sam bi dao": "nuoc sam",
    "bap xao tep": "bap xao tom kho",
    "dau phong rang toi ot": "lac rang",
}


def dec(s: str) -> str:
    out: list[str] = []
    i = 0
    while i < len(s):
        if s.startswith("\\x", i) and i + 4 <= len(s):
            try:
                out.append(chr(int(s[i + 2 : i + 4], 16)))
                i += 4
                continue
            except ValueError:
                pass
        if s.startswith("\\u", i) and i + 6 <= len(s):
            try:
                out.append(chr(int(s[i + 2 : i + 6], 16)))
                i += 6
                continue
            except ValueError:
                pass
        out.append(s[i])
        i += 1
    return "".join(out)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.replace("đ", "d").replace("Đ", "D").lower().strip()


def slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", norm(name)).strip("-")
    return s or "item"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read()


def discover_chunk_url() -> str:
    html = fetch(f"{ORIGIN}/dishes").decode("utf-8", "replace")
    m = re.search(r"/_next/static/chunks/687-[a-f0-9]+\.js", html)
    if not m:
        raise SystemExit("could not find dishes catalog chunk in /dishes HTML")
    return ORIGIN + m.group(0)


def parse_items(js: str) -> dict[int, dict]:
    en_map = {
        int(i): (dec(vi), dec(en))
        for i, vi, en in re.findall(
            r'(\d+):\{vi:"((?:\\.|[^"\\])*)",en:"((?:\\.|[^"\\])*)"', js
        )
    }
    items: dict[int, dict] = {}
    for body in re.findall(r"\{([^{}]{20,500})\}", js):
        if 'name:"' not in body or "price:" not in body or "image:" not in body:
            continue

        def grab(key: str, default=None):
            mm = re.search(rf'{key}:"((?:\\.|[^"\\])*)"', body)
            if mm:
                return dec(mm.group(1))
            mm = re.search(rf"{key}:(\d+)", body)
            if mm:
                return int(mm.group(1))
            mm = re.search(rf"{key}:(!0|!1|true|false)", body)
            if mm:
                return mm.group(1) in ("!0", "true")
            return default

        name = grab("name")
        image = grab("image")
        price = grab("price")
        if not isinstance(name, str) or not isinstance(image, int) or not isinstance(price, int):
            continue
        kind = grab("kind")
        category = grab("category")
        items[image] = {
            "name": name,
            "sub": grab("sub") or "",
            "price": price,
            "image": image,
            "category": category,
            "kind": kind,
            "veg": grab("veg"),
            "quip": grab("quip") or "",
            "nameEn": en_map.get(image, (None, None))[1],
        }
    return items


def parse_optimized(js: str) -> dict[str, str]:
    pairs = re.findall(
        r'"(food-[^"]+|drink-[^"]+|snack-[^"]+|nhau-[^"]+)":\{oneX:"([^"]+)",twoX:"([^"]+)"\}',
        js,
    )
    return {k: b for k, _one, b in pairs}


def atlas_cell(image: int) -> tuple[str, int, int, int, int] | None:
    """atlas name, cols, rows, col, row — None for core 0–131 (kept as sheets)."""
    e = image
    if 500 <= e <= 547:
        n = (e - 500) % 12
        a = (e - 500) // 12
        return f"drink-{2 + a}", 4, 3, n % 4, n // 4
    if 400 <= e <= 447:
        n = (e - 400) % 12
        a = (e - 400) // 12
        return f"nhau-{a}", 4, 3, n % 4, n // 4
    if 168 <= e <= 183:
        n = (e - 168) % 4
        a = (e - 168) // 4
        names = ["food-chinese-0", "food-korean-0", "food-japanese-0", "food-indian-0"]
        return names[a], 2, 2, n % 2, n // 2
    if 300 <= e <= 383:
        n = (e - 300) % 12
        a = (e - 300) // 12
        return f"snack-vietnam-{a}", 4, 3, n % 4, n // 4
    if 156 <= e <= 167:
        n = e - 156
        return "snack-0", 4, 3, n % 4, n // 4
    if 132 <= e <= 155:
        n = (e - 132) % 12
        a = (e - 132) // 12
        return f"drink-{a}", 4, 3, n % 4, n // 4
    return None


CORE_ATLASES = [f"food-hd-{i}" for i in range(9)] + [f"food-expanded-{i}" for i in range(3)] + [
    f"food-lunch-{i}" for i in range(4)
] + ["food-common-0"]


def download_atlas(name: str, optimized: dict[str, str]) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    dest = CACHE / f"{name}.webp"
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    urls = [f"{ORIGIN}/{name}.webp"]
    if name in optimized:
        urls.append(ORIGIN + optimized[name])
    last_err = None
    for url in urls:
        try:
            data = fetch(url)
            if len(data) < 500 or data[:4] != b"RIFF":
                continue
            dest.write_bytes(data)
            print(f"  atlas {name} {len(data)} bytes from {url}")
            return dest
        except Exception as exc:  # noqa: BLE001
            last_err = exc
    raise SystemExit(f"failed to download atlas {name}: {last_err}")


def crop_sprite(atlas: Path, cols: int, rows: int, col: int, row: int) -> Image.Image:
    im = Image.open(atlas).convert("RGBA")
    w, h = im.size
    cw, ch = w / cols, h / rows
    box = (round(col * cw), round(row * ch), round((col + 1) * cw), round((row + 1) * ch))
    sprite = im.crop(box)
    # Fit onto a square canvas so reel/grid stay 1:1.
    side = max(sprite.size)
    canvas = Image.new("RGBA", (side, side), (20, 24, 28, 255))
    ox, oy = (side - sprite.size[0]) // 2, (side - sprite.size[1]) // 2
    canvas.paste(sprite, (ox, oy), sprite)
    return canvas.resize((512, 512), Image.Resampling.LANCZOS)


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def icon_for(item: dict, local_icon: str | None) -> str:
    if local_icon:
        return local_icon
    name = norm(item["name"])
    cat = item.get("category") or ""
    if name.startswith("nuoc dua") or name == "nuoc dua":
        return "coconut"
    if "cold brew" in name or "u lanh" in name:
        return "coldbrew"
    if any(k in name for k in ("latte", "cappuccino", "espresso", "americano")):
        return "mug"
    if "bia" in name and "lon" in name:
        return "can"
    if "chai" in name or "loc dong" in name:
        return "bottle"
    if name.startswith("oc ") or "ngheu" in name or name.startswith("so diep") or name.startswith("so huyet") or "hau sua" in name:
        return "shell"
    if "muc" in name or "tom " in name:
        return "fish" if "muc" in name else "skewer"
    if "khoai tay chien" in name or "fries" in name:
        return "fries"
    if "dau hu" in name or "tofu" in name:
        return "tofu"
    if "chan ga" in name:
        return "wing"
    if "nem" in name or "cuon" in name:
        return "roll"
    mapping = {
        "coffee": "cup",
        "milk-tea": "boba",
        "tea": "teacup",
        "juice": "juice",
        "smoothie": "smoothie",
        "refreshments": "glass",
        "matcha-cocoa": "mug",
        "milk": "cup",
        "yogurt": "cup",
        "blended": "smoothie",
        "soda": "glass",
        "snack-savoury": "plate",
        "snack-sweet": "plate",
        "snack-light": "peanut",
        "snack-fruit": "plate",
        "nhau-vegetables": "plate",
        "nhau-fried": "fries",
        "nhau-meat": "plate",
        "rice": "rice",
        "noodles": "noodles",
        "hotpot": "hotpot",
        "bread": "plate",
        "grill": "plate",
    }
    return mapping.get(cat, "plate")


def veg_for(item: dict) -> bool | None:
    if item.get("veg") is True:
        return True
    if item.get("veg") is False:
        return False
    cat = item.get("category") or ""
    kind = item.get("kind")
    if kind == "nhau":
        return cat == "nhau-vegetables"
    if kind == "snack":
        return cat in ("snack-sweet", "snack-fruit", "snack-light")
    if item.get("category") in (
        "coffee",
        "tea",
        "juice",
        "smoothie",
        "refreshments",
        "milk-tea",
        "matcha-cocoa",
        "milk",
        "yogurt",
        "blended",
        "soda",
    ):
        return True
    return None


def sub_en(sub: str) -> str:
    s = sub
    repl = [
        ("Một ly", "One glass"),
        ("Một phần", "One serving"),
        ("kèm cơm", "with rice"),
        ("Kèm cơm", "With rice"),
        ("Trung Quốc", "China"),
        ("Hàn Quốc", "Korea"),
        ("Nhật Bản", "Japan"),
        ("Nam Ấn Độ", "South India"),
        ("Bắc Ấn Độ", "North India"),
        ("Việt Nam", "Vietnam"),
    ]
    for a, b in repl:
        s = s.replace(a, b)
    return s


EN_FALLBACK = {
    "Cà phê đen đá": "Black iced coffee",
    "Cà phê sữa đá": "Iced milk coffee",
    "Bạc xỉu": "Bac xiu",
    "Latte": "Latte",
    "Trà sữa trân châu": "Bubble milk tea",
    "Trà sữa ô long": "Oolong milk tea",
    "Matcha latte": "Matcha latte",
    "Trà sữa Thái": "Thai milk tea",
    "Trà đào cam sả": "Peach lemongrass tea",
    "Trà vải": "Lychee tea",
    "Trà chanh": "Lime iced tea",
    "Trà tắc": "Kumquat iced tea",
    "Nước ép cam": "Orange juice",
    "Nước ép dưa hấu": "Watermelon juice",
    "Nước ép dứa": "Pineapple juice",
    "Nước ép ổi": "Guava juice",
    "Sinh tố bơ": "Avocado smoothie",
    "Sinh tố xoài": "Mango smoothie",
    "Sinh tố dâu": "Strawberry smoothie",
    "Sinh tố chuối": "Banana smoothie",
    "Nước dừa": "Fresh coconut",
    "Nước mía": "Sugarcane juice",
    "Sữa đậu nành": "Soy milk",
    "Nước sâm": "Herbal cooling tea",
    "Bánh tráng trộn": "Mixed rice paper salad",
    "Cá viên chiên": "Fried fish balls",
    "Nem chua rán": "Fried fermented pork rolls",
    "Khoai tây chiên": "French fries",
    "Takoyaki": "Takoyaki",
    "Bánh flan": "Flan",
    "Chè đậu đen": "Black bean sweet soup",
    "Bánh trứng nướng": "Baked egg tart",
    "Bánh cheesecake": "Cheesecake",
    "Trái cây dầm": "Crushed fruit cup",
    "Sữa chua nếp cẩm": "Yogurt with black sticky rice",
    "Hạt điều rang": "Roasted cashews",
    "Cơm đậu hũ Mapo": "Mapo tofu rice",
    "Cơm gà Kung Pao": "Kung Pao chicken rice",
    "Mì Dan Dan Tứ Xuyên": "Sichuan dan dan noodles",
    "Cháo thịt nạc trứng bắc thảo": "Pork congee with century egg",
    "Cơm heo xào cay Jeyuk": "Jeyuk spicy pork rice",
    "Gà hầm sâm Samgyetang": "Samgyetang ginseng chicken",
    "Canh sườn bò Galbitang kèm cơm": "Galbitang short-rib soup",
    "Mì Kalguksu hải sản": "Seafood kalguksu",
    "Cơm cuộn trứng Omurice": "Omurice",
    "Cơm heo xào gừng Shogayaki": "Shogayaki ginger pork rice",
    "Cơm thịt băm Hambagu": "Hambagu rice",
    "Cơm trà cá hồi Ochazuke": "Salmon ochazuke",
    "Masala dosa": "Masala dosa",
    "Chole bhature": "Chole bhature",
    "Palak paneer kèm cơm": "Palak paneer with rice",
    "Gà tandoori kèm naan": "Tandoori chicken with naan",
    "Bánh tráng nướng": "Grilled rice paper",
    "Bánh tráng cuốn": "Rice-paper rolls",
    "Bánh tráng bơ": "Butter rice paper",
    "Bột chiên": "Fried rice flour cake",
    "Há cảo tôm": "Shrimp har gow",
    "Sủi cảo chiên": "Fried dumplings",
    "Bánh gối": "Fried pillow pastry",
    "Bánh rán mặn": "Savoury fried puff",
    "Bánh giò": "Banh gio",
    "Bánh đúc nóng": "Hot banh duc",
    "Bánh bèo": "Banh beo",
    "Bánh bột lọc": "Banh bot loc",
    "Bánh nậm": "Banh nam",
    "Bánh khọt": "Banh khot",
    "Bắp xào tôm khô": "Corn with dried shrimp",
    "Bắp nướng mỡ hành": "Grilled corn with scallion oil",
    "Bắp luộc": "Boiled corn",
    "Khoai lang nướng": "Roasted sweet potato",
    "Khoai lang kén": "Sweet-potato fries",
    "Phô mai que": "Cheese sticks",
    "Xúc xích nướng": "Grilled sausage",
    "Chân gà sả tắc": "Lemongrass kumquat chicken feet",
    "Chân gà nướng": "Grilled chicken feet",
    "Trứng cút lộn xào me": "Tamarind quail eggs",
    "Ốc luộc": "Boiled snails",
    "Ốc xào dừa": "Snails in coconut milk",
    "Sò điệp nướng mỡ hành": "Grilled scallops with scallion oil",
    "Khô gà lá chanh": "Lime-leaf dried chicken",
    "Khô bò sợi": "Dried beef shreds",
    "Mực rim me": "Squid in tamarind sauce",
    "Chuối chiên": "Fried banana",
    "Bánh cam": "Sesame balls",
    "Bánh tiêu": "Hollow fried bread",
    "Bánh bò hấp": "Steamed banh bo",
    "Bánh bò nướng": "Baked banh bo",
    "Bánh da lợn": "Layered pandan cake",
    "Bánh khoai mì nướng": "Baked cassava cake",
    "Bánh chuối hấp": "Steamed banana cake",
    "Bánh su kem": "Cream puffs",
    "Bông lan trứng muối": "Salted-egg sponge cake",
    "Chè bưởi": "Pomelo sweet soup",
    "Chè Thái": "Thai mixed sweet soup",
    "Chè ba màu": "Three-colour che",
    "Chè đậu xanh": "Mung-bean sweet soup",
    "Chè đậu đỏ": "Red-bean sweet soup",
    "Chè trôi nước": "Sticky rice balls in ginger syrup",
    "Chè khoai dẻo": "Chewy potato sweet soup",
    "Chè sương sa hạt lựu": "Agar jelly sweet soup",
    "Tào phớ": "Tofu pudding",
    "Sữa chua mít": "Jackfruit yogurt",
    "Kem dừa": "Coconut ice cream",
    "Kem xôi": "Sticky-rice ice cream",
    "Kem chuối": "Banana ice cream",
    "Bánh đúc lá dứa": "Pandan banh duc",
    "Đậu phộng rang": "Roasted peanuts",
    "Hạt hướng dương": "Sunflower seeds",
    "Hạt bí rang": "Roasted pumpkin seeds",
    "Hạt dẻ rang": "Roasted chestnuts",
    "Rong biển sấy": "Roasted seaweed",
    "Đậu nành rang": "Roasted soybeans",
    "Dưa hấu": "Watermelon",
    "Dưa lưới": "Melon",
    "Ổi": "Guava",
    "Xoài chín": "Ripe mango",
    "Cóc": "Hog plum",
    "Thơm (dứa)": "Pineapple",
    "Bưởi": "Pomelo",
    "Cam": "Orange",
    "Quýt": "Mandarin",
    "Thanh long": "Dragon fruit",
    "Đu đủ": "Papaya",
    "Chuối": "Banana",
    "Mít": "Jackfruit",
    "Sầu riêng": "Durian",
    "Măng cụt": "Mangosteen",
    "Chôm chôm": "Rambutan",
    "Nhãn": "Longan",
    "Vải": "Lychee",
    "Mãng cầu ta (na)": "Custard apple",
    "Sapoche": "Sapodilla",
    "Vú sữa": "Star apple",
    "Nho": "Grapes",
    "Táo": "Apple",
    "Roi (mận miền Nam)": "Water apple",
    "Đậu tẩm hành": "Tofu with spring onion",
    "Tóp mỡ xào dưa": "Pork rinds with pickled mustard",
    "Dưa chuột": "Cucumber",
    "Lạc rang": "Roasted peanuts",
    "Ngô chiên": "Fried corn",
    "Mực khô nướng xé": "Grilled dried squid",
    "Lòng xào dưa": "Pork offal with pickled mustard",
    "Sụn gà rang muối": "Salt-fried chicken cartilage",
    "Gỏi xoài khô bò": "Green mango with dried beef",
    "Má đào cháy tỏi": "Garlic pork jowl",
    "Gà chiên mắm": "Fish-sauce fried chicken",
    "Sụn gà chiên mắm": "Fish-sauce fried cartilage",
    "Chân gà sốt Thái": "Thai-sauce chicken feet",
    "Lòng gà xào mướp": "Chicken offal with luffa",
    "Dạ dày cháy tỏi": "Garlic pork stomach",
    "Dồi sụn nướng": "Grilled cartilage sausage",
    "Tai heo bóp thính": "Pig-ear salad",
    "Ba chỉ rang riềng": "Galangal pork belly",
    "Ba chỉ nướng riềng mẻ": "Grilled pork belly with galangal",
    "Bò lúc lắc": "Shaking beef",
    "Gân bò cháy tỏi": "Garlic beef tendon",
    "Bò xào cần": "Stir-fried beef with celery",
    "Ếch xào sả ớt": "Frog with lemongrass chili",
    "Ếch chiên bơ": "Butter-fried frog",
    "Vịt cháy tỏi": "Garlic duck",
    "Lưỡi vịt rang muối": "Salt-fried duck tongue",
    "Chim câu quay": "Roast pigeon",
    "Rau muống xào tỏi": "Garlic water spinach",
    "Ngọn su su xào tỏi": "Garlic chayote shoots",
    "Rau củ luộc chấm kho quẹt": "Boiled vegetables with kho quet",
    "Đậu hũ chiên sả": "Lemongrass fried tofu",
    "Cà tím nướng mỡ hành": "Grilled eggplant with scallion oil",
    "Cải thìa xào nấm": "Bok choy with mushrooms",
    "Đậu bắp nướng": "Grilled okra",
    "Nộm xoài tép khô": "Green mango with dried shrimp",
    "Nghêu hấp sả": "Lemongrass steamed clams",
    "Hàu sữa nướng mỡ hành": "Grilled oysters with scallion oil",
    "Ốc móng tay xào rau muống": "Razor clams with water spinach",
    "Ốc len xào dừa": "Sea snails in coconut milk",
    "Sò huyết xào me": "Blood cockles with tamarind",
    "Tôm nướng muối ớt": "Chili-salt grilled prawns",
    "Mực hấp gừng sả": "Steamed squid with ginger lemongrass",
    "Mực trứng chiên lá lốt": "Egg-stuffed squid in betel leaf",
    "Râu mực chiên mắm": "Fish-sauce fried squid tentacles",
}


def name_en(item: dict) -> str:
    if item.get("nameEn"):
        return item["nameEn"]
    if item["name"] in EN_FALLBACK:
        return EN_FALLBACK[item["name"]]
    return item["name"]


def photo_src(item: dict) -> str:
    return f"/items/{item['image']}-{slug(item['name'])}.webp"


def fmt_authored(item: dict, icon: str) -> str:
    veg = veg_for(item)
    veg_s = ", veg: true" if veg else ""
    photo = photo_src(item)
    return (
        "  { "
        f"name: '{ts_escape(item['name'])}', "
        f"nameEn: '{ts_escape(name_en(item))}', "
        f"sub: '{ts_escape(item['sub'])}', "
        f"subEn: '{ts_escape(sub_en(item['sub']))}', "
        f"price: {item['price']}, "
        f"icon: '{icon}', "
        f"photo: '{photo}'"
        f"{veg_s} "
        "},"
    )


def parse_local_names(path: Path) -> list[tuple[str, str]]:
    """Return (name, icon) from AuthoredItem files."""
    text = path.read_text()
    return re.findall(r"name: '([^']+)'.*?icon: '([^']+)'", text, flags=re.S)


def match_key(name: str) -> str:
    n = norm(name)
    return ALIASES.get(n, n)


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    ITEMS_DIR.mkdir(parents=True, exist_ok=True)

    chunk_url = discover_chunk_url()
    print("chunk", chunk_url)
    js = fetch(chunk_url).decode("utf-8", "replace")
    (CACHE / "dishes-chunk.js").write_text(js)
    items = parse_items(js)
    optimized = parse_optimized(js)
    print("parsed", len(items), "items", Counter((it.get("kind"), it.get("category")) for it in items.values()))

    # Core lunch atlases → public/
    for name in CORE_ATLASES:
        src = download_atlas(name, optimized)
        dest = PUBLIC / f"{name}.webp"
        if not dest.exists() or dest.stat().st_size != src.stat().st_size:
            dest.write_bytes(src.read_bytes())
            print("  copied", dest.name)

    extras = [it for it in items.values() if it["image"] >= 132]
    atlases_needed = {atlas_cell(it["image"])[0] for it in extras}  # type: ignore[index]
    atlas_paths = {name: download_atlas(name, optimized) for name in sorted(atlases_needed)}

    for it in extras:
        cell = atlas_cell(it["image"])
        if not cell:
            continue
        name, cols, rows, col, row = cell
        out = ITEMS_DIR / f"{it['image']}-{slug(it['name'])}.webp"
        if out.exists() and out.stat().st_size > 2000:
            continue
        sprite = crop_sprite(atlas_paths[name], cols, rows, col, row)
        sprite.convert("RGB").save(out, "WEBP", quality=82, method=4)
        print("  sprite", out.name, out.stat().st_size)

    # Classify extras
    drinks_site = [it for it in extras if it["image"] <= 155 or it["image"] >= 500]
    nhau_site = [it for it in extras if 400 <= it["image"] <= 447]
    sweet = [it for it in extras if it.get("category") == "snack-sweet"]
    an_vat = [
        it
        for it in extras
        if it.get("kind") == "snack" and it.get("category") != "snack-sweet"
    ]
    asia = [it for it in extras if 168 <= it["image"] <= 183]

    local_drinks = parse_local_names(ROOT / "src/lib/items/drinks.ts")
    local_snacks = parse_local_names(ROOT / "src/lib/items/snacks.ts")
    local_veg = parse_local_names(ROOT / "src/lib/items/veg-extra.ts")

    site_by_key: dict[str, dict] = {}
    for it in extras:
        site_by_key.setdefault(match_key(it["name"]), it)

    def merge(local: list[tuple[str, str]], site_list: list[dict]) -> list[tuple[dict, str, str]]:
        """(item, icon, origin) origin=local|site"""
        used = set()
        out: list[tuple[dict, str, str]] = []
        site_index = {match_key(it["name"]): it for it in site_list}
        for name, icon in local:
            key = match_key(name)
            if key in site_index:
                it = dict(site_index[key])
                it["name"] = name  # keep local display name
                out.append((it, icon, "matched"))
                used.add(key)
            else:
                out.append(
                    (
                        {
                            "name": name,
                            "nameEn": None,
                            "sub": "",
                            "price": 0,
                            "image": -1,
                            "category": None,
                            "kind": None,
                            "veg": True,
                            "quip": "",
                        },
                        icon,
                        "local-only",
                    )
                )
        for it in site_list:
            key = match_key(it["name"])
            if key in used:
                continue
            out.append((it, icon_for(it, None), "site"))
        return out

    # Local-only drinks/snacks need their original records, not empty stubs.
    # Re-read full local rows from TS instead of the stub above.
    def parse_local_full(path: Path) -> list[dict]:
        text = path.read_text()
        rows = []
        for m in re.finditer(
            r"\{ name: '([^']+)', nameEn: '([^']+)', sub: '([^']+)', subEn: '([^']+)', price: (\d+), icon: '([^']+)'(, veg: true)? \}",
            text,
        ):
            rows.append(
                {
                    "name": m.group(1),
                    "nameEn": m.group(2),
                    "sub": m.group(3),
                    "subEn": m.group(4),
                    "price": int(m.group(5)),
                    "icon": m.group(6),
                    "veg": bool(m.group(7)),
                }
            )
        return rows

    local_drink_rows = parse_local_full(ROOT / "src/lib/items/drinks.ts")
    local_snack_rows = parse_local_full(ROOT / "src/lib/items/snacks.ts")
    local_veg_rows = parse_local_full(ROOT / "src/lib/items/veg-extra.ts")

    def merge_authored(local_rows: list[dict], site_list: list[dict]) -> list[dict]:
        used = set()
        out: list[dict] = []
        site_index = {match_key(it["name"]): it for it in site_list}
        photos = {match_key(it["name"]): it for it in extras}
        for row in local_rows:
            key = match_key(row["name"])
            site = site_index.get(key) or photos.get(key)
            rec = dict(row)
            rec["origin"] = "local"
            if site:
                rec["photo"] = photo_src(site)
                rec["origin"] = "matched"
                used.add(key)
            out.append(rec)
        for it in site_list:
            key = match_key(it["name"])
            if key in used:
                continue
            veg = veg_for(it)
            out.append(
                {
                    "name": it["name"],
                    "nameEn": name_en(it),
                    "sub": it["sub"],
                    "subEn": sub_en(it["sub"]),
                    "price": it["price"],
                    "icon": icon_for(it, None),
                    "veg": True if veg is None else veg,
                    "photo": photo_src(it),
                    "origin": "site",
                }
            )
        out.sort(key=lambda r: (r["price"], r["name"]))
        return out

    drinks_out = merge_authored(local_drink_rows, drinks_site)
    snacks_out = merge_authored(local_snack_rows, nhau_site)
    desserts_out = merge_authored([], sweet)
    anvat_out = merge_authored([], an_vat)
    veg_out = []
    for row in local_veg_rows:
        rec = dict(row)
        rec["origin"] = "local"
        site = site_by_key.get(match_key(row["name"]))
        if site and site["image"] >= 132:
            rec["photo"] = photo_src(site)
            rec["origin"] = "matched"
        veg_out.append(rec)
    veg_out.sort(key=lambda r: (r["price"], r["name"]))

    def write_authored(path: Path, export_name: str, comment: str, rows: list[dict]) -> None:
        lines = [
            "import type { AuthoredItem } from './types';",
            "",
            comment,
            f"export const {export_name}: AuthoredItem[] = [",
        ]
        for row in rows:
            veg_s = ", veg: true" if row.get("veg") else ""
            photo_s = f", photo: '{row['photo']}'" if row.get("photo") else ""
            lines.append(
                "  { "
                f"name: '{ts_escape(row['name'])}', "
                f"nameEn: '{ts_escape(row['nameEn'])}', "
                f"sub: '{ts_escape(row['sub'])}', "
                f"subEn: '{ts_escape(row['subEn'])}', "
                f"price: {row['price']}, "
                f"icon: '{row['icon']}'"
                f"{photo_s}{veg_s} "
                "},"
            )
        lines.append("];")
        lines.append("")
        path.write_text("\n".join(lines))
        print("wrote", path.relative_to(ROOT), len(rows), "items")

    write_authored(
        ROOT / "src/lib/items/drinks.ts",
        "drinks",
        "// Street → café-chain prices in thousand VND. Photos cloned from truanayangi.com/dishes.",
        drinks_out,
    )
    write_authored(
        ROOT / "src/lib/items/snacks.ts",
        "snacks",
        '// "Món nhậu": Vietnamese sharing plates. Photos cloned from truanayangi.com/dishes.',
        snacks_out,
    )
    write_authored(
        ROOT / "src/lib/items/desserts.ts",
        "desserts",
        "// Sweet snacks and chè. Photos cloned from truanayangi.com/dishes.",
        desserts_out,
    )
    write_authored(
        ROOT / "src/lib/items/street-snacks.ts",
        "streetSnacks",
        "// Savoury street snacks, light bites and fruit. Photos cloned from truanayangi.com/dishes.",
        anvat_out,
    )
    write_authored(
        ROOT / "src/lib/items/veg-extra.ts",
        "vegExtra",
        "// Extra vegetarian dishes for the Vegetarian Case. Thousand VND.",
        veg_out,
    )

    asia_lines = [
        "/** Extra mains cloned from truanayangi.com/dishes (image 168–183). */",
        "export const asiaFoods = [",
    ]
    cuisine_of = {}
    for i in range(168, 172):
        cuisine_of[i] = "cn"
    for i in range(172, 176):
        cuisine_of[i] = "kr"
    for i in range(176, 180):
        cuisine_of[i] = "jp"
    for i in range(180, 184):
        cuisine_of[i] = "in"
    for it in sorted(asia, key=lambda x: x["image"]):
        veg_s = ", veg: true" if it.get("veg") else ""
        asia_lines.append(
            "  { "
            f"name: '{ts_escape(it['name'])}', "
            f"sub: '{ts_escape(it['sub'])}', "
            f"price: {it['price']}, "
            f"image: {it['image']}, cuisine: '{cuisine_of[it['image']]}', "
            f"quip: '{ts_escape(it['quip'])}', "
            f"photo: '{photo_src(it)}'"
            f"{veg_s} "
            "},"
        )
    asia_lines.append("] as const;")
    asia_lines.append("")
    asia_path = ROOT / "src/lib/items/asia-foods.ts"
    asia_path.write_text("\n".join(asia_lines))
    print("wrote", asia_path.relative_to(ROOT), len(asia), "items")

    # english names snippet
    en_extra = {it["image"]: name_en(it) for it in asia}
    (CACHE / "english-extra.json").write_text(json.dumps(en_extra, ensure_ascii=False, indent=2))

    report = {
        "site": len(items),
        "core": sum(1 for i in items if i <= 131),
        "drinks": {"count": len(drinks_out), "matched": sum(1 for r in drinks_out if r["origin"] == "matched"), "site": sum(1 for r in drinks_out if r["origin"] == "site"), "localOnly": sum(1 for r in drinks_out if r["origin"] == "local")},
        "nhau": {"count": len(snacks_out), "matched": sum(1 for r in snacks_out if r["origin"] == "matched"), "site": sum(1 for r in snacks_out if r["origin"] == "site"), "localOnly": sum(1 for r in snacks_out if r["origin"] == "local")},
        "desserts": len(desserts_out),
        "anVat": len(anvat_out),
        "asia": len(asia),
        "vegExtra": {"count": len(veg_out), "matched": sum(1 for r in veg_out if r.get("photo"))},
        "oursOnlyDrinks": [r["name"] for r in drinks_out if r["origin"] == "local"],
        "oursOnlySnacks": [r["name"] for r in snacks_out if r["origin"] == "local"],
    }
    (CACHE / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
