#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const PLATFORMS = ['claude', 'cursor', 'antigravity', 'all'];

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

function showHelp() {
  log('\n' + BOLD + '  SAM - Smart Agent Manager' + RESET);
  log('  Autonomous TDD Agent System\n', CYAN);
  log('  Usage: npx sam-agents [options] [target-directory]\n');
  log('  Options:');
  log('    --platform <name>  Target platform: claude, cursor, antigravity, all');
  log('    --help, -h         Show this help message');
  log('    --version, -v      Show version number\n');
  log('  Examples:');
  log('    npx sam-agents                         Interactive mode');
  log('    npx sam-agents --platform cursor       Install for Cursor');
  log('    npx sam-agents --platform antigravity  Install for Antigravity');
  log('    npx sam-agents --platform all          Install for all platforms');
  log('    npx sam-agents ./myapp                 Install in ./myapp directory\n');
  log('  Supported Platforms:');
  log('    claude      - Claude Code CLI (.claude/commands/)');
  log('    cursor      - Cursor IDE (.cursor/rules/)');
  log('    antigravity - Google Antigravity IDE (.agent/skills/)\n');
}

function generateCursorRules(samDir, targetDir) {
  const cursorDir = path.join(targetDir, '.cursor', 'rules');

  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }

  const agents = [
    { name: 'sam', file: 'core/agents/sam-master.md', display: 'SAM Orchestrator' },
    { name: 'atlas', file: 'agents/architect.md', display: 'Atlas - System Architect' },
    { name: 'dyna', file: 'agents/dev.md', display: 'Dyna - Developer' },
    { name: 'titan', file: 'agents/test.md', display: 'Titan - Test Architect' },
    { name: 'argus', file: 'agents/reviewer.md', display: 'Argus - Code Reviewer' },
    { name: 'sage', file: 'agents/tech-writer.md', display: 'Sage - Technical Writer' },
    { name: 'iris', file: 'agents/ux-designer.md', display: 'Iris - UX Designer' }
  ];

  let rulesCount = 0;

  for (const agent of agents) {
    const agentPath = path.join(samDir, agent.file);
    if (fs.existsSync(agentPath)) {
      const content = fs.readFileSync(agentPath, 'utf8');

      const ruleContent = `---
description: ${agent.display} - SAM Agent for TDD development
globs: ["**/*"]
alwaysApply: false
---

# ${agent.display}

When the user mentions "@${agent.name}" or asks for ${agent.display.toLowerCase()}, adopt this persona:

${content}

## Invocation
To use this agent, the user should mention @${agent.name} in their message.
`;

      fs.writeFileSync(path.join(cursorDir, `sam-${agent.name}.mdc`), ruleContent);
      rulesCount++;
    }
  }

  const workflowRule = `---
description: SAM Autonomous TDD Workflow - Full pipeline from PRD to tested code
globs: ["**/*"]
alwaysApply: false
---

# SAM Autonomous TDD Workflow

When the user mentions "@sam-tdd" or asks for the TDD workflow, execute this pipeline:

## Overview
SAM orchestrates a team of AI agents to transform a PRD into working, tested code using strict TDD.

## The Pipeline

### Phase 1: Validate PRD
- @atlas reviews technical feasibility
- @iris validates UX requirements

### Phase 2: Generate Stories
- Break PRD into epics and user stories
- Create detailed acceptance criteria

### Phase 3: TDD Loop (for each story)
1. **RED**: @titan writes failing tests based on acceptance criteria
2. **GREEN**: @dyna writes minimal code to make tests pass
3. **REFACTOR**: @argus reviews and improves code quality

### Phase 4: Complete
- @sage generates documentation
- Final review and handoff

## Usage
Mention @sam-tdd with a PRD or feature description to start the pipeline.

## Agent Commands
- @sam - Orchestrator
- @atlas - Architect (PRD validation, technical design)
- @titan - Test Architect (RED phase - write failing tests)
- @dyna - Developer (GREEN phase - make tests pass)
- @argus - Code Reviewer (REFACTOR phase)
- @sage - Technical Writer (documentation)
- @iris - UX Designer (UX validation)
`;

  fs.writeFileSync(path.join(cursorDir, 'sam-workflow.mdc'), workflowRule);
  rulesCount++;

  return rulesCount;
}

