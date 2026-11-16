/**
 * public/scripts/draw-pdf.mjs
 * PDF Drawing Loop
 *
 * Author: Edward Silva
 * Creation Date: 16 November, 2026
 * Last Update: 16 November, 2026
 *
 * Draws every page of a PDF into a host element with PDF.js, one canvas per page, scaled to the
 * host's width and the screen pixel ratio. PDF.js loads the first time a PDF is drawn. It lives in
 * public/ because both viewers use inline module scripts, which import it by URL.
 *
 * File Structure:
 * - drawPdf: loads PDF.js and draws each page in order
 *
 * Where this file is used within the repository:
 * - src/components/PdfPages.astro and src/components/PdfViewer.astro
 *
 * Usage:
 * $ `import { drawPdf } from '/scripts/draw-pdf.mjs'` : Imports the loop in a browser module
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

/**
 * @brief Draws each page of a PDF into a host element
 * @param host Element the page canvases are appended to
 * @param url URL of the PDF
 * @param label Words before the page numbers in each canvas label, such as "Page"
 * @return {Promise<void>} Resolves when every page has been painted
 * @details Each canvas is labeled "<label> N of M" for screen readers.
 */
export async function drawPdf(host, url, label) {
    const { getDocument, GlobalWorkerOptions } = await import('/vendor/pdf.min.mjs');

    GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.mjs';

    const pdf = await getDocument({ url }).promise;
    const cssWidth = host.clientWidth;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    for (let number = 1; number <= pdf.numPages; number += 1) {
        const page = await pdf.getPage(number);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (cssWidth / base.width) * pixelRatio });
        const canvas = document.createElement('canvas');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `${label} ${number} of ${pdf.numPages}`);
        host.append(canvas);

        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport,
            canvas,
        }).promise;
    }
}
