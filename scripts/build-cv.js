/**
 * scripts/build-cv.js
 * Build CV Script
 *
 * Author: Edward Silva
 * Creation Date: 11 November, 2026
 * Last Update: 11 November, 2026
 *
 * Generates the CV and fits it on two pages with the same method as scripts/build-resume.js:
 * compile, measure the real page, step the size and margins down until it fits, then grow the
 * spacing to fill the second page. It checks the PDF text the way an applicant tracking system
 * reads it. A failed compile or a CV that will not fit in two pages stops with an error. No entry
 * is dropped to make it fit. This script has its own build directory, template, job name, and
 * output, and it does not touch the resume or public/assets.
 *
 * File Structure:
 * - Layout constants: the size and margin ladder, the spacing ranges, and the page ceiling
 * - Compiling: settings, one pdflatex run, error reporting
 * - Fitting: measure, overflow, fit, fillPage
 * - Checks: text layer in reading order
 * - SKIP_RESUME_GENERATE and SKIP_RESUME_PDF_BUILD: CI sets both and ships the committed PDF
 *
 * Where this file is used within the repository:
 * - npm run build:cv, called by npm run build
 *
 * Usage:
 * $ `npm run build:cv` : Fits the CV and writes public/cv/Edward_Silva_CV.pdf
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C_BUILD_DIR, expectedText, writeCvBody } from './generate-cv.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'cv');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'scripts', 'cv-template.tex');
const C_JOB_NAME = 'Edward_Silva_CV';
const C_MAX_PAGES = 2;

// Layouts to try, roomiest first: font size in points and margin in inches. The floors match the
// resume's rules in information/.agents/docs/resume_rules.md: 10.5 pt text and 0.5 in margins.
const C_LAYOUTS = [
    [11.0, 0.5],
    [10.75, 0.5],
    [10.5, 0.5],
];

// Each range runs from compact to roomy. A CV with room left grows all of them together, in
// proportion, until the last page is full. Spacing never shrinks below compact to fit more.
const C_LINE_SPACING = [1.07, 1.15];
const C_SECTION_GAP = [7.0, 10.0];
const C_SECTION_AFTER = [4.0, 6.0];
const C_ENTRY_GAP = [6.3, 8.55];
const C_LIST_TOP = [1.5, 3.0];
const C_LIST_ITEM = [1.0, 2.0];
const C_AFTER_HEADER = [4.0, 8.0];

// Room left at the bottom of a filled page, in lines, so rounding cannot push text to page three.
const C_FILL_RESERVE = 0.5;
const C_EMPTY_LINES_NOTE = 3;

// Characters that mean the text layer is broken: unmapped glyphs, the replacement character,
// ligature code points, and private-use glyphs.
const C_TEXT_JUNK = /\(cid:\d+\)|[�ﬀ-ﬆ-]/g;

/**
 * @brief Finds a value part way along a spacing range
 * @param range Compact and roomy values
 * @param fill 0 for compact, 1 for roomy
 * @return Interpolated value
 */
function grow([compact, roomy], fill) {
    return compact + fill * (roomy - compact);
}

/**
 * @brief Writes the LaTeX definitions for one layout
 * @param font Font size in points
 * @param margin Margin in inches
 * @param fill Spacing position from 0 (compact) to 1 (roomy)
 * @return Nothing
 */
function writeSettings(font, margin, fill) {
    const line = font * 1.2 * grow(C_LINE_SPACING, fill);
    const lengths = {
        sectiongap: C_SECTION_GAP,
        sectionafter: C_SECTION_AFTER,
        listtop: C_LIST_TOP,
        listitem: C_LIST_ITEM,
        afterheader: C_AFTER_HEADER,
    };
    const definitions = Object.entries(lengths).map(
        ([name, range]) => `\\newcommand{\\${name}}{${grow(range, fill).toFixed(2)}pt}`
    );

    fs.writeFileSync(
        path.join(C_BUILD_DIR, 'settings.tex'),
        [
            `\\newcommand{\\resumemargin}{${margin}in}`,
            `\\newcommand{\\resumefont}{\\fontsize{${font}pt}{${line.toFixed(2)}pt}\\selectfont}`,
            `\\newcommand{\\entrygap}{\\par\\vspace{${grow(C_ENTRY_GAP, fill).toFixed(2)}pt}}`,
            ...definitions,
            '',
        ].join('\n'),
        'utf8'
    );
}

/**
 * @brief Pulls a short message out of a failed LaTeX run
 * @param log LaTeX log text
 * @return First error and the two lines after it
 */
