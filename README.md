# cortex-cli

> One command to give any AI tool memory and context.

[![npm version](https://img.shields.io/npm/v/cortex-cli.svg)](https://www.npmjs.com/package/cortex-cli)
[![license](https://img.shields.io/npm/l/cortex-cli.svg)](https://www.npmjs.com/package/cortex-cli)
[![node version](https://img.shields.io/node/v/cortex-cli.svg)](https://www.npmjs.com/package/cortex-cli)

## The Problem
AI coding tools start from zero every session. They don't remember your project structure, dependencies, or conventions, wasting tokens and breaking context.

## The Solution
cortex creates a `.agent/` directory in your project—a persistent memory bank that any AI tool can read to understand your codebase instantly.

## Quick Start
```bash
npx cortex-cli init
```

## What it generates
The `.agent/` directory contains:
```
.agent/
├── config.json     # Cortex configuration and selected AI tools
├── map.md          # Project structure, dependencies, and tech stack
├── style.md        # Your coding conventions and preferences
└── wiki/           # Auto-generated documentation for modules and components
```

## Supported AI Tools
| Tool          | Configuration File |
|---------------|--------------------|
| Claude Code   | CLAUDE.md          |
| OpenCode      | AGENTS.md          |
| Cursor        | .cursor/rules      |
| Aider         | .aider.conf.yml    |
| Gemini CLI    | GEMINI.md          |
| Codex CLI     | (no file, uses context) |
| Windsurf      | .windsurfrules     |
| GitHub Copilot| .github/copilot-instructions.md |

## Commands
- `cortex init`   — Initialize cortex in your project (creates .agent/)
- `cortex sync`   — Update .agent/ with latest project changes
- `cortex status` — Show current cortex configuration and file stats

## How it works
1. **Scan** — cortex analyzes your project structure, dependencies, and files
2. **Generate** — creates/updates .agent/ with context for AI tools
3. **AI reads** — your AI tool loads .agent/ files to understand your project instantly

## License
MIT