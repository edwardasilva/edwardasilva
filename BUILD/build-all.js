#!/usr/bin/env node

/**
 * Main Build Script
 * Orchestrates building both resume and site components
 */

const { buildResume } = require('./build-resume');
const { buildSite } = require('./build-site');

/**
 * Main build function that coordinates all builds
 */
function buildAll() {
  console.log('🚀 Starting complete build process...\n');
  
  try {
    // Build resume and README
    console.log('📄 Building resume and README...');
    buildResume();
    
    console.log('\n🌐 Building website...');
    // Build website
    buildSite();
    
    console.log('\n✅ Complete build process finished successfully!');
    console.log('\n📋 Summary:');
    console.log('- Resume (LaTeX): resume/Edward_Silva_Resume.tex');
    console.log('- README: README.md');
    console.log('- Website: index.html');
    
    console.log('\n🔧 Next steps:');
    console.log('- For PDF: npm run compile');
    console.log('- For development: npm run dev');
    
  } catch (error) {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildAll();
}

module.exports = {
  buildAll
};