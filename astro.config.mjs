/**
 * astro.config.mjs
 * Astro Configuration
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 14 April, 2026
 *
 * Defines site, base path, output mode, and integrations for the Astro portfolio.
 *
 * File Structure:
 * - Imports: Astro integrations and plugins
 * - Config Export: defineConfig call with environment-aware options
 *
 * Used by Astro build/dev commands.
 *
 * Licence/Copyright: Licensed under MIT License
 */

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Set ASTRO_SITE and ASTRO_BASE env vars for GitHub Pages if needed
  site: process.env.ASTRO_SITE || 'https://easilva.com',
  base:
    process.env.ASTRO_BASE && process.env.ASTRO_BASE !== '/' ? process.env.ASTRO_BASE : undefined,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
