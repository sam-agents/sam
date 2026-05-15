const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testDir = path.join(__dirname, '..', 'test-output-copilot');
const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

function cleanup() {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

function verifyCopilotInstall() {
  console.log('Testing SAM installation for GitHub Copilot...');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  try {
    execSync(`node ${cliPath} --platform copilot ${testDir}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('CLI execution failed:', error);
    process.exit(1);
  }

  const samDir = path.join(testDir, '_sam');
  if (!fs.existsSync(samDir)) {
    throw new Error('_sam directory not created');
  }
  console.log('✓ _sam directory created');

  const copilotDir = path.join(testDir, 'copilot-integration');
  if (!fs.existsSync(copilotDir)) {
    throw new Error('copilot-integration directory not created');
  }
  const instructionsPath = path.join(copilotDir, 'instructions.md');
  if (!fs.existsSync(instructionsPath)) {
    throw new Error('copilot-integration/instructions.md not created');
  }
  const agentsDir = path.join(copilotDir, 'agents');
  if (!fs.existsSync(agentsDir)) {
    throw new Error('copilot-integration/agents directory not created');
  }
  console.log('✓ copilot-integration scaffolding created');

  // The set that should be referenced exactly once each in instructions.md
  // and present as an .md file in copilot-integration/agents/.
  const expectedAgents = [
    { name: 'sam-orchestrator', display: 'SAM Orchestrator' },
    { name: 'sam-atlas',        display: 'Atlas - System Architect' },
    { name: 'sam-titan',        display: 'Titan - Test Architect' },
    { name: 'sam-dyna',         display: 'Dyna - Developer' },
    { name: 'sam-argus',        display: 'Argus - Code Reviewer' },
    { name: 'sam-sage',         display: 'Sage - Technical Writer' },
    { name: 'sam-iris',         display: 'Iris - UX Designer' },
    { name: 'sam-quill',        display: 'Quill - Product Manager' },
    { name: 'sam-cosmo',        display: 'Cosmo - CSS Consistency Reviewer' },
    { name: 'sam-sentinel',     display: 'Sentinel - Security Reviewer' },
    { name: 'sam-aria',         display: 'Aria - Accessibility Reviewer' },
    { name: 'sam-upkeep',       display: 'Upkeep - Dependency and Maintenance' },
    { name: 'sam-lens',         display: 'Lens - Demo Recorder' }
  ];

  const expectedWorkflows = [
    { name: 'sam-quick-prd',    display: 'SAM Quick PRD Workflow' },
    { name: 'sam-scope',        display: 'SAM Scope Workflow' },
    { name: 'sam-plan',         display: 'SAM Planning Workflow' },
    { name: 'sam-build-tdd',    display: 'SAM Build-TDD Workflow' },
    { name: 'sam-plan-n-build', display: 'SAM Plan-n-Build Workflow' },
    { name: 'sam-extend',       display: 'SAM Extend Workflow' }
  ];

  const instructions = fs.readFileSync(instructionsPath, 'utf8');

  // Header-uniqueness check: each `### <display>` line must appear exactly once.
  // This is the regression guard for the Quill-double-registration class of bug.
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function countHeaderOccurrences(display) {
    const re = new RegExp('^### ' + escapeRegExp(display) + '$', 'gm');
    const matches = instructions.match(re);
    return matches ? matches.length : 0;
  }

  for (const entry of [...expectedAgents, ...expectedWorkflows]) {
    const count = countHeaderOccurrences(entry.display);
    if (count === 0) {
      throw new Error(`Missing header in instructions.md: ### ${entry.display}`);
    }
    if (count > 1) {
      throw new Error(`Duplicate header in instructions.md (${count} times): ### ${entry.display}`);
    }
    const agentFile = path.join(agentsDir, `${entry.name}.md`);
    if (!fs.existsSync(agentFile)) {
      throw new Error(`Expected file missing: ${path.relative(testDir, agentFile)}`);
    }
  }

  // Stray-file check: no unexpected .md files in copilot-integration/agents/
  const expectedFiles = new Set(
    [...expectedAgents, ...expectedWorkflows].map(e => `${e.name}.md`)
  );
  const actualFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  const stray = actualFiles.filter(f => !expectedFiles.has(f));
  if (stray.length > 0) {
    throw new Error(`Unexpected file(s) in copilot-integration/agents/: ${stray.join(', ')}`);
  }
  if (actualFiles.length !== expectedFiles.size) {
    throw new Error(`File count mismatch: expected ${expectedFiles.size}, found ${actualFiles.length}`);
  }

  const total = expectedAgents.length + expectedWorkflows.length;
  console.log(`✓ All ${total} entries verified (${expectedAgents.length} agents, ${expectedWorkflows.length} workflows) - no duplicates, no strays`);
}

try {
  cleanup();
  verifyCopilotInstall();
  console.log('\nSUCCESS: SAM Copilot integration verified and production-ready!');
} catch (error) {
  console.error('\nVERIFICATION FAILED:', error.message);
  process.exit(1);
} finally {
  cleanup();
}
