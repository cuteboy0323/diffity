import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const lockPath = resolve(root, 'package-lock.json');

const packagePaths = [
  'packages/cli',
  'packages/git',
  'packages/github',
  'packages/parser',
  'packages/ui',
];

const bump = process.argv[2] as 'patch' | 'minor';
if (bump !== 'patch' && bump !== 'minor') {
  console.error('Usage: tsx scripts/release.ts <patch|minor>');
  process.exit(1);
}

const cliPkgPath = resolve(root, 'packages/cli/package.json');
const cliPkg = JSON.parse(readFileSync(cliPkgPath, 'utf-8'));
const [major, minor, patch] = cliPkg.version.split('.').map(Number);

const newVersion =
  bump === 'minor'
    ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`;

console.log(`${cliPkg.version} → ${newVersion}\n`);

const filesToStage: string[] = [];

for (const pkgDir of packagePaths) {
  const pkgPath = resolve(root, pkgDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.version = newVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  filesToStage.push(`${pkgDir}/package.json`);
}

const lockJson = JSON.parse(readFileSync(lockPath, 'utf-8'));
for (const pkgDir of packagePaths) {
  if (lockJson.packages?.[pkgDir]) {
    lockJson.packages[pkgDir].version = newVersion;
  }
}
writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
filesToStage.push('package-lock.json');

execSync(`git add ${filesToStage.join(' ')}`, { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "chore: release v${newVersion}"`, { cwd: root, stdio: 'inherit' });
execSync(`git tag v${newVersion}`, { cwd: root, stdio: 'inherit' });

console.log(`\nTagged v${newVersion}`);
