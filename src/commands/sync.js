import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { scanProject, buildFileMap } from '../indexer/scanner.js';
import { ADAPTERS, generateAdapterContent } from '../adapters/index.js';

export async function syncCommand(options) {
  const cwd = process.cwd();
  const configPath = join(cwd, '.agent', 'config.json');

  if (!existsSync(configPath)) {
    console.log('');
    console.log(chalk.yellow('  ⚠  Cortex not initialized.'));
    console.log(chalk.gray('     Run ' + chalk.white('npx cortex init') + ' first.'));
    console.log('');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  console.log('');
  console.log(chalk.bold.cyan(`  Cortex Sync — ${config.projectName}`));
  console.log('');

  // Scan project
  const spinner = ora({ text: chalk.gray('Scanning project...'), color: 'cyan' }).start();
  const scanResult = await scanProject(cwd);
  spinner.succeed(chalk.green(`Scanned ${scanResult.fileCount} files`));

  // Update map.md
  const mapSpinner = ora({ text: chalk.gray('Updating map.md...'), color: 'cyan' }).start();
  const mapContent = buildFileMap(scanResult, cwd);
  writeFileSync(join(cwd, '.agent', 'map.md'), mapContent);
  mapSpinner.succeed(chalk.green('Updated .agent/map.md'));

  // Update adapter files
  const adapterSpinner = ora({ text: chalk.gray('Updating AI tool configs...'), color: 'cyan' }).start();
  for (const adapterKey of config.adapters) {
    const adapter = ADAPTERS[adapterKey];
    if (!adapter) continue;
    const filePath = join(cwd, adapter.file);
    if (existsSync(filePath)) {
      writeFileSync(filePath, generateAdapterContent(adapterKey, config.projectName));
    }
  }
  adapterSpinner.succeed(chalk.green('Updated AI tool configs'));

  // Update lastSync in config
  config.lastSync = new Date().toISOString();
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('');
  console.log(chalk.bold.green('  ✓ Sync complete!'));
  console.log('');
}
