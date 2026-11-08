/**
 * scripts/check-pr-body.js
 * Pull Request Body Check
 *
 * Author: Edward Silva
 * Creation Date: 08 November, 2026
 * Last Update: 08 November, 2026
 *
 * Fails a pull request whose body does not name its issue on a line of its own, the same rule
 * eeprep uses. Issues are off in this repo, so the issue is usually in another one, such as
 * Part of edwardasilva/information#7 on the edwardasilva.com board. Part of #12 also passes.
 * Dependabot and pull requests labeled no-epic are exempt.
 *
 * File Structure:
 * - Inputs: PR_BODY, PR_LABELS, PR_ACTOR, and PR_SENDER from the environment
 * - Main Logic: exemptions, then the issue line
 * - readLabels: parses the label list
 *
 * Where this file is used within the repository:
 * - .github/workflows/pr-body.yml
 *
 * Usage:
 * $ `PR_BODY="Part of #12" node scripts/check-pr-body.js` : Checks a body by hand
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

const C_EXEMPT_ACTOR = 'dependabot[bot]';
const C_EXEMPT_LABEL = 'no-epic';
const C_ISSUE_LINE = /^Part of (?:[\w.-]+\/[\w.-]+)?#\d+\b/;

const actor = process.env.PR_ACTOR ?? '';
const sender = process.env.PR_SENDER ?? '';
const labels = readLabels(process.env.PR_LABELS ?? '[]');
const body = process.env.PR_BODY ?? '';

if (actor === C_EXEMPT_ACTOR || sender === C_EXEMPT_ACTOR || labels.includes(C_EXEMPT_LABEL)) {
    console.log('[SUCCESS] PR body check skipped for an exempt change.');
    process.exit(0);
}

const hasIssueLine = body.split(/\r?\n/).some((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('<!--') || trimmed.startsWith('-->')) {
        return false;
    }

    return C_ISSUE_LINE.test(trimmed);
});

if (!hasIssueLine) {
    console.error(
        '[ERROR] The PR body needs a line "Part of #<issue>", for example "Part of #12" or "Part of edwardasilva/eeprep#12".'
    );
    process.exit(1);
}

console.log('[SUCCESS] PR body names its issue.');

/**
 * @brief Parses the JSON label list GitHub passes in
 * @param raw JSON array of label names
 * @return The label names, or an empty list if the input is not a JSON array
 */
function readLabels(raw) {
    try {
        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch {
        return [];
    }
}
