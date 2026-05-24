import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

const CONFIG_DIR = join(homedir(), '.octboos');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export async function configCommand(options) {
  if (options.show) {
    showConfig();
    return;
  }

  if (options.style) {
    const validStyles = ['minimal', 'detailed'];
    if (!validStyles.includes(options.style)) {
      console.log('');
      console.log(chalk.red(`  Error: Invalid style "${options.style}"`));
      console.log(chalk.gray(`  Valid styles: ${validStyles.join(', ')}`));
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

    config.style = options.style;
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

    console.log('');
    console.log(chalk.green('  ✓ Style preference saved'));
    console.log(chalk.gray(`  Style: ${config.style}`));
    console.log(chalk.gray(`  Config: ${CONFIG_FILE}`));
    console.log('');
    return;
  }

  console.log('');
  console.log(chalk.yellow('  Usage: npx octboos config --style <minimal|detailed>'));
  console.log(chalk.gray('  Or:    npx octboos config --show'));
  console.log('');
}

function showConfig() {
  console.log('');
  console.log(chalk.bold.cyan('  Octboos Config'));
  console.log('');

  if (!existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('  No configuration set'));
    console.log(chalk.gray('  Run: npx octboos config --style <minimal|detailed>'));
    console.log('');
    return;
  }

  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    console.log(chalk.gray('  Style: ') + chalk.white(config.style || 'not set'));
    console.log(chalk.gray('  Config: ') + chalk.white(CONFIG_FILE));
  } catch {
    console.log(chalk.red('  Error: Could not read config file'));
  }

  console.log('');
}
