#!/usr/bin/env node

/**
 * Setup script for the resume system
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('Setting up Edward Silva Resume System...\n');

// Check Node.js
try {
    const nodeVersion = process.version;
    console.log(`Node.js ${nodeVersion} detected`);
} catch (error) {
    console.error('Node.js is required but not installed');
    console.log('Please install Node.js from https://nodejs.org/');
    process.exit(1);
}

// Check package.json
if (!fs.existsSync('package.json')) {
    console.error('package.json not found');
    console.log('Please run this script from the BUILD directory');
    process.exit(1);
}

// Install dependencies
console.log('\nInstalling dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
} catch (error) {
    console.error('Failed to install dependencies');
    console.log('Try running: npm install');
    process.exit(1);
}

// Check resume-data.json
if (!fs.existsSync('../resume-data.json')) {
    console.error('resume-data.json not found');
    console.log('Please ensure resume-data.json exists in the project root');
    process.exit(1);
}

// Run initial build
console.log('\nRunning initial build...');
try {
    execSync('node build-resume.js', { stdio: 'inherit' });
    console.log('Initial build completed successfully');
} catch (error) {
    console.error('Build failed');
    console.log('Check the error messages above');
    process.exit(1);
}

// Check LaTeX
console.log('\nChecking LaTeX installation...');
try {
    execSync('pdflatex --version', { stdio: 'ignore' });
    console.log('LaTeX detected - PDF compilation available');
    console.log('Run: npm run compile');
} catch (error) {
    console.log('LaTeX not detected - PDF compilation not available');
    console.log('Install LaTeX to compile PDFs:');
    console.log('  - Windows: MiKTeX (https://miktex.org/)');
    console.log('  - macOS: MacTeX (https://www.tug.org/mactex/)');
    console.log('  - Linux: TeX Live (https://www.tug.org/texlive/)');
}

console.log('\nSetup completed successfully!');
console.log('\nNext steps:');
console.log('1. Edit resume-data.json to update your information');
console.log('2. Run: npm run build');
console.log('3. For PDFs: npm run compile');
console.log('4. For development: npm run dev'); 