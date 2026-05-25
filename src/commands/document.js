import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { scanProject, buildFileMap } from '../indexer/scanner.js';

export async function documentCommand(options = {}) {
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

  console.log('');
  console.log(chalk.bold.cyan('  Octboos Document Generator'));
  console.log('');

  // Scan project to get structure
  const scanResult = await scanProject(cwd);
  const mapContent = buildFileMap(scanResult, cwd);

  const prompt = `📋 Copy this prompt to your AI tool to generate wiki documentation:
─────────────────────────────────────
Read \`.agent/protocol.md\` first — mandatory execution protocol.

Then read all files in this project and create 
wiki documentation in .agent/wiki/

For each logical module (auth, api, components, etc.):
1. Create .agent/wiki/[module].md with:
   # Module Name
   ## Purpose
   ## Key Files
   ## How it works  
   ## Main functions/exports
2. Update .agent/wiki/INDEX.md

Project structure:
${mapContent}
─────────────────────────────────────`;

  if (options.copy) {
    try {
      const platform = process.platform;
      if (platform === 'darwin') {
        execSync('pbcopy', { input: prompt });
      } else if (platform === 'win32') {
        execSync('clip', { input: prompt });
      } else {
        // Linux: try xclip or xsel
        try {
          execSync('xclip -selection clipboard', { input: prompt });
        } catch {
          execSync('xsel --clipboard --input', { input: prompt });
        }
      }
      console.log(chalk.green('  ✓ ') + 'Prompt copied to clipboard');
    } catch (err) {
      console.log(chalk.yellow('  ⚠  Failed to copy to clipboard'));
      console.log(chalk.gray('     ' + err.message));
      console.log('');
      console.log(prompt);
    }
  } else {
    console.log(prompt);
    console.log('');
    console.log(chalk.gray('💡 Tip: Use ' + chalk.white('--copy') + ' to copy this prompt to clipboard'));
  }

  console.log(chalk.gray('💡 Or run ' + chalk.white('npx octboos sync') + ' to update project structure'));
  console.log('');
}
