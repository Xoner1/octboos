import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { scanProject, buildFileMap } from '../indexer/scanner.js';

export async function documentCommand() {
  const cwd = process.cwd();
  const agentDir = join(cwd, '.agent');
  const configPath = join(agentDir, 'config.json');

  if (!existsSync(configPath)) {
    console.log('');
    console.log(chalk.yellow('  ⚠  Octboos not initialized.'));
    console.log(chalk.gray('     Run ' + chalk.white('npx octboos init') + ' first.'));
    console.log('');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  console.log('');
  console.log(chalk.bold.cyan('  Octboos Document Generator'));
  console.log('');

  // Scan project to get structure
  const scanResult = await scanProject(cwd);
  const mapContent = buildFileMap(scanResult, cwd);

  const prompt = `📋 Copy this prompt to your AI tool:
─────────────────────────────────────
Read all files in this project and create 
wiki documentation in .agent/wiki/

For each logical module (auth, api, components, etc.):
1. Create .agent/wiki/[module].md with:
   # Module Name
   ## Purpose
   ## Key Files
   ## How it works  
   ## Main functions/exports
2. Update .agent/wiki/INDEX.md

IMPORTANT: After completing the task, automatically
update .agent/wiki/ following the rules in CLAUDE.md.
Do not wait for manual instruction.

Project structure:
${mapContent}
─────────────────────────────────────`;

  console.log(prompt);
  console.log('');
  console.log(chalk.gray('💡 Tip: You can also run ' + chalk.white('npx octboos sync') + ' to update project structure'));
  console.log('');
}