function latexError(log) {
    const lines = log.split('\n');
    const first = lines.findIndex((line) => line.startsWith('!'));

    return first < 0
        ? 'LaTeX stopped without an error message.'
        : lines.slice(first, first + 3).join(' ');
}

/**
 * @brief Compiles the CV at one layout
 * @param font Font size in points
 * @param margin Margin in inches
 * @param fill Spacing position
 * @return Page count and log text
 * @details SOURCE_DATE_EPOCH pins pdflatex's timestamps so the PDF is byte-identical across
 * rebuilds on the same TeX distribution when the content is unchanged.
 */
function compileOnce(font, margin, fill) {
    writeSettings(font, margin, fill);

    const logPath = path.join(C_BUILD_DIR, `${C_JOB_NAME}.log`);

    fs.rmSync(logPath, { force: true });

    const result = spawnSync(
        'pdflatex',
        [
            '-interaction=nonstopmode',
            '-halt-on-error',
            '-no-shell-escape',
            `-jobname=${C_JOB_NAME}`,
            'cv-template.tex',
        ],
        {
            cwd: C_BUILD_DIR,
            env: { ...process.env, SOURCE_DATE_EPOCH: '0', FORCE_SOURCE_DATE: '1' },
            stdio: 'ignore',
        }
    );

    if (result.error) {
        throw new Error(
            '[ERROR] pdflatex not found on PATH. Install TeX Live or MiKTeX, or set SKIP_RESUME_PDF_BUILD=1 to skip.'
        );
    }

    const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'latin1') : '';

    if (result.status !== 0) {
        throw new Error(`[ERROR] LaTeX failed: ${latexError(log)}\nFull log: ${logPath}`);
    }

    const pages = log.match(/Output written on [\s\S]*?\((\d+) pages?/);

    if (!pages) {
        throw new Error(`[ERROR] LaTeX produced no pages. Full log: ${logPath}`);
    }

    return { pages: Number(pages[1]), log };
}

/**
 * @brief Reads the page measurement the template writes to the log
 * @param log LaTeX log text
 * @return Page, used height, page goal, and line height in points, or null when missing
 */
function measure(log) {
    const match = log.match(/CV-END page=(\d+) used=([\d.]+)pt\s+goal=([\d.]+)pt line=([\d.]+)pt/);

    if (!match) {
        return null;
    }

    const [page, used, goal, line] = match.slice(1).map(Number);

    return { page, used, goal, line };
}

/**
 * @brief Works out how much content does not fit in the page ceiling
 * @param measurement Result of measure
 * @return Overflow in points, negative when there is room
 */
function overflow({ page, used, goal }) {
    return used + (page - (C_MAX_PAGES + 1)) * goal;
}

/**
 * @brief Grows the spacing to fill the last page of a CV that fits
 * @param font Font size in points
 * @param margin Margin in inches
 * @param compactLog Log from the compact compile
 * @return Spacing position and free lines left in the page ceiling
 * @details Line breaks do not depend on vertical spacing, so height grows nearly in a straight line
 * with fill. One build at the roomy end gives the slope, and one more lands near a full page. A
 * page break can move, so a landing that no longer fits falls back to the compact layout.
 */
function fillPage(font, margin, compactLog) {
    const compact = measure(compactLog);

    if (!compact) {
        return { fill: 0, freeLines: 0 };
    }

    const reserve = C_FILL_RESERVE * compact.line;
    const room = -overflow(compact);

    if (room <= reserve) {
        return { fill: 0, freeLines: room / compact.line };
    }

    const roomyRun = compileOnce(font, margin, 1);
    const roomy = measure(roomyRun.log);

    if (roomyRun.pages <= C_MAX_PAGES && roomy && -overflow(roomy) >= reserve) {
        return { fill: 1, freeLines: -overflow(roomy) / roomy.line };
    }

    const slope = roomy ? room + overflow(roomy) : 0;
    const fill = slope > 0 ? Math.min(1, (room - reserve) / slope) : 0;
    const filledRun = compileOnce(font, margin, fill);
    const filled = measure(filledRun.log);

    if (filledRun.pages > C_MAX_PAGES || !filled) {
        return { fill: 0, freeLines: room / compact.line };
    }

    return { fill, freeLines: -overflow(filled) / filled.line };
}

/**
 * @brief Finds the roomiest layout that fits in two pages, then fills the last page
 * @return Chosen font, margin, fill, and free lines
 */
