import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const RESUME_DIR = path.join(ROOT_DIR, 'resume');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'resume');
const GENERATE_SCRIPT = path.join(ROOT_DIR, 'scripts', 'generate-resume.js');

console.log(`Resume Directory: ${RESUME_DIR}`);
console.log(`Output Directory: ${OUTPUT_DIR}`);

// Only compile these (skip any experimental variants)
const ALLOWED_TEX_FILES = new Set([
	'Edward_Silva_Resume.tex'
]);

// Regenerate TeX files first (skip with SKIP_RESUME_GENERATE=1)
if (process.env.SKIP_RESUME_GENERATE !== '1') {
	console.log('\nRegenerating TeX from src/data/resume-data.json...\n');
	execSync(`node "${GENERATE_SCRIPT}"`, { stdio: 'inherit', cwd: ROOT_DIR });
}

if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
	const files = fs
		.readdirSync(RESUME_DIR)
		.filter(f => f.endsWith('.tex') && ALLOWED_TEX_FILES.has(f));

	console.log(`Found ${files.length} resume files to compile.`);

	for (const file of files) {
		console.log(`Step 1: Compiling ${file}...`);
		try {
			const cmd = `pdflatex -interaction=nonstopmode -output-directory="${OUTPUT_DIR}" "${file}"`;
			execSync(cmd, {
				stdio: 'inherit',
				cwd: RESUME_DIR
			});
			console.log(`Compiled ${file} successfully.`);
		} catch (e) {
			console.error(`Failed to compile ${file}. It might have errors or missing dependencies.`);
			// Don't exit process, try others.
		}
		console.log(`Step 2: Compiling ${file}...`);
		try {
			const cmd = `pdflatex -interaction=nonstopmode -output-directory="${OUTPUT_DIR}" "${file}"`;
			execSync(cmd, {
				stdio: 'inherit',
				cwd: RESUME_DIR
			});
			console.log(`Compiled ${file} successfully.`);
		} catch (e) {
			console.error(`Failed to compile ${file}. It might have errors or missing dependencies.`);
			// Don't exit process, try others.
		}
	}

	// Clean up auxiliary files (log, aux, out) in OUTPUT_DIR
	const extensions = ['.aux', '.log', '.out', '.toc'];
	if (fs.existsSync(OUTPUT_DIR)) {
		const generatedFiles = fs.readdirSync(OUTPUT_DIR);
		for (const file of generatedFiles) {
			if (extensions.some(ext => file.endsWith(ext))) {
				fs.unlinkSync(path.join(OUTPUT_DIR, file));
			}
		}
	}
} catch (err) {
	if (err.code === 'ENOENT') {
		console.warn('Resume directory not found. Skipping resume build.');
	} else {
		console.error('Error during resume build:', err);
		process.exit(1);
	}
}

console.log('Resume compilation complete.');
