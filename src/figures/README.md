# Figure provenance

The plot SVGs in this folder are kept as exported. They were not redrawn in pgfplots, so no script or data for them is committed here. This file records where each one came from. The `-dark.svg` copies are written from the light files by `npm run figures`, so they are not listed.

Entries that read `[INSERT ...]` are facts only the original MATLAB files and reports hold. They are left open on purpose and must be filled in from those sources.

## MATLAB exports

Each file carries the generator line "MATLAB, The MathWorks, Inc." in its `<desc>` tag, and was exported as SVG from a MATLAB figure. The MATLAB version is the one in that line.

| File | MATLAB version | Report | MATLAB script and commit |
| --- | --- | --- | --- |
| `pitch/latency.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `pitch/residual.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `pitch/retuning.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `gantry/step-response.svg` | R2025b (25.2.0.2998904) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `gantry/slow-swing.svg` | R2025b (25.2.0.2998904) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `gantry/cable-length.svg` | R2025b (25.2.0.2998904) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `gantry/slow-position.svg` | R2025b (25.2.0.2998904) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `estimation/ekf-force.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `estimation/ukf-force.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |
| `estimation/disturbance.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | [INSERT REPORT] | [INSERT SCRIPT AND COMMIT] |

## Converted from report PDFs

These two have no generator line. They were converted from a plot in a report PDF, and the glyphs are cairo paths, not text.

| File | Report | Conversion |
| --- | --- | --- |
| `damper/v1-dyno.svg` | [INSERT REPORT] | [INSERT HOW IT WAS CONVERTED] |
| `gantry/slow-delay.svg` | [INSERT REPORT] | [INSERT HOW IT WAS CONVERTED] |

## Generated in this repo

`gantry/augmented.svg` and `gantry/reference-scaling.svg` are written by `scripts/digitize-gantry-pulse.py`. That script reads each curve back out of the report's PNG screenshots, which are not committed. See its header for the details.

## Built from TikZ

`pitch/filters.svg` is built from `pitch/filters.tex` with XeLaTeX and dvisvgm. The commands are in the header of the `.tex` file. It is set in Source Serif 4 and uses glyph paths, not text.
