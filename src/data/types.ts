/**
 * src/data/types.ts
 * Resume Data Type Definitions
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 18 July, 2026
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
    Resume: string;
    Highlights: string;
    text?: string;
    careerGoals: string[];
    extracurriculars: string[];
    photos: ProfilePhoto[];
    evidence: ProfileEvidence[];
    Visibility: VisibilityScope;
}

export interface ProfilePhoto {
    title: string;
    url: string;
    alt?: string;
    description?: string;
}

export interface ProfileEvidence {
    title: string;
    type: 'pdf' | 'video' | 'image' | 'link' | 'file';
    url: string;
    description?: string;
    embedUrl?: string;
}

export type VisibilityScope = 'All' | 'Site' | 'Hide';

export interface Education {
    institution: string;
    location: string;
    degree: string;
    specialization?: string;
    minor?: string;
    startDate?: string;
    graduationDate: string;
    gpa?: string;
    Visibility: VisibilityScope;
}

export interface Course {
    code: string;
    name: string;
    alias?: string;
    description: string;
    relevancy: string;
    Priority: number;
    Visibility: VisibilityScope;
}

export interface EducationSupplementary {
    honors: string[];
    scholarships: string[];
    courses: Record<string, Course[]>;
}

export interface Experience {
    title: string;
    slug?: string;
    summary?: string;
    company: string;
    companyUrl?: string;
    location: string;
    duration: string;
    startDate: string;
    endDate: string;
    type: string;
    technologies?: string[];
    Resume: string[];
    Highlights: string[];
    Visibility: VisibilityScope;
}

export interface Project {
    title: string;
    slug?: string;
    summary?: string;
    technologies: string[];
    github?: string;
    duration: string;
    course?: string;
    Resume: string[];
    Highlights: string[];
    proof?: ProjectProof[];
    Visibility: VisibilityScope;
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
    Visibility: VisibilityScope;
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
    Visibility: VisibilityScope;
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
}
