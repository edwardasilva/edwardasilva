/**
 * src/data/resume.ts
 * Resume Data Module
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 14 April, 2026
 *
 * Central registry for resume data with utilities to normalize, filter, and access data.
 * Imports raw JSON and provides typed exports with asset URL normalization.
 *
 * File Structure:
 * - Asset Normalization: Functions to rewrite asset paths to /assets/ URLs
 * - Resume Export: Processed resume data with normalized assets
 * - Utility Functions: Slug generation, data filtering, lookups
 *
 * Used in: All components, pages, and API routes needing resume data
 *
 * Licence/Copyright: Licensed under MIT License
 */

import rawResumeData from './resume-data.json';
import type {
  Certification,
  Education,
  Experience,
  Project,
  ProjectProof,
  ResumeData,
} from './types';

/**
 * @brief Normalizes asset URLs to /assets/ format
 * @param url The URL to normalize
 * @return Normalized URL path starting with /assets/
 * @details Handles absolute URLs, mailto/tel protocols, and relative paths
 */
function normalizeAssetUrl(url: string): string {
  if (/^(?:https?:|mailto:|tel:)/i.test(url)) {
    return url;
  }

  const normalized = url.replace(/^\/?(?:src\/)?assets\/(?:proof\/)?/i, '/assets/');

  if (/^assets\//i.test(normalized)) {
    return `/${normalized}`;
  }

  return normalized;
}

/**
 * @brief Normalizes asset URLs in project proof objects
 * @param proof The proof object to normalize
 * @return Proof with normalized URLs
 */
function normalizeProjectProof(proof: ProjectProof): ProjectProof {
  return {
    ...proof,
    url: normalizeAssetUrl(proof.url),
    embedUrl: proof.embedUrl ? normalizeAssetUrl(proof.embedUrl) : proof.embedUrl,
  };
}

/**
 * @brief Normalizes asset URLs in project objects
 * @param project The project to normalize
 * @return Project with normalized proof URLs, or unchanged if no proofs
 */
function normalizeProject(project: Project): Project {
  if (!project.proof?.length) {
    return project;
  }

  return {
    ...project,
    proof: project.proof.map(normalizeProjectProof),
  };
}

/**
 * @brief Normalizes asset URLs in certification objects
 * @param certification The certification to normalize
 * @return Certification with normalized link URL
 */
function normalizeCertification(certification: Certification): Certification {
  if (!certification.link) {
    return certification;
  }

  return {
    ...certification,
    link: normalizeAssetUrl(certification.link),
  };
}

export const resume: ResumeData = {
  ...rawResumeData,
  projects: (rawResumeData.projects as unknown as Project[]).map(normalizeProject),
  certifications: (rawResumeData.certifications as unknown as Certification[]).map(
    normalizeCertification
  ),
} as ResumeData;

/**
 * @brief Gets the primary education entry
 * @param data Optional resume data; defaults to global resume
 * @return First education entry or undefined if none exist
 */
export function getPrimaryEducation(data: ResumeData = resume): Education | undefined {
  return data.education?.[0];
}

/**
 * @brief Gets expected graduation date from primary education
 * @param data Optional resume data; defaults to global resume
 * @return Expected graduation string or undefined
 */
export function getExpectedGraduation(data: ResumeData = resume): string | undefined {
  return getPrimaryEducation(data)?.expectedGraduation;
}

/**
 * @brief Gets resume PDF URL
 * @param data Optional resume data; defaults to global resume
 * @return URL to resume PDF, or default path if not specified
 */
export function getResumePdfUrl(data: ResumeData = resume): string {
  return data.personal.resumePdfUrl ?? '/resume/Edward_Silva_Resume.pdf';
}

/**
 * @brief Converts text to URL-safe slug
 * @param value The text to slugify
 * @return Lowercase, hyphen-separated slug
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @brief Gets slug for a project
 * @param project The project to slugify
 * @return Project's explicit slug or generated from title
 */
export function getProjectSlug(project: Pick<Project, 'title' | 'slug'>): string {
  return project.slug?.trim() || slugify(project.title);
}

/**
 * @brief Gets all portfolio projects visible on site
 * @param data Optional resume data; defaults to global resume
 * @return All projects with experienceType 'All' or 'Site'
 */
export function getPortfolioProjects(data: ResumeData = resume): Project[] {
  return data.projects.filter(
    (project) => project.experienceType === 'All' || project.experienceType === 'Site'
  );
}

/**
 * @brief Looks up a project by slug
 * @param slug The project slug to find
 * @param data Optional resume data; defaults to global resume
 * @return Project with matching slug or undefined
 */
export function getProjectBySlug(slug: string, data: ResumeData = resume): Project | undefined {
  for (const project of data.projects) {
    if (getProjectSlug(project) === slug) {
      return project;
    }
  }

  return undefined;
}

/**
 * @brief Gets all public experiences visible on site
 * @param data Optional resume data; defaults to global resume
 * @return All experiences with experienceType 'All' or 'Site'
 */
export function getPublicExperiences(data: ResumeData = resume): Experience[] {
  return data.experiences.filter(
    (experience) => experience.experienceType === 'All' || experience.experienceType === 'Site'
  );
}

/**
 * @brief Gets slug for an experience
 * @param experience The experience to slugify
 * @return Experience's explicit slug or generated from title and company
 */
export function getExperienceSlug(
  experience: Pick<Experience, 'title' | 'company' | 'slug'>
): string {
  return experience.slug?.trim() || slugify(`${experience.title}-${experience.company}`);
}

/**
 * @brief Looks up an experience by slug
 * @param slug The experience slug to find
 * @param data Optional resume data; defaults to global resume
 * @return Experience with matching slug or undefined
 */
export function getExperienceBySlug(
  slug: string,
  data: ResumeData = resume
): Experience | undefined {
  for (const experience of data.experiences) {
    if (getExperienceSlug(experience) === slug) {
      return experience;
    }
  }

  return undefined;
}
