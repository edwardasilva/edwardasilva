<!--
  src/drafts/film-festival/README.md
  Film Draft Notes

  Author: Edward Silva
  Creation Date: 07 November, 2026
  Last Update: 08 November, 2026

  Explains why this folder does not reach the website and how to publish it.

  Usage:
  $ `npm run dev` : Previews the page once film-festival.mdx is moved as described below

  Copyright (c) 2026 Edward Silva. All rights reserved.
  NOTICE: This file contains personal biographical data.
  It is strictly excluded from the repository's MIT License and
  may not be reproduced, distributed, or modified without permission.
-->

# Film draft

This is the write-up of the CSCI 406 film festival short. It is unpublished on purpose.

Nothing here reaches the website. The docs loader reads only `src/content/docs`. The repository is public, so this file can still be read on GitHub.

## To publish

1. Move `film-festival.mdx` to `src/content/docs/projects/film-festival.mdx`.

2. In `information/resume-data.json`, change the `film-festival` project's `Visibility` from `Hide` to `Site`. Its sidebar label, card, team, and dates are already there, so the sidebar and the project lists pick it up.

3. Fill in the `[INSERT ...]` comment at the top of `film-festival.mdx`.
