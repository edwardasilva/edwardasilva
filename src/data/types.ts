/**
 * src/data/types.ts
 * Resume Data Type Definitions
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 14 April, 2026
 *
 * Central type definitions for all resume data structures. Used throughout the portfolio
 * to ensure type safety and consistent data modeling across components and pages.
 *
 * File Structure:
 * - Interfaces: PersonalInfo, Profile, Education, Course, Experience, Project, etc.
 * - Complex Types: EducationSupplementary, Skills, ResumeData
 *
 * Used in: src/data/resume.ts, all components that display resume data
 *
 * Licence/Copyright: Licensed under MIT License
 */

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  website: string;
  linkedin: string;
  github: string;
  resumePdfUrl?: string;
  relocation: string;
  citizenship: string;
  clearance: string;
}

export interface Profile {
  text: string;
  experienceType: string;
}

export interface Education {
  institution: string;
  location: string;
  degree: string;
  specialization: string;
  minor?: string;
  startDate?: string;
  expectedGraduation: string;
  gpa?: string;
  experienceType: string;
}

export interface Course {
  code: string;
  name: string;
  alias?: string;
  description: string;
  relevancy: string;
  experienceType: string;
}

export interface EducationSupplementary {
  honors: string[];
  scholarships: string[];
  courses: Record<string, Course[]>;
}

export interface Experience {
  title: string;
  slug?: string;
  company: string;
  location: string;
  duration: string;
  startDate: string;
  endDate: string;
  type: string;
  description: string[];
  experienceType: string;
}

export interface Project {
  title: string;
  slug?: string;
  summary?: string;
  technologies: string[];
  github?: string;
  duration: string;
  description: string[];
  proof?: ProjectProof[];
  experienceType: string;
  projectType: string;
}

export interface ProjectProof {
  title: string;
  type: 'pdf' | 'video' | 'image' | 'link' | 'file';
  url: string;
  description?: string;
  embedUrl?: string;
}

export interface Skill {
  name: string;
  experienceType: string;
}

export interface Skills {
  [category: string]: Skill[];
}

export interface Certification {
  name: string;
  organization: string;
  credly?: string;
  link?: string;
  description: string;
  experienceType: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  profile: Profile;
  education: Education[];
  educationSupplementary: EducationSupplementary;
  experiences: Experience[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  careerGoals: string[];
  extracurriculars: string[];
}
