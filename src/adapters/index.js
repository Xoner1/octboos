// All supported AI tool adapters
export const ADAPTERS = {
  claude: {
    name:        'Claude Code',
    file:        'CLAUDE.md',
    description: 'Anthropic Claude Code',
  },
  codex: {
    name:        'Codex / OpenCode',
    file:        'AGENTS.md',
    description: 'OpenAI Codex CLI & OpenCode',
  },
  cursor: {
    name:        'Cursor',
    file:        '.cursor/rules',
    description: 'Cursor IDE',
  },
  windsurf: {
    name:        'Windsurf',
    file:        '.windsurfrules',
    description: 'Windsurf IDE',
  },
  copilot: {
    name:        'GitHub Copilot',
    file:        '.github/copilot-instructions.md',
    description: 'GitHub Copilot',
  },
  gemini: {
    name:        'Gemini CLI',
    file:        'GEMINI.md',
    description: 'Google Gemini CLI',
  },
  aider: {
    name:        'Aider',
    file:        '.aider.conf.yml',
    description: 'Aider AI Pair Programming',
  },
  cline: {
    name:        'Cline',
    file:        '.clinerules',
    description: 'Cline AI Coding Assistant',
  },
  continue: {
    name:        'Continue.dev',
    file:        '.continue/config.json',
    description: 'Continue.dev AI Coding Assistant',
  },
};

export function generateAdapterContent(adapterKey, projectName) {
  const header = buildHeader(projectName);
  const autoDocRule = `

## Auto-Documentation Rule (CRITICAL)
After EVERY task you complete:
1. Identify which module you worked on:
   - src/auth/** → .agent/wiki/auth.md
   - src/api/** → .agent/wiki/api.md
   - src/components/** → .agent/wiki/components.md
   - src/lib/** or src/utils/** → .agent/wiki/utils.md
   - src/db/** or src/database/** → .agent/wiki/database.md
   - Other → .agent/wiki/general.md

2. Update the module wiki file with:
   - What this module does
   - Functions/components you added/modified
   - Important changes and why

3. If the wiki file doesn't exist, CREATE it with:
   \`\`\`markdown
   # [Module Name]
   ## Purpose
   [What this module does]
   
   ## Key Files
   - [file paths]
   
   ## How it works
   [Brief explanation]
   
   ## Recent Changes
   - [DATE]: [What you changed]
   \`\`\`

4. Update .agent/wiki/INDEX.md to include the module link

## 📚 Before ANY Task
1. READ .agent/map.md — Project structure
2. CHECK .agent/wiki/INDEX.md — Module documentation
3. FOLLOW .agent/style.md — Your coding conventions

## 📖 Project Info
`;

  switch (adapterKey) {
    case 'claude':
      return `# ${projectName || 'Project'} — Octboos Context
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

## Octboos Instructions
> This file is auto-managed by Octboos. Edit \`.agent/\` files instead.

${autoDocRule}${header.slice(header.indexOf('> Managed by Octboos'))}`;

    case 'codex':
      return `# ${projectName || 'Project'} — Octboos Context
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

## Octboos Context
> Auto-managed by Octboos. Source of truth: \`.agent/\`

${autoDocRule}${header.slice(header.indexOf('> Managed by Octboos'))}`;

    case 'cursor':
    case 'windsurf':
      return `# Octboos Context for ${ADAPTERS[adapterKey].name}
> Auto-managed. Edit .agent/ files instead.
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

${autoDocRule}

Always read .agent/map.md before starting any task.
Follow conventions in .agent/style.md.
Reference .agent/wiki/ for module documentation.`;

    case 'copilot':
      return `# GitHub Copilot Instructions
> Managed by Octboos
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

## Context Files
- \`.agent/map.md\` — project map and stack
- \`.agent/wiki/\` — module documentation
- \`.agent/style.md\` — code style and conventions

${autoDocRule}

Always reference these files before suggesting code changes.`;

    case 'gemini':
      return `# ${projectName || 'Project'} — Octboos Context
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

## Octboos Context
> Auto-managed by Octboos

${autoDocRule}${header.slice(header.indexOf('> Managed by Octboos'))}`;

    case 'aider':
      return `# Aider Configuration
> Managed by Octboos
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

# This file configures Aider AI Pair Programming
# DO NOT EDIT MANUALLY - changes will be overwritten

${autoDocRule}

# Standard aider configuration that works with octboos
model: claude-3-5-sonnet-20241022
edit-format: draft
no-suggest: false
auto-commits: false
`;

    case 'cline':
      return `# Cline Configuration
> Managed by Octboos
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

${autoDocRule}

# Standard cline configuration that works with octboos
{
  "autoAccept": false,
  "allowedTools": ["read", "write", "bash", "glob"],
  "customInstructions": "Follow octboos documentation rules in .agent/"
}`;

    case 'continue':
      return `# Continue.dev Configuration
> Managed by Octboos
> Last updated: ${new Date().toISOString().split('T')[0]} | Do not edit manually

${autoDocRule}

{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022"
    }
  ],
  "autopilot": false,
  "contextProviders": [
    {
      "name": "octboos",
      "description": "Loads octboos context files",
      "priority": 10
    }
  ]
}`;

    default:
      return header;
  }
}

function buildHeader(projectName) {
  return `# ${projectName || 'Project'} — Octboos Context
> Last synced: ${new Date().toISOString().split('T')[0]}
> Managed by Octboos (https://github.com/Octboos1/octboos.git)`;
}
