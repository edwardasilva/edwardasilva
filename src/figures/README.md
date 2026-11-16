<!--
  src/figures/README.md
  Figure Provenance

  Author: Edward Silva
  Creation Date: 10 November, 2026
  Last Update: 14 November, 2026

  Records where each plot in src/figures came from. The site does not read this file.

  Usage:
  $ `npm run figures` : Writes the -dark.svg copies this file leaves out

  Copyright (c) 2026 Edward Silva. All rights reserved.
-->

# Figure provenance

The plot SVGs in this folder are kept as exported. They were not redrawn in pgfplots, so no script or data for them is committed here. This file records where each one came from. The `-dark.svg` copies are written from the light files by `npm run figures`, so they are not listed.

## MATLAB exports

Each file carries the generator line "MATLAB, The MathWorks, Inc." in its `<desc>` tag, and was exported as SVG from a MATLAB figure. The MATLAB version is the one in that line.

The scripts that drew these plots stay in each project's private course repository. The last column names the page that shows the plot and the report that page is built from.

| File                         | MATLAB version                              | Page and report                                         |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| `pitch/latency.svg`          | R2026a Prerelease Update 3 (26.1.0.3133997) | `dsp-final`, EENG 411 report in `src/assets/DSP`        |
| `pitch/residual.svg`         | R2026a Prerelease Update 3 (26.1.0.3133997) | `dsp-final`, EENG 411 report in `src/assets/DSP`        |
| `pitch/retuning.svg`         | R2026a Prerelease Update 3 (26.1.0.3133997) | `dsp-final`, EENG 411 report in `src/assets/DSP`        |
| `gantry/step-response.svg`   | R2025b (25.2.0.2998904)                     | `MCD-project`, gantry crane reports in `src/assets/MCD` |
| `gantry/slow-swing.svg`      | R2025b (25.2.0.2998904)                     | `MCD-project`, gantry crane reports in `src/assets/MCD` |
| `gantry/cable-length.svg`    | R2025b (25.2.0.2998904)                     | `MCD-project`, gantry crane reports in `src/assets/MCD` |
| `gantry/slow-position.svg`   | R2025b (25.2.0.2998904)                     | `MCD-project`, gantry crane reports in `src/assets/MCD` |
| `estimation/ekf-force.svg`   | R2026a Prerelease Update 3 (26.1.0.3133997) | `EKF-project`, EENG 519 report in `src/assets/EKF`      |
| `estimation/ukf-force.svg`   | R2026a Prerelease Update 3 (26.1.0.3133997) | `EKF-project`, EENG 519 report in `src/assets/EKF`      |
| `estimation/disturbance.svg` | R2026a Prerelease Update 3 (26.1.0.3133997) | `EKF-project`, EENG 519 report in `src/assets/EKF`      |

## Converted from report PDFs

These two have no generator line. They were converted from a plot in a report PDF, and the glyphs are cairo paths, not text.

| File                    | Report                                              | Conversion                                                                                                                               |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `damper/v1-dyno.svg`    | Critical design report, Fig. 12                     | Not recorded.                                                                                                                            |
| `gantry/slow-delay.svg` | Part 1 report, `src/assets/MCD/MCD_P1.pdf`, Fig. 10 | Re-exported from the report's vector figure with a tight crop of the full frame, then the two data-series colors were mapped as in #119. |

## Raster plots from report PDFs

`damper/final-dyno.png` is the embedded image of Fig. 16 in the final design report, `src/assets/Capstone/FDR.pdf`, extracted unchanged with `pdfimages -png`.

## Generated in this repo

`gantry/augmented.svg` and `gantry/reference-scaling.svg` are written by `scripts/digitize-gantry-pulse.py`. That script reads each curve back out of the report's PNG screenshots, which are not committed. See its header for the details.

## Built from TikZ

`pitch/filters.svg` is built from `pitch/filters.tex` with XeLaTeX and dvisvgm. The commands are in the header of the `.tex` file. It is set in Source Serif 4 and uses glyph paths, not text.

## From eeprep's brand files

`eeprep/op-amp.svg` is the eeprep mark, `public/brand/eeprep-mark-outlined.svg` in the eeprep repo. Its paths are unchanged. Only the canvas is wider, at 3:2, so the project card's figure is as tall as the others. The eeprep name and logo are outside eeprep's open licenses, and this site uses them as the owner's mark.
