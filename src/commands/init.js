import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { input, checkbox, confirm } from '@inquirer/prompts';
import { scanProject, buildFileMap, detectInstalledTools } from '../indexer/scanner.js';
import { ADAPTERS, generateAdapterContent } from '../adapters/index.js';

const AGENT_DIR = '.agent';

export async function initCommand(options) {
  console.log('');
  console.log(chalk.bold.cyan('  ╔═══════════════════════════════╗'));
  console.log(chalk.bold.cyan('  ║   Cortex — Init               ║'));
  console.log(chalk.bold.cyan('  ║   Transform your AI tool      ║'));
  console.log(chalk.bold.cyan('  ╚═══════════════════════════════╝'));
  console.log('');

  const cwd = process.cwd();

  // Check if already initialized
  if (existsSync(join(cwd, AGENT_DIR, 'config.json'))) {
    console.log(chalk.yellow('  ⚠  Cortex already initialized in this project.'));
    console.log(chalk.gray('     Run ' + chalk.white('cortex sync') + ' to update.'));
    console.log('');
    return;
  }

  // Step 0 — Detect installed AI tools
  let detectedTools = { detected: [], uncertain: [], notFound: [] };
  try {
    detectedTools = detectInstalledTools();
    if (detectedTools.detected.length > 0) {
      console.log(chalk.gray(`  🔍 Found ${detectedTools.detected.length} tools on your machine`));
      console.log('');
    }
  } catch (err) {
    // Silently fall back to manual selection if detection fails
  }

   // Step 1 — Project name
   let projectName;
   try {
     const pkgPath = join(cwd, 'package.json');
     projectName = existsSync(pkgPath)
       ? JSON.parse(readFileSync(pkgPath, 'utf8')).name || ''
       : '';
   } catch { projectName = ''; }

   if (!options.yes) {
     projectName = await input({
       message: 'Project name:',
       default: projectName || 'my-project',
     });
   }

   // Step 2 — Choose adapters
   let selectedAdapters = [];

   if (!options.yes && !options.adapters) {
     // Build choices with pre-checked detected tools
     const choices = Object.entries(ADAPTERS).map(([key, val]) => {
       let checked = false;
       let name = `${val.name} (${val.file})`;
       
       // Check if detected
       if (detectedTools.detected.includes(key)) {
         checked = true;
       }
       // Check if uncertain
       else if (detectedTools.uncertain.includes(key)) {
         name += ' (not sure)';
       }
       
       return {
         name,
         value: key,
         checked
       };
     });

     selectedAdapters = await checkbox({
       message: 'Which AI tools do you use?',
       choices
     });
   } else if (options.adapters) {
     selectedAdapters = options.adapters.split(',').map(s => s.trim());
   } else {
     // Default fallback when options.yes is true
     selectedAdapters = ['claude', 'codex'];
   }

   // Step 3 — Scan project
  const spinner = ora({
    text: chalk.gray('Scanning project...'),
    color: 'cyan',
  }).start();

  let scanResult;
  try {
    scanResult = await scanProject(cwd);
    spinner.succeed(chalk.green(`Scanned ${scanResult.fileCount} files`));
  } catch (err) {
    spinner.fail('Failed to scan project');
    console.error(err);
    return;
  }

  // Step 4 — Create .agent/ directory
  const agentDir = join(cwd, AGENT_DIR);
  const wikiDir  = join(agentDir, 'wiki');

  mkdirSync(agentDir, { recursive: true });
  mkdirSync(wikiDir,  { recursive: true });

  // Step 5 — Generate files
  const genSpinner = ora({ text: chalk.gray('Generating context files...'), color: 'cyan' }).start();

  // config.json
  const config = {
    version:    '0.1.0',
    projectName,
    adapters:   selectedAdapters,
    autoSync:   true,
    created:    new Date().toISOString(),
    lastSync:   new Date().toISOString(),
  };
  writeFileSync(join(agentDir, 'config.json'), JSON.stringify(config, null, 2));

  // map.md
  const mapContent = buildFileMap(scanResult, cwd);
  writeFileSync(join(agentDir, 'map.md'), mapContent);

  // style.md
  writeFileSync(join(agentDir, 'style.md'), buildStyleTemplate(projectName));

  // wiki/INDEX.md
  writeFileSync(join(wikiDir, 'INDEX.md'), buildWikiIndex(projectName, scanResult));

  genSpinner.succeed(chalk.green('Generated .agent/ context files'));

  // Step 6 — Generate adapter files
  const adapterSpinner = ora({ text: chalk.gray('Configuring AI tools...'), color: 'cyan' }).start();

  const generatedAdapters = [];
  for (const adapterKey of selectedAdapters) {
    const adapter = ADAPTERS[adapterKey];
    if (!adapter) continue;

    const filePath = join(cwd, adapter.file);
    const fileDir  = dirname(filePath);

    mkdirSync(fileDir, { recursive: true });

    // Don't overwrite existing files — append Cortex section
    if (existsSync(filePath)) {
      const existing = readFileSync(filePath, 'utf8');
      if (!existing.includes('Cortex')) {
        writeFileSync(filePath, existing + '\n\n' + generateAdapterContent(adapterKey, projectName));
      }
    } else {
      writeFileSync(filePath, generateAdapterContent(adapterKey, projectName));
    }

    generatedAdapters.push(adapter.file);
  }

  adapterSpinner.succeed(chalk.green(`Configured ${generatedAdapters.length} AI tools`));

  // Step 7 — Add to .gitignore if needed (keep .agent/ tracked)
  const gitignorePath = join(cwd, '.gitignore');
  if (existsSync(gitignorePath)) {
    const gitignore = readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('.agent/graph.html')) {
      writeFileSync(gitignorePath, gitignore + '\n# Cortex - keep .agent/ tracked except large files\n.agent/graph.html\n');
    }
  }

  // Done!
  console.log('');
  console.log(chalk.bold.green('  ✓ Cortex initialized successfully!'));
  console.log('');
  console.log(chalk.gray('  Created:'));
  console.log(chalk.white('  .agent/'));
  console.log(chalk.gray('  ├── ') + chalk.white('config.json  ') + chalk.gray('← Cortex config'));
  console.log(chalk.gray('  ├── ') + chalk.white('map.md       ') + chalk.gray('← project structure'));
  console.log(chalk.gray('  ├── ') + chalk.white('style.md     ') + chalk.gray('← coding conventions'));
  console.log(chalk.gray('  └── ') + chalk.white('wiki/        ') + chalk.gray('← auto documentation'));
  console.log('');
  console.log(chalk.gray('  AI configs:'));
  for (const f of generatedAdapters) {
    console.log(chalk.gray('  ✓ ') + chalk.white(f));
  }
  console.log('');
  console.log(chalk.bold('  Next steps:'));
  console.log(chalk.cyan('  1.') + chalk.white(' Edit .agent/style.md with your coding conventions'));
  console.log(chalk.cyan('  2.') + chalk.white(' Run cortex sync to update wiki'));
  console.log(chalk.cyan('  3.') + chalk.white(' Commit .agent/ to git'));
  console.log('');
}

