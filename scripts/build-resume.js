/**
 * scripts/build-resume.js
 * Build Resume Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 09 November, 2026
 *
 * Syncs assets, generates the resume, and fits it on one page. The fitting method comes from
 * resume-generator (github.com/edwardasilva/resume-generator): compile, measure the real page, step
 * the size and margins down until it fits, then grow the spacing to fill the page. It also checks the
 * PDF text the way an applicant tracking system reads it. A failed compile or a resume that will not
 * fit stops with an error, so a stale PDF can never ship by accident.
 *
 * File Structure:
 * - Layout constants: the size and margin ladder and the spacing ranges
 * - syncAssets: copies src/assets into public/assets
 * - Compiling: settings, one pdflatex run, error reporting
 * - Fitting: measure, overflow, fit, fillPage
 * - Checks: text layer in reading order, empty lines, short bullets
 * - SKIP_RESUME_GENERATE and SKIP_RESUME_PDF_BUILD: CI sets both and ships the committed PDF
 *
 * Where this file is used within the repository:
 * - npm run build:resume, called by npm run build and the pre-commit hook
 *
 * Usage:
 * $ `npm run build:resume` : Fits the resume and writes public/resume/Edward_Silva_Resume.pdf
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C_BUILD_DIR, expectedText, writeResumeBody } from './generate-resume.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'resume');
const ASSET_SOURCE_DIR = path.join(ROOT_DIR, 'src', 'assets');
const ASSET_OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'assets');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'scripts', 'resume-template.tex');
const C_JOB_NAME = 'Edward_Silva_Resume';

// Layouts to try, roomiest first: font size in points and margin in inches. The floors are the
// repository's rules in information/.agents/docs/resume_rules.md: 10.5 pt text and 0.5 in margins.
const C_LAYOUTS = [
    [11.0, 0.5],
    [10.75, 0.5],
    [10.5, 0.5],
];

// Each range runs from compact to roomy. A page with room left grows all of them together, in
// proportion, until it is full. Spacing never shrinks below compact to fit more.
const C_LINE_SPACING = [1.07, 1.15];
const C_SECTION_GAP = [7.0, 10.0];
const C_SECTION_AFTER = [4.0, 6.0];
const C_ENTRY_GAP = [6.3, 8.55];
const C_LIST_TOP = [1.5, 3.0];
const C_LIST_ITEM = [1.0, 2.0];
const C_AFTER_HEADER = [4.0, 8.0];

// Room left at the bottom of a filled page, in lines, so rounding cannot push text to page two.
const C_FILL_RESERVE = 0.5;
const C_EMPTY_LINES_NOTE = 3;
const C_SHORT_LAST_LINE = 0.5;

// Characters that mean the text layer is broken: unmapped glyphs, the replacement character,
// ligature code points, and private-use glyphs.
const C_TEXT_JUNK = /\(cid:\d+\)|[�ﬀ-ﬆ-]/g;

/**
 * @brief Syncs assets from source to public directory
 * @return Nothing
 * @details Creates public/assets and recursively copies all files from src/assets
 */
function syncAssets() {
    if (fs.existsSync(ASSET_SOURCE_DIR)) {
        console.log(`[RUN] Syncing assets from ${ASSET_SOURCE_DIR} to ${ASSET_OUTPUT_DIR}`);
        fs.rmSync(ASSET_OUTPUT_DIR, { recursive: true, force: true });
        fs.mkdirSync(path.dirname(ASSET_OUTPUT_DIR), { recursive: true });
        fs.cpSync(ASSET_SOURCE_DIR, ASSET_OUTPUT_DIR, { recursive: true, force: true });
    } else {
        console.log(`[RUN] No src/assets directory at ${ASSET_SOURCE_DIR}, skipping asset sync`);
    }
}

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
 * @brief Compiles the resume at one layout
 * @param font Font size in points
 * @param margin Margin in inches
 * @param fill Spacing position
 * @return Page count and log text
 * @details SOURCE_DATE_EPOCH pins pdflatex's timestamps so the PDF is byte-identical across
 * rebuilds when the content is unchanged.
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
            'resume-template.tex',
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
    const match = log.match(
        /RESUME-END page=(\d+) used=([\d.]+)pt\s+goal=([\d.]+)pt line=([\d.]+)pt/
    );

    if (!match) {
        return null;
    }

    const [page, used, goal, line] = match.slice(1).map(Number);

    return { page, used, goal, line };
}

/**
 * @brief Works out how much content does not fit on page one
 * @param measurement Result of measure
 * @return Overflow in points, negative when there is room
 */
function overflow({ page, used, goal }) {
    return used + (page - 2) * goal;
}

/**
 * @brief Grows the spacing to fill a page that fits
 * @param font Font size in points
 * @param margin Margin in inches
 * @param compactLog Log from the compact compile
 * @return Spacing position and free lines left on the page
 * @details Line breaks do not depend on vertical spacing, so page height grows in a straight line
 * with fill. One build at the roomy end gives the slope, and one more lands on a full page.
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

    if (roomyRun.pages === 1 && roomy && -overflow(roomy) >= reserve) {
        return { fill: 1, freeLines: -overflow(roomy) / roomy.line };
    }

    const slope = roomy ? room + overflow(roomy) : 0;
    const fill = slope > 0 ? Math.min(1, (room - reserve) / slope) : 0;
    const filledRun = compileOnce(font, margin, fill);
    const filled = measure(filledRun.log);

    if (filledRun.pages !== 1 || !filled) {
        return { fill: 0, freeLines: room / compact.line };
    }

    return { fill, freeLines: -overflow(filled) / filled.line };
}

/**
 * @brief Finds the roomiest layout that fits on one page, then fills the page
 * @return Chosen font, margin, fill, and free lines
 */
function fit() {
    let lastLog = '';

    for (const [font, margin] of C_LAYOUTS) {
        const { pages, log } = compileOnce(font, margin, 0);

        lastLog = log;

        if (pages === 1) {
            return { font, margin, ...fillPage(font, margin, log) };
        }
    }

    const tightest = measure(lastLog);
    const lines = tightest ? Math.ceil(overflow(tightest) / tightest.line) : 'some';

    throw new Error(
        `[ERROR] The resume does not fit at 10.5 pt with 0.5 in margins. Cut about ${lines} lines: drop a coursework item first, then the weakest bullet, or set a project's Visibility to "Site".`
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
 * @brief Finds bullets whose last line fills less than half the line
 * @param pdfPath Finished PDF
 * @param margin Margin in inches
 * @return First words of each short bullet
 */
function shortBullets(pdfPath, margin) {
    const result = spawnSync('pdftotext', ['-bbox-layout', pdfPath, '-'], { encoding: 'utf8' });
    const pageWidth = result.stdout?.match(/<page width="([\d.]+)"/);

    if (result.status !== 0 || !pageWidth) {
        return [];
    }

    const right = Number(pageWidth[1]) - margin * 72;
    const lines = result.stdout
        .split('<block')
        .slice(1)
        .flatMap((block, blockIndex) =>
            [
                ...block.matchAll(
                    /<line xMin="([\d.]+)"[^>]*xMax="([\d.]+)"[^>]*>([\s\S]*?)<\/line>/g
                ),
            ].map((match) => ({
                blockIndex,
                start: Number(match[1]),
                end: Number(match[2]),
                words: [...match[3].matchAll(/<word[^>]*>(.*?)<\/word>/g)].map((word) => word[1]),
            }))
        );

    return lines.flatMap((line, index) => {
        if (line.words[0] !== '•' || line.words.length < 2) {
            return [];
        }

        let last = null;

        for (const next of lines.slice(index + 1)) {
            if (next.blockIndex !== line.blockIndex || next.words[0] === '•') {
                break;
            }

            last = next;
        }

        const isShort = last && (last.end - last.start) / (right - last.start) < C_SHORT_LAST_LINE;

        return isShort ? [line.words.slice(1, 6).join(' ')] : [];
    });
}

/**
 * @brief Prints the checks on the finished PDF
 * @param pdfPath Finished PDF
 * @param data Resume data, or null when generation was skipped
 * @param layout Chosen layout from fit
 * @return Nothing
 * @details A broken text layer stops the build, since it fails silently for every reader. The
 * layout notes are advice and do not.
 */
function reportChecks(pdfPath, data, { margin, freeLines }) {
    if (freeLines > C_EMPTY_LINES_NOTE) {
        console.log(
            `[NOTE] About ${Math.round(freeLines)} lines at the bottom are empty, even with roomy spacing. The page has room for another bullet or project.`
        );
    }

    if (spawnSync('pdftotext', ['-v']).error) {
        console.log('[NOTE] pdftotext is not installed, so the text checks were skipped.');
        return;
    }

    for (const start of shortBullets(pdfPath, margin)) {
        console.log(
            `[NOTE] The bullet "${start}..." ends with a short last line. Cut it, or add a detail that fills most of the line.`
        );
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
 * @brief Fits the resume, compiles the final PDF, and copies it into public/resume
 * @param data Resume data, or null when generation was skipped
 * @return Nothing
 */
function buildPdf(data) {
    if (!fs.existsSync(path.join(C_BUILD_DIR, 'body.tex'))) {
        throw new Error('[ERROR] No generated resume body. Unset SKIP_RESUME_GENERATE.');
    }

    fs.copyFileSync(TEMPLATE_PATH, path.join(C_BUILD_DIR, 'resume-template.tex'));

    const layout = fit();

    // A second run settles the PDF bookmarks at the chosen layout.
    compileOnce(layout.font, layout.margin, layout.fill);

    const { pages } = compileOnce(layout.font, layout.margin, layout.fill);

    if (pages !== 1) {
        throw new Error(`[ERROR] The final compile came to ${pages} pages.`);
    }

    const pdfPath = path.join(C_BUILD_DIR, `${C_JOB_NAME}.pdf`);

    reportChecks(pdfPath, data, layout);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.copyFileSync(pdfPath, path.join(OUTPUT_DIR, `${C_JOB_NAME}.pdf`));
    console.log(
        `[SUCCESS] Resume fits one page at ${layout.font} pt, ${layout.margin} in margins, ${Math.round(layout.fill * 100)}% spacing, ${layout.freeLines.toFixed(1)} lines free.`
    );
}

try {
    syncAssets();

    const data = process.env.SKIP_RESUME_GENERATE === '1' ? null : writeResumeBody();

    if (process.env.SKIP_RESUME_PDF_BUILD === '1') {
        console.log('[RUN] Skipping resume PDF compilation in this environment.');
    } else {
        buildPdf(data);
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
