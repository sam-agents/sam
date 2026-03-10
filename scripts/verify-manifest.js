#!/usr/bin/env node
/**
 * Verify that every agent referenced in agent-manifest.csv actually exists,
 * and every agent file in _sam/agents/ and _sam/core/agents/ has a manifest entry.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const manifestPath = path.join(repoRoot, '_sam', '_config', 'agent-manifest.csv');
const agentsDir = path.join(repoRoot, '_sam', 'agents');
const coreAgentsDir = path.join(repoRoot, '_sam', 'core', 'agents');

let errors = 0;

// Parse manifest
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const lines = manifestContent.trim().replace(/\r/g, '').split('\n');
const rows = lines.slice(1);

const manifestPaths = new Set();

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  // Simple CSV parse - find the path field (last column)
  const match = row.match(/"([^"]+)"$/);
  if (match) {
    const agentPath = match[1];
    manifestPaths.add(agentPath);
    const fullPath = path.join(repoRoot, agentPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Manifest references missing file: ${agentPath}`);
      errors++;
    }
  } else {
    console.warn(`Warning: Could not parse manifest row ${i + 2}: ${row.substring(0, 80)}...`);
  }
}

// Check all agent files in _sam/agents/ have manifest entries
if (fs.existsSync(agentsDir)) {
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  for (const file of agentFiles) {
    const expectedPath = `_sam/agents/${file}`;
    if (!manifestPaths.has(expectedPath)) {
      console.error(`Agent file not in manifest: ${expectedPath}`);
      errors++;
    }
  }
}

// Check all agent files in _sam/core/agents/ have manifest entries
if (fs.existsSync(coreAgentsDir)) {
  const coreAgentFiles = fs.readdirSync(coreAgentsDir).filter(f => f.endsWith('.md'));
  for (const file of coreAgentFiles) {
    const expectedPath = `_sam/core/agents/${file}`;
    if (!manifestPaths.has(expectedPath)) {
      console.error(`Core agent file not in manifest: ${expectedPath}`);
      errors++;
    }
  }
}

// Verify templates manifest matches
const templatesManifestPath = path.join(repoRoot, 'templates', '_sam', '_config', 'agent-manifest.csv');
if (fs.existsSync(templatesManifestPath)) {
  const templatesContent = fs.readFileSync(templatesManifestPath, 'utf8');
  if (manifestContent !== templatesContent) {
    console.error('agent-manifest.csv differs between _sam/ and templates/_sam/');
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} manifest error(s) found.`);
  process.exit(1);
} else {
  console.log(`Agent manifest valid (${rows.length} agents, all files exist).`);
}
