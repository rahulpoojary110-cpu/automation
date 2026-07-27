// Shared interactive "app" logic for the compiled deck-sop-agent binaries.
// Platform-specific entry points (e.g. app.win32.mjs) statically import the
// native `claude` binary asset + the skill files as embedded text, then call
// runApp() with those resolved.

import { query } from '@anthropic-ai/claude-agent-sdk';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const CONFIG_DIR = path.join(os.homedir(), '.deck-sop-agent');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const WORK_DIR = path.join(os.homedir(), 'deck-sop-agent');
const OUTPUT_DIR = path.join(WORK_DIR, 'output');
const SKILL_DIR = path.join(WORK_DIR, '.claude', 'skills', 'deck-sop');

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function materializeSkill(skillFiles) {
  mkdirSync(path.join(SKILL_DIR, 'references'), { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(path.join(SKILL_DIR, 'SKILL.md'), skillFiles.skillMd);
  writeFileSync(path.join(SKILL_DIR, 'references', 'slide-patterns.md'), skillFiles.slidePatterns);
  writeFileSync(path.join(SKILL_DIR, 'references', 'chart-cheatsheet.md'), skillFiles.chartCheatsheet);
  writeFileSync(path.join(SKILL_DIR, 'references', 'sop-full.md'), skillFiles.sopFull);
}

export async function runApp({ pathToClaudeCodeExecutable, skillFiles, appLabel }) {
  console.log(`\n=== ${appLabel ?? 'deck-sop-agent'} ===`);
  console.log(`Workspace: ${WORK_DIR}`);
  console.log(`Output folder: ${OUTPUT_DIR}\n`);

  materializeSkill(skillFiles);

  const config = loadConfig();
  const rl = readline.createInterface({ input: stdin, output: stdout });

  let apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('First run: paste your Anthropic API key (from https://console.anthropic.com/settings/keys).');
    console.log(`It will be saved locally to ${CONFIG_PATH} (plain text) so you only enter it once.\n`);
    apiKey = (await rl.question('API key: ')).trim();
    if (!apiKey) {
      console.error('No key entered, exiting.');
      rl.close();
      process.exit(1);
    }
    saveConfig({ ...config, apiKey });
  }

  console.log("\nType your slide/deck request below. Type 'exit' at the prompt to quit,");
  console.log("or '/reset-key' to replace the saved API key.\n");

  while (true) {
    const first = await rl.question('Build a deck > ');
    if (first.trim().toLowerCase() === 'exit') break;
    if (first.trim().toLowerCase() === '/reset-key') {
      const newKey = (await rl.question('New API key: ')).trim();
      if (newKey) {
        apiKey = newKey;
        saveConfig({ ...config, apiKey });
        console.log('Saved.\n');
      }
      continue;
    }

    const rest = await readMultilinePromptContinuation(rl, first);
    const userPrompt = rest;

    const instructions = [
      'You are running headless as a one-shot desktop app (deck-sop-agent), not inside an interactive Claude Code session.',
      'A skill named "deck-sop" is enabled — follow it exactly for any deck/slide/pptx work.',
      "There is no human available to answer the activation handshake question, so per the skill's headless rule, silently use the locked-in HiveMinds default format unless the request below includes its own format block.",
      `Do all work inside ${WORK_DIR}. Write the final .pptx file(s) into ${OUTPUT_DIR}.`,
      'If soffice/pdftoppm are unavailable for a visual preview, skip the image render and rely on the text QA checklist instead of stopping.',
      'If Node.js/npm are not available on this machine, say so clearly and stop — do not attempt a workaround.',
      'When finished, print the final absolute path(s) of the .pptx file(s) you produced.',
      '',
      'Request:',
      userPrompt,
    ].join('\n');

    try {
      const stream = query({
        prompt: instructions,
        options: {
          cwd: WORK_DIR,
          settingSources: ['project'],
          skills: ['deck-sop'],
          allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],
          permissionMode: 'bypassPermissions',
          allowDangerouslySkipPermissions: true,
          maxTurns: 60,
          pathToClaudeCodeExecutable,
          env: { ...process.env, ANTHROPIC_API_KEY: apiKey },
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
            console.log(
              `Done in ${(message.duration_ms / 1000).toFixed(1)}s, ${message.num_turns} turns, $${message.total_cost_usd.toFixed(4)}`
            );
          } else {
            console.error(`Agent stopped early: ${message.subtype}`);
            if (message.errors?.length) console.error(message.errors.join('\n'));
          }
        }
      }
    } catch (err) {
      console.error('Error running agent:', err?.message ?? err);
    }
    console.log('');
  }

  rl.close();
}

async function readMultilinePromptContinuation(rl, firstLine) {
  console.log('(Add more lines if you want, e.g. exact numbers/labels. Press Enter on an empty line when done.)');
  const lines = [firstLine];
  while (true) {
    const line = await rl.question('> ');
    if (line === '') break;
    lines.push(line);
  }
  return lines.join('\n');
}
