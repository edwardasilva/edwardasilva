<!--
  src/drafts/natlock/README.md
  natlock Draft Notes

  Author: Edward Silva
  Creation Date: 07 November, 2026
  Last Update: 08 November, 2026

  Explains why this folder does not reach the website and how to publish it.

  Usage:
  $ `npm run dev` : Previews the page once natlock.mdx is moved as described below

  Copyright (c) 2026 Edward Silva. All rights reserved.
  NOTICE: This file contains personal biographical data.
  It is strictly excluded from the repository's MIT License and
  may not be reproduced, distributed, or modified without permission.
-->

# natlock draft

This is the finished write-up of the 2021 Cisco externship project. It is unpublished on purpose.

Nothing here reaches the website. The docs loader reads only `src/content/docs`, and the asset sync copies only `src/assets`. The repository is public, so these files can still be read on GitHub.

## To publish

1. Move `natlock.mdx` to `src/content/docs/projects/natlock.mdx`. Its imports already expect that location.

2. In `information/resume-data.json`, change the `natlock` project's `Visibility` from `Hide` to `Site`. Its sidebar label, card, team, and dates are already there, so the sidebar and the project lists pick it up.

3. Fill in the `[INSERT ...]` comments at the top of `natlock.mdx`.

The experience entry in `resume-data.json` stays marked `Hide`. Its proof link still points at the deck's old `/assets/Cisco/` path, so update the link if you ever show that entry.

## Files

| File                | Source                                                             |
| ------------------- | ------------------------------------------------------------------ |
| `Presentation.pptx` | The original deck, with speaker notes                              |
| `deck.pdf`          | LibreOffice export of the deck                                     |
| `model.glb`         | The 3D model embedded on slide 10                                  |
| `model.png`         | PowerPoint's still image of that model, for browsers without WebGL |
| `parts.svg`         | Slide 13, cropped                                                  |
| `ModelViewer.astro` | Drag-to-turn viewer for `model.glb`                                |
