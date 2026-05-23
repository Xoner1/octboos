#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

program
  .name('octboos')
  .description('One agent to control every AI tool')
  .version(pkg.version);

// Commands
const { initCommand }   = await import('../src/commands/init.js');
const { syncCommand }   = await import('../src/commands/sync.js');
const { statusCommand } = await import('../src/commands/status.js');

program
  .command('init')
  .description('Initialize Octboos in current project')
  .option('-y, --yes', 'Skip prompts, use defaults')
  .option('--adapters <list>', 'Comma-separated adapters: claude,codex,cursor,windsurf,copilot')
  .action(initCommand);

program
  .command('sync')
  .description('Sync and update .agent/ wiki and context')
  .option('--incremental', 'Only update changed files')
  .action(syncCommand);

program
  .command('status')
  .description('Show current Octboos status for this project')
  .action(statusCommand);

program.parse();
