#!/usr/bin/env node
/**
 * Sync _sam/ to templates/_sam/
 * Single source of truth: edit _sam/, then run this before release or when changing agents.
 * Usage: node scripts/sync-templates.js   or   npm run sync-templates
 *
 * This script cleans templates/_sam/ first to remove stale files,
 * then copies everything from _sam/.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const src = path.join(repoRoot, '_sam');
const dest = path.join(repoRoot, 'templates', '_sam');

if (!fs.existsSync(src)) {
  console.error('Error: _sam/ not found at', src);
  process.exit(1);
}

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean destination first to remove stale files
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}

// Copy fresh
copyRecursive(src, dest);
console.log('Synced _sam/ -> templates/_sam/ (cleaned stale files)');
