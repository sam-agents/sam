#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

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
  log('  Autonomous TDD Agent System for Claude Code\n', CYAN);
  log('  Usage: npx @sam-agents/sam [target-directory]\n');
  log('  Options:');
  log('    --help, -h     Show this help message');
  log('    --version, -v  Show version number\n');
  log('  Examples:');
  log('    npx @sam-agents/sam          Install in current directory');
  log('    npx @sam-agents/sam ./myapp  Install in ./myapp directory\n');
}

function main() {
  const args = process.argv.slice(2);

  // Handle flags
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    const pkg = require('../package.json');
    log(`sam-skills v${pkg.version}`);
    return;
  }

  const targetDir = args[0] || process.cwd();

  log('\n' + BOLD + '  SAM - Smart Agent Manager' + RESET);
  log('  Autonomous TDD Agent System for Claude Code\n', CYAN);

  const templatesDir = path.join(__dirname, '..', 'templates');

  if (!fs.existsSync(templatesDir)) {
    log('Error: Templates directory not found.', RED);
    process.exit(1);
  }

  // Check for existing installations
  const samDir = path.join(targetDir, '_sam');
  const claudeCommandsDir = path.join(targetDir, '.claude', 'commands', 'sam');

  if (fs.existsSync(samDir) || fs.existsSync(claudeCommandsDir)) {
    log('  Warning: SAM files already exist in this directory.', YELLOW);
    log('  Existing files will be overwritten.\n', YELLOW);
  }

  log('  Installing SAM to: ' + targetDir + '\n', CYAN);

  // Copy _sam folder
  const samTemplateDir = path.join(templatesDir, '_sam');
  if (fs.existsSync(samTemplateDir)) {
    copyRecursive(samTemplateDir, samDir);
    const samFileCount = countFiles(samDir);
    log(`  ✓ Copied _sam/ (${samFileCount} files)`, GREEN);
  }

  // Copy .claude/commands/sam folder
  const claudeTemplateDir = path.join(templatesDir, '.claude', 'commands', 'sam');
  if (fs.existsSync(claudeTemplateDir)) {
    copyRecursive(claudeTemplateDir, claudeCommandsDir);
    const claudeFileCount = countFiles(claudeCommandsDir);
    log(`  ✓ Copied .claude/commands/sam/ (${claudeFileCount} files)`, GREEN);
  }

  log('\n' + BOLD + '  Installation complete!' + RESET + '\n');
  log('  SAM Agents available:', CYAN);
  log('    /sam:core:agents:sam          - SAM Orchestrator');
  log('    /sam:sam:agents:atlas         - Atlas (Architect)');
  log('    /sam:sam:agents:dyna          - Dyna (Developer)');
  log('    /sam:sam:agents:titan         - Titan (Test Architect)');
  log('    /sam:sam:agents:argus         - Argus (Code Reviewer)');
  log('    /sam:sam:agents:sage          - Sage (Tech Writer)');
  log('    /sam:sam:agents:iris          - Iris (UX Designer)');
  log('\n  Workflow:');
  log('    /sam:core:workflows:autonomous-tdd - Full TDD Pipeline\n');
  log('  Restart Claude Code to load the new skills.\n', YELLOW);
}

main();
