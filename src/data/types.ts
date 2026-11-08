/**
 * src/data/types.ts
 * Resume Data Type Definitions
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 08 November, 2026
 *
 * Types for the normalized resume data the site renders. Field names match
 * resume-data.json, and fields only the resume generator reads are left out.
 *
 * File Structure:
 * - Scopes: VisibilityScope
 * - Sections: PersonalInfo, About, Education, Course, Experience, Project, Certification,
 *   Organization, Site
 * - Derived types: SkillEntry, SkillReference
 *
 * Used in: src/data/resume.ts and the components that display resume data
 *
 * Usage:
 * $ `import type { ResumeData } from './types'` : Imported for resume data type safety
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

export type VisibilityScope = 'All' | 'Site' | 'Hide';

export interface PersonalInfo {
    name: string;
    email: string;
    website: string;
    linkedin: string;
    github: string;
    resumePdfUrl?: string;
}

export interface AboutRole {
    title: string;
    employer: string;
    location?: string;
    duration?: string;
    Summary?: string;
}

export interface About {
    Highlights: string;
    Summary?: string;
    intro: string[];
    earlyWork: {
        Summary?: string;
        roles: AboutRole[];
    };
    path: string[];
    future: string[];
    Visibility: VisibilityScope;
}

export interface Course {
    code: string;
    name: string;
    alias?: string;
    description: string;
    Summary?: string;
    relevancy: string;
    skills: string[];
    Visibility: VisibilityScope;
}

export interface Education {
    institution: string;
    url?: string;
    wikipedia?: string;
    location: string;
    degree: string;
    specialization?: string;
    minor?: string;
    graduationDate: string;
    gpa?: string;
    honors: string[];
    scholarships: string[];
    courses: Record<string, Course[]>;
    Visibility: VisibilityScope;
}

export interface Proof {
    title: string;
    type: 'pdf' | 'video' | 'image' | 'link' | 'file';
    url: string;
    description?: string;
    embedUrl?: string;
}

export interface WorkEntry {
    title: string;
    slug?: string;
    navLabel?: string;
    Summary?: string;
    duration: string;
    skills: string[];
    siteSkills?: string[];
    proof: Proof[];
    Resume: string[];
    Highlights: string[];
    Visibility: VisibilityScope;
}

export interface Experience extends WorkEntry {
    company: string;
    companyUrl?: string;
    location: string;
    employmentType?: string;
}

export type ProjectKind = 'project' | 'personal';

export interface ProjectLink {
    label: string;
    href: string;
}

export interface Project extends WorkEntry {
    github?: string;
    course?: string;
    kind?: ProjectKind;
    order?: number;
    dek?: string;
    figure?: string;
    figureAlt?: string;
    team?: string;
    myPart?: string;
    links: ProjectLink[];
}

export interface Certification {
    name: string;
    organization: string;
    link?: string;
    description: string;
    skills: string[];
    Visibility: VisibilityScope;
}

export interface Organization {
    name: string;
    chapter?: string;
    url?: string;
    role: string;
    duration: string;
    Summary?: string;
    Visibility: VisibilityScope;
}

export interface PageCopy {
    description: string;
    intro?: string;
}

export interface Site {
    description: string;
    aboutPublished: boolean;
    person: {
        jobTitle: string;
        worksFor: { name: string; url: string };
        occupation: string;
        knowsAbout: string[];
    };
    pages: Record<'home' | 'projects' | 'experiences' | 'coursework' | 'skills', PageCopy>;
}

export interface ResumeData {
    personal: PersonalInfo;
    about: About;
    education: Education[];
    experiences: Experience[];
    projects: Project[];
    certifications: Certification[];
    organizations: Organization[];
    TopSkills: string[];
    ResumeSkills: string[];
    site: Site;
}

export interface SkillReference {
    label: string;
    href: string;
}

export interface SkillEntry {
    name: string;
    slug: string;
    references: SkillReference[];
}
