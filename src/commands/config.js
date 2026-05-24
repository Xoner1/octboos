import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

const CONFIG_DIR = join(homedir(), '.octboos');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const VALID_PROVIDERS = ['claude', 'openai', 'gemini'];

export async function configCommand(options) {
  if (options.show) {
    showConfig();
    return;
  }

  if (!options.key) {
    console.log('');
    console.log(chalk.yellow('  Usage: npx octboos config --key <API_KEY> [--provider <claude|openai|gemini>]'));
    console.log(chalk.gray('  Or:    npx octboos config --show'));
    console.log('');
    return;
  }

  if (options.provider && !VALID_PROVIDERS.includes(options.provider)) {
    console.log('');
    console.log(chalk.red(`  Error: Invalid provider "${options.provider}"`));
    console.log(chalk.gray(`  Valid providers: ${VALID_PROVIDERS.join(', ')}`));
    console.log('');
    return;
  }

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  let config = {};
  if (existsSync(CONFIG_FILE)) {
    try {
      config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    } catch {
      config = {};
    }
  }

  config.apiKey = options.key;
  if (options.provider) {
    config.provider = options.provider;
  } else if (!config.provider) {
    config.provider = 'claude';
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  console.log('');
  console.log(chalk.green('  ✓ API key saved'));
  console.log(chalk.gray(`  Provider: ${config.provider}`));
  console.log(chalk.gray(`  Config:   ${CONFIG_FILE}`));
  console.log('');
}

function showConfig() {
  console.log('');
  console.log(chalk.bold.cyan('  Octboos API Config'));
  console.log('');

  if (!existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('  No API key configured'));
    console.log(chalk.gray('  Run: npx octboos config --key <YOUR_KEY>'));
    console.log('');
    return;
  }

  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    console.log(chalk.gray('  Provider: ') + chalk.white(config.provider || 'claude'));
    console.log(chalk.gray('  API Key:  ') + (config.apiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set')));
    console.log(chalk.gray('  Config:   ') + chalk.white(CONFIG_FILE));
  } catch {
    console.log(chalk.red('  Error: Could not read config file'));
  }

  console.log('');
}
