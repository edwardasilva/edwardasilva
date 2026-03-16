// Central place for resume data - import this instead of the JSON directly
import rawResumeData from './resume-data.json';
import type { Education, ResumeData } from './types';

export const resume = rawResumeData as ResumeData;

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
