const { copyFileSync, existsSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const bundleDirectory = join(process.cwd(), '.pages-functions');
const workerCandidates = [
  join(bundleDirectory, '_worker.js'),
  join(bundleDirectory, 'index.js'),
];
const source = workerCandidates.find(existsSync);
const destination = join(process.cwd(), 'out', '_worker.js');

if (!source) {
  throw new Error('Pages Functions compilation did not produce a worker bundle.');
}

copyFileSync(source, destination);
rmSync(bundleDirectory, { recursive: true, force: true });
