import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const hooksDir = path.join(root, '.githooks');
const prePushPath = path.join(hooksDir, 'pre-push');

const prePushScript = `#!/usr/bin/env sh
set -e

echo "[pre-push] Syncing RESUME_DATA secret from local resume-data.json..."
npm run --silent sync:resume-secret
echo "[pre-push] Secret sync complete. Proceeding with push."
`;

if (!fs.existsSync(hooksDir)) {
	fs.mkdirSync(hooksDir, { recursive: true });
}

fs.writeFileSync(prePushPath, prePushScript, { encoding: 'utf8', mode: 0o755 });

try {
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

console.log('Configured git hooks at .githooks and installed pre-push hook.');
