/**
 * scripts/scrub-private.js
 * Private Path Scrubber
 *
 * Author: Edward Silva
 * Creation Date: 24 October, 2026
 * Last Update: 08 November, 2026
 *
 * Keeps local AI instructions and resume source off GitHub. .gitignore already
 * skips them on add. This script removes them from the index during commit and
 * rejects a push whose tip, or any commit not yet on a remote, contains them.
 * Working tree files are not deleted.
 *
 * File Structure:
 * - Path rules: basenames and directory names that stay local
 * - isPrivatePath: classifies a repo-relative path
 * - scrubStaged: drops matching paths from the index
 * - scrubPush: reads pre-push stdin and blocks a push whose new commits contain them
 *
 * Used by .githooks/pre-commit and .githooks/pre-push, installed via scripts/setup-git-hooks.js.
 *
 * Usage:
 * $ `npm run scrub:private` : Remove private paths from the index. Files stay on disk.
 * $ `node scripts/scrub-private.js push` : Block if a pushed tip or new commit contains them.
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PRIVATE_BASENAMES = new Set([
    'resume-data.json',
    'AGENTS.md',
    'STYLE.md',
    'TODO.md',
    'CLAUDE.md',
    'GEMINI.md',
    '.cursorrules',
    'SKILL.md',
]);

const PRIVATE_DIR_NAMES = new Set([
    '.agents',
    '.gemini',
    '.claude',
    '.copilot',
    '.cursor',
    'previousjobs',
]);

/**
 * @brief Runs a git command in the repository root
 * @param args Arguments passed to git, excluding the git binary
 * @return Standard output from the command
 */
function runGit(args) {
    const result = spawnSync('git', args, {
        cwd: ROOT_DIR,
        encoding: 'utf8',
    });

    if (result.status !== 0) {
        if (result.stderr) {
            console.error(result.stderr.trim());
        }

        console.error(`[SCRUB] git ${args.join(' ')} failed.`);
        process.exit(result.status || 1);
    }

    return result.stdout;
}

/**
 * @brief Decides whether a repo-relative path must stay off GitHub
 * @param filePath Path reported by git, relative to the repository root
 * @return True when the path is local-only
 */
function isPrivatePath(filePath) {
    const normalized = filePath.replaceAll('\\', '/').replace(/^\.\//, '');
    const parts = normalized.split('/').filter(Boolean);
    const base = parts[parts.length - 1];

    if (!base) {
        return false;
    }

    if (PRIVATE_BASENAMES.has(base)) {
        return true;
    }

    if (parts[0] === 'docs') {
        return true;
    }

    return parts.some((part) => PRIVATE_DIR_NAMES.has(part));
}

/**
 * @brief Removes private paths from the index without deleting working tree files
 * @return void
 * @details Includes paths already committed, so the next commit drops them from GitHub.
 */
function scrubStaged() {
    const indexed = runGit(['ls-files', '-z']).split('\0').filter(Boolean);
    const privatePaths = indexed.filter(isPrivatePath);

    if (privatePaths.length === 0) {
        return;
    }

    console.log('[SCRUB] Removing private paths from the index. Files stay on disk.');
    privatePaths.forEach((filePath) => {
        console.log(`[SCRUB] ${filePath}`);
    });

    runGit(['rm', '--cached', '-q', '--', ...privatePaths]);
}

/**
 * @brief Blocks a push when any updated tip, or any commit it adds, contains a private path
 * @return void
 * @details Reads the pre-push hook's stdin. Each line is local ref, local sha, remote ref, remote sha.
 * A file added in one commit and deleted in a later one would still reach GitHub in history, so
 * every commit not already on a remote is checked, not just the tip. Deletions are ignored, so a
 * push that removes a leaked file is allowed.
 */
function scrubPush() {
    const stdin = process.stdin.isTTY ? '' : fs.readFileSync(0, 'utf8');
    const lines = stdin
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const blocked = new Set();

    lines.forEach((line) => {
        const parts = line.split(/\s+/);

        if (parts.length < 4) {
            console.error(`[SCRUB] Could not read pre-push ref line: ${line}`);
            process.exit(1);
        }

        const localSha = parts[1];

        if (/^0+$/.test(localSha)) {
            return;
        }

        const names = runGit(['ls-tree', '-r', '--name-only', localSha])
            .split('\n')
            .filter(Boolean);

        const historyNames = runGit([
            'log',
            '--format=',
            '--name-only',
            '--diff-filter=d',
            localSha,
            '--not',
            '--remotes',
        ])
            .split('\n')
            .filter(Boolean);

        [...names, ...historyNames].filter(isPrivatePath).forEach((name) => {
            blocked.add(name);
        });
    });

    if (blocked.size === 0) {
        return;
    }

    console.error('[SCRUB] Push blocked. These private paths are in the commits being pushed:');
    blocked.forEach((name) => {
        console.error(`[SCRUB] ${name}`);
    });
    console.error(
        '[SCRUB] The files are still on disk. Remove them from the commit, then push again.'
    );
    process.exit(1);
}

const mode = process.argv[2];

if (mode === 'staged') {
    scrubStaged();
} else if (mode === 'push') {
    scrubPush();
} else {
    console.error('Usage: node scripts/scrub-private.js <staged|push>');
    process.exit(1);
}
