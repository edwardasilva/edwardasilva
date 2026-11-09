"""
scripts/digitize-gantry-pulse.py
Gantry Pulse Figures

Author: Edward Silva
Creation Date: 09 November, 2026
Last Update: 09 November, 2026

Rebuilds the two pulse-response plots from the Part 2 gantry crane report as SVG files, so the
dark-theme copies can be written like every other plot under src/figures. The report left these
two as PNG screenshots of a MATLAB figure, and the Simulink models behind them cannot run here, so
this script reads each curve back out of the PNG by its MATLAB line color and redraws it. The axes
limits are the ones MATLAB printed on the frame: 0 to 30 s and -1 to 2.5. Each curve is read once
per pixel column, so the data is only as fine as the source image.

File Structure:
- C_SERIES: the four MATLAB default colors and the legend label each one carries
- find_frame: the pixel box of the axes
- digitize: one series, as time and value pairs
- hold_across_gaps: keeps a hidden flat line flat
- write_svg: the plot in the same style as the report's other SVG exports
- main: reads the two PNGs and writes the two SVGs

Where this file is used within the repository:
- Writes src/figures/gantry/reference-scaling.svg and src/figures/gantry/augmented.svg
- npm run figures then writes the dark copies of both

Usage:
$ `python3 -I scripts/digitize-gantry-pulse.py` : Rewrites the two SVGs from the PNGs in the same folder

Copyright (c) 2026 Edward Silva. MIT License.
"""

from pathlib import Path

import numpy as np
from PIL import Image

C_ROOT = Path(__file__).resolve().parent.parent
C_FIGURE_DIR = C_ROOT / "src" / "figures" / "gantry"
C_X_RANGE = (0.0, 30.0)
C_Y_RANGE = (-1.0, 2.5)
C_X_TICKS = [0, 5, 10, 15, 20, 25, 30]
C_Y_TICKS = [-1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5]
# The line colors as the report's PNG has them, in the order its legend lists them. Three are
# MATLAB's defaults and the fourth is the purple the export wrote.
C_SERIES = [
    ("r", (0, 114, 189)),
    ("disturbance", (217, 83, 25)),
    ("y", (237, 177, 32)),
    ("z dot", (133, 22, 209)),
]
C_COLOR_TOLERANCE = 60
# The legend box inside the axes, in source pixels, so its color swatches are not read as data.
C_LEGEND_BOX = (905, 1127, 50, 184)
C_WIDTH = 1158
C_HEIGHT = 775


def find_frame(image):
    """
    @brief Finds the axes box, the gray rectangle MATLAB draws around the plot
    @param image RGB pixels as an integer array
    @return left, right, top, bottom pixel edges of the box
    @details The frame is the only long gray line in each direction, so the two columns and two
    rows with the most gray pixels are its edges.
    """
    gray = (
        (np.abs(image[:, :, 0] - image[:, :, 1]) < 12)
        & (np.abs(image[:, :, 1] - image[:, :, 2]) < 12)
        & (image.sum(axis=2) < 450)
    )
    columns = np.argsort(gray.sum(axis=0))[-4:]
    rows = np.argsort(gray.sum(axis=1))[-4:]

    return (
        float(columns.min()) + 0.5,
        float(columns.max()) - 0.5,
        float(rows.min()) + 0.5,
        float(rows.max()) - 0.5,
    )


def digitize(image, color, frame):
    """
    @brief Reads one curve out of the image by color
    @param image RGB pixels as an integer array
    @param color The line's RGB color
    @param frame The axes box from find_frame
    @return Time and value pairs, one per pixel column where the color appears
    @details A column may hold the line more than once where it rises steeply, so the pixel
    rows are split into runs and each run becomes its own point, in the order the line travels.
    """
    left, right, top, bottom = frame
    distance = np.abs(image - np.array(color)).sum(axis=2)
    hit = distance < C_COLOR_TOLERANCE
    box_left, box_right, box_top, box_bottom = C_LEGEND_BOX
    hit[box_top:box_bottom, box_left:box_right] = False
    points = []
    previous = None

    for column in range(int(left) + 1, int(right)):
        rows = np.flatnonzero(hit[int(top) + 1 : int(bottom), column]) + int(top) + 1

        if rows.size == 0:
            continue

        runs = np.split(rows, np.flatnonzero(np.diff(rows) > 2) + 1)
        centers = [float(run.mean()) for run in runs]

        if previous is not None and len(centers) > 1:
            centers.sort(key=lambda center: abs(center - previous))
            ordered = [centers[0]] + sorted(centers[1:], key=lambda c: -abs(c - centers[0]))
            centers = ordered

        for center in centers:
            time = C_X_RANGE[0] + (column - left) / (right - left) * (C_X_RANGE[1] - C_X_RANGE[0])
            value = C_Y_RANGE[1] - (center - top) / (bottom - top) * (C_Y_RANGE[1] - C_Y_RANGE[0])
            points.append((time, value))

        previous = centers[-1]

    return hold_across_gaps(points)


