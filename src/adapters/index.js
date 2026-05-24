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
};

export function generateAdapterContent(adapterKey, projectName) {
  const header = buildHeader(projectName);
  const autoDocRule = `

## Auto-Documentation Rule (IMPORTANT)
After completing ANY task in this project:
1. Check which files you modified
2. Update .agent/wiki/[module-name].md with:
   - What this module does
   - Recent changes made
   - Key functions/components
3. If .agent/wiki/[module-name].md doesn't exist, create it
4. Update .agent/wiki/INDEX.md with the module link

Module naming:
- src/auth/** → .agent/wiki/auth.md
- src/api/** → .agent/wiki/api.md
- src/components/** → .agent/wiki/components.md
- src/lib/ or src/utils/ → .agent/wiki/utils.md
- src/db/ or src/database/ → .agent/wiki/database.md
- Other → .agent/wiki/general.md
`;

  switch (adapterKey) {
    case 'claude':
      return `${header}

## Octboos Instructions
> This file is auto-managed by Octboos. Edit \`.agent/\` files instead.

## Before Every Task
1. Read \`.agent/map.md\` for project structure
2. Check \`.agent/wiki/\` for module documentation
3. Follow conventions in \`.agent/style.md\`
4. After completing a task, update relevant \`.agent/wiki/\` files

## Quick Reference
- Project map: \`.agent/map.md\`
- Code wiki:   \`.agent/wiki/\`
- User style:  \`.agent/style.md\`
- Octboos config: \`.agent/config.json\`${autoDocRule}
`;

    case 'codex':
      return `${header}

## Octboos Context
> Auto-managed by Octboos. Source of truth: \`.agent/\`

## Required Reading
Before any task, read:
- \`.agent/map.md\` — project structure and stack
- \`.agent/wiki/\` — module documentation  
- \`.agent/style.md\` — coding conventions

## Update Rule
After completing any task, sync relevant docs:
\`\`\`
npx octboos sync --incremental
\`\`\`${autoDocRule}
`;

    case 'cursor':
    case 'windsurf':
      return `# Octboos Context for ${ADAPTERS[adapterKey].name}
> Auto-managed. Edit .agent/ files instead.

Always read .agent/map.md before starting any task.
Follow conventions in .agent/style.md.
Reference .agent/wiki/ for module documentation.${autoDocRule}
`;

    case 'copilot':
      return `# GitHub Copilot Instructions
> Managed by Octboos

## Context Files
- \`.agent/map.md\` — project map and stack
- \`.agent/wiki/\` — module documentation
- \`.agent/style.md\` — code style and conventions

Always reference these files before suggesting code changes.${autoDocRule}
`;

    case 'gemini':
      return `${header}

## Octboos Context
Read \`.agent/map.md\` and \`.agent/wiki/\` before any task.
Follow \`.agent/style.md\` for code conventions.${autoDocRule}
`;

    default:
      return header;
  }
}

function buildHeader(projectName) {
  return `# ${projectName || 'Project'} — Octboos Context
> Last synced: ${new Date().toISOString().split('T')[0]}
> Managed by Octboos (https://github.com/Octboos1/octboos.git)`;
}
