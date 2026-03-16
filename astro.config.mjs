// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Set ASTRO_SITE and ASTRO_BASE env vars for GitHub Pages if needed
  site: process.env.ASTRO_SITE || undefined,
  base: process.env.ASTRO_BASE && process.env.ASTRO_BASE !== '/' ? process.env.ASTRO_BASE : undefined,
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
