/**
 * src/plugins/rehype-external-links.js
 * Rehype External Links
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 08 November, 2026
 *
 * Opens links to other sites in a new tab and marks them for the arrow CSS draws. Each one gets
 * target, rel, the external-link class, and a screen-reader hint. Adapted from eeprep.com.
 *
 * File Structure:
 * - Hosts: this site, from personal.website in resume-data.json, never counts as external
 * - walk, isExternal, mark, withTail: the tree transform
 *
 * Where this file is used within the repository:
 * - astro.config.mjs, in the Markdown pipeline
 *
 * Usage:
 * $ `npm run dev` : Runs on every Markdown page during the build
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import fs from 'node:fs';
import { splitTail } from './external-link-tail.js';

const C_SITE_HOST = new URL(
    JSON.parse(
        fs.readFileSync(new URL('../../information/resume-data.json', import.meta.url), 'utf8')
    ).personal.website
).hostname
    .toLowerCase()
    .replace(/^www\./, '');
const C_OWN_HOSTS = new Set([C_SITE_HOST, `www.${C_SITE_HOST}`]);

/**
 * @brief Checks whether a link element points at another site
 * @param node Link element from the HTML tree
 * @return True for http or https links outside this site
 */
function isExternal(node) {
    const href = String(node.properties?.href ?? '');

    if (!/^https?:\/\//i.test(href)) {
        return false;
    }

    try {
        return !C_OWN_HOSTS.has(new URL(href).hostname.toLowerCase());
    } catch {
        return false;
    }
}

/**
 * @brief Wraps link text so the last word stays on one line with the arrow
 * @param children Child nodes of the link
 * @return Replacement child list
 */
function withTail(children) {
    const last = children.at(-1);

    if (!last) {
        return children;
    }

    const head = children.slice(0, -1);
    let tail = [last];

    if (last.type === 'text') {
        const [start, end] = splitTail(last.value);

        if (start) {
            head.push({ type: 'text', value: start });
        }

        tail = [{ type: 'text', value: end }];
    }

    return [
        {
            type: 'element',
            tagName: 'span',
            properties: { className: ['es-ext-text'] },
            children: [
                ...head,
                {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['es-ext-last'] },
                    children: tail,
                },
            ],
        },
    ];
}

/**
 * @brief Adds the new-tab attributes and hint to a link
 * @param node Link element from the HTML tree
 * @return Nothing
 */
function mark(node) {
    const classes = node.properties.className ?? [];

    node.properties.className = [
        ...(Array.isArray(classes) ? classes : [classes]),
        'external-link',
    ];
    node.properties.target = '_blank';
    node.properties.rel = ['noopener', 'noreferrer'];
    node.children = withTail(node.children);
    node.children.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['sr-only'] },
        children: [{ type: 'text', value: ' (opens in a new tab)' }],
    });
}

/**
 * @brief Walks the tree and marks external links
 * @param node Tree node
 * @return Nothing
 * @details Punctuation right after a link joins it in a wrapper, so it never starts a line.
 */
function walk(node) {
    const children = node?.children ?? [];

    for (let index = 0; index < children.length; index += 1) {
        const child = children[index];

        if (child?.type === 'element' && child.tagName === 'a' && isExternal(child)) {
            mark(child);

            const next = children[index + 1];
            const punctuation = next?.type === 'text' ? /^[.,;:!?)\]]+/.exec(next.value) : null;

            if (punctuation) {
                next.value = next.value.slice(punctuation[0].length);
                children[index] = {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['es-ext'] },
                    children: [child, { type: 'text', value: punctuation[0] }],
                };

                if (!next.value) {
                    children.splice(index + 1, 1);
                }
            }
        } else {
            walk(child);
        }
    }
}

/**
 * @brief Builds the rehype plugin
 * @return Tree transform
 */
export default function rehypeExternalLinks() {
    return (tree) => {
        walk(tree);
    };
}