function fit() {
    let lastLog = '';

    for (const [font, margin] of C_LAYOUTS) {
        const { pages, log } = compileOnce(font, margin, 0);

        lastLog = log;

        if (pages <= C_MAX_PAGES) {
            return { font, margin, ...fillPage(font, margin, log) };
        }
    }

    const tightest = measure(lastLog);
    const lines = tightest ? Math.ceil(overflow(tightest) / tightest.line) : 'some';

    throw new Error(
        `[ERROR] The CV does not fit in two pages at 10.5 pt with 0.5 in margins. It runs about ${lines} lines over. Trim a CV bullet in resume-data.json, or set an entry's Visibility to "Hide".`
    );
}

/**
 * @brief Reduces text to how a reader sees it
 * @param text Raw text
 * @return Text with straight quotes, plain hyphens, and single spaces
 */
function plain(text) {
    return String(text)
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * @brief Checks the PDF's text layer against the data
 * @param pdfPath Finished PDF
 * @param data Resume data
 * @return Problems found, empty when the text reads cleanly
 */
function checkText(pdfPath, data) {
    const result = spawnSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { encoding: 'utf8' });

    if (result.status !== 0) {
        return [`pdftotext could not read the PDF: ${result.stderr.trim()}`];
    }

    const problems = [...result.stdout.matchAll(C_TEXT_JUNK)].map(
        (match) => `unreadable text "${match[0]}" at offset ${match.index}`
    );
    const text = plain(result.stdout);
    let position = 0;

    for (const want of expectedText(data).map(plain)) {
        const found = text.indexOf(want, position);

        if (found >= 0) {
            position = found + want.length;
        } else {
            problems.push(
                text.includes(want) ? `out of reading order: "${want}"` : `missing: "${want}"`
            );
        }
    }

    return problems;
}

/**
 * @brief Prints the checks on the finished PDF
 * @param pdfPath Finished PDF
 * @param data Resume data, or null when generation was skipped
 * @param layout Chosen layout from fit
 * @return Nothing
 * @details A broken text layer stops the build, since it fails silently for every reader. The
 * layout note is advice and does not.
 */
function reportChecks(pdfPath, data, { freeLines }) {
    if (freeLines > C_EMPTY_LINES_NOTE) {
        console.log(
            `[NOTE] About ${Math.round(freeLines)} lines at the bottom are empty, even with roomy spacing.`
        );
    }

    if (spawnSync('pdftotext', ['-v']).error) {
        console.log('[NOTE] pdftotext is not installed, so the text checks were skipped.');
        return;
    }

    if (!data) {
        return;
    }

    const problems = checkText(pdfPath, data);

    if (problems.length > 0) {
        throw new Error(
            `[ERROR] The PDF does not extract cleanly, so an applicant tracking system may misread it:\n  - ${problems.join('\n  - ')}`
        );
    }

    console.log('[SUCCESS] Text check: every entry extracts whole and in reading order.');
}

/**
 * @brief Fits the CV, compiles the final PDF, and copies it into public/cv
 * @param data Resume data, or null when generation was skipped
 * @return Nothing
 */
function buildPdf(data) {
    if (!fs.existsSync(path.join(C_BUILD_DIR, 'body.tex'))) {
        throw new Error('[ERROR] No generated CV body. Unset SKIP_RESUME_GENERATE.');
    }

    fs.copyFileSync(TEMPLATE_PATH, path.join(C_BUILD_DIR, 'cv-template.tex'));

    const layout = fit();

    // A second run settles the PDF bookmarks at the chosen layout.
    compileOnce(layout.font, layout.margin, layout.fill);

    const { pages } = compileOnce(layout.font, layout.margin, layout.fill);

    if (pages > C_MAX_PAGES) {
        throw new Error(`[ERROR] The final compile came to ${pages} pages.`);
    }

    const pdfPath = path.join(C_BUILD_DIR, `${C_JOB_NAME}.pdf`);

    reportChecks(pdfPath, data, layout);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.copyFileSync(pdfPath, path.join(OUTPUT_DIR, `${C_JOB_NAME}.pdf`));
    console.log(
        `[SUCCESS] CV fits ${pages} pages at ${layout.font} pt, ${layout.margin} in margins, ${Math.round(layout.fill * 100)}% spacing, ${layout.freeLines.toFixed(1)} lines free.`
    );
}

try {
    const data = process.env.SKIP_RESUME_GENERATE === '1' ? null : writeCvBody();

    if (process.env.SKIP_RESUME_PDF_BUILD === '1') {
        console.log('[RUN] Skipping CV PDF compilation in this environment.');
    } else {
        buildPdf(data);
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
