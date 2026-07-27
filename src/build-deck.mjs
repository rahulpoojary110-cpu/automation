#!/usr/bin/env node
// Deck agent: a standalone AI agent that builds HiveMinds-format PowerPoint
// decks using the bundled deck-sop skill (.claude/skills/deck-sop).
//
// Usage:
//   npm run build-deck -- "build a P1 snapshot slide about our Q3 launch..."
//   node src/build-deck.mjs --format ./my-format.md "build slide 2..."
//
// Requires ANTHROPIC_API_KEY (in the environment or a .env file next to
// package.json).

import { query } from '@anthropic-ai/claude-agent-sdk';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');

function loadDotEnv() {
  const envPath = path.join(REPO_ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = { formatFile: null, maxTurns: 60, model: undefined, promptParts: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format' || a === '--format-file') {
      args.formatFile = argv[++i];
    } else if (a === '--max-turns') {
      args.maxTurns = Number(argv[++i]);
    } else if (a === '--model') {
      args.model = argv[++i];
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    } else {
      args.promptParts.push(a);
    }
  }
  return args;
}

function printHelp() {
  console.log(`deck-agent — build HiveMinds-format decks with the deck-sop skill

Usage:
  npm run build-deck -- "<slide description>"
  node src/build-deck.mjs [options] "<slide description>"

Options:
  --format <file>      Path to a text file with a custom format block
                        (overrides the locked-in HiveMinds default for
                        this run)
  --max-turns <n>      Max agentic turns before stopping (default: 60)
  --model <name>       Model alias or id (default: SDK default)
  -h, --help           Show this help

Output:
  Finished .pptx files are written to ./output/

Requires ANTHROPIC_API_KEY in the environment or in a .env file
(see .env.example).
`);
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.promptParts.length === 0) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      'Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key, ' +
        'or export it in your shell.'
    );
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let userPrompt = args.promptParts.join(' ');
  if (args.formatFile) {
    if (!existsSync(args.formatFile)) {
      console.error(`Format file not found: ${args.formatFile}`);
      process.exit(1);
    }
    const formatBlock = readFileSync(args.formatFile, 'utf8');
    userPrompt = `Use this format block instead of the HiveMinds default:\n\n${formatBlock}\n\n---\n\n${userPrompt}`;
  }

  const instructions = [
    'You are running headless as a one-shot CLI agent (deck-agent), not inside an interactive Claude Code session.',
    'A skill named "deck-sop" is enabled — follow it exactly for any deck/slide/pptx work.',
    'There is no human available to answer the activation handshake question, so per the skill\'s headless rule, silently use the locked-in HiveMinds default format unless the request below includes its own format block.',
    `Do all work inside ${REPO_ROOT}. Write the final .pptx file(s) into ${OUTPUT_DIR}.`,
    'If soffice/pdftoppm are unavailable for a visual preview, skip the image render and rely on the text QA checklist from the skill instead of stopping.',
    'When finished, print the final absolute path(s) of the .pptx file(s) you produced.',
    '',
    'Request:',
    userPrompt,
  ].join('\n');

  const stream = query({
    prompt: instructions,
    options: {
      cwd: REPO_ROOT,
      settingSources: ['project'],
      skills: ['deck-sop'],
      allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: args.maxTurns,
      model: args.model,
      systemPrompt: { type: 'preset', preset: 'claude_code' },
    },
  });

  for await (const message of stream) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text' && block.text.trim()) {
          console.log(block.text.trim());
        } else if (block.type === 'tool_use') {
          const preview = JSON.stringify(block.input ?? {}).slice(0, 160);
          console.log(`\n[tool] ${block.name} ${preview}`);
        }
      }
    } else if (message.type === 'result') {
      console.log('\n---');
      if (message.subtype === 'success') {
        console.log(`Done in ${(message.duration_ms / 1000).toFixed(1)}s, ${message.num_turns} turns, $${message.total_cost_usd.toFixed(4)}`);
      } else {
        console.error(`Agent stopped early: ${message.subtype}`);
        if (message.errors?.length) console.error(message.errors.join('\n'));
        process.exitCode = 1;
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
