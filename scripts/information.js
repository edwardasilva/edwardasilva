/**
 * scripts/information.js
 * Information Submodule Sync
 *
 * Author: Edward Silva
 * Creation Date: 08 November, 2026
 * Last Update: 08 November, 2026
 *
 * Manages information/, a git submodule that points at the private repo edwardasilva/information.
 * It holds the files that stay off the public repo: resume-data.json, TODO.md, .agents/, and
 * previousjobs/. Only Edward can read the private repo, so anyone else who clones this one gets an
 * empty information/ folder.
 *
 * File Structure:
 * - Global Constants: submodule path, branch, and git's repo-location variables
 * - Helpers: infoGit, requireSubmodule, onBranch, commitChanges
 * - Commands: setup, status, commit, push, save, pull
 *
 * Where this file is used within the repository:
 * - npm run info:* scripts in package.json
 * - .githooks/pre-commit runs commit, and .githooks/pre-push runs push. scripts/setup-git-hooks.js
 *   registers both hooks
 *
 * Usage:
 * $ `npm run info:setup` : New clone. Fetches the submodule and puts it on its main branch
 * $ `npm run info:status` : Lists changed files in information/
 * $ `npm run info:pull` : Saves local changes, then pulls the other machine's
 * $ `npm run info:save` : Commits changes in information/ and pushes them
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_SUBMODULE = 'information';
const C_SUBMODULE_DIR = path.join(ROOT_DIR, C_SUBMODULE);
const C_BRANCH = 'main';

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
 * @brief Puts the submodule on its main branch, so commits never land on a detached HEAD
 * @return Nothing
 * @details git submodule update leaves a detached HEAD. When main already contains that commit,
 * or can fast-forward to it, switching is safe. Otherwise the script stops and says why.
 */
function onBranch() {
    const branch = infoGit(['symbolic-ref', '--short', '-q', 'HEAD'], { allowFailure: true });

    if (branch.status === 0 && branch.stdout.trim() === C_BRANCH) {
        return;
    }

    const head = infoGit(['rev-parse', 'HEAD']).stdout.trim();

    infoGit(['switch', '-q', C_BRANCH]);

    const merged = infoGit(['merge', '-q', '--ff-only', head], { allowFailure: true });

    if (merged.status !== 0) {
        console.error(`[ERROR] information/ was on ${head}, which main cannot fast-forward to.`);
        console.error('Open information/ and merge it by hand, then run this again.');
        process.exit(1);
    }
}

/**
 * @brief Commits every change in the submodule, if there are any
 * @return True when a commit was made
 */
function commitChanges() {
    onBranch();
    infoGit(['add', '-A']);

    if (infoGit(['diff', '--cached', '--quiet'], { allowFailure: true }).status === 0) {
        return false;
    }

    infoGit(['commit', '-q', '-m', `Update from ${os.hostname()} at ${new Date().toISOString()}`]);
    return true;
}

/**
 * @brief Fetches the submodule on a new clone and puts it on main
 * @return Nothing
 */
function setup() {
    infoGit(['submodule', 'update', '--init', '--', C_SUBMODULE], { inSubmodule: false });
    onBranch();
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
 * @brief Commits submodule changes so the parent commit records the new pointer
 * @return Nothing
 * @details Run by the pre-commit hook before it stages tracked changes, which include the pointer.
 * A clone without the submodule skips this step.
 */
function commit() {
    if (!hasSubmodule()) {
        return;
    }

    if (commitChanges()) {
        console.log('[RUN] Committed the changes in information/.');
    }
}

/**
 * @brief Pushes the submodule's main branch
 * @return Nothing
 * @details Run by the pre-push hook, so the commit the parent points at exists on GitHub before
 * the deploy looks for it.
 */
function push() {
    requireSubmodule();
    onBranch();

    const result = infoGit(['push', '-q', 'origin', C_BRANCH], { allowFailure: true });

    if (result.status !== 0) {
        console.error(result.stderr.trim());
        console.error('[ERROR] information/ did not push. If the other machine pushed first,');
        console.error('run `npm run info:pull`, then push again.');
        process.exit(1);
    }

    console.log('[SUCCESS] information/ pushed.');
}

/**
 * @brief Commits and pushes the submodule, then stages its new pointer in this repo
 * @return Nothing
 * @details git skips a commit when nothing is staged before the pre-commit hook runs, so a change
 * made only inside information/ needs the pointer staged first. After this, `git commit` works.
 */
function save() {
    requireSubmodule();
    commit();
    push();
    infoGit(['add', '--', C_SUBMODULE], { inSubmodule: false });
    console.log('[SUCCESS] Staged the new information/ pointer. Commit this repo to record it.');
}

/**
 * @brief Saves local changes, then merges the other machine's changes
 * @return Nothing
 */
function pull() {
    requireSubmodule();
    commit();

    const result = infoGit(['pull', '-q', '--no-rebase', '--no-edit', 'origin', C_BRANCH], {
        allowFailure: true,
    });

    if (result.status !== 0) {
        console.error(result.stderr.trim());
        console.error('[ERROR] The pull did not finish. Both machines changed the same lines.');
        console.error('Fix the conflict markers in information/, then run `npm run info:save`.');
        process.exit(1);
    }

    console.log(
        '[SUCCESS] information/ is up to date. Commit this repo to record the new pointer.'
    );
}

const C_COMMANDS = { setup, status, commit, push, save, pull };
const command = process.argv[2];

if (!C_COMMANDS[command]) {
    console.error(`Usage: node scripts/information.js <${Object.keys(C_COMMANDS).join('|')}>`);
    process.exit(1);
}

C_COMMANDS[command]();