function generateAntigravitySkills(samDir, targetDir) {
  const skillsDir = path.join(targetDir, '.agent', 'skills');

  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  const agents = [
    {
      name: 'sam-orchestrator',
      file: 'core/agents/sam-master.md',
      display: 'SAM Orchestrator',
      description: 'Orchestrate autonomous TDD pipeline, coordinate SAM agents, manage RED-GREEN-REFACTOR workflow'
    },
    {
      name: 'sam-atlas',
      file: 'agents/architect.md',
      display: 'Atlas - System Architect',
      description: 'Architecture review, PRD validation, technical design, system design decisions'
    },
    {
      name: 'sam-titan',
      file: 'agents/test.md',
      display: 'Titan - Test Architect',
      description: 'Write failing tests, RED phase of TDD, test architecture, acceptance criteria validation'
    },
    {
      name: 'sam-dyna',
      file: 'agents/dev.md',
      display: 'Dyna - Developer',
      description: 'Implement code to pass tests, GREEN phase of TDD, minimal implementation'
    },
    {
      name: 'sam-argus',
      file: 'agents/reviewer.md',
      display: 'Argus - Code Reviewer',
      description: 'Code review, REFACTOR phase of TDD, quality improvement, best practices'
    },
    {
      name: 'sam-sage',
      file: 'agents/tech-writer.md',
      display: 'Sage - Technical Writer',
      description: 'Generate documentation, technical writing, API docs, README creation'
    },
    {
      name: 'sam-iris',
      file: 'agents/ux-designer.md',
      display: 'Iris - UX Designer',
      description: 'UX validation, user experience review, interface design feedback'
    }
  ];

  let skillsCount = 0;

  for (const agent of agents) {
    const agentPath = path.join(samDir, agent.file);
    if (fs.existsSync(agentPath)) {
      const content = fs.readFileSync(agentPath, 'utf8');
      const skillDir = path.join(skillsDir, agent.name);
      const referencesDir = path.join(skillDir, 'references');

      // Create skill directory structure
      if (!fs.existsSync(referencesDir)) {
        fs.mkdirSync(referencesDir, { recursive: true });
      }

      // Create SKILL.md
      const skillContent = `---
name: ${agent.name}
description: ${agent.description}
---

# ${agent.display}

This is a SAM (Smart Agent Manager) agent for autonomous TDD development.

## When to Use
Invoke this skill when you need help with: ${agent.description.toLowerCase()}.

## Instructions
Load and follow the detailed agent instructions from the references folder.

See: references/agent.md for complete agent definition.
`;

      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);

      // Copy full agent definition to references
      fs.writeFileSync(path.join(referencesDir, 'agent.md'), content);

      skillsCount++;
    }
  }

  // Create TDD Pipeline workflow skill
  const pipelineDir = path.join(skillsDir, 'sam-tdd-pipeline');
  const pipelineRefsDir = path.join(pipelineDir, 'references');

  if (!fs.existsSync(pipelineRefsDir)) {
    fs.mkdirSync(pipelineRefsDir, { recursive: true });
  }

  const pipelineSkill = `---
name: sam-tdd-pipeline
description: Autonomous TDD pipeline - transform PRD into working tested code using RED-GREEN-REFACTOR methodology
---

# SAM Autonomous TDD Pipeline

This skill orchestrates a complete TDD development workflow using specialized SAM agents.

## When to Use
Invoke this skill when you want to:
- Transform a PRD into working, tested code
- Follow strict TDD methodology (RED-GREEN-REFACTOR)
- Use autonomous AI agents for development

## The Pipeline

### Phase 1: Validate PRD
- sam-atlas reviews technical feasibility
- sam-iris validates UX requirements

### Phase 2: Generate Stories
- Break PRD into epics and user stories
- Create detailed acceptance criteria

### Phase 3: TDD Loop (for each story)
1. **RED**: sam-titan writes failing tests based on acceptance criteria
2. **GREEN**: sam-dyna writes minimal code to make tests pass
3. **REFACTOR**: sam-argus reviews and improves code quality

### Phase 4: Complete
- sam-sage generates documentation
- Final review and handoff

## Usage
Provide a PRD or feature description to start the autonomous TDD pipeline.

## Available Agents
- /sam-orchestrator - Pipeline coordinator
- /sam-atlas - Architect (PRD validation, technical design)
- /sam-titan - Test Architect (RED phase)
- /sam-dyna - Developer (GREEN phase)
- /sam-argus - Code Reviewer (REFACTOR phase)
- /sam-sage - Technical Writer (documentation)
- /sam-iris - UX Designer (UX validation)
`;

  fs.writeFileSync(path.join(pipelineDir, 'SKILL.md'), pipelineSkill);
  skillsCount++;

  // Copy workflow files to references if they exist
  const workflowPath = path.join(samDir, 'core/workflows/autonomous-tdd/workflow.md');
  if (fs.existsSync(workflowPath)) {
    fs.copyFileSync(workflowPath, path.join(pipelineRefsDir, 'workflow.md'));
  }

  return skillsCount;
}

