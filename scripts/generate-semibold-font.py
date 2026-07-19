# scripts/generate-semibold-font.py
#
# Author: Edward Silva
# Creation Date: 19 July, 2026
# Last Update: 19 July, 2026
#
# Calibri (and its metric-compatible open clone Carlito) ships only regular
# and bold faces, so semibold text on the site would otherwise snap to the
# heavy 700 weight. This script builds a true semibold face by expanding
# Carlito Regular's outlines halfway toward bold (stroke + union on every
# simple glyph), renames the family to "Carlito Semi", and writes a woff2
# the site serves for emphasized text. Carlito is licensed under the SIL
# OFL, which permits modification. Run once; the output is committed.
#
# Usage: python scripts/generate-semibold-font.py
# Requires: pip install fonttools skia-pathops brotli

import pathlib

import pathops
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "node_modules/@fontsource/carlito/files/carlito-latin-400-normal.woff"
OUT_DIR = ROOT / "public/fonts"
OUT_PATH = OUT_DIR / "carlito-semibold.woff2"

# Total stem thickening in font units (upem 2048). Carlito's bold adds
# roughly 100 units of stem over regular; ~48 lands halfway.
EMBOLDEN = 48

FAMILY = "Carlito Semi"
PS_NAME = "CarlitoSemi-Regular"


def embolden_glyph(glyf, name):
    glyph = glyf[name]
    if glyph.isComposite() or glyph.numberOfContours <= 0:
        return

    original = pathops.Path()
    glyph.draw(original.getPen(), glyf)

    stroked = pathops.Path(original)
    stroked.stroke(EMBOLDEN, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4)

    # Stroking emits conic segments, which the winding fixer can't handle
    original.convertConicsToQuads()
    stroked.convertConicsToQuads()

    result = pathops.op(original, stroked, pathops.PathOp.UNION, fix_winding=True)

    pen = TTGlyphPen(None)
    result.draw(pen)
    glyf[name] = pen.glyph()


def rename(font):
    name = font["name"]
    for platform in ((3, 1, 0x409), (1, 0, 0)):
        name.setName(FAMILY, 1, *platform)
        name.setName("Regular", 2, *platform)
        name.setName(f"{FAMILY} Regular", 4, *platform)
        name.setName(PS_NAME, 6, *platform)
        name.setName(f"1.000;{PS_NAME}", 3, *platform)
    for name_id in (16, 17):
        name.removeNames(nameID=name_id)


def main():
    font = TTFont(SOURCE)
    glyf = font["glyf"]
    hmtx = font["hmtx"]

    for glyph_name in font.getGlyphOrder():
        embolden_glyph(glyf, glyph_name)

    # Keep hmtx left side bearings in sync with the widened outlines;
    # advance widths stay untouched to preserve Calibri metrics.
    for glyph_name in font.getGlyphOrder():
        glyph = glyf[glyph_name]
        glyph.recalcBounds(glyf)
        if glyph.numberOfContours != 0:
            advance, _ = hmtx[glyph_name]
            hmtx[glyph_name] = (advance, glyph.xMin)

    font["OS/2"].usWeightClass = 600
    rename(font)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(OUT_PATH)
    print(f"Wrote {OUT_PATH.relative_to(ROOT)} ({OUT_PATH.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
