// Compile entry point for the Windows desktop build:
//   bun build --compile --target=bun-windows-x64 src/app.win32.mjs --outfile deck-sop-agent.exe
//
// Statically embeds the win32 `claude` native binary and the deck-sop skill
// files into the executable so the resulting .exe needs nothing next to it.

import claudeBinPath from '@anthropic-ai/claude-agent-sdk-win32-x64/claude.exe' with { type: 'file' };
import { extractFromBunfs } from '@anthropic-ai/claude-agent-sdk/extract';
import skillMd from '../.claude/skills/deck-sop/SKILL.md' with { type: 'text' };
import slidePatterns from '../.claude/skills/deck-sop/references/slide-patterns.md' with { type: 'text' };
import chartCheatsheet from '../.claude/skills/deck-sop/references/chart-cheatsheet.md' with { type: 'text' };
import sopFull from '../.claude/skills/deck-sop/references/sop-full.md' with { type: 'text' };
import { runApp } from './app-core.mjs';

const cliPath = extractFromBunfs(claudeBinPath);

await runApp({
  pathToClaudeCodeExecutable: cliPath,
  skillFiles: { skillMd, slidePatterns, chartCheatsheet, sopFull },
  appLabel: 'deck-sop-agent (Windows)',
});