def hold_across_gaps(points):
    """
    @brief Holds the last value across a gap where another line hid this one
    @param points Time and value pairs in column order
    @return The same points, with a hold point before each jump across a gap longer than 0.5 s
    @details The lines are drawn on top of each other in the report, so a flat line vanishes under
    a busier one for a stretch. Without the hold, the path would slope across the gap instead of
    staying flat and then stepping, which is what the hidden line does.
    """
    held = []

    for time, value in points:
        if held and time - held[-1][0] > 0.5:
            held.append((time, held[-1][1]))

        held.append((time, value))

    return held


def write_svg(path, series, title):
    """
    @brief Writes the plot as an SVG in the style of the report's MATLAB exports
    @param path Destination file
    @param series Legend label and digitized points for each curve
    @param title The plot title, as the report printed it
    @return Nothing
    @details Colors are plain hex attributes, so scripts/theme-figures.js can recolor them.
    """
    left, right, top, bottom = 100, 1140, 36, 694
    width = C_WIDTH
    height = C_HEIGHT

    def x_at(time):
        return left + (time - C_X_RANGE[0]) / (C_X_RANGE[1] - C_X_RANGE[0]) * (right - left)

    def y_at(value):
        return bottom - (value - C_Y_RANGE[0]) / (C_Y_RANGE[1] - C_Y_RANGE[0]) * (bottom - top)

    lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
        f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
        'xmlns="http://www.w3.org/2000/svg" version="1.1">',
        f"<title>{title}</title>",
        "<desc>Redrawn from the Part 2 report figure by scripts/digitize-gantry-pulse.py</desc>",
        f'<rect x="0" y="0" width="{width}" height="{height}" fill="#ffffff"/>',
        f'<rect x="{left}" y="{top}" width="{right - left}" height="{bottom - top}" '
        'fill="#ffffff" stroke="#262626" stroke-width="1"/>',
    ]

    for tick in C_X_TICKS:
        x = x_at(tick)
        lines.append(f'<line x1="{x:.1f}" y1="{bottom}" x2="{x:.1f}" y2="{bottom - 8}" stroke="#262626" stroke-width="1"/>')
        lines.append(f'<text x="{x:.1f}" y="{bottom + 30}" font-family="Helvetica, Arial, sans-serif" font-size="22" text-anchor="middle" fill="#262626">{tick:g}</text>')

    for tick in C_Y_TICKS:
        y = y_at(tick)
        lines.append(f'<line x1="{left}" y1="{y:.1f}" x2="{left + 8}" y2="{y:.1f}" stroke="#262626" stroke-width="1"/>')
        lines.append(f'<text x="{left - 12}" y="{y + 8:.1f}" font-family="Helvetica, Arial, sans-serif" font-size="22" text-anchor="end" fill="#262626">{tick:g}</text>')

    lines.append(f'<text x="{(left + right) / 2:.1f}" y="{height - 12}" font-family="Helvetica, Arial, sans-serif" font-size="24" text-anchor="middle" fill="#262626">Time (seconds)</text>')
    lines.append(f'<text x="24" y="{(top + bottom) / 2:.1f}" font-family="Helvetica, Arial, sans-serif" font-size="24" text-anchor="middle" fill="#262626" transform="rotate(-90 24 {(top + bottom) / 2:.1f})">data</text>')
    lines.append(f'<text x="{(left + right) / 2:.1f}" y="22" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#262626">{title}</text>')

    for (label, color), points in zip(C_SERIES, series):
        hexcolor = "#%02x%02x%02x" % color
        d = " ".join(f"{'M' if index == 0 else 'L'}{x_at(t):.1f},{y_at(v):.1f}" for index, (t, v) in enumerate(points))
        lines.append(f'<path d="{d}" fill="none" stroke="{hexcolor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>')

    legend_x, legend_y = right - 232, top + 14
    lines.append(f'<rect x="{legend_x}" y="{legend_y}" width="216" height="{len(C_SERIES) * 30 + 12}" fill="#ffffff" stroke="#262626" stroke-width="1"/>')

    for index, (label, color) in enumerate(C_SERIES):
        y = legend_y + 22 + index * 30
        hexcolor = "#%02x%02x%02x" % color
        lines.append(f'<line x1="{legend_x + 12}" y1="{y - 6}" x2="{legend_x + 62}" y2="{y - 6}" stroke="{hexcolor}" stroke-width="2.5"/>')
        lines.append(f'<text x="{legend_x + 74}" y="{y}" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#262626">{label}</text>')

    lines.append("</svg>")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    """
    @brief Reads the two report PNGs and writes the two SVGs beside them
    @return Nothing
    """
    for name in ("reference-scaling", "augmented"):
        image = np.array(Image.open(C_FIGURE_DIR / f"{name}.png").convert("RGB")).astype(int)
        frame = find_frame(image)
        series = [digitize(image, color, frame) for _, color in C_SERIES]
        write_svg(C_FIGURE_DIR / f"{name}.svg", series, "Simulation of crane with controller")
        print(f"[SUCCESS] {name}.svg: " + ", ".join(f"{label} {len(points)} points" for (label, _), points in zip(C_SERIES, series)))


if __name__ == "__main__":
    main()
