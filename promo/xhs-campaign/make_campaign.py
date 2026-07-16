from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SOURCE = HERE / "source"
OUTPUT = HERE / "output"
W, H = 1080, 1440

INK = "173c2c"
GREEN = "2f8a50"
GREEN_DARK = "236b3d"
MUTED = "667a70"
VIOLET = "8e7ad8"
CYAN = "3a9ab2"
AMBER = "efac3e"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/msyhbd.ttc") if bold else Path("C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/simhei.ttf") if bold else Path("C:/Windows/Fonts/simsun.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf") if bold else Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def color(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def rounded(image: Image.Image, radius: int) -> Image.Image:
    image = image.convert("RGBA")
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, image.width - 1, image.height - 1), radius=radius, fill=255)
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.paste(image, (0, 0), mask)
    return result


def fit_width(path: Path, width: int) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def screen(path: Path, width: int, radius: int = 34) -> Image.Image:
    image = rounded(fit_width(path, width), radius)
    frame = Image.new("RGBA", (image.width + 12, image.height + 12), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle(
        (0, 0, frame.width - 1, frame.height - 1),
        radius=radius + 6,
        fill=(255, 255, 255, 205),
        outline=(67, 156, 94, 72),
        width=2,
    )
    frame.alpha_composite(image, (6, 6))
    return frame


def paste_shadow(base: Image.Image, item: Image.Image, xy: tuple[int, int], blur: int = 32, alpha: int = 55) -> None:
    mask = item.getchannel("A")
    shadow = Image.new("RGBA", item.size, color(GREEN_DARK, alpha))
    shadow.putalpha(mask.point(lambda p: round(p * alpha / 255)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow, (xy[0], xy[1] + 18))
    base.alpha_composite(item, xy)


def base(page: int, accent: str = GREEN) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    bg = Image.open(SOURCE / "watercolor-background.png").convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    veil = Image.new("RGBA", (W, H), (255, 255, 255, 24))
    bg.alpha_composite(veil)
    draw = ImageDraw.Draw(bg)
    draw.rounded_rectangle((58, 48, 1022, 119), radius=36, fill=(255, 255, 255, 172), outline=color(accent, 34), width=1)
    icon = rounded(Image.open(ROOT / "assets" / "qingping-bubble-icon.png").convert("RGBA").resize((52, 52), Image.Resampling.LANCZOS), 16)
    bg.alpha_composite(icon, (74, 58))
    draw.text((142, 65), "青萍桌面助手", font=font(26, True), fill=color(INK))
    draw.text((902, 67), f"{page:02d} / 06", font=font(21, True), fill=color(accent))
    return bg, draw


def title(draw: ImageDraw.ImageDraw, heading: str, subheading: str, accent: str = GREEN, y: int = 158) -> int:
    draw.rounded_rectangle((62, y + 7, 70, y + 75), radius=4, fill=color(accent))
    lines = heading.split("\n")
    current = y
    for line in lines:
        draw.text((92, current), line, font=font(66, True), fill=color(INK))
        current += 78
    draw.text((94, current + 12), subheading, font=font(27), fill=color(MUTED))
    return current + 62


def pill(draw: ImageDraw.ImageDraw, xy: tuple[int, int], label: str, accent: str = GREEN, filled: bool = False) -> int:
    x, y = xy
    f = font(22, True)
    width = round(draw.textlength(label, font=f)) + 40
    fill = color(accent, 220) if filled else (255, 255, 255, 188)
    text_fill = (255, 255, 255, 255) if filled else color(accent)
    draw.rounded_rectangle((x, y, x + width, y + 48), radius=24, fill=fill, outline=color(accent, 48), width=1)
    draw.text((x + 20, y + 10), label, font=f, fill=text_fill)
    return width


def note_card(draw: ImageDraw.ImageDraw, xy: tuple[int, int], number: str, heading: str, body: str, accent: str = GREEN, width: int = 330) -> None:
    x, y = xy
    draw.rounded_rectangle((x, y, x + width, y + 142), radius=28, fill=(255, 255, 255, 195), outline=color(accent, 40), width=1)
    draw.ellipse((x + 20, y + 22, x + 66, y + 68), fill=color(accent, 28), outline=color(accent, 70), width=1)
    draw.text((x + 35, y + 29), number, font=font(18, True), fill=color(accent))
    draw.text((x + 82, y + 23), heading, font=font(27, True), fill=color(INK))
    draw.text((x + 82, y + 67), body, font=font(21), fill=color(MUTED), spacing=8)


def footer(draw: ImageDraw.ImageDraw, label: str = "风起于青萍之末，成长于点滴之间") -> None:
    draw.line((74, 1353, 1006, 1353), fill=color(GREEN, 40), width=1)
    draw.text((74, 1372), label, font=font(21), fill=color(MUTED))
    draw.text((895, 1372), "QINGPING", font=font(18, True), fill=color(GREEN, 150))


def save(image: Image.Image, name: str) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(OUTPUT / name, quality=95, optimize=True)


def poster_cover() -> None:
    bg, draw = base(1)
    title(draw, "把时间，\n轻轻放在手边", "任务 · 专注 · 回顾 · 计划", y=168)
    x = 92
    for label, accent in [("今日待办", GREEN), ("45 分钟专注", CYAN), ("时间回顾", VIOLET), ("阶段计划", AMBER)]:
        x += pill(draw, (x, 405), label, accent, filled=x == 92) + 12

    today = screen(SOURCE / "today.png", 510).rotate(-5, expand=True, resample=Image.Resampling.BICUBIC)
    focus = screen(SOURCE / "focus.png", 490).rotate(4, expand=True, resample=Image.Resampling.BICUBIC)
    review = screen(SOURCE / "review-ring.png", 525).rotate(-1, expand=True, resample=Image.Resampling.BICUBIC)
    paste_shadow(bg, today, (14, 548), blur=36, alpha=42)
    paste_shadow(bg, focus, (590, 535), blur=36, alpha=42)
    paste_shadow(bg, review, (278, 500), blur=42, alpha=66)

    draw.rounded_rectangle((728, 1138, 1006, 1298), radius=34, fill=(255, 255, 255, 210), outline=color(GREEN, 46), width=1)
    draw.text((758, 1166), "安静存在", font=font(34, True), fill=color(GREEN_DARK))
    draw.text((758, 1212), "随时可用", font=font(34, True), fill=color(GREEN_DARK))
    draw.text((758, 1262), "一枚桌面气泡的陪伴", font=font(19), fill=color(MUTED))
    footer(draw)
    save(bg, "01-cover.png")


def poster_today() -> None:
    bg, draw = base(2)
    title(draw, "今天要做的，\n清清楚楚", "不堆砌清单，只照看今天。", y=164)
    today = screen(SOURCE / "today.png", 565)
    paste_shadow(bg, today, (448, 374), blur=42, alpha=58)
    note_card(draw, (72, 474), "01", "快速记下", "任务名称与标签\n一次完成")
    note_card(draw, (72, 642), "02", "直接计时", "从今天要做\n立即进入专注", CYAN)
    note_card(draw, (72, 810), "03", "今日闭环", "待办、专注、完成\n只计算当天", VIOLET)
    draw.text((74, 1070), "每一天从这里重新开始。", font=font(32, True), fill=color(GREEN_DARK))
    draw.text((74, 1122), "任务跨日自动更新，完成记录留在当天。", font=font(23), fill=color(MUTED))
    footer(draw)
    save(bg, "02-today.png")


def poster_focus() -> None:
    bg, draw = base(3, CYAN)
    title(draw, "45 分钟，\n只交给一件事", "开始以后，让界面安静下来。", CYAN, y=164)
    focus = screen(SOURCE / "focus.png", 565)
    paste_shadow(bg, focus, (64, 390), blur=42, alpha=58)

    bubble = rounded(Image.open(SOURCE / "bubble.png").convert("RGBA").resize((218, 218), Image.Resampling.LANCZOS), 70)
    paste_shadow(bg, bubble, (752, 428), blur=36, alpha=52)
    draw.text((688, 690), "倒计时", font=font(30, True), fill=color(CYAN))
    draw.text((688, 739), "正计时", font=font(30, True), fill=color(GREEN))
    draw.text((688, 788), "分段专注", font=font(30, True), fill=color(VIOLET))
    draw.line((688, 850, 978, 850), fill=color(CYAN, 70), width=2)
    draw.text((688, 880), "时间结束，青萍从气泡里\n轻轻浮出，提醒你歇一会儿。", font=font(24), fill=color(MUTED), spacing=12)
    pill(draw, (688, 1010), "休息计时", CYAN, True)
    pill(draw, (688, 1072), "自选音效", GREEN)
    footer(draw)
    save(bg, "03-focus.png")


def poster_review() -> None:
    bg, draw = base(4, VIOLET)
    title(draw, "看见时间，\n真正流向哪里", "不评价今天，只诚实地看见它。", VIOLET, y=164)
    ring = screen(SOURCE / "review-ring-expanded.png", 560)
    bars = screen(SOURCE / "review-bars-expanded.png", 440)
    paste_shadow(bg, ring, (52, 390), blur=44, alpha=58)
    paste_shadow(bg, bars, (600, 520), blur=38, alpha=48)
    pill(draw, (672, 421), "青萍环", GREEN, True)
    pill(draw, (826, 421), "涟漪", CYAN)
    draw.rounded_rectangle((630, 1114, 1005, 1280), radius=32, fill=(255, 255, 255, 202), outline=color(VIOLET, 42), width=1)
    draw.text((660, 1140), "比例，是时间的形状", font=font(29, True), fill=color(INK))
    draw.text((660, 1190), "青萍环看分布，柱状涟漪看每一段投入。", font=font(21), fill=color(MUTED))
    draw.text((660, 1232), "把忙碌变成可以理解的一天。", font=font(21), fill=color(MUTED))
    footer(draw)
    save(bg, "04-review.png")


def poster_plan() -> None:
    bg, draw = base(5, AMBER)
    title(draw, "让长期目标，\n一圈圈长出来", "完成一小步，水面就多一圈回响。", AMBER, y=164)
    plan_list = screen(SOURCE / "plan-list.png", 420).rotate(-3, expand=True, resample=Image.Resampling.BICUBIC)
    detail = screen(SOURCE / "plan-detail.png", 560).rotate(1, expand=True, resample=Image.Resampling.BICUBIC)
    paste_shadow(bg, plan_list, (18, 464), blur=40, alpha=42)
    paste_shadow(bg, detail, (460, 386), blur=44, alpha=62)
    draw.rounded_rectangle((70, 1110, 418, 1288), radius=32, fill=(255, 255, 255, 205), outline=color(AMBER, 42), width=1)
    draw.text((100, 1138), "主要任务", font=font(28, True), fill=color(INK))
    draw.text((100, 1186), "阶段目标 · 时间范围", font=font(21), fill=color(MUTED))
    draw.text((100, 1224), "进度状态 · 阶段笔记", font=font(21), fill=color(MUTED))
    draw.text((100, 1262), "从上到下，持续推进", font=font(21, True), fill=color(GREEN))
    footer(draw)
    save(bg, "05-plan.png")


def poster_closing() -> None:
    bg, draw = base(6)
    draw.text((78, 190), "安静存在", font=font(78, True), fill=color(INK))
    draw.text((78, 286), "随时可用", font=font(78, True), fill=color(GREEN_DARK))
    draw.text((82, 395), "一枚桌面气泡，也是一段持续生长的日常。", font=font(27), fill=color(MUTED))

    bubble = rounded(Image.open(SOURCE / "bubble.png").convert("RGBA").resize((260, 260), Image.Resampling.LANCZOS), 92)
    paste_shadow(bg, bubble, (705, 152), blur=48, alpha=56)

    settings = screen(SOURCE / "settings.png", 455).rotate(4, expand=True, resample=Image.Resampling.BICUBIC)
    review = screen(SOURCE / "review-ring.png", 440).rotate(-5, expand=True, resample=Image.Resampling.BICUBIC)
    today = screen(SOURCE / "today.png", 440).rotate(-1, expand=True, resample=Image.Resampling.BICUBIC)
    paste_shadow(bg, settings, (608, 536), blur=38, alpha=40)
    paste_shadow(bg, review, (22, 560), blur=38, alpha=44)
    paste_shadow(bg, today, (320, 500), blur=44, alpha=62)

    x = 97
    for label, accent in [("开源", GREEN), ("Windows", CYAN), ("本地存储", VIOLET), ("清新可定制", AMBER)]:
        x += pill(draw, (x, 1210), label, accent, filled=label == "开源") + 12
    draw.text((98, 1290), "风起于青萍之末，成长于点滴之间。", font=font(30, True), fill=color(INK))
    footer(draw, "青萍 · 清新简约的桌面效率伴侣")
    save(bg, "06-closing.png")


def contact_sheet() -> None:
    names = [
        "01-cover.png",
        "02-today.png",
        "03-focus.png",
        "04-review.png",
        "05-plan.png",
        "06-closing.png",
    ]
    thumb_w, thumb_h = 270, 360
    gap = 18
    sheet = Image.new("RGB", (thumb_w * 3 + gap * 4, thumb_h * 2 + gap * 3), (237, 247, 240))
    for index, name in enumerate(names):
        image = Image.open(OUTPUT / name).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = gap + (index % 3) * (thumb_w + gap)
        y = gap + (index // 3) * (thumb_h + gap)
        sheet.paste(image, (x, y))
    sheet.save(OUTPUT / "00-contact-sheet.jpg", quality=92, optimize=True)


def main() -> None:
    poster_cover()
    poster_today()
    poster_focus()
    poster_review()
    poster_plan()
    poster_closing()
    contact_sheet()
    print(OUTPUT)


if __name__ == "__main__":
    main()
