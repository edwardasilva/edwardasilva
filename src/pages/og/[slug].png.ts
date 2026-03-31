import { html } from 'satori-html';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { getPortfolioProjects, getProjectSlug, getExperienceSlug, getPublicExperiences } from '../../data/resume';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const projects = getPortfolioProjects();
  const experiences = getPublicExperiences();

  const paths = [
    ...projects.map((project) => ({
      params: { slug: getProjectSlug(project) },
      props: { type: 'Project', title: project.title, tags: project.technologies.slice(0, 4) },
    })),
    ...experiences.map((exp) => ({
      params: { slug: getExperienceSlug(exp) },
      props: { type: 'Experience', title: exp.title, tags: [exp.company, exp.duration] },
    }))
  ];

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { type, title, tags } = props as { type: string; title: string; tags: string[] };

  // Read Inter font
  const interFontPath = path.resolve('./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff');
  const interFontData = await fs.readFile(interFontPath);

  const interBoldPath = path.resolve('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');
  const interBoldData = await fs.readFile(interBoldPath);

  const markup = html`
    <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #f8f7f2; padding: 60px; justify-content: space-between; font-family: 'Inter'; border: 30px solid #dfd3b8;">
      <div style="display: flex; flex-direction: column;">
        <p style="font-size: 32px; font-weight: 700; color: #6f84bb; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 20px;">
          Edward Silva • ${type}
        </p>
        <h1 style="font-size: 72px; font-weight: 700; color: #292b31; margin: 0; line-height: 1.1;">
          ${title}
        </h1>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        ${tags.map((tag: string) => `<div style="display: flex; background-color: #f7f2e4; border: 2px solid #dfd3b8; padding: 12px 24px; border-radius: 12px; font-size: 28px; font-weight: 700; color: #5f6578;">${tag}</div>`).join('')}
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interFontData,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBoldData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render().asPng();

  return new Response(pngData as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
