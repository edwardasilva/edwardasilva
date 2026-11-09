/**
 * scripts/shown-proofs.js
 * Shown Proof Helper
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 09 November, 2026
 *
 * Works out which proof files in resume-data.json a page really shows. A project page shows a
 * proof through a ProofList tag, or links it by hand with an /assets/ path in the page text. A
 * proof that neither does is not copied to the site, and its PDF is not thumbnailed.
 *
 * File Structure:
 * - Constants: paths and the ProofList tag pattern
 * - readPageSources: reads every page under src/content/docs
 * - listedProofs: proofs that a ProofList tag lists, with their type
 * - listShownProofs: URLs a page shows, and PDF URLs that need a thumbnail
 * - thumbNameFor: maps a PDF proof URL to its thumbnail file name
 *
 * Where this file is used within the repository:
 * - scripts/generate-pdf-thumbs.js
 * - scripts/build-resume.js
 *
 * Usage:
 * $ `import { listShownProofs } from './shown-proofs.js'` : Called by the build scripts
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE_DIR = path.join(ROOT_DIR, 'src', 'content', 'docs');
const LIST_TAG = /<ProofList\b([^>]*)\/>/g;
const ATTRIBUTE = /(\w+)="([^"]*)"/g;
const ASSET_LINK = /\/assets\/[^\s"')\]>]+/g;

/**
 * @brief Maps a PDF proof URL to its thumbnail file name
 * @param url Proof URL such as /assets/DSP/Writeup.pdf
 * @return Thumbnail file name such as DSP-Writeup.webp
 */
export function thumbNameFor(url) {
    return url
        .replace(/^\/assets\//, '')
        .replace(/\.pdf$/i, '.webp')
        .replace(/\//g, '-');
}

/**
 * @brief Reads the text of every page file
 * @param dir Directory to walk
 * @return Array of page texts
 */
function readPageSources(dir = PAGE_DIR) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return readPageSources(full);
        }

        return /\.mdx?$/.test(entry.name) ? [fs.readFileSync(full, 'utf8')] : [];
    });
}

/**
 * @brief Finds the proofs that ProofList tags show
 * @param data Parsed resume-data.json contents
 * @param sources Page texts
 * @return Array of proof entries
 * @details A tag with only="video" keeps just the proofs of that type, as ProofList.astro does
 */
function listedProofs(data, sources) {
    const proofs = [];

    for (const source of sources) {
        for (const tag of source.matchAll(LIST_TAG)) {
            const attributes = Object.fromEntries(
                [...tag[1].matchAll(ATTRIBUTE)].map((match) => [match[1], match[2]])
            );
            const project = (data.projects ?? []).find((entry) => entry.slug === attributes.slug);

            for (const proof of project?.proof ?? []) {
                if (!attributes.only || proof.type === attributes.only) {
                    proofs.push(proof);
                }
            }
        }
    }

    return proofs;
}

/**
 * @brief Lists the proof files a page shows
 * @param data Parsed resume-data.json contents
 * @return Object with the /assets/ URLs to leave out, and the PDF proof URLs that need a thumbnail
 * @details A proof is hidden when it lives under /assets/, no ProofList tag lists it, and no page
 *          links its path by hand. The thumbnail of a PDF that no ProofList tag lists is left out too
 */
export function listShownProofs(data) {
    const sources = readPageSources();
    const listed = listedProofs(data, sources);
    const linked = new Set(sources.flatMap((source) => source.match(ASSET_LINK) ?? []));
    const hidden = new Set();

    for (const section of [data.projects, data.experiences]) {
        for (const entry of section ?? []) {
            for (const proof of entry.proof ?? []) {
                const isShown = listed.some((item) => item.url === proof.url);

                if (proof.url?.startsWith('/assets/') && !isShown && !linked.has(proof.url)) {
                    hidden.add(proof.url);
                }
            }
        }
    }

    const thumbs = [
        ...new Set(
            listed
                .filter((proof) => proof.type === 'pdf' && proof.url?.startsWith('/assets/'))
                .map((proof) => proof.url)
        ),
    ];

    for (const section of [data.projects, data.experiences]) {
        for (const entry of section ?? []) {
            for (const proof of entry.proof ?? []) {
                if (proof.type === 'pdf' && !thumbs.includes(proof.url)) {
                    hidden.add(`/assets/thumbs/${thumbNameFor(proof.url)}`);
                }
            }
        }
    }

    return { hidden, thumbs };
}
