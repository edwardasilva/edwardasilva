/**
 * scripts/sync-resume-secret.js
 * Sync Resume Secret Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 14 April, 2026
 *
 * Synchronizes resume data from local JSON file to GitHub Actions secrets.
 * Supports both repository and environment-level secrets via GitHub CLI.
 *
 * File Structure:
 * - Global Constants: root, resumePath
 * - Utility Functions: getArgValue, validation functions
 * - Main Logic: Secret synchronization with GitHub
 *
 * Used in: GitHub Actions workflow, pre-push hooks
 * Invoked via: npm run sync:resume-secret
 *
 * Licence/Copyright: Licensed under MIT License
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const resumePath = path.join(root, 'src', 'data', 'resume-data.json');

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
 * @brief Validates resume data file exists and contains valid JSON
 * @return The JSON text if valid
 */
function validateResumeFile() {
  if (!fs.existsSync(resumePath)) {
    console.error(`Resume file not found: ${resumePath}`);
    process.exit(1);
  }

  let jsonText = '';
  try {
    jsonText = fs.readFileSync(resumePath, 'utf8');
    JSON.parse(jsonText);
  } catch (error) {
    console.error('Local src/data/resume-data.json is missing or invalid JSON.');
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
 * @brief Updates GitHub Actions secret with resume data
 * @param jsonText The resume JSON content
 * @param secretName The secret name to update
 * @param scope The secret scope: 'repo' or 'env'
 * @param repository The target repository
 * @param environment The environment (if scope is 'env')
 */
function syncSecretToGithub(jsonText, secretName, scope, repository, environment) {
  const targetArgs =
    scope === 'env'
      ? ['secret', 'set', secretName, '--repo', repository, '--env', environment]
      : ['secret', 'set', secretName, '--repo', repository];

  const result = spawnSync('gh', targetArgs, {
    cwd: root,
    input: jsonText,
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
  console.log(
    `Updated ${scopeLabel} secret ${secretName} in ${repository} from src/data/resume-data.json`
  );
}

// Main execution
const secretName = getArgValue('--name') || process.env.RESUME_SECRET_NAME || 'RESUME_DATA';
const scope = getArgValue('--scope') || process.env.RESUME_SECRET_SCOPE || 'repo';
const environment = getArgValue('--env') || process.env.RESUME_SECRET_ENV || 'github-pages';
const repository =
  getArgValue('--repo') || process.env.RESUME_SECRET_REPO || 'edwardasilva/edwardasilva';

const jsonText = validateResumeFile();
validateGithubCli();
syncSecretToGithub(jsonText, secretName, scope, repository, environment);
