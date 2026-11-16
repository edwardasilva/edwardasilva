/**
 * src/lib/pdf-link.ts
 * PDF Page Links
 *
 * Author: Edward Silva
 * Creation Date: 16 November, 2026
 * Last Update: 16 November, 2026
 *
 * The two links a PDF page needs: the head entry that names the PDF as another form of the page,
 * and the file name its download link saves under.
 *
 * File Structure:
 * - pdfAlternate: the rel="alternate" head entry
 * - pdfFileName: the download name
 *
 * Where this file is used within the repository:
 * - src/pages/resume/viewer.astro and src/pages/resume/cv.astro
 *
 * Usage:
 * $ `import { pdfAlternate, pdfFileName } from '../../lib/pdf-link'` : Imported by the PDF pages
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

/**
 * @brief Builds the head entry that links a page to its PDF
 * @param href URL of the PDF
 * @param name Document name, such as "Resume"
 * @return A Starlight head entry for a rel="alternate" link titled "<name> (PDF)"
 */
export function pdfAlternate(href: string, name: string) {
    return {
        tag: 'link' as const,
        attrs: { rel: 'alternate', type: 'application/pdf', href, title: `${name} (PDF)` },
    };
}

/**
 * @brief Gets the file name a PDF downloads as
 * @param href URL of the PDF
 * @return The last segment of the URL
 */
export function pdfFileName(href: string) {
    return href.split('/').at(-1);
}
