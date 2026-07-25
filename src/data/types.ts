/**
 * src/data/types.ts
 * Resume Data Type Definitions
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 25 July, 2026
 *
 * Central type definitions for all resume data structures. Used throughout the portfolio
 * to ensure type safety and consistent data modeling across components and pages.
 *
 * File Structure:
 * - Interfaces: PersonalInfo, About, Education, Course, Experience, Volunteer, Project
 * - Complex Types: Proof, SkillEntry, SkillReference, ResumeData
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

export interface AboutRole {
    title: string;
    employer: string;
    location?: string;
    duration?: string;
    Summary?: string;
}

export interface AboutEarlyWork {
    Summary?: string;
    roles: AboutRole[];
}

export interface About {
    Resume: string;
    Highlights: string;
    text?: string;
    Summary?: string;
    intro: string[];
    earlyWork: AboutEarlyWork;
    path: string[];
    future: string[];
    careerGoals: string[];
    extracurriculars: string[];
    photos: ProfilePhoto[];
    evidence: ProfileEvidence[];
    Visibility: VisibilityScope;
}

export interface Education {
    institution: string;
    location: string;
    degree: string;
    specialization?: string;
    minor?: string;
    startDate?: string;
    graduationDate: string;
    gpa?: string;
    honors: string[];
    scholarships: string[];
    courses: Record<string, Course[]>;
    Visibility: VisibilityScope;
}

export interface Course {
    code: string;
    name: string;
    alias?: string;
    description: string;
    relevancy: string;
    skills?: string[];
    Priority: number;
    Visibility: VisibilityScope;
}

export interface Experience {
    title: string;
    slug?: string;
    Summary?: string;
    company: string;
    companyUrl?: string;
    location: string;
    duration: string;
    startDate: string;
    endDate: string;
    type: string;
    skills?: string[];
    proof?: Proof[];
    Resume: string[];
    Highlights: string[];
    Visibility: VisibilityScope;
}

export interface Volunteer {
    title: string;
    slug?: string;
    Summary?: string;
    organization: string;
    organizationUrl?: string;
    location: string;
    duration: string;
    startDate?: string;
    endDate?: string;
    skills?: string[];
    proof?: Proof[];
    Resume: string[];
    Highlights: string[];
    Visibility: VisibilityScope;
}

export interface Project {
    title: string;
    slug?: string;
    Summary?: string;
    skills: string[];
    github?: string;
    duration: string;
    course?: string;
    Resume: string[];
    Highlights: string[];
    proof?: Proof[];
    Visibility: VisibilityScope;
}

export interface Proof {
    title: string;
    type: 'pdf' | 'video' | 'image' | 'link' | 'file';
    url: string;
    description?: string;
    embedUrl?: string;
}

export interface SkillReference {
    label: string;
    href: string;
    kind: 'Experience' | 'Project' | 'Volunteer' | 'Course' | 'Certification';
}

export interface SkillEntry {
    name: string;
    slug: string;
    references: SkillReference[];
}

export interface Certification {
    name: string;
    organization: string;
    credly?: string;
    link?: string;
    description: string;
    skills?: string[];
    Visibility: VisibilityScope;
}

export interface ResumeData {
    personal: PersonalInfo;
    skillPriority: string[];
    about: About;
    education: Education[];
    experiences: Experience[];
    volunteer: Volunteer[];
    projects: Project[];
    certifications: Certification[];
}
