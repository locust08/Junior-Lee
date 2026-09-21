const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

for (const name of ['_next']) {
  fs.rmSync(path.join(publicDir, name), { recursive: true, force: true });
}

for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    fs.rmSync(path.join(publicDir, entry.name), { force: true });
  }
}
