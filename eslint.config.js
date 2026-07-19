/**
 * eslint.config.js
 * ESLint Flat Configuration
 *
 * Author: Edward Silva
 * Creation Date: 14 April, 2026
 * Last Update: 14 April, 2026
 *
 * Defines repository linting rules for JavaScript, TypeScript, and Astro files.
 *
 * File Structure:
 * - Imports
 * - Shared ignore patterns
 * - Language-specific rule configuration
 *
 * Where this file is used within the repository:
 * - Invoked by npm run lint and npm run lint:fix
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import parserAstro from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '.astro/**',
            'public/resume/**',
            'public/assets/**',
            'resume-data.json',
        ],
    },
    js.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'no-undef': 'off',
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    ...eslintPluginAstro.configs['flat/recommended'],
    {
        files: ['**/*.astro'],
        languageOptions: {
            parser: parserAstro,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.astro'],
            },
        },
    },
    eslintConfigPrettier,
];
