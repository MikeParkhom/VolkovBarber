"""Заменяет фон на фото на однотонный, не трогая человека.

Маска строится моделью BiRefNet (portrait) через rembg, цвет переднего плана
на краях волос восстанавливается pymatting, затем фото смешивается с фоном.

    python tools/replace_bg.py in.jpg out.jpg [--color 2b2622] [--size 1400]
"""
import argparse

import numpy as np
from PIL import Image, ImageOps
from pymatting import estimate_foreground_ml
from rembg import new_session, remove


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--color", default="2b2622")
    ap.add_argument("--size", type=int, default=1400)
    args = ap.parse_args()

    im = ImageOps.exif_transpose(Image.open(args.src)).convert("RGB")
    im.thumbnail((args.size, args.size), Image.LANCZOS)
    mask = remove(im, session=new_session("birefnet-portrait"), only_mask=True)

    rgb = np.asarray(im) / 255.0
    a = np.asarray(mask.convert("L")) / 255.0
    bg = np.array([int(args.color[i:i + 2], 16) for i in (0, 2, 4)]) / 255.0
    fg = estimate_foreground_ml(rgb, a)
    out = fg * a[..., None] + bg * (1 - a[..., None])
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(args.dst, quality=86, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
