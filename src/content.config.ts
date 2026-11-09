/**
 * src/content.config.ts
 * Content Collections
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 08 November, 2026
 *
 * Defines the docs collection Starlight reads. A project write-up holds only its title,
 * description, and body. Its kind, order, card, team, my part, dates, course, links, and
 * visibility live in resume-data.json and are matched by slug.
 *
 * File Structure:
 * - collections: docs, extended with role, which the role pages pass to the facts block
 *
 * Used in: Starlight's content loader, src/data/projects.ts, src/components/PageTitle.astro
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
                role: z.string().optional(),
            }),
        }),
    }),
};
