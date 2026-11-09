/**
 * scripts/generate-pdf-thumbs.js
 * PDF Thumbnail Generation Script
 *
 * Author: Edward Silva
 * Creation Date: 18 July, 2026
 * Last Update: 09 November, 2026
 *
 * Renders the first page of every PDF that a project page lists as proof in
 * resume-data.json to a 400 px wide WebP in src/assets/thumbs, so project pages
 * can show a real preview without embedding a PDF viewer. Thumbnails are
 * regenerated only when missing or older than their source PDF.
 *
 * File Structure:
 * - Constants: directory paths
 * - Main Logic: shown-proof lookup, staleness check, first-page rendering
 *
 * Used in: npm run build (before build:resume asset sync)
 * Invoked via: npm run build:thumbs
 *
 * Usage:
 * $ `npm run build:thumbs` : Generates WebP thumbnails for all PDF proof assets
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import { listShownProofs, thumbNameFor } from './shown-proofs.js';

const THUMB_WIDTH = 400;
const THUMB_QUALITY = 80;
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = path.join(ROOT_DIR, 'src', 'assets');
const THUMB_DIR = path.join(ASSET_DIR, 'thumbs');
const RESUME_DATA = path.join(ROOT_DIR, 'information', 'resume-data.json');

/**
 * @brief Generates a thumbnail for every shown PDF proof that is missing or out of date
 * @return Promise that resolves when every thumbnail is written
 */
async function generateThumbnails() {
    const data = JSON.parse(fs.readFileSync(RESUME_DATA, 'utf8'));
    const pdfUrls = listShownProofs(data).thumbs;

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
            const resized = await sharp(page)
                .resize({ width: THUMB_WIDTH })
                .webp({ quality: THUMB_QUALITY })
                .toBuffer();
            fs.writeFileSync(thumbPath, resized);
            break;
        }
        console.log(`Generated thumbnail: ${path.relative(ROOT_DIR, thumbPath)}`);
    }
}

generateThumbnails().catch((err) => {
    console.error('Thumbnail generation failed:', err);
    process.exit(1);
});
