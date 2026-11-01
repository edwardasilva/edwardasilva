/**
 * scripts/sync-resume-secret.js
 * Sync Resume Secret Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 01 November, 2026
 *
 * Synchronizes local resume data and the private todo file to GitHub Actions
 * environment secrets. Repository scope remains available with --scope=repo.
 *
 * File Structure:
 * - Global Constants: root, resumePath
 * - Utility Functions: getArgValue, validation functions
 * - Main Logic: Secret synchronization with GitHub
 *
 * Used in: GitHub Actions workflow, pre-push hooks
 * Invoked via: npm run sync:resume-secret
 *
 * Usage:
 * $ `npm run sync:resume-secret` : Syncs resume-data.json and TODO.md to the github-pages environment
 * $ `npm run sync:resume-secret:env` : Same environment sync, with the scope set explicitly
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
const resumePath = path.resolve(root, 'resume-data.json');
const todoPath = path.resolve(root, 'TODO.md');

/**
 * @brief Extracts command-line argument value
 * @param flagName The flag name to search for (e.g., '--name')
 * @return The value after '=' or undefined if not found
 */
function getArgValue(flagName) {
    const prefix = `${flagName}=`;
    const match = process.argv.find((arg) => arg.startsWith(prefix));
    return match ? match.slice(prefix.length) : undefined;
}

/**
 * @brief Reads a local private file and rejects an empty result
 * @param filePath Absolute path to the file
 * @param label Short name used in error output
 * @return File contents
 */
function readPrivateFile(filePath, label) {
    if (!fs.existsSync(filePath)) {
        console.error(`${label} file not found: ${filePath}`);
        process.exit(1);
    }

    const text = fs.readFileSync(filePath, 'utf8');

    if (text.trim().length === 0) {
        console.error(`${label} file is empty: ${filePath}`);
        process.exit(1);
    }

    return text;
}

/**
 * @brief Validates resume data file exists and contains valid JSON
 * @return The JSON text if valid
 */
function validateResumeFile() {
    let jsonText = '';

    try {
        jsonText = readPrivateFile(resumePath, 'Resume');
        JSON.parse(jsonText);
    } catch (error) {
        console.error(`Local resume data file is missing or invalid JSON: ${resumePath}`);
        console.error(String(error));
        process.exit(1);
    }

    return jsonText;
}

/**
 * @brief Checks GitHub CLI is installed and user is authenticated
 */
function validateGithubCli() {
    const checkGh = spawnSync('gh', ['--version'], {
        cwd: root,
        stdio: 'ignore',
    });

    if (checkGh.status !== 0) {
        console.error(
            'GitHub CLI is not installed or not on PATH. Install from https://cli.github.com/'
        );
        process.exit(1);
    }

    const authCheck = spawnSync('gh', ['auth', 'status'], {
        cwd: root,
        stdio: 'ignore',
    });

    if (authCheck.status !== 0) {
        console.error('GitHub CLI is not authenticated. Run: gh auth login');
        process.exit(1);
    }
}

/**
 * @brief Writes one local file to a GitHub Actions secret
 * @param secretText The secret contents
 * @param secretName The secret name to update
 * @param scope The secret scope: 'repo' or 'env'
 * @param repository The target repository
 * @param environment The environment (if scope is 'env')
 * @param sourcePath Local file the secret was read from
 */
function syncSecretToGithub(secretText, secretName, scope, repository, environment, sourcePath) {
    const targetArgs =
        scope === 'env'
            ? ['secret', 'set', secretName, '--repo', repository, '--env', environment]
            : ['secret', 'set', secretName, '--repo', repository];

    const result = spawnSync('gh', targetArgs, {
        cwd: root,
        input: secretText,
        encoding: 'utf8',
    });

    if (result.status !== 0) {
        if (result.stderr) {
            console.error(result.stderr.trim());
        }
        if (result.stdout) {
            console.error(result.stdout.trim());
        }
        console.error('Failed to update GitHub Actions secret.');
        process.exit(result.status || 1);
    }

    if (result.stdout) {
        console.log(result.stdout.trim());
    }

    const scopeLabel = scope === 'env' ? `environment:${environment}` : 'repository';
    console.log(`Updated ${scopeLabel} secret ${secretName} in ${repository} from ${sourcePath}`);
}

// Main execution
const secretName = getArgValue('--name') || process.env.RESUME_SECRET_NAME || 'RESUME_DATA';
const todoSecretName = getArgValue('--todo-name') || process.env.TODO_SECRET_NAME || 'TODO_MD';
const scope = getArgValue('--scope') || process.env.RESUME_SECRET_SCOPE || 'env';
const environment = getArgValue('--env') || process.env.RESUME_SECRET_ENV || 'github-pages';
const repository =
    getArgValue('--repo') || process.env.RESUME_SECRET_REPO || 'edwardasilva/edwardasilva';

const jsonText = validateResumeFile();
const todoText = readPrivateFile(todoPath, 'Todo');
validateGithubCli();
syncSecretToGithub(jsonText, secretName, scope, repository, environment, resumePath);
syncSecretToGithub(todoText, todoSecretName, scope, repository, environment, todoPath);
