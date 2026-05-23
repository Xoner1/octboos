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

  switch (adapterKey) {
    case 'claude':
      return `${header}

## Cortex Instructions
> This file is auto-managed by Cortex. Edit \`.agent/\` files instead.

## Before Every Task
1. Read \`.agent/map.md\` for project structure
2. Check \`.agent/wiki/\` for module documentation
3. Follow conventions in \`.agent/style.md\`
4. After completing a task, update relevant \`.agent/wiki/\` files

## Quick Reference
- Project map: \`.agent/map.md\`
- Code wiki:   \`.agent/wiki/\`
- User style:  \`.agent/style.md\`
- Cortex config: \`.agent/config.json\`
`;

    case 'codex':
      return `${header}

## Cortex Context
> Auto-managed by Cortex. Source of truth: \`.agent/\`

## Required Reading
Before any task, read:
- \`.agent/map.md\` — project structure and stack
- \`.agent/wiki/\` — module documentation  
- \`.agent/style.md\` — coding conventions

## Update Rule
After completing any task, sync relevant docs:
\`\`\`
npx cortex sync --incremental
\`\`\`
`;

    case 'cursor':
    case 'windsurf':
      return `# Cortex Context for ${ADAPTERS[adapterKey].name}
> Auto-managed. Edit .agent/ files instead.

Always read .agent/map.md before starting any task.
Follow conventions in .agent/style.md.
Reference .agent/wiki/ for module documentation.
`;

    case 'copilot':
      return `# GitHub Copilot Instructions
> Managed by Cortex

## Context Files
- \`.agent/map.md\` — project map and stack
- \`.agent/wiki/\` — module documentation
- \`.agent/style.md\` — code style and conventions

Always reference these files before suggesting code changes.
`;

    case 'gemini':
      return `${header}

## Cortex Context
Read \`.agent/map.md\` and \`.agent/wiki/\` before any task.
Follow \`.agent/style.md\` for code conventions.
`;

    default:
      return header;
  }
}

function buildHeader(projectName) {
  return `# ${projectName || 'Project'} — Cortex Context
> Last synced: ${new Date().toISOString().split('T')[0]}
> Managed by Cortex (https://github.com/Xoner1/cortex.git)`;
}
