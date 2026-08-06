/**
 * scripts/configs.js
 * Duplicate AI Configurations Script
 *
 * Author: Edward Silva
 * Creation Date: 06 August, 2026
 * Last Update: 06 August, 2026
 *
 * File Purpose:
 * Synchronizes and duplicates AI instructions, rules, playbooks, skills,
 * and docs across all local AI assistant configuration directories (.agents,
 * .gemini, .claude, .copilot, .cursor) from single edit sources in docs/ (docs/AGENTS.md).
 *
 * File Structure:
 * - Global Constants: ANSI color codes, AI target directories, source paths
 * - Utility Functions: copyRecursive, syncAiFolder
 * - Main Execution Flow: Processing target folders
 *
 * Used in: Local development maintenance
 * Invoked via: node scripts/configs.js
 *
 * Usage:
 * $ `npm run sync:ai-configs` : Synchronizes docs/AGENTS.md, RESUME.md, SKILL.md, and docs/ to .agents/, .gemini/, .claude/, .copilot/, .cursor/
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const PURPLE = '\x1b[35m';
const GREEN = '\x1b[32m';

const SOURCE_AGENTS = path.join(root, 'docs', 'AGENTS.md');
const SOURCE_DOCS = path.join(root, 'docs');
const SOURCE_SKILL = path.join(root, 'docs', 'SKILL.md');
const SOURCE_RESUME = path.join(root, 'docs', 'RESUME.md');

const TARGET_FOLDERS = ['.agents', '.gemini', '.claude', '.copilot', '.cursor'];

/**
 * @brief Recursively copies a directory or file from source to destination
 * @param src Source path to copy
 * @param dest Destination path to copy to
 * @return void
 * @details Creates destination directories if they do not exist
 */
function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else if (exists) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
    }
}

/**
 * @brief Synchronizes configuration files and docs to a single AI target folder
 * @param folder Target folder name relative to root
 * @return void
 * @details Duplicates rules, playbooks, skills, and docs using each AI assistant's native format
 */
function syncAiFolder(folder) {
    const targetDir = path.join(root, folder);

    // Clean existing folder content for fresh sync
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    // 1. Copy rules file depending on folder convention
    if (fs.existsSync(SOURCE_AGENTS)) {
        if (folder === '.claude') {
            fs.copyFileSync(SOURCE_AGENTS, path.join(targetDir, 'CLAUDE.md'));
        } else if (folder === '.copilot') {
            fs.copyFileSync(SOURCE_AGENTS, path.join(targetDir, 'copilot-instructions.md'));
            fs.copyFileSync(SOURCE_AGENTS, path.join(targetDir, 'instructions.md'));
        } else if (folder === '.cursor') {
            const rulesDir = path.join(targetDir, 'rules');
            fs.mkdirSync(rulesDir, { recursive: true });
            fs.copyFileSync(SOURCE_AGENTS, path.join(rulesDir, 'agents.mdc'));
        } else {
            // .agents, .gemini
            fs.copyFileSync(SOURCE_AGENTS, path.join(targetDir, 'AGENTS.md'));
        }
    }

    // 2. Copy RESUME.md and SKILL.md
    if (fs.existsSync(SOURCE_RESUME)) {
        if (folder === '.cursor') {
            const rulesDir = path.join(targetDir, 'rules');
            fs.copyFileSync(SOURCE_RESUME, path.join(rulesDir, 'resume.mdc'));
        } else {
            fs.copyFileSync(SOURCE_RESUME, path.join(targetDir, 'RESUME.md'));
        }
    }

    if (fs.existsSync(SOURCE_SKILL)) {
        if (folder === '.cursor') {
            const rulesDir = path.join(targetDir, 'rules');
            fs.copyFileSync(SOURCE_SKILL, path.join(rulesDir, 'skill.mdc'));
        } else {
            fs.copyFileSync(SOURCE_SKILL, path.join(targetDir, 'SKILL.md'));
        }

        // Standard skills folder format (.agents/skills/resume-review/SKILL.md, .claude/skills/..., etc.)
        const skillTargetDir = path.join(targetDir, 'skills', 'resume-review');
        fs.mkdirSync(skillTargetDir, { recursive: true });
        fs.copyFileSync(SOURCE_SKILL, path.join(skillTargetDir, 'SKILL.md'));
    }

    // 3. Copy docs directory recursively
    if (fs.existsSync(SOURCE_DOCS)) {
        copyRecursive(SOURCE_DOCS, path.join(targetDir, 'docs'));
    }

    console.log(`${GREEN}[SUCCESS]${RESET} ${GREEN}Synced AI configuration to ${folder}/${RESET}`);
}

/**
 * @brief Main function to execute AI configuration synchronization
 * @return void
 * @details Syncs docs/AGENTS.md to root AGENTS.md and loops through all target AI folders
 */
function main() {
    console.log(
        `${PURPLE}${BOLD}[SYNC]${RESET} ${PURPLE}Starting AI configuration synchronization...${RESET}`
    );

    // Keep root AGENTS.md synced from docs/AGENTS.md for root discovery
    if (fs.existsSync(SOURCE_AGENTS)) {
        fs.copyFileSync(SOURCE_AGENTS, path.join(root, 'AGENTS.md'));
        console.log(
            `${GREEN}[SUCCESS]${RESET} ${GREEN}Synced root AGENTS.md from docs/AGENTS.md${RESET}`
        );
    }

    TARGET_FOLDERS.forEach(syncAiFolder);
    console.log(
        `${GREEN}${BOLD}[SUCCESS]${RESET} ${GREEN}AI configuration duplication complete.${RESET}`
    );
}

main();
