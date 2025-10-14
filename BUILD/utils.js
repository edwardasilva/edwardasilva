#!/usr/bin/env node

/**
 * Shared utilities for build scripts
 */

const fs = require('fs');
const path = require('path');

/**
 * Load resume data from JSON file
 */
function loadResumeData() {
  try {
    // Resolve path relative to this utils.js file so the script works
    // regardless of the current working directory when node is invoked.
    const resumePath = path.resolve(__dirname, '..', 'resume-data.json');
    const data = fs.readFileSync(resumePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading resume data:', error.message);
    process.exit(1);
  }
}

/**
 * Filter functions for different content types
 */
const filters = {
  /**
   * Filter relevant courses by relevancy field
   */
  filterRelevantCourses(courses) {
    return Object.fromEntries(
      Object.entries(courses).map(([category, courseList]) => [
        category,
        courseList.filter(course => course.relevancy === "Yes")
      ])
    );
  },

  /**
   * Filter experience for resume (All type only)
   */
  filterResumeExperience(experience) {
    return experience.filter(exp => exp.experienceType === "All");
  },

  /**
   * Filter projects for resume (All type only)
   */
  filterResumeProjects(projects) {
    return projects.filter(project => project.experienceType === "All");
  },

  /**
   * Filter experience for website (All and Site types)
   */
  filterWebsiteExperience(experience) {
    return experience.filter(exp => exp.experienceType === "All" || exp.experienceType === "Site");
  },

  /**
   * Filter projects for website (All and Site types)
   */
  filterWebsiteProjects(projects) {
    return projects.filter(project => project.experienceType === "All" || project.experienceType === "Site");
  },

  /**
   * Filter skills for resume (All type only)
   */
  filterResumeSkills(skills) {
    const filtered = {};
    Object.entries(skills).forEach(([category, skillList]) => {
      filtered[category] = skillList.filter(skill =>
        typeof skill === 'string' || skill.experienceType === "All"
      );
    });
    return filtered;
  },

  /**
   * Filter skills for website (All and Site types)
   */
  filterWebsiteSkills(skills) {
    const filtered = {};
    Object.entries(skills).forEach(([category, skillList]) => {
      filtered[category] = skillList.filter(skill =>
        typeof skill === 'string' || skill.experienceType === "All" || skill.experienceType === "Site"
      );
    });
    return filtered;
  },

  /**
   * Filter certifications for resume (All type only)
   */
  filterResumeCertifications(certifications) {
    return certifications.filter(cert =>
      typeof cert === 'string' || cert.experienceType === "All" || !cert.experienceType
    );
  },

  /**
   * Filter certifications for website (All and Site types)
   */
  filterWebsiteCertifications(certifications) {
    return certifications.filter(cert =>
      typeof cert === 'string' || cert.experienceType === "All" || cert.experienceType === "Site" || !cert.experienceType
    );
  },

  /**
   * Filter courses for resume (All type only)
   */
  filterResumeCourses(courses) {
    const allCourses = [];

    Object.values(courses).forEach(categoryCourses => {
      const filteredCourses = categoryCourses.filter(course =>
        course.experienceType === "All" || !course.experienceType
      );
      allCourses.push(...filteredCourses);
    });

    return allCourses;
  },

  /**
   * Filter courses for website (All and Site types)
   */
  filterWebsiteCourses(courses) {
    const allCourses = [];

    Object.values(courses).forEach(categoryCourses => {
      const filteredCourses = categoryCourses.filter(course =>
        course.experienceType === "All" || course.experienceType === "Site" || !course.experienceType
      );
      allCourses.push(...filteredCourses);
    });

    return allCourses;
  },

  /**
   * Get education context: choose primary education (first 'All' or first entry)
   * and return supplementary object as-is. This replaces the old isPrimary flag.
   */
  getEducationContext(education, supplementary = {}) {
    if (!Array.isArray(education) || education.length === 0) return { primaryEducation: null, supplementary };

    // Prefer Master's entry when it's explicitly included for resume (experienceType === 'All').
    // Otherwise, fall back to the previous behavior of picking the first 'All' or the first entry.
    const isMasters = (e) => {
      const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
      return deg.startsWith('ms') || deg.includes('master');
    };

    // Among entries marked 'All', try to find a Master's first
    const allEntries = education.filter(e => e && e.experienceType === 'All');
    const mastersPrimary = allEntries.find(isMasters);
    const primary = mastersPrimary || allEntries[0] || education[0];
    return { primaryEducation: primary, supplementary };
  },

  /**
   * Filter education for resume
   */
  filterResumeEducation(education) {
    // Use experienceType consistency: include entries marked as 'All'
    // or those explicitly marked for resume via 'Site' (if needed later)
    return education.filter(edu => edu.experienceType === 'All');
  },

  /**
   * Filter education for website
   */
  filterWebsiteEducation(education) {
    // Website should include entries marked 'All' or 'Site'
    return education.filter(edu => edu.experienceType === 'All' || edu.experienceType === 'Site');
  }
};

/**
 * LaTeX text escaping utility
 */
function escapeLatex(text) {
  if (typeof text !== 'string') return text;

  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\^{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

/**
 * Group certifications by organization
 */
function groupCertificationsByOrganization(certifications) {
  const grouped = {};

  certifications.forEach(cert => {
    const org = cert.organization || 'Other';
    if (!grouped[org]) {
      grouped[org] = [];
    }
    grouped[org].push(cert);
  });

  return grouped;
}

/**
 * Group projects by type
 */
function groupProjectsByType(projects) {
  const grouped = {};

  projects.forEach(project => {
    const type = project.projectType || 'Other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(project);
  });

  return grouped;
}

/**
 * Extract skill names from skill objects or strings
 */
function extractSkillNames(skills) {
  return skills.map(skill => typeof skill === 'string' ? skill : skill.name);
}

/**
 * Extract certification names from certification objects or strings
 * Combines Microsoft Technical Associate certifications for resume display
 */
function extractCertificationNames(certifications) {
  const javaCert = certifications.find(cert =>
    typeof cert === 'object' && cert.name === "Microsoft Technical Associate - Java Programming"
  );
  const pythonCert = certifications.find(cert =>
    typeof cert === 'object' && cert.name === "Microsoft Technical Associate - Python Programming"
  );

  // If both certifications exist, combine them for resume
  if (javaCert && pythonCert) {
    return certifications
      .filter(cert =>
        typeof cert === 'string' ||
        (cert.name !== "Microsoft Technical Associate - Java Programming" &&
          cert.name !== "Microsoft Technical Associate - Python Programming")
      )
      .map(cert => typeof cert === 'string' ? cert : cert.name)
      .concat(["Microsoft Technical Associate - Java & Python Programming"]);
  }

  // Otherwise, return all certifications as normal
  return certifications.map(cert => typeof cert === 'string' ? cert : cert.name);
}

/**
 * Extract course names from course objects
 */
function extractCourseNames(courses) {
  return courses.map(course => course.name);
}

/**
 * Group skills by subcategory
 */
function groupSkillsBySubcategory(skills) {
  const grouped = {};

  skills.forEach(skill => {
    if (typeof skill === 'object' && skill.subcategory) {
      const subcategory = skill.subcategory;
      if (!grouped[subcategory]) {
        grouped[subcategory] = [];
      }
      grouped[subcategory].push(skill);
    } else {
      if (!grouped['Other']) {
        grouped['Other'] = [];
      }
      grouped['Other'].push(skill);
    }
  });

  return grouped;
}

/**
 * Write file utility with error handling
 */
function writeFile(filepath, content) {
  try {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Generated: ${filepath}`);
  } catch (error) {
    console.error(`Error writing ${filepath}:`, error.message);
  }
}

module.exports = {
  loadResumeData,
  filters,
  escapeLatex,
  groupCertificationsByOrganization,
  groupProjectsByType,
  extractSkillNames,
  extractCertificationNames,
  extractCourseNames,
  groupSkillsBySubcategory,
  writeFile,
  getEducationContext: (education, supplementary) => filters.getEducationContext(education, supplementary),
  // Backward compatible alias: returns primary education directly
  getPrimaryEducation: (education) => filters.getEducationContext(education).primaryEducation
};