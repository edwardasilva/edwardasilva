/**
 * src/data/site-updated.ts
 * Site Last-Updated Date
 *
 * Author: Edward Silva
 * Creation Date: 15 November, 2026
 * Last Update: 15 November, 2026
 *
 * The one "Last updated" date in the site footer: the date of the newest commit in the build.
 * The deploy job checks out full history, so this is the date the site last changed. A build
 * outside git falls back to today.
 *
 * File Structure:
 * - siteUpdated: the date
 * - siteUpdatedText: the date as the footer shows it, such as "Nov 15, 2026"
 *
 * Where this file is used within the repository:
 * - src/components/Footer.astro
 *
 * Usage:
 * $ `npm run dev` : Runs at build time
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import { execSync } from 'node:child_process';

function newestCommitDate(): Date {
    try {
        const iso = execSync('git log -1 --format=%cI', {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        const date = new Date(iso);
        return Number.isNaN(date.getTime()) ? new Date() : date;
    } catch {
        return new Date();
    }
}

export const siteUpdated = newestCommitDate();

export const siteUpdatedText = siteUpdated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Denver',
});
