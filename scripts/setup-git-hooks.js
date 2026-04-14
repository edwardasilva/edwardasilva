import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const hooksDir = path.join(root, '.githooks');
const preCommitPath = path.join(hooksDir, 'pre-commit');
const prePushPath = path.join(hooksDir, 'pre-push');

const preCommitScript = `#!/usr/bin/env sh
set -e

echo "[pre-commit] Running cleanup before commit..."
./cleanup.sh --yes

# Ensure cleanup changes are included in this commit.
git add -u
echo "[pre-commit] Cleanup complete. Proceeding with commit."
`;

const prePushScript = `#!/usr/bin/env sh
set -e

echo "Cleaning repo to prep for push"
./cleanup.sh --yes

echo "[pre-push] Syncing RESUME_DATA secret from local resume-data.json..."
npm run --silent sync:resume-secret
echo "[pre-push] Secret sync complete. Proceeding with push."
`;

const normalizeLineEndings = (script) => script.replace(/\r\n/g, '\n');

if (!fs.existsSync(hooksDir)) {
	fs.mkdirSync(hooksDir, { recursive: true });
}

fs.writeFileSync(preCommitPath, normalizeLineEndings(preCommitScript), { encoding: 'utf8', mode: 0o755 });
fs.writeFileSync(prePushPath, normalizeLineEndings(prePushScript), { encoding: 'utf8', mode: 0o755 });

try {
	fs.chmodSync(preCommitPath, 0o755);
	fs.chmodSync(prePushPath, 0o755);
} catch {
	// Ignore chmod failures on filesystems that do not support POSIX permissions.
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
	cwd: root,
	stdio: 'inherit'
});

if (result.status !== 0) {
	console.error('Failed to configure git hooks path.');
	process.exit(result.status || 1);
}

console.log('Configured git hooks at .githooks and installed pre-commit and pre-push hooks.');