async function promptPlatform() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    log('\n' + BOLD + '  SAM - Smart Agent Manager' + RESET);
    log('  Autonomous TDD Agent System\n', CYAN);
    log('  Select your IDE/Platform:\n');
    log('    1) Claude Code   ' + DIM + '(.claude/commands/)' + RESET);
    log('    2) Cursor        ' + DIM + '(.cursor/rules/)' + RESET);
    log('    3) Antigravity   ' + DIM + '(.agent/skills/)' + RESET);
    log('    4) All           ' + DIM + '(install for all platforms)' + RESET);
    log('');

    rl.question('  Enter choice [1-4]: ', (answer) => {
      rl.close();
      const choice = answer.trim();

      if (choice === '1' || choice.toLowerCase() === 'claude') {
        resolve('claude');
      } else if (choice === '2' || choice.toLowerCase() === 'cursor') {
        resolve('cursor');
      } else if (choice === '3' || choice.toLowerCase() === 'antigravity') {
        resolve('antigravity');
      } else if (choice === '4' || choice.toLowerCase() === 'both' || choice.toLowerCase() === 'all') {
        resolve('all');
      } else if (choice === '') {
        // Default to claude
        resolve('claude');
      } else {
        log('\n  Invalid choice. Defaulting to Claude Code.\n', YELLOW);
        resolve('claude');
      }
    });
  });
}

