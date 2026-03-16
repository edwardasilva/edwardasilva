import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const resumePath = path.join(root, 'src', 'data', 'resume-data.json');

function getArgValue(flagName) {
	const prefix = `${flagName}=`;
	const match = process.argv.find((arg) => arg.startsWith(prefix));
	return match ? match.slice(prefix.length) : undefined;
}

const secretName = getArgValue('--name') || process.env.RESUME_SECRET_NAME || 'RESUME_DATA';
const scope = getArgValue('--scope') || process.env.RESUME_SECRET_SCOPE || 'repo';
const environment = getArgValue('--env') || process.env.RESUME_SECRET_ENV || 'github-pages';

if (!fs.existsSync(resumePath)) {
	console.error(`Resume file not found: ${resumePath}`);
	process.exit(1);
}

let jsonText = '';
try {
	jsonText = fs.readFileSync(resumePath, 'utf8');
	JSON.parse(jsonText);
} catch (error) {
	console.error('Local src/data/resume-data.json is missing or invalid JSON.');
	console.error(String(error));
	process.exit(1);
}

const targetArgs =
	scope === 'env'
		? ['secret', 'set', secretName, '--env', environment, '--body', jsonText]
		: ['secret', 'set', secretName, '--body', jsonText];

const checkGh = spawnSync('gh', ['--version'], {
	cwd: root,
	stdio: 'ignore'
});

if (checkGh.status !== 0) {
	console.error('GitHub CLI is not installed or not on PATH. Install from https://cli.github.com/');
	process.exit(1);
}

const authCheck = spawnSync('gh', ['auth', 'status'], {
	cwd: root,
	stdio: 'ignore'
});

if (authCheck.status !== 0) {
	console.error('GitHub CLI is not authenticated. Run: gh auth login');
	process.exit(1);
}

const result = spawnSync('gh', targetArgs, {
	cwd: root,
	stdio: 'inherit',
	maxBuffer: 1024 * 1024 * 10
});

if (result.status !== 0) {
	console.error('Failed to update GitHub Actions secret.');
	process.exit(result.status || 1);
}

const scopeLabel = scope === 'env' ? `environment:${environment}` : 'repository';
console.log(`Updated ${scopeLabel} secret ${secretName} from src/data/resume-data.json`);
