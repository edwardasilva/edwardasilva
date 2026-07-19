/**
 * scripts/generate-pdf-thumbs.js
 * PDF Thumbnail Generation Script
 *
 * Author: Edward Silva
 * Creation Date: 18 July, 2026
 * Last Update: 18 July, 2026
 *
 * Renders the first page of every PDF referenced in resume-data.json proof
 * entries to a PNG in src/assets/thumbs, so project pages can show a real
 * preview without embedding a PDF viewer. Thumbnails are regenerated only
 * when missing or older than their source PDF.
 *
 * File Structure:
 * - Constants: directory paths and thumbnail naming convention
 * - Main Logic: proof scanning, staleness check, first-page rendering
 *
 * Used in: npm run build (before build:resume asset sync)
 * Invoked via: npm run build:thumbs
 *
 * Licence/Copyright: Licensed under MIT License
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pdf } from 'pdf-to-img';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT_DIR, 'src', 'assets');
const THUMB_DIR = path.join(ASSET_DIR, 'thumbs');
const RESUME_DATA = path.join(ROOT_DIR, 'resume-data.json');

/**
 * @brief Maps a proof asset URL to its thumbnail file name
 * @param url Proof URL such as /assets/DSP/Writeup.pdf
 * @return Thumbnail file name such as DSP-Writeup.png
 */
function thumbNameFor(url) {
    return url
        .replace(/^\/assets\//, '')
        .replace(/\.pdf$/i, '.png')
        .replace(/\//g, '-');
}

/**
 * @brief Collects unique PDF proof URLs from resume data
 * @param data Parsed resume-data.json contents
 * @return Array of /assets/... PDF URLs
 */
function collectPdfUrls(data) {
    const urls = new Set();
    for (const project of data.projects ?? []) {
        for (const proof of project.proof ?? []) {
            if (proof.type === 'pdf' && proof.url?.startsWith('/assets/')) {
                urls.add(proof.url);
            }
        }
    }
    return [...urls];
}

async function generateThumbnails() {
    const data = JSON.parse(fs.readFileSync(RESUME_DATA, 'utf8'));
    const pdfUrls = collectPdfUrls(data);

    if (pdfUrls.length === 0) {
        console.log('No PDF proofs found; skipping thumbnail generation.');
        return;
    }

    fs.mkdirSync(THUMB_DIR, { recursive: true });

    for (const url of pdfUrls) {
        const pdfPath = path.join(ASSET_DIR, url.replace(/^\/assets\//, ''));
        const thumbPath = path.join(THUMB_DIR, thumbNameFor(url));

        if (!fs.existsSync(pdfPath)) {
            console.warn(`PDF missing for thumbnail: ${pdfPath}`);
            continue;
        }

        const pdfMtime = fs.statSync(pdfPath).mtimeMs;
        if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).mtimeMs >= pdfMtime) {
            continue;
        }

        const document = await pdf(pdfPath, { scale: 2 });
        for await (const page of document) {
            fs.writeFileSync(thumbPath, page);
            break;
        }
        console.log(`Generated thumbnail: ${path.relative(ROOT_DIR, thumbPath)}`);
    }
}

generateThumbnails().catch((err) => {
    console.error('Thumbnail generation failed:', err);
    process.exit(1);
});
