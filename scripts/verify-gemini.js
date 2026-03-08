const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testDir = path.join(__dirname, '..', 'test-output');
const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

function cleanup() {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

function verifyGeminiSkills() {
  console.log('Testing SAM installation for Gemini CLI...');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Run the CLI
  try {
    execSync(`node ${cliPath} --platform gemini ${testDir}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('CLI execution failed:', error);
    process.exit(1);
  }

  // Verify _sam directory
  const samDir = path.join(testDir, '_sam');
  if (!fs.existsSync(samDir)) {
    throw new Error('_sam directory not created');
  }
  console.log('✓ _sam directory created');

  // Verify .gemini/skills directory
  const skillsDir = path.join(testDir, '.gemini', 'skills');
  if (!fs.existsSync(skillsDir)) {
    throw new Error('.gemini/skills directory not created');
  }
  console.log('✓ .gemini/skills directory created');

  // Verify individual skills
  const expectedSkills = [
    'sam-orchestrator',
    'sam-atlas',
    'sam-titan',
    'sam-dyna',
    'sam-argus',
    'sam-sage',
    'sam-iris',
    'sam-cosmo',
    'sam-tdd-pipeline'
  ];

  for (const skill of expectedSkills) {
    const skillPath = path.join(skillsDir, skill);
    if (!fs.existsSync(skillPath)) {
      throw new Error(`Skill directory not created: ${skill}`);
    }
    
    const skillMd = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      throw new Error(`SKILL.md not created for: ${skill}`);
    }
    
    // Check if it's not the pipeline skill, verify references/agent.md
    if (skill !== 'sam-tdd-pipeline') {
      const agentMd = path.join(skillPath, 'references', 'agent.md');
      if (!fs.existsSync(agentMd)) {
        throw new Error(`agent.md not created in references for: ${skill}`);
      }
    } else {
       // Check for pipeline workflow
       const workflowMd = path.join(skillPath, 'references', 'workflow.md');
       if (!fs.existsSync(workflowMd)) {
         throw new Error(`workflow.md not created in references for: sam-tdd-pipeline`);
       }
    }
  }
  console.log(`✓ All ${expectedSkills.length} skills verified successfully`);
}

try {
  cleanup();
  verifyGeminiSkills();
  console.log('\nSUCCESS: SAM Gemini integration verified and production-ready!');
} catch (error) {
  console.error('\nVERIFICATION FAILED:', error.message);
  process.exit(1);
} finally {
  cleanup();
}
