/**
 * scripts/setup-git-hooks.js
 * Setup Git Hooks Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 08 November, 2026
 *
 * Points git at the committed hooks in .githooks/. The pre-commit hook builds the resume and strips
 * private paths from the index. The pre-push hook blocks private paths, and blocks a push that
 * points information/ at a commit that is not on its main branch. The hook files are the source of
 * truth, so this script never writes them. It only restores their executable bit and registers
 * the folder.
 *
 * File Structure:
 * - Global Constants: root and hook paths
 * - makeExecutable: restores the executable bit git needs to run a hook
 * - registerHooksPath: sets core.hooksPath
 *
 * Where this file is used within the repository:
 * - npm run hooks:install, and npm's prepare step
 *
 * Usage:
 * $ `npm run hooks:install` : Registers .githooks as this clone's hooks folder
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_HOOK_PATHS = ['pre-commit', 'pre-push'].map((name) =>
    path.join(ROOT_DIR, '.githooks', name)
);

/**
 * @brief Restores the executable bit on each hook
 * @return Nothing
 * @details Git runs a hook only when it is executable, and a checkout on a filesystem without
 * POSIX permissions can drop the bit. A failed chmod there is harmless, so it is only noted.
 */
function makeExecutable() {
    for (const hookPath of C_HOOK_PATHS) {
        try {
            fs.chmodSync(hookPath, 0o755);
        } catch {
            console.log(`[NOTE] Could not set the executable bit on ${hookPath}.`);
        }
    }
}

/**
 * @brief Registers .githooks as the hooks folder for this clone
 * @return Nothing
 */
function registerHooksPath() {
    const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
        cwd: ROOT_DIR,
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        console.error('[ERROR] Failed to configure the git hooks path.');
        process.exit(result.status || 1);
    }
}

makeExecutable();
registerHooksPath();
console.log('[SUCCESS] Configured git hooks at .githooks (pre-commit and pre-push).');
