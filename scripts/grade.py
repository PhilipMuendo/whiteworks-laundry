"""Apply the site's monochrome grade to a folder of photos.

usage:  python scripts/grade.py <input-folder> <output-folder>
needs:  pip install Pillow

Desaturates ~86%, applies a filmic S-curve with blacks lifted to the page ink
(#080808), cool shadows / neutral highlights, and caps width at 2000px.
"""
import os
import sys

from PIL import Image, ImageOps

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)


def curve(x):
    t = x / 255.0
    s = t * t * (3 - 2 * t)  # smoothstep S-curve
    t = 0.55 * s + 0.45 * t
    return 8 + t * (240 - 8)


LUT = [int(round(curve(i))) for i in range(256)]


def tone(img):
    g = ImageOps.grayscale(img)
    img = Image.blend(img, Image.merge("RGB", (g, g, g)), 0.86)
    r, gc, b = img.split()
    r = r.point(lambda v: min(255, int(v * 0.985 + (4 if v > 150 else 0))))
    b = b.point(lambda v: min(255, int(v * 1.0 + (5 if v < 90 else -2))))
    return Image.merge("RGB", (r, gc, b)).point(LUT * 3)


for f in sorted(os.listdir(src)):
    if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    im = Image.open(os.path.join(src, f)).convert("RGB")
    if im.width > 2000:
        im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
    out = os.path.splitext(f)[0] + ".jpg"
    tone(im).save(os.path.join(dst, out), "JPEG", quality=80, optimize=True, progressive=True)
    print(out, im.size)