function buildStyleTemplate(projectName) {
  return `# Coding Style — ${projectName}
> Edit this file to teach Cortex your preferences.
> Last updated: ${new Date().toISOString().split('T')[0]}

## General Conventions
- [ ] Add your naming conventions here
- [ ] Add your file structure preferences here

## Code Style
- [ ] Indentation: (tabs / 2 spaces / 4 spaces)
- [ ] Quotes: (single / double)
- [ ] Semicolons: (yes / no)

## Architecture Patterns
- [ ] Describe your patterns here (MVC, Repository, etc.)

## What to Avoid
- [ ] List anti-patterns specific to this project

## Useful Commands
\`\`\`bash
# Add your most-used project commands here
# npm run dev
# npm run build
# npm test
\`\`\`
`;
}

function buildWikiIndex(projectName, scanResult) {
  const lines = [
    `# Wiki — ${projectName}`,
    `> Auto-generated by Cortex | ${new Date().toISOString().split('T')[0]}`,
    '',
    '## Modules',
    '> Add module documentation here or run `cortex sync` to auto-generate.',
    '',
    '## Stack Summary',
  ];

  if (scanResult.frameworks.length > 0) {
    lines.push(`**Frameworks:** ${scanResult.frameworks.join(', ')}`);
  }
  if (scanResult.stack.length > 0) {
    lines.push(`**Libraries:** ${scanResult.stack.join(', ')}`);
  }

  const langs = Object.entries(scanResult.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([l]) => l);
  if (langs.length > 0) {
    lines.push(`**Languages:** ${langs.join(', ')}`);
  }

  return lines.join('\n');
}
