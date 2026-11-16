/**
 * src/data/sidebar-parents.ts
 * Sidebar Parent Groups
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Finds sidebar groups that open with a link to their own page. A group whose first link has the
 * group's label is a parent page: the link is the label, and the other entries are its sub-pages.
 *
 * File Structure:
 * - splitParentGroup: separates the parent link from its children
 * - hasCurrent: whether the current page sits inside an entry
 *
 * Where this file is used within the repository:
 * - src/components/SidebarTree.astro
 *
 * Usage:
 * $ `npm run dev` : Renders in the local development server
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import type { StarlightRouteData } from '@astrojs/starlight/route-data';

export type Entry = StarlightRouteData['sidebar'][number];
export type Link = Extract<Entry, { type: 'link' }>;

/**
 * @brief Separates a parent-page group into its link and sub-pages
 * @param entry Sidebar entry
 * @return The parent link and children, or null for any other entry
 */
export function splitParentGroup(entry: Entry): { parent: Link; children: Entry[] } | null {
    if (entry.type !== 'group') {
        return null;
    }

    const [first, ...children] = entry.entries;

    if (first?.type !== 'link' || first.label.trim() !== entry.label.trim()) {
        return null;
    }

    return { parent: first, children };
}

/**
 * @brief Checks whether the current page is anywhere inside an entry
 * @param entry Sidebar entry
 * @return True when the entry or a descendant is current
 */
export function hasCurrent(entry: Entry): boolean {
    return entry.type === 'link' ? entry.isCurrent : entry.entries.some(hasCurrent);
}
