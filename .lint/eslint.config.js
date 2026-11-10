/**
 * .lint/eslint.config.js
 * ESLint Flat Configuration
 *
 * Author: Edward Silva
 * Creation Date: 14 April, 2026
 * Last Update: 08 November, 2026
 *
 * Defines repository linting rules for JavaScript, TypeScript, and Astro files.
 *
 * File Structure:
 * - Imports
 * - Ignored paths
 * - Recommended rule sets and Node globals for scripts
 *
 * Where this file is used within the repository:
 * - Invoked by npm run lint and npm run lint:fix via --config .lint/eslint.config.js
 *
 * Usage:
 * $ `npm run lint` : Validates repository source code against ESLint rules
 * $ `npm run lint:fix` : Automatically fixes fixable ESLint violations
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '.astro/**',
            '.venv/**',
            'public/resume/**',
            'public/assets/**',
            'public/vendor/**',
            '.agents/**',
            '.gemini/**',
            '.claude/**',
            '.copilot/**',
            '.cursor/**',
            'information/**',
        ],
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    eslintPluginAstro.configs['flat/recommended'],
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            globals: globals.node,
            sourceType: 'module',
        },
    }
);
