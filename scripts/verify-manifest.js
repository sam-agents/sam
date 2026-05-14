#!/usr/bin/env node
/**
 * Verify that every agent and workflow referenced in the manifests exists,
 * and every file under _sam/agents/, _sam/core/agents/, and _sam/core/workflows/
 * has a corresponding manifest entry.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const manifestPath = path.join(repoRoot, '_sam', '_config', 'agent-manifest.csv');
const workflowManifestPath = path.join(repoRoot, '_sam', '_config', 'workflow-manifest.csv');
const agentsDir = path.join(repoRoot, '_sam', 'agents');
const coreAgentsDir = path.join(repoRoot, '_sam', 'core', 'agents');
const workflowsDir = path.join(repoRoot, '_sam', 'core', 'workflows');

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

// Workflow manifest checks
let workflowRowCount = 0;
if (fs.existsSync(workflowManifestPath)) {
  const wfContent = fs.readFileSync(workflowManifestPath, 'utf8');
  const wfLines = wfContent.trim().replace(/\r/g, '').split('\n');
  const wfRows = wfLines.slice(1);
  workflowRowCount = wfRows.length;

  const workflowManifestPaths = new Set();
  for (let i = 0; i < wfRows.length; i++) {
    const row = wfRows[i];
    const match = row.match(/"([^"]+)"$/);
    if (match) {
      const wfPath = match[1];
      workflowManifestPaths.add(wfPath);
      const fullPath = path.join(repoRoot, wfPath);
      if (!fs.existsSync(fullPath)) {
        console.error(`Workflow manifest references missing file: ${wfPath}`);
        errors++;
      }
    } else {
      console.warn(`Warning: Could not parse workflow manifest row ${i + 2}: ${row.substring(0, 80)}...`);
    }
  }

  // Every workflow.md under _sam/core/workflows/<name>/ must have a manifest entry
  if (fs.existsSync(workflowsDir)) {
    const wfDirs = fs.readdirSync(workflowsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    for (const dir of wfDirs) {
      const expectedPath = `_sam/core/workflows/${dir}/workflow.md`;
      const fullPath = path.join(repoRoot, expectedPath);
      if (fs.existsSync(fullPath) && !workflowManifestPaths.has(expectedPath)) {
        console.error(`Workflow not in manifest: ${expectedPath}`);
        errors++;
      }
    }
  }

  // Templates workflow manifest must match
  const templatesWfManifestPath = path.join(repoRoot, 'templates', '_sam', '_config', 'workflow-manifest.csv');
  if (fs.existsSync(templatesWfManifestPath)) {
    const templatesContent = fs.readFileSync(templatesWfManifestPath, 'utf8');
    if (wfContent !== templatesContent) {
      console.error('workflow-manifest.csv differs between _sam/ and templates/_sam/');
      errors++;
    }
  }
} else {
  console.error(`Workflow manifest missing: ${workflowManifestPath}`);
  errors++;
}

if (errors > 0) {
  console.error(`\n${errors} manifest error(s) found.`);
  process.exit(1);
} else {
  console.log(`Manifests valid (${rows.length} agents, ${workflowRowCount} workflows, all files exist).`);
}
