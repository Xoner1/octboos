import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { homedir } from 'os';
import { scanProject } from '../indexer/scanner.js';
import { ADAPTERS } from '../adapters/index.js';

export async function verifyCommand() {
  const cwd = process.cwd();
  const agentDir = join(cwd, '.agent');
  const globalConfigDir = join(homedir(), '.octboos');
  const globalConfigFile = join(globalConfigDir, 'config.json');

  console.log('');
  console.log(chalk.bold.cyan('  Octboos Setup Verification'));
  console.log('');

  // Check 1: Project initialization
  console.log(chalk.bold('📁 Project Initialization:'));
  if (existsSync(join(agentDir, 'config.json'))) {
    console.log(chalk.green('  ✓ ') + 'Project initialized with octboos');
    const config = JSON.parse(readFileSync(join(agentDir, 'config.json'), 'utf8'));
    console.log(chalk.gray('    Project: ') + chalk.white(config.projectName || 'unnamed'));
    console.log(chalk.gray('    Version: ') + chalk.white(config.version));
  } else {
    console.log(chalk.red('  ✗ ') + 'Project not initialized');
    console.log(chalk.gray('    Run: ') + chalk.white('npx octboos init'));
  }
  console.log('');

  // Check 2: .agent/ folder structure
  console.log(chalk.bold('📂 .agent/ Folder Structure:'));
  const agentFiles = [
    ['config.json', 'Octboos configuration'],
    ['map.md', 'Project structure map'],
    ['style.md', 'Coding style and conventions'],
  ];
  
  for (const [file, desc] of agentFiles) {
    const exists = existsSync(join(agentDir, file));
    console.log(
      '  ' + (exists ? chalk.green('✓') : chalk.red('✗')) + ' ' +
      chalk.white(`.agent/${file}`) + chalk.gray(` — ${desc}`)
    );
  }
  
  // Check wiki directory
  const wikiDir = join(agentDir, 'wiki');
  if (existsSync(wikiDir)) {
    const wikiFiles = readdirSync(wikiDir).filter(f => f.endsWith('.md'));
    console.log(
      '  ' + (wikiFiles.length > 0 ? chalk.green('✓') : chalk.yellow('⚠')) + ' ' +
      chalk.white(`.agent/wiki/`) + chalk.gray(` — Wiki directory (${wikiFiles.length} files)`)
    );
    if (wikiFiles.length > 0) {
      console.log(chalk.gray('    Files: ') + wikiFiles.map(f => `  · ${f}`).join('\n'));
    }
  } else {
    console.log('  ' + chalk.red('✗') + ' ' + chalk.white(`.agent/wiki/`) + chalk.gray(` — Missing`));
  }
  console.log('');

  // Check 3: Global configuration
  console.log(chalk.bold('⚙️  Global Configuration:'));
  if (existsSync(globalConfigFile)) {
    console.log(chalk.green('  ✓ ') + 'Global config exists');
    try {
      const globalConfig = JSON.parse(readFileSync(globalConfigFile, 'utf8'));
      console.log(chalk.gray('    Style: ') + chalk.white(globalConfig.style || 'not set'));
      console.log(chalk.gray('    File: ') + chalk.white(globalConfigFile));
    } catch (err) {
      console.log(chalk.red('    Error reading config: ') + chalk.white(err.message));
    }
  } else {
    console.log(chalk.yellow('  ⚠ ') + 'No global configuration (optional)');
    console.log(chalk.gray('    Run: ') + chalk.white('npx octboos config --style <minimal|detailed>'));
  }
  console.log('');

  // Check 4: Adapter files
  console.log(chalk.bold('🤖 AI Tool Adapter Files:'));
  let selectedAdapters = [];
  try {
    const agentConfig = JSON.parse(readFileSync(join(agentDir, 'config.json'), 'utf8'));
    selectedAdapters = agentConfig.adapters || [];
  } catch (err) {
    console.log(chalk.yellow('    ⚠ Could not read project config to determine selected adapters'));
  }
  
  let allSelectedAdaptersPresent = true;
  let foundMainAdapterWithRules = false;
  
  for (const [adapterKey, adapter] of Object.entries(ADAPTERS)) {
    const isSelected = selectedAdapters.includes(adapterKey);
    const filePath = join(cwd, adapter.file);
    const exists = existsSync(filePath);
    
    // Only report on selected adapters, but note if a selected adapter is missing
    if (isSelected) {
      if (!exists) allSelectedAdaptersPresent = false;
      
      console.log(
        '  ' + (exists ? chalk.green('✓') : chalk.red('✗')) + ' ' +
        chalk.white(adapter.name) + chalk.gray(` (${adapter.file})`) + chalk.dim(' [selected]')
      );
    } else {
      // For non-selected adapters, show as dimmed/optional
      console.log(
        '  ' + (exists ? chalk.dim('✓') : chalk.dim('✗')) + ' ' +
        chalk.white(adapter.name) + chalk.gray(` (${adapter.file})`) + chalk.dim(' [optional]')
      );
    }
    
    if (exists && isSelected) {
      // Check if file contains octboos content
      try {
        const content = readFileSync(filePath, 'utf8');
        const hasOctboos = content.toLowerCase().includes('octboos') || content.includes('Auto-Documentation');
        if (!hasOctboos) {
          console.log(chalk.gray('    ⚠ File exists but may not contain octboos instructions'));
        }
        
        // Check if it's a main adapter that should have auto-doc rules
        if (['claude', 'gemini', 'codex', 'antigravity'].includes(adapterKey) && (content.includes('Auto-Documentation Rule') || content.includes('update .agent/wiki/'))) {
          foundMainAdapterWithRules = true;
        }
      } catch (err) {
        console.log(chalk.gray('    ⚠ Could not read file content'));
      }
    }
  }
  
  if (selectedAdapters.length === 0) {
    console.log(chalk.yellow('    No adapters selected in config'));
  } else if (allSelectedAdaptersPresent) {
    console.log(chalk.green('    All selected AI tools have adapter files'));
  } else {
    console.log(chalk.red('    Some selected adapter files are missing'));
    console.log(chalk.gray('    Run: ') + chalk.white('npx octboos sync') + ' to regenerate');
  }
  console.log('');

  // Check 5: Protocol Enforcement
  console.log(chalk.bold('📋 Protocol Enforcement:'));
  const protocolPath = join(agentDir, 'protocol.md');
  const protocolExists = existsSync(protocolPath);
  let protocolValid = false;
  
  if (protocolExists) {
    const protocolContent = readFileSync(protocolPath, 'utf8');
    const hasBeforeTask = protocolContent.includes('Before ANY Task');
    const hasAfterTask = protocolContent.includes('After EVERY Task');
    const hasEnforcement = protocolContent.includes('FAILURE TO FOLLOW');
    protocolValid = hasBeforeTask && hasAfterTask && hasEnforcement;
    
    if (protocolValid) {
      console.log(chalk.green('  ✓ ') + '.agent/protocol.md exists and is valid');
    } else {
      console.log(chalk.yellow('  ⚠ ') + '.agent/protocol.md exists but is missing required sections');
      if (!hasBeforeTask) console.log(chalk.gray('    Missing: ') + chalk.white('"Before ANY Task" section'));
      if (!hasAfterTask) console.log(chalk.gray('    Missing: ') + chalk.white('"After EVERY Task" section'));
      if (!hasEnforcement) console.log(chalk.gray('    Missing: ') + chalk.white('Enforcement statement'));
    }
  } else {
    console.log(chalk.red('  ✗ ') + '.agent/protocol.md — Missing (mandatory)');
  }
  
  // Check that adapter files reference protocol.md
  let adaptersWithProtocolRef = 0;
  let totalSelectedAdapters = 0;
  
  for (const [adapterKey, adapter] of Object.entries(ADAPTERS)) {
    const filePath = join(cwd, adapter.file);
    if (existsSync(filePath) && selectedAdapters.includes(adapterKey)) {
      totalSelectedAdapters++;
      try {
        const content = readFileSync(filePath, 'utf8');
        if (content.includes('protocol.md') || content.includes('PROTOCOL')) {
          adaptersWithProtocolRef++;
        }
      } catch (err) {
        // skip unreadable files
      }
    }
  }
  
  if (totalSelectedAdapters > 0) {
    if (adaptersWithProtocolRef === totalSelectedAdapters) {
      console.log(chalk.green('  ✓ ') + 'All selected adapter files reference protocol.md');
    } else {
      console.log(chalk.yellow('  ⚠ ') + `Only ${adaptersWithProtocolRef}/${totalSelectedAdapters} adapter files reference protocol.md`);
      console.log(chalk.gray('    Run: ') + chalk.white('npx octboos sync') + ' to regenerate adapter files');
    }
  } else if (protocolExists) {
    console.log(chalk.gray('  - No adapter files to check for protocol references'));
  } else {
    console.log(chalk.gray('  - Skipping adapter protocol check (protocol.md missing)'));
  }
  console.log('');

  // Check 6: Auto-documentation rules
  console.log(chalk.bold('📜 Auto-Documentation Rules:'));
  let hasAutoDocRules = false;
  
  // Check main adapters for auto-doc rules
  const mainAdapters = ['claude', 'gemini', 'codex', 'antigravity'];
  for (const adapterKey of mainAdapters) {
    if (Object.prototype.hasOwnProperty.call(ADAPTERS, adapterKey) && ADAPTERS[adapterKey]) {
      const filePath = join(cwd, ADAPTERS[adapterKey].file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf8');
          if (content.includes('Auto-Documentation Rule') || content.includes('update .agent/wiki/')) {
            hasAutoDocRules = true;
            break;
          }
        } catch (err) {
          // Continue checking
        }
      }
    }
  }
  
  if (hasAutoDocRules) {
    console.log(chalk.green('  ✓ ') + 'Auto-documentation rules found in adapter files');
    console.log(chalk.gray('    AI tools will update .agent/wiki/ after each task'));
  } else {
    console.log(chalk.red('  ✗ ') + 'Auto-documentation rules NOT found');
    console.log(chalk.gray('    Run: ') + chalk.white('npx octboos sync') + ' to regenerate adapter files');
  }
  console.log('');

  // Check 7: Recommendations
  console.log(chalk.bold('💡 Recommendations:'));
  
  const issues = [];
  if (!existsSync(join(agentDir, 'config.json'))) issues.push('Initialize project with npx octboos init');
  if (!protocolExists) issues.push('Create protocol.md with npx octboos init');
  if (protocolExists && !protocolValid) issues.push('Fix protocol.md to include all required sections');
  if (selectedAdapters.length > 0 && !allSelectedAdaptersPresent) issues.push('Regenerate adapter files with npx octboos sync');
  if (totalSelectedAdapters > 0 && adaptersWithProtocolRef < totalSelectedAdapters) issues.push('Regenerate adapter files to include protocol.md reference with npx octboos sync');
  if (!foundMainAdapterWithRules && selectedAdapters.some(a => ['claude', 'gemini', 'codex'].includes(a))) issues.push('Update adapter files with npx octboos sync');
  
  if (issues.length === 0) {
    console.log(chalk.green('  🎉 All checks passed! Octboos is ready to use.'));
    console.log(chalk.gray('    Your AI tools will now:'));
    console.log(chalk.gray('    1. Read protocol.md for mandatory execution rules'));
    console.log(chalk.gray('    2. Read adapter files for AI tool context'));
    console.log(chalk.gray('    3. Automatically update .agent/wiki/ after tasks'));
    console.log(chalk.gray('    4. Keep your documentation persistent and current'));
  } else {
    console.log(chalk.yellow('  Please address the following:'));
    for (const issue of issues) {
      console.log(chalk.gray('  · ') + chalk.white(issue));
    }
  }
  
  console.log('');
}