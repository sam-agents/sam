#!/usr/bin/env node
/**
 * Verify that story-schema.md contains all required statuses and transition rules.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const schemaPath = path.join(repoRoot, '_sam', 'core', 'resources', 'story-schema.md');

let errors = 0;

if (!fs.existsSync(schemaPath)) {
  console.error(`Story schema missing: ${schemaPath}`);
  process.exit(1);
}

const content = fs.readFileSync(schemaPath, 'utf8');

// Required statuses in the status enum
const requiredStatuses = ['draft', 'ready', 'in-progress', 'done', 'blocked', 'needs-rebuild', 'obsolete'];

for (const status of requiredStatuses) {
  if (!content.includes(status)) {
    console.error(`Missing status in schema: ${status}`);
    errors++;
  }
}

// Required transition rules (statuses are backtick-wrapped in the schema)
const requiredTransitions = [
  ['done', 'needs-rebuild'],
  ['done', 'obsolete'],
  ['ready', 'obsolete'],
  ['in-progress', 'obsolete'],
  ['needs-rebuild', 'in-progress'],
];

for (const [from, to] of requiredTransitions) {
  // Match backtick-wrapped format: `from` → `to`
  const pattern = `\`${from}\` → \`${to}\``;
  if (!content.includes(pattern)) {
    console.error(`Missing transition rule: ${from} → ${to}`);
    errors++;
  }
}

// Verify the status enum line in frontmatter includes the new statuses
const statusEnumMatch = content.match(/status:.*#.+/);
if (statusEnumMatch) {
  const statusLine = statusEnumMatch[0];
  if (!statusLine.includes('needs-rebuild')) {
    console.error('Status enum line in frontmatter does not include needs-rebuild');
    errors++;
  }
  if (!statusLine.includes('obsolete')) {
    console.error('Status enum line in frontmatter does not include obsolete');
    errors++;
  }
}

// Verify templates copy matches
const templatesSchemaPath = path.join(repoRoot, 'templates', '_sam', 'core', 'resources', 'story-schema.md');
if (fs.existsSync(templatesSchemaPath)) {
  const templatesContent = fs.readFileSync(templatesSchemaPath, 'utf8');
  if (content !== templatesContent) {
    console.error('story-schema.md differs between _sam/ and templates/_sam/');
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} story schema error(s) found.`);
  process.exit(1);
} else {
  console.log('Story schema valid (all statuses and transitions present).');
}
