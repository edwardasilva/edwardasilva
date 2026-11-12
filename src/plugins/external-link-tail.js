/**
 * src/plugins/external-link-tail.js
 * External Link Tail
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Splits link text into the part that wraps as usual and a short tail that CSS keeps on one line
 * with the arrow. A last word over 12 characters keeps only its last character in the tail.
 *
 * File Structure:
 * - splitTail
 *
 * Where this file is used within the repository:
 * - src/plugins/rehype-external-links.js and src/components/ExternalLink.astro
 *
 * Usage:
 * $ `npm run dev` : Runs on every Markdown page during the build
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

/**
 * @brief Splits link text into its head and tail
 * @param text Link text
 * @return Head and tail strings
 */
export function splitTail(text) {
    const space = text.search(/\s\S*$/);
    const word = space < 0 ? text : text.slice(space + 1);
    const cut = word.length > 12 ? text.length - 1 : space < 0 ? 0 : space + 1;

    return [text.slice(0, cut), text.slice(cut)];
}