function install(platform, targetDir) {
  const templatesDir = path.join(__dirname, '..', 'templates');

  if (!fs.existsSync(templatesDir)) {
    log('Error: Templates directory not found.', RED);
    process.exit(1);
  }

  const samDir = path.join(targetDir, '_sam');

  log(`\n  Platform: ${platform}`, CYAN);
  log(`  Installing to: ${targetDir}\n`, CYAN);

  // Always copy _sam folder
  const samTemplateDir = path.join(templatesDir, '_sam');
  if (fs.existsSync(samTemplateDir)) {
    copyRecursive(samTemplateDir, samDir);
    const samFileCount = countFiles(samDir);
    log(`  ✓ Copied _sam/ (${samFileCount} files)`, GREEN);
  }

  // Install Claude Code integration
  if (platform === 'claude' || platform === 'all') {
    const claudeCommandsDir = path.join(targetDir, '.claude', 'commands', 'sam');
    const claudeTemplateDir = path.join(templatesDir, '.claude', 'commands', 'sam');
    if (fs.existsSync(claudeTemplateDir)) {
      copyRecursive(claudeTemplateDir, claudeCommandsDir);
      const claudeFileCount = countFiles(claudeCommandsDir);
      log(`  ✓ Copied .claude/commands/sam/ (${claudeFileCount} files)`, GREEN);
    }
  }

  // Install Cursor integration
  if (platform === 'cursor' || platform === 'all') {
    const cursorRulesCount = generateCursorRules(samDir, targetDir);
    log(`  ✓ Generated .cursor/rules/ (${cursorRulesCount} files)`, GREEN);
  }

  // Install Antigravity integration
  if (platform === 'antigravity' || platform === 'all') {
    const antigravitySkillsCount = generateAntigravitySkills(samDir, targetDir);
    log(`  ✓ Generated .agent/skills/ (${antigravitySkillsCount} skills)`, GREEN);
  }

  log('\n' + BOLD + '  Installation complete!' + RESET + '\n');

  if (platform === 'claude' || platform === 'all') {
    log('  Claude Code Commands:', CYAN);
    log('    /sam:core:agents:sam          - SAM Orchestrator');
    log('    /sam:sam:agents:atlas         - Atlas (Architect)');
    log('    /sam:sam:agents:dyna          - Dyna (Developer)');
    log('    /sam:sam:agents:titan         - Titan (Test Architect)');
    log('    /sam:sam:agents:argus         - Argus (Code Reviewer)');
    log('    /sam:sam:agents:sage          - Sage (Tech Writer)');
    log('    /sam:sam:agents:iris          - Iris (UX Designer)');
    log('    /sam:core:workflows:autonomous-tdd - Full TDD Pipeline\n');
  }

  if (platform === 'cursor' || platform === 'all') {
    log('  Cursor Commands (use @ mentions):', CYAN);
    log('    @sam       - SAM Orchestrator');
    log('    @atlas     - Atlas (Architect)');
    log('    @dyna      - Dyna (Developer)');
    log('    @titan     - Titan (Test Architect)');
    log('    @argus     - Argus (Code Reviewer)');
    log('    @sage      - Sage (Tech Writer)');
    log('    @iris      - Iris (UX Designer)');
    log('    @sam-tdd   - Full TDD Pipeline\n');
  }

  if (platform === 'antigravity' || platform === 'all') {
    log('  Antigravity Skills (use / commands):', CYAN);
    log('    /sam-orchestrator  - SAM Orchestrator');
    log('    /sam-atlas         - Atlas (Architect)');
    log('    /sam-dyna          - Dyna (Developer)');
    log('    /sam-titan         - Titan (Test Architect)');
    log('    /sam-argus         - Argus (Code Reviewer)');
    log('    /sam-sage          - Sage (Tech Writer)');
    log('    /sam-iris          - Iris (UX Designer)');
    log('    /sam-tdd-pipeline  - Full TDD Pipeline\n');
  }

  if (platform === 'claude' || platform === 'all') {
    log('  Restart Claude Code to load the new skills.', YELLOW);
  }
  if (platform === 'cursor' || platform === 'all') {
    log('  Cursor will auto-detect rules in .cursor/rules/', YELLOW);
  }
  if (platform === 'antigravity' || platform === 'all') {
    log('  Antigravity will auto-detect skills in .agent/skills/', YELLOW);
  }
  log('');
}

async function main() {
  const args = process.argv.slice(2);

  // Handle flags
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    const pkg = require('../package.json');
    log(`sam-agents v${pkg.version}`);
    return;
  }

  // Check if platform is specified
  const platformIdx = args.indexOf('--platform');
  let platform = null;

  if (platformIdx !== -1 && args[platformIdx + 1]) {
    platform = args[platformIdx + 1].toLowerCase();
    if (!PLATFORMS.includes(platform)) {
      log(`\nError: Unknown platform "${platform}". Use: ${PLATFORMS.join(', ')}`, RED);
      process.exit(1);
    }
  }

  // Get target directory (skip flags)
  const targetDir = args.find(arg => !arg.startsWith('--') && arg !== platform) || process.cwd();

  // If no platform specified, prompt interactively
  if (!platform) {
    platform = await promptPlatform();
  } else {
    log('\n' + BOLD + '  SAM - Smart Agent Manager' + RESET);
    log('  Autonomous TDD Agent System', CYAN);
  }

  install(platform, targetDir);
}

main();
