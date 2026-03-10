#!/usr/bin/env node
/**
 * Verify that _sam/ and templates/_sam/ are in sync.
 * Exits with code 1 if any files differ.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const src = path.join(repoRoot, '_sam');
const dest = path.join(repoRoot, 'templates', '_sam');

let errors = 0;

function compareRecursive(srcDir, destDir, relPath) {
  if (!fs.existsSync(srcDir)) {
    console.error(`Missing source: ${relPath}`);
    errors++;
    return;
  }
  if (!fs.existsSync(destDir)) {
    console.error(`Missing in templates: ${relPath}`);
    errors++;
    return;
  }

  const srcEntries = fs.readdirSync(srcDir, { withFileTypes: true });
  const destEntries = new Set(fs.readdirSync(destDir));

  for (const entry of srcEntries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const rel = path.join(relPath, entry.name);

    if (!destEntries.has(entry.name)) {
      console.error(`Missing in templates/_sam/: ${rel}`);
      errors++;
      continue;
    }

    if (entry.isDirectory()) {
      compareRecursive(srcPath, destPath, rel);
    } else {
      const srcContent = fs.readFileSync(srcPath, 'utf8');
      const destContent = fs.readFileSync(destPath, 'utf8');
      if (srcContent !== destContent) {
        console.error(`Out of sync: ${rel}`);
        errors++;
      }
    }
  }

  // Check for extra files in templates/_sam/ that don't exist in _sam/
  const srcNames = new Set(srcEntries.map(e => e.name));
  for (const name of destEntries) {
    if (!srcNames.has(name)) {
      console.error(`Extra file in templates/_sam/ (not in _sam/): ${path.join(relPath, name)}`);
      errors++;
    }
  }
}

compareRecursive(src, dest, '');

if (errors > 0) {
  console.error(`\n${errors} sync error(s) found. Run "npm run sync-templates" or manually sync _sam/ and templates/_sam/.`);
  process.exit(1);
} else {
  console.log('_sam/ and templates/_sam/ are in sync.');
}
