from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def make_icon(size: int) -> Image.Image:
    bg_top = (103, 58, 183)
    bg_bot = (49, 130, 246)

    grad = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = grad.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(bg_top[0] * (1 - t) + bg_bot[0] * t)
        g = int(bg_top[1] * (1 - t) + bg_bot[1] * t)
        b = int(bg_top[2] * (1 - t) + bg_bot[2] * t)
        for x in range(size):
            px[x, y] = (r, g, b, 255)

    v = Image.new("L", (size, size), 0)
    vd = ImageDraw.Draw(v)
    vd.ellipse((-size * 0.15, -size * 0.2, size * 1.15, size * 1.2), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(int(size * 0.078)))
    grad.putalpha(v)

    pad = int(size * 0.0625)
    radius = int(size * 0.215)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((pad, pad, size - pad, size - pad), radius=radius, fill=255)
    clipped = Image.composite(grad, Image.new("RGBA", (size, size), (0, 0, 0, 0)), mask)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    doc_x0, doc_y0 = int(size * 0.244), int(size * 0.205)
    doc_x1, doc_y1 = int(size * 0.703), int(size * 0.801)
    sd.rounded_rectangle(
        (doc_x0 + int(size * 0.018), doc_y0 + int(size * 0.022), doc_x1 + int(size * 0.018), doc_y1 + int(size * 0.022)),
        radius=int(size * 0.055),
        fill=(0, 0, 0, 130),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(size * 0.021)))

    paper = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pd = ImageDraw.Draw(paper)
    pd.rounded_rectangle(
        (doc_x0, doc_y0, doc_x1, doc_y1),
        radius=int(size * 0.055),
        fill=(255, 255, 255, 245),
        outline=(240, 243, 250, 255),
        width=max(1, int(size * 0.006)),
    )

    fold = int(size * 0.127)
    fx1, fy0 = doc_x1, doc_y0
    pd.polygon([(fx1 - fold, fy0), (fx1, fy0), (fx1, fy0 + fold)], fill=(236, 241, 252, 255))
    pd.line([(fx1 - fold, fy0), (fx1 - fold, fy0 + fold)], fill=(225, 231, 247, 255), width=max(1, int(size * 0.006)))
    pd.line([(fx1 - fold, fy0 + fold), (fx1, fy0 + fold)], fill=(225, 231, 247, 255), width=max(1, int(size * 0.006)))

    line_color = (170, 186, 220, 255)
    for i, w in enumerate([0.35, 0.41, 0.38, 0.33]):
        y = doc_y0 + int(size * (0.176 + i * 0.088))
        x = doc_x0 + int(size * 0.088)
        pd.rounded_rectangle(
            (x, y, x + int(size * w), y + int(size * 0.025)),
            radius=int(size * 0.012),
            fill=line_color,
        )

    cx, cy = doc_x0 + int(size * 0.146), doc_y0 + int(size * 0.107)
    star = [(0, -0.054), (0.016, -0.016), (0.054, 0), (0.016, 0.016), (0, 0.054), (-0.016, 0.016), (-0.054, 0), (-0.016, -0.016)]
    star = [(cx + int(size * x), cy + int(size * y)) for x, y in star]
    pd.polygon(star, fill=(120, 210, 255, 255))
    inner = [(0, -0.027), (0.01, -0.01), (0.027, 0), (0.01, 0.01), (0, 0.027), (-0.01, 0.01), (-0.027, 0), (-0.01, -0.01)]
    inner = [(cx + int(size * x), cy + int(size * y)) for x, y in inner]
    pd.polygon(inner, fill=(255, 255, 255, 255))

    arrow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ad = ImageDraw.Draw(arrow)
    ax0, ay0 = int(size * 0.635), int(size * 0.508)
    ax1 = int(size * 0.83)
    stroke = max(6, int(size * 0.058))
    ad.line((ax0, ay0, ax1 - int(size * 0.04), ay0), fill=(255, 255, 255, 245), width=stroke)
    ad.polygon(
        [
            (ax1 - int(size * 0.04), ay0 - int(size * 0.088)),
            (ax1 + int(size * 0.02), ay0),
            (ax1 - int(size * 0.04), ay0 + int(size * 0.088)),
        ],
        fill=(255, 255, 255, 245),
    )
    arrow = arrow.filter(ImageFilter.GaussianBlur(max(1, int(size * 0.001))))

    out = Image.alpha_composite(clipped, shadow)
    out = Image.alpha_composite(out, paper)
    out = Image.alpha_composite(out, arrow)
    return out


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    out_dir = repo_root / "assets" / "icons"
    out_dir.mkdir(parents=True, exist_ok=True)

    base = make_icon(1024)
    base.save(out_dir / "icon1024.png")

    for s in [16, 32, 48, 64, 128]:
        small = base.resize((s, s), Image.Resampling.LANCZOS)
        small.save(out_dir / f"icon{s}.png")


if __name__ == "__main__":
    main()

