// Central place for resume data - import this instead of the JSON directly
import rawResumeData from './resume-data.json';
import type { Certification, Education, Experience, Project, ProjectProof, ResumeData } from './types';

function normalizeAssetUrl(url: string): string {
  // Public files should resolve from /assets/... regardless of source data prefix.
  if (/^(?:https?:|mailto:|tel:)/i.test(url)) {
    return url;
  }

  const normalized = url.replace(/^\/?(?:src\/)?assets\/(?:proof\/)?/i, '/assets/');

  if (/^assets\//i.test(normalized)) {
    return `/${normalized}`;
  }

  return normalized;
}

function normalizeProjectProof(proof: ProjectProof): ProjectProof {
  return {
    ...proof,
    url: normalizeAssetUrl(proof.url),
    embedUrl: proof.embedUrl ? normalizeAssetUrl(proof.embedUrl) : proof.embedUrl,
  };
}

function normalizeProject(project: Project): Project {
  if (!project.proof?.length) {
    return project;
  }

  return {
    ...project,
    proof: project.proof.map(normalizeProjectProof),
  };
}

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
  certifications: (rawResumeData.certifications as unknown as Certification[]).map(normalizeCertification),
} as ResumeData;

// First education entry is treated as primary
export function getPrimaryEducation(data: ResumeData = resume): Education | undefined {
  return data.education?.[0];
}

export function getExpectedGraduation(data: ResumeData = resume): string | undefined {
  return getPrimaryEducation(data)?.expectedGraduation;
}

export function getResumePdfUrl(data: ResumeData = resume): string {
  return data.personal.resumePdfUrl ?? '/resume/Edward_Silva_Resume.pdf';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProjectSlug(project: Pick<Project, 'title' | 'slug'>): string {
  return project.slug?.trim() || slugify(project.title);
}

export function getPortfolioProjects(data: ResumeData = resume): Project[] {
  return data.projects.filter((project) => project.experienceType === 'All' || project.experienceType === 'Site');
}

export function getProjectBySlug(slug: string, data: ResumeData = resume): Project | undefined {
  for (const project of data.projects) {
    if (getProjectSlug(project) === slug) {
      return project;
    }
  }

  return undefined;
}

export function getPublicExperiences(data: ResumeData = resume): Experience[] {
  return data.experiences.filter((experience) => experience.experienceType === 'All' || experience.experienceType === 'Site');
}

export function getExperienceSlug(experience: Pick<Experience, 'title' | 'company' | 'slug'>): string {
  return experience.slug?.trim() || slugify(`${experience.title}-${experience.company}`);
}

export function getExperienceBySlug(slug: string, data: ResumeData = resume): Experience | undefined {
  for (const experience of data.experiences) {
    if (getExperienceSlug(experience) === slug) {
      return experience;
    }
  }

  return undefined;
}
