import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export async function statusCommand() {
  const cwd = process.cwd();
  const configPath = join(cwd, '.agent', 'config.json');

  console.log('');

  if (!existsSync(configPath)) {
    console.log(chalk.yellow('  ✗ Octboos not initialized in this project'));
    console.log(chalk.gray('    Run: ') + chalk.white('npx octboos init'));
    console.log('');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const lastSync = new Date(config.lastSync);
  const hoursSince = Math.floor((Date.now() - lastSync) / 1000 / 60 / 60);

  console.log(chalk.bold.cyan('  Octboos Status'));
  console.log('');
  console.log(chalk.gray('  Project:    ') + chalk.white(config.projectName));
  console.log(chalk.gray('  Version:    ') + chalk.white(config.version));
  console.log(chalk.gray('  Last sync:  ') + (
    hoursSince < 24
      ? chalk.green(`${hoursSince}h ago`)
      : chalk.yellow(`${Math.floor(hoursSince / 24)}d ago — run octboos sync`)
  ));

  // Files
  console.log('');
  console.log(chalk.gray('  Context files:'));
  const agentFiles = [
    ['map.md',      'Project structure'],
    ['style.md',    'Coding style'],
    ['config.json', 'Octboos config'],
  ];
  for (const [file, desc] of agentFiles) {
    const exists = existsSync(join(cwd, '.agent', file));
    console.log(
      '  ' + (exists ? chalk.green('✓') : chalk.red('✗')) + ' ' +
      chalk.white(`.agent/${file}`) + chalk.gray(` — ${desc}`)
    );
  }

  // Wiki
  const wikiDir = join(cwd, '.agent', 'wiki');
  if (existsSync(wikiDir)) {
    const wikiFiles = readdirSync(wikiDir).filter(f => f.endsWith('.md'));
    console.log('');
    console.log(chalk.gray(`  Wiki: ${wikiFiles.length} files`));
    for (const f of wikiFiles.slice(0, 5)) {
      console.log(chalk.gray('  ·  ') + chalk.white(`.agent/wiki/${f}`));
    }
    if (wikiFiles.length > 5) {
      console.log(chalk.gray(`  ... and ${wikiFiles.length - 5} more`));
    }
  }

  // Adapters
  console.log('');
  console.log(chalk.gray('  AI tools configured:'));
  const { ADAPTERS } = await import('../adapters/index.js');
  for (const adapterKey of config.adapters) {
    const adapter = ADAPTERS[adapterKey];
    if (!adapter) continue;
    const exists = existsSync(join(cwd, adapter.file));
    console.log(
      '  ' + (exists ? chalk.green('✓') : chalk.red('✗')) + ' ' +
      chalk.white(adapter.name) + chalk.gray(` (${adapter.file})`)
    );
  }

  console.log('');
}
