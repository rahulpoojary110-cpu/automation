// Plain Node.js entry for the interactive desktop app (used by run.bat / run.sh).
// Unlike app.win32.mjs, this doesn't embed anything — it reads the skill
// files straight off disk and lets the Claude Agent SDK auto-resolve its own
// native `claude` binary via the platform-specific optional dependency that
// `npm install` already fetched.

import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runApp } from './app-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SKILL_SRC = path.join(REPO_ROOT, '.claude', 'skills', 'deck-sop');

const skillFiles = {
  skillMd: readFileSync(path.join(SKILL_SRC, 'SKILL.md'), 'utf8'),
  slidePatterns: readFileSync(path.join(SKILL_SRC, 'references', 'slide-patterns.md'), 'utf8'),
  chartCheatsheet: readFileSync(path.join(SKILL_SRC, 'references', 'chart-cheatsheet.md'), 'utf8'),
  sopFull: readFileSync(path.join(SKILL_SRC, 'references', 'sop-full.md'), 'utf8'),
};

await runApp({
  pathToClaudeCodeExecutable: undefined, // let the SDK auto-resolve it
  skillFiles,
  appLabel: 'deck-sop-agent',
});
