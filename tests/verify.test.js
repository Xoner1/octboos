import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

describe('octboos verification suite', () => {
  it('protocol.md exists and has required sections', () => {
    const content = readFileSync(join(root, '.agent/protocol.md'), 'utf8');
    assert(content.includes('Before ANY Task'), 'protocol.md: missing "Before ANY Task"');
    assert(content.includes('After EVERY Task'), 'protocol.md: missing "After EVERY Task"');
    assert(content.includes('FAILURE TO FOLLOW'), 'protocol.md: missing enforcement');
  });

  it('.agent/ has all required files', () => {
    const required = ['config.json', 'map.md', 'style.md', 'protocol.md'];
    for (const file of required) {
      assert(existsSync(join(root, '.agent', file)), `.agent/${file} missing`);
    }
  });

  it('wiki directory exists with index', () => {
    const wikiDir = join(root, '.agent/wiki');
    assert(existsSync(wikiDir), '.agent/wiki/ missing');
    assert(existsSync(join(wikiDir, 'INDEX.md')), '.agent/wiki/INDEX.md missing');
  });

  it('adapter index exports ADAPTERS object', async () => {
    const { ADAPTERS } = await import('../src/adapters/index.js');
    assert(ADAPTERS, 'ADAPTERS not exported');
    assert(typeof ADAPTERS === 'object');
    assert(Object.keys(ADAPTERS).length >= 9, 'expected 9+ adapters');
  });

  it('claude adapter file references protocol.md', () => {
    const claudePath = join(root, 'CLAUDE.md');
    assert(existsSync(claudePath), 'CLAUDE.md missing');
    const content = readFileSync(claudePath, 'utf8');
    assert(content.includes('protocol.md') || content.includes('PROTOCOL'), 'must reference protocol');
  });

  it('verify command exports a function', async () => {
    const mod = await import('../src/commands/verify.js');
    assert(typeof mod.verifyCommand === 'function');
  });

  it('document command exports a function and accepts options', async () => {
    const mod = await import('../src/commands/document.js');
    assert(typeof mod.documentCommand === 'function');
    // should accept { copy: true }
    const len = mod.documentCommand.length;
    assert(len <= 1, 'documentCommand should accept options param');
  });

  it('ui server exports startUIServer', async () => {
    const mod = await import('../src/ui/server.js');
    assert(typeof mod.startUIServer === 'function');
  });

  it('bin/octboos.js is executable', () => {
    const content = readFileSync(join(root, 'bin/octboos.js'), 'utf8');
    assert(content.startsWith('#!/usr/bin/env node'), 'must have shebang');
    assert(content.includes('documentCommand'), 'must import documentCommand');
    assert(content.includes('startUIServer'), 'must import startUIServer');
    assert(content.includes('command(\'ui\')'), 'must have ui command');
    assert(content.includes('--copy'), 'must support --copy flag');
  });

  it('package.json has correct author and repo URLs', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    assert(pkg.author !== 'xoner', 'author should not be "xoner"');
    assert(pkg.repository.url.includes('octboos'), 'repo URL should reference octboos');
  });
});
