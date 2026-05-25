import { createServer } from 'http';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const PORT = 3847;
const __dirname = dirname(fileURLToPath(import.meta.url));
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

export function startUIServer(projectRoot = process.cwd()) {
  const staticDir = join(__dirname, 'static');

  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = url.pathname;

    // API routes
    if (pathname === '/api/status') {
      handleApiStatus(res, projectRoot);
      return;
    }
    if (pathname === '/api/structure') {
      handleApiStructure(res, projectRoot);
      return;
    }
    if (pathname === '/api/config') {
      handleApiConfig(res, projectRoot);
      return;
    }

    // Static files
    if (pathname === '/') pathname = '/index.html';
    const filePath = join(staticDir, pathname);

    try {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(PORT, () => {
    console.log('');
    console.log(chalk.bold.cyan('  Octboos Cockpit UI'));
    console.log(chalk.gray('  ─────────────────────'));
    console.log(chalk.white(`  Local:   http://localhost:${PORT}`));
    console.log('');
  });
}

function handleApiStatus(res, root) {
  const agentDir = join(root, '.agent');
  const adaptersDir = join(__dirname, '..', 'adapters');
  const stats = {
    initialized: existsSync(join(agentDir, 'config.json')),
    protocolExists: existsSync(join(agentDir, 'protocol.md')),
    wikiFiles: 0,
    adapterFiles: [],
    uptime: process.uptime(),
  };

  // Count wiki files
  const wikiDir = join(agentDir, 'wiki');
  if (existsSync(wikiDir)) {
    stats.wikiFiles = readdirSync(wikiDir).filter(f => f.endsWith('.md')).length;
  }

  // Find adapter files
  try {
    const adapterModule = readFileSync(join(adaptersDir, 'index.js'), 'utf8');
    const adapterMatches = adapterModule.matchAll(/ADAPTERS\[['"](.+?)['"]\]/g);
    const seen = new Set();
    for (const match of adapterMatches) {
      const name = match[1];
      if (!seen.has(name)) {
        seen.add(name);
        stats.adapterFiles.push({
          name,
          exists: existsSync(join(root, name === 'claude' ? 'CLAUDE.md' : name === 'gemini' ? 'GEMINI.md' : name === 'codex' ? 'CODEX.md' : name === 'cursor' ? '.cursorrules' : name === 'windsurf' ? '.windsurfrules' : name === 'copilot' ? '.github/copilot-instructions.md' : `${name}.md`)),
        });
      }
    }
  } catch {
    // ignore adapter scan errors
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(stats));
}

function handleApiStructure(res, root) {
  const agentDir = join(root, '.agent');
  const files = [];

  function walk(dir, prefix) {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const stat = statSync(full);
      files.push({
        name: entry,
        path: join(prefix, entry),
        isDirectory: stat.isDirectory(),
        size: stat.size,
        modified: stat.mtimeMs,
      });
      if (stat.isDirectory()) walk(full, join(prefix, entry));
    }
  }

  walk(agentDir, '.agent');

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ files }));
}

function handleApiConfig(res, root) {
  const configPath = join(root, '.agent', 'config.json');
  if (!existsSync(configPath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not initialized' }));
    return;
  }

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
