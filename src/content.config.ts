/**
 * src/content.config.ts
 * Content Collections
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Defines the docs collection Starlight reads, with the project fields the facts block, the
 * project index, and the home page use. Dates, course, proof, and visibility stay in
 * resume-data.json and are matched by slug.
 *
 * File Structure:
 * - collections: docs, extended with kind, order, card, team, and my part
 *
 * Used in: Starlight's content loader, src/components/ProjectFacts.astro, src/data/projects.ts
 *
 * Usage:
 * $ `npm run dev` : Loaded by Astro when it syncs content
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
    docs: defineCollection({
        loader: docsLoader(),
        schema: docsSchema({
            extend: z.object({
                kind: z.enum(['project', 'personal']).optional(),
                order: z.number().optional(),
                dek: z.string().optional(),
                figure: z.string().optional(),
                figureAlt: z.string().optional(),
                team: z.string().optional(),
                myPart: z.string().optional(),
                when: z.string().optional(),
                course: z.string().optional(),
                links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
            }),
        }),
    }),
};
