# octboos

> One agent to control every AI tool.

[![npm version](https://img.shields.io/npm/v/octboos.svg)](https://www.npmjs.com/package/octboos)
[![license](https://img.shields.io/npm/l/octboos.svg)](https://www.npmjs.com/package/octboos)
[![node version](https://img.shields.io/node/v/octboos.svg)](https://www.npmjs.com/package/octboos)

## The Problem
AI coding tools start from zero every session. They don't remember your project structure, dependencies, or conventions, wasting tokens and breaking context.

## The Solution
octboos creates a `.agent/` directory in your project—a persistent memory bank that any AI tool can read to understand your codebase instantly.

## Quick Start
```bash
npx octboos init
```

## What it generates
The `.agent/` directory contains:
```
.agent/
├── config.json     # Octboos configuration and selected AI tools
├── map.md          # Project structure, dependencies, and tech stack
├── style.md        # Your coding conventions and preferences
└── wiki/           # Documentation for modules and components (updated by AI)
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
- `octboos init`   — Initialize octboos in your project (creates .agent/)
- `octboos sync`   — Update .agent/ with latest project changes
- `octboos status` — Show current octboos configuration and file stats
- `octboos document` — Get a prompt to document your project with AI

## How it works
1. **Initialize** — run `npx octboos init` to create the `.agent/` directory with configuration files
2. **AI learns** — your AI tool (Claude, Cursor, etc.) reads the generated CLAUDE.md/AGENTS.md etc. to understand your project
3. **Document automatically** — after each task, your AI tool updates .agent/wiki/ following the rules in its configuration file
   OR use `npx octboos document` to get a ready-made prompt for manual documentation
4. **Stay in sync** — run `npx octboos sync` to update the project map (.agent/map.md) as your project evolves

## License
MIT