/**
 * scripts/information.js
 * Information Submodule Workflow
 *
 * Author: Edward Silva
 * Creation Date: 08 November, 2026
 * Last Update: 08 November, 2026
 *
 * Manages information/, a git submodule that points at the private repo edwardasilva/information.
 * It holds the files that stay off the public repo: resume-data.json, .agents/, and previousjobs/.
 * Only Edward can read the private repo, so anyone else who clones this one gets an empty
 * information/ folder.
 *
 * Both repos change only through pull requests. A change to information/ goes up on a branch of
 * its own and merges there first. This repo then points at the merged commit on information's
 * main branch, in a pull request of its own.
 *
 * File Structure:
 * - Global Constants: submodule path, branch, and git's repo-location variables
 * - Helpers: infoGit, hasSubmodule, requireSubmodule, toMain, pointerSha
 * - Commands: setup, status, save, pull, check
 *
 * Where this file is used within the repository:
 * - npm run info:* scripts in package.json
 * - .githooks/pre-push runs check. scripts/setup-git-hooks.js registers the hook
 *
 * Usage:
 * $ `npm run info:setup` : New clone. Fetches the submodule and puts it on its main branch
 * $ `npm run info:status` : Lists changed files in information/
 * $ `npm run info:save -- "Message"` : Commits information/ on a new branch, pushes it, and opens
 *   a pull request there
 * $ `npm run info:pull` : After that pull request merges, moves information/ to the new main and
 *   stages the pointer here
 * $ `node scripts/information.js check` : Fails if this repo points at a commit that is not on
 *   information's main branch
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_SUBMODULE = 'information';
const C_SUBMODULE_DIR = path.join(ROOT_DIR, C_SUBMODULE);
const C_BRANCH = 'main';
const C_REPO = 'edwardasilva/information';

/*
 * git sets these inside a hook, for example GIT_DIR and GIT_INDEX_FILE. Passed through, they would
 * point the submodule's git calls at this repo's index. Credential and identity variables stay.
 */
const C_LOCAL_GIT_VARS = new Set(
    spawnSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' })
        .stdout.split('\n')
        .filter(Boolean)
);

/**
 * @brief Runs git in the repo root or in the submodule
 * @param args Arguments after the git binary
 * @param options inSubmodule runs inside information/, and allowFailure returns the result
 * instead of exiting on a non-zero status
 * @return The spawnSync result
 */
function infoGit(args, { inSubmodule = true, allowFailure = false } = {}) {
    const env = Object.fromEntries(
        Object.entries(process.env).filter(([name]) => !C_LOCAL_GIT_VARS.has(name))
    );
    const result = spawnSync('git', inSubmodule ? ['-C', C_SUBMODULE_DIR, ...args] : args, {
        cwd: ROOT_DIR,
        env,
        encoding: 'utf8',
    });

    if (result.status !== 0 && !allowFailure) {
        console.error(result.stderr.trim() || result.stdout.trim());
        console.error(`[ERROR] git ${args.join(' ')} failed.`);
        process.exit(result.status || 1);
    }

    return result;
}

/**
 * @brief Reports whether information/ is a checked-out git repo
 * @return True when the submodule is present
 */
function hasSubmodule() {
    return fs.existsSync(path.join(C_SUBMODULE_DIR, '.git'));
}

/**
 * @brief Stops with a message when the submodule has not been fetched
 * @return Nothing
 */
function requireSubmodule() {
    if (!hasSubmodule()) {
        console.error('[ERROR] information/ is empty on this machine. Run `npm run info:setup`.');
        process.exit(1);
    }
}

/**
 * @brief Fetches information's main branch and switches to it, fast-forwarding to GitHub's copy
 * @return Nothing
 * @details git submodule update leaves a detached HEAD, and a merged pull request leaves its
 * branch behind. Both are safe to leave as long as main can fast-forward. Otherwise the script
 * stops and says why.
 */
function toMain() {
    infoGit(['fetch', '-q', 'origin', C_BRANCH]);
    infoGit(['switch', '-q', C_BRANCH]);

    const merged = infoGit(['merge', '-q', '--ff-only', `origin/${C_BRANCH}`], {
        allowFailure: true,
    });

    if (merged.status !== 0) {
        console.error(`[ERROR] information/ main has commits that origin/${C_BRANCH} does not.`);
        console.error('Move them to a branch and open a pull request, then run this again.');
        process.exit(1);
    }
}

/**
 * @brief Reads the submodule commit this repo's HEAD points at
 * @return The commit hash, or an empty string if HEAD has no submodule entry
 */
function pointerSha() {
    const entry = infoGit(['ls-tree', 'HEAD', C_SUBMODULE], { inSubmodule: false }).stdout;

    return entry.split(/\s+/)[2] ?? '';
}

/**
 * @brief Fetches the submodule on a new clone and puts it on main
 * @return Nothing
 */
function setup() {
    infoGit(['submodule', 'update', '--init', '--', C_SUBMODULE], { inSubmodule: false });
    toMain();
    infoGit(['branch', '-q', `--set-upstream-to=origin/${C_BRANCH}`, C_BRANCH]);
    console.log('[SUCCESS] information/ is ready.');
}

/**
 * @brief Prints the changed files in the submodule
 * @return Nothing
 */
function status() {
    requireSubmodule();
    console.log(infoGit(['status', '--short', '--branch']).stdout.trim());
}

/**
 * @brief Commits the changes in information/ on a new branch, pushes it, and opens a pull request
 * @param message Commit message and pull request title
 * @return Nothing
 * @details On main, the branch is named after the date and time. On another branch, the commit
 * goes on that branch. The pull request opens with the gh CLI when it is installed. Otherwise the
 * script prints the link to open it by hand.
 */
function save(message) {
    requireSubmodule();

    if (!message) {
        console.error(
            '[ERROR] Give the change a message: npm run info:save -- "Add Python to the SpaceX skills"'
        );
        process.exit(1);
    }

    let branch = infoGit(['symbolic-ref', '--short', '-q', 'HEAD'], {
        allowFailure: true,
    }).stdout.trim();

    if (!branch || branch === C_BRANCH) {
        const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

        branch = `update/${stamp}`;
        infoGit(['switch', '-q', '-c', branch]);
    }

    infoGit(['add', '-A']);

    if (infoGit(['diff', '--cached', '--quiet'], { allowFailure: true }).status === 0) {
        console.error('[ERROR] information/ has no changes to save.');
        process.exit(1);
    }

    infoGit(['commit', '-q', '-m', message]);
    infoGit(['push', '-q', '-u', 'origin', branch]);
    console.log(`[SUCCESS] Pushed ${branch} to edwardasilva/information.`);

    const pr = spawnSync(
        'gh',
        ['pr', 'create', '--repo', C_REPO, '--base', C_BRANCH, '--head', branch, '--fill'],
        { cwd: C_SUBMODULE_DIR, encoding: 'utf8' }
    );

    if (pr.status === 0) {
        console.log(`[SUCCESS] Opened ${pr.stdout.trim()}`);
    } else {
        console.log(
            `[NOTE] Open the pull request: https://github.com/${C_REPO}/pull/new/${branch}`
        );
    }

    console.log('[NOTE] Squash-merge it, then run `npm run info:pull` to point this repo at it.');
}

/**
 * @brief Moves information/ to the latest main and stages the new pointer in this repo
 * @return Nothing
 * @details Run after an information pull request merges. Commit the staged pointer on a branch
 * and open a pull request here.
 */
function pull() {
    requireSubmodule();

    if (infoGit(['status', '--porcelain']).stdout.trim()) {
        console.error('[ERROR] information/ has changes that are not saved.');
        console.error(
            'Run `npm run info:save -- "Message"` first, or set them aside with git stash.'
        );
        process.exit(1);
    }

    toMain();
    infoGit(['add', '--', C_SUBMODULE], { inSubmodule: false });
    console.log('[SUCCESS] information/ is on the latest main, and the new pointer is staged.');
}

/**
 * @brief Fails when this repo points at an information commit that is not on its main branch
 * @return Nothing
 * @details Run by the pre-push hook. A branch commit disappears from main's history when its pull
 * request is squash-merged, so the deploy must point at main. A clone without the submodule skips
 * this check.
 */
function check() {
    if (!hasSubmodule()) {
        return;
    }

    const sha = pointerSha();

    if (!sha) {
        return;
    }

    infoGit(['fetch', '-q', 'origin', C_BRANCH]);

    const onMain = infoGit(['merge-base', '--is-ancestor', sha, `origin/${C_BRANCH}`], {
        allowFailure: true,
    });

    if (onMain.status !== 0) {
        console.error(
            `[ERROR] This repo points at information commit ${sha.slice(0, 7)}, which is not on main.`
        );
        console.error(
            'Merge the information pull request first, then run `npm run info:pull` and commit the pointer.'
        );
        process.exit(1);
    }
}

const C_COMMANDS = { setup, status, save, pull, check };
const command = process.argv[2];

if (!C_COMMANDS[command]) {
    console.error(`Usage: node scripts/information.js <${Object.keys(C_COMMANDS).join('|')}>`);
    process.exit(1);
}

C_COMMANDS[command](process.argv.slice(3).join(' ').trim());
