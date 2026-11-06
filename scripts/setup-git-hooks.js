/**
 * scripts/setup-git-hooks.js
 * Setup Git Hooks Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 01 November, 2026
 *
 * Points Git at the committed hooks in .githooks. The pre-commit hook builds the resume
 * and strips private paths from the index; the pre-push hook blocks private paths and
 * syncs the resume secret.
 *
 * File Structure:
 * - Global Constants: root, hook paths
 * - Setup Logic: permission repair, Git hook registration
 *
 * Used in: Repository initialization, development environment setup
 * Invoked via: npm run hooks:install, or automatically by npm install (prepare)
 *
 * Usage:
 * $ `npm run prepare` : Configures pre-commit and pre-push Git hooks for local repo
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const hookPaths = ['pre-commit', 'pre-push'].map((name) => path.join(root, '.githooks', name));

// Git runs hooks only when they are executable. Checkouts on filesystems without POSIX
// permissions can drop the bit, so restore it; failures there are harmless.
for (const hookPath of hookPaths) {
    try {
        fs.chmodSync(hookPath, 0o755);
    } catch {
        // Ignore chmod failures on filesystems that do not support POSIX permissions.
    }
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
    cwd: root,
    stdio: 'inherit',
});

if (result.status !== 0) {
    console.error('Failed to configure git hooks path.');
    process.exit(result.status || 1);
}

console.log('Configured git hooks at .githooks (pre-commit and pre-push).');
