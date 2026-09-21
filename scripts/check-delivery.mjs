import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const policy = JSON.parse(readFileSync(resolve(root, 'delivery.config.json'), 'utf8'));
const allowed = new Set(policy.sourceFiles);
const problems = [];

function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    const file = resolve(directory, name);
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in delivery: ${relative(root, file)}`);
    return stat.isDirectory() ? walk(file) : [relative(root, file).replaceAll('\\', '/')];
  });
}

function inspectSource(files) {
  for (const file of files) {
    if (!allowed.has(file)) problems.push(`Not on source delivery list: ${file}`);
    if (/\.(?:md|pdf|map|zip)$/i.test(file) || /(?:^|\/)(?:\.env(?:\.|$)|AGENTS\.|SKILL\.)/i.test(file)) problems.push(`Private or unsupported source file: ${file}`);
    const stat = lstatSync(resolve(root, file));
    if (stat.isSymbolicLink()) problems.push(`Source symlink is not permitted: ${file}`);
  }
}

inspectSource(policy.sourceFiles);
const publicFiles = walk(resolve(root, 'public'));
inspectSource(publicFiles);

let gitFiles;
try {
  gitFiles = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean);
} catch {
  if (process.argv.includes('--require-git')) problems.push('A Git repository is required for this check.');
}
if (gitFiles) inspectSource(gitFiles);

const distFiles = walk(resolve(root, 'dist'));
const allowedPublic = new Set(publicFiles.map(file => file.replace(/^public\//, '')));
const signatures = [/\/Users\//i, /\.codex\//i];
for (const path of distFiles) {
  const file = path.replace(/^dist\//, '');
  const builtAsset = /^assets\/index-[A-Za-z0-9_-]+\.(?:js|css)$/.test(file);
  if (file !== 'index.html' && !allowedPublic.has(file) && !builtAsset) problems.push(`Unexpected hosting file: ${file}`);
  if (/\.(?:html|js|css|txt)$/.test(file)) {
    const contents = readFileSync(resolve(root, path), 'utf8');
    for (const pattern of signatures) if (pattern.test(contents)) problems.push(`Private workspace reference in: ${file}`);
  }
}

if (!distFiles.includes('dist/index.html')) problems.push('Missing hosting entry page.');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Delivery check passed: ${gitFiles?.length ?? 0} tracked files; ${publicFiles.length} public files; ${distFiles.length} hosting files.`);
  console.log('Only files on the explicit delivery list may be published. No ZIP was created.');
}
