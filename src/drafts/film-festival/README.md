<!--
  src/drafts/film-festival/README.md
  Film Draft Notes

  Author: Edward Silva
  Creation Date: 07 November, 2026
  Last Update: 07 November, 2026

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

2. In `astro.config.mjs`, add this line after the ram pump entry in the Projects group:

   ```js
   { label: 'Ethical algorithms film', slug: 'projects/film-festival' },
   ```

3. Fill in the `[INSERT ...]` comment at the top of `film-festival.mdx`.
