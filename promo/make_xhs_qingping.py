from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "promo" / "xhs-qingping-vertical.png"
W, H = 1080, 1440


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/msyhbd.ttc") if bold else Path("C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/simhei.ttf") if bold else Path("C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf") if bold else Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.strip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def rounded(im: Image.Image, radius: int) -> Image.Image:
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, im.width, im.height), radius=radius, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def cover(path: Path, size: tuple[int, int], crop_top: int = 0) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    target_w, target_h = size
    scale = max(target_w / im.width, target_h / im.height)
    resized = im.resize((math.ceil(im.width * scale), math.ceil(im.height * scale)), Image.Resampling.LANCZOS)
    x = max(0, (resized.width - target_w) // 2)
    y = min(max(0, crop_top), max(0, resized.height - target_h))
    return resized.crop((x, y, x + target_w, y + target_h))


def paste_shadow(base: Image.Image, item: Image.Image, xy: tuple[int, int], blur: int = 38, alpha: int = 54) -> None:
    shadow = Image.new("RGBA", item.size, (0, 0, 0, 0))
    mask = item.split()[-1]
    shadow_draw = Image.new("RGBA", item.size, (32, 91, 58, alpha))
    shadow.paste(shadow_draw, (0, 0), mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow, (xy[0], xy[1] + 20))
    base.alpha_composite(item, xy)


def screen_card(path: Path, size: tuple[int, int], radius: int = 36, crop_top: int = 0) -> Image.Image:
    body = cover(path, size, crop_top)
    body = rounded(body, radius)
    card = Image.new("RGBA", (size[0] + 12, size[1] + 12), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle((0, 0, card.width - 1, card.height - 1), radius=radius + 6, fill=(255, 255, 255, 188), outline=(144, 213, 165, 88), width=2)
    card.alpha_composite(body, (6, 6))
    shine = Image.new("RGBA", card.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shine)
    sd.rounded_rectangle((12, 12, card.width - 14, 112), radius=radius, fill=(255, 255, 255, 34))
    card.alpha_composite(shine)
    return card


def wrap(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        test = current + char
        if draw.textlength(test, font=font_obj) <= width or not current:
            current = test
        else:
            lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


def draw_text_block(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font_obj: ImageFont.FreeTypeFont, fill, width: int, line_gap: int) -> int:
    x, y = xy
    for line in wrap(draw, text, font_obj, width):
        draw.text((x, y), line, font=font_obj, fill=fill)
        y += font_obj.size + line_gap
    return y


def main() -> None:
    bg = Image.new("RGBA", (W, H), rgba("eef8f1"))
    draw = ImageDraw.Draw(bg)

    for y in range(H):
        ratio = y / H
        r = int(252 * (1 - ratio) + 231 * ratio)
        g = int(255 * (1 - ratio) + 245 * ratio)
        b = int(251 * (1 - ratio) + 236 * ratio)
        draw.line((0, y, W, y), fill=(r, g, b, 255))

    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.ellipse((-180, 120, 540, 840), fill=(88, 185, 133, 34))
    wd.ellipse((660, -90, 1280, 480), fill=(160, 222, 188, 88))
    wd.ellipse((630, 880, 1260, 1530), fill=(171, 156, 236, 38))
    wash = wash.filter(ImageFilter.GaussianBlur(60))
    bg.alpha_composite(wash)

    for center, color, count, step in [((170, 565), (55, 166, 142, 24), 10, 38), ((815, 1080), (66, 166, 90, 34), 12, 42)]:
        cx, cy = center
        for i in range(count):
            r = 70 + i * step
            draw.ellipse((cx - r, cy - r * 0.56, cx + r, cy + r * 0.56), outline=color, width=2)

    lily = Image.open(ROOT / "assets" / "qingping-lily-clock.png").convert("RGBA").resize((510, 510), Image.Resampling.LANCZOS)
    lily.putalpha(lily.split()[-1].point(lambda p: int(p * 0.08)))
    bg.alpha_composite(lily, (505, 380))

    icon = Image.open(ROOT / "assets" / "qingping-bubble-icon.png").convert("RGBA")
    brand_icon = rounded(icon.resize((74, 74), Image.Resampling.LANCZOS), 22)
    paste_shadow(bg, brand_icon, (76, 80), blur=18, alpha=32)
    draw.text((168, 98), "青萍 QingPing", font=font(30, True), fill=rgba("2b7b4a"))

    draw.text((76, 166), "把任务和专注", font=font(84, True), fill=rgba("20372b"))
    draw.text((76, 258), "轻轻放在手边", font=font(84, True), fill=rgba("20372b"))
    draw_text_block(
        draw,
        (78, 376),
        "一枚清透气泡，陪你管理今日待办、专注计时、回顾时间流向，也记录生活的细微感想。",
        font(29),
        rgba("486555"),
        646,
        14,
    )

    chip_x, chip_y = 76, 510
    for label in ["桌面悬浮", "45 分钟专注", "青萍回顾", "阶段计划"]:
        w = int(draw.textlength(label, font=font(22, True))) + 42
        draw.rounded_rectangle((chip_x, chip_y, chip_x + w, chip_y + 46), radius=23, fill=(255, 255, 255, 178), outline=(66, 166, 90, 56), width=1)
        draw.text((chip_x + 21, chip_y + 9), label, font=font(22, True), fill=rgba("2e7344"))
        chip_x += w + 14

    draw.rounded_rectangle((744, 96, 1010, 284), radius=32, fill=(255, 255, 255, 184), outline=(66, 166, 90, 52), width=1)
    draw.text((772, 122), "安静", font=font(36, True), fill=rgba("2e8a52"))
    draw.text((772, 164), "但随时可用", font=font(36, True), fill=rgba("2e8a52"))
    draw_text_block(draw, (772, 220), "不打断工作，只在你需要时展开。", font(21), rgba("5a7362"), 206, 8)

    left = screen_card(ROOT / "shot-today.png", (374, 520), crop_top=0).rotate(-7, expand=True, resample=Image.Resampling.BICUBIC)
    right = screen_card(ROOT / "shot-review.png", (374, 520), crop_top=0).rotate(6, expand=True, resample=Image.Resampling.BICUBIC)
    bottom = screen_card(ROOT / "shot-plan-flow-detail.png", (500, 270), radius=32, crop_top=130).rotate(-2, expand=True, resample=Image.Resampling.BICUBIC)
    main_card = screen_card(ROOT / "shot-focus.png", (430, 598), radius=38, crop_top=0).rotate(1, expand=True, resample=Image.Resampling.BICUBIC)

    paste_shadow(bg, left, (52, 622), blur=36, alpha=42)
    paste_shadow(bg, right, (682, 628), blur=36, alpha=38)
    paste_shadow(bg, bottom, (258, 942), blur=34, alpha=42)
    paste_shadow(bg, main_card, (318, 558), blur=46, alpha=64)

    for x, y, r in [(834, 474, 13), (150, 1240, 20), (948, 762, 10)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, 120), outline=(66, 166, 90, 44), width=1)

    draw.text((76, 1270), "风起于青萍之末，成长于点滴之间", font=font(34, True), fill=rgba("315744"))
    draw.text((78, 1323), "清新简约的知识型效率伴侣", font=font(23), fill=rgba("6e8176"))

    badge = Image.new("RGBA", (190, 190), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.ellipse((0, 0, 189, 189), fill=(255, 255, 255, 184), outline=(66, 166, 90, 58), width=2)
    badge.alpha_composite(rounded(icon.resize((84, 84), Image.Resampling.LANCZOS), 24), (53, 24))
    bd.text((48, 118), "开源桌面", font=font(24, True), fill=rgba("2f7f4e"))
    bd.text((48, 151), "效率助手", font=font(24, True), fill=rgba("2f7f4e"))
    paste_shadow(bg, badge, (812, 1200), blur=28, alpha=36)

    OUT.parent.mkdir(exist_ok=True)
    bg.convert("RGB").save(OUT, quality=96, optimize=True)
    print(OUT)


if __name__ == "__main__":
    main()
