// deck-sop-agent web server: a browser UI + SSE endpoint around the
// Claude Agent SDK, so anyone with a URL and their own Anthropic API key can
// build HiveMinds-format decks without installing anything locally.
//
// Start: node server/index.mjs   (or `npm run web`)
// Optional: set SITE_PASSWORD to gate usage (not page load) behind a simple
// shared password — recommended before sharing the URL, since building a
// deck runs shell commands (npm/node/soffice) server-side.

import express from 'express';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const WEB_OUTPUT_DIR = path.join(REPO_ROOT, 'output', 'web');
const PORT = process.env.PORT || 3000;
const SITE_PASSWORD = process.env.SITE_PASSWORD || null;

mkdirSync(WEB_OUTPUT_DIR, { recursive: true });

const sessions = new Set();

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function isAuthed(req) {
  if (!SITE_PASSWORD) return true;
  const { session } = parseCookies(req);
  return Boolean(session && sessions.has(session));
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(REPO_ROOT, 'public')));

app.post('/api/login', (req, res) => {
  if (!SITE_PASSWORD) return res.json({ ok: true });
  if (req.body?.password !== SITE_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Wrong password' });
  }
  const token = randomUUID();
  sessions.add(token);
  res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`);
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  res.json({ passwordRequired: Boolean(SITE_PASSWORD), authed: isAuthed(req) });
});

app.post('/api/build', async (req, res) => {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { prompt, apiKey, formatBlock } = req.body ?? {};
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Missing apiKey' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const jobId = randomUUID();
  const jobDir = path.join(WEB_OUTPUT_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (event, data) => {
    if (res.writableEnded) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  let userPrompt = prompt;
  if (formatBlock && formatBlock.trim()) {
    userPrompt = `Use this format block instead of the HiveMinds default:\n\n${formatBlock}\n\n---\n\n${userPrompt}`;
  }

  const instructions = [
    'You are running as a web-hosted headless agent (deck-sop-agent), not inside an interactive Claude Code session. There is no human available to answer the activation handshake question.',
    'A skill named "deck-sop" is enabled — follow it exactly for any deck/slide/pptx work.',
    "Per the skill's headless rule, silently use the locked-in HiveMinds default format unless the request below includes its own format block.",
    `Do all work inside ${REPO_ROOT}, but write the final .pptx file(s) ONLY into this exact job directory: ${jobDir} — do not write output anywhere else.`,
    'If soffice/pdftoppm are unavailable for a visual preview, skip the image render and rely on the text QA checklist instead of stopping.',
    'When finished, print the final absolute path(s) of the .pptx file(s) you produced.',
    '',
    'Request:',
    userPrompt,
  ].join('\n');

  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  try {
    const stream = query({
      prompt: instructions,
      options: {
        cwd: REPO_ROOT,
        settingSources: ['project'],
        skills: ['deck-sop'],
        allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 60,
        env: { ...process.env, ANTHROPIC_API_KEY: apiKey },
        systemPrompt: { type: 'preset', preset: 'claude_code' },
      },
    });

    let sawResult = false;
    for await (const message of stream) {
      if (closed) break;
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if (block.type === 'text' && block.text.trim()) {
            send('text', { text: block.text.trim() });
          } else if (block.type === 'tool_use') {
            send('tool', { name: block.name, input: block.input ?? {} });
          }
        }
      } else if (message.type === 'result') {
        sawResult = true;
        if (message.subtype === 'success') {
          send('result', {
            ok: true,
            durationMs: message.duration_ms,
            numTurns: message.num_turns,
            costUsd: message.total_cost_usd,
          });
        } else {
          send('result', { ok: false, subtype: message.subtype, errors: message.errors ?? [] });
        }
      }
    }

    if (!sawResult && !closed) {
      send('error', {
        message:
          'The agent process ended without completing a turn. This usually means the API key was rejected or the server could not reach the Anthropic API — check the server logs.',
      });
    }

    let files = [];
    if (existsSync(jobDir)) {
      files = readdirSync(jobDir)
        .filter((f) => f.toLowerCase().endsWith('.pptx'))
        .filter((f) => statSync(path.join(jobDir, f)).isFile());
    }
    send('files', { jobId, files: files.map((f) => `/download/${jobId}/${encodeURIComponent(f)}`) });
  } catch (err) {
    send('error', { message: err?.message ?? String(err) });
  } finally {
    if (!res.writableEnded) res.end();
  }
});

app.get('/download/:jobId/:filename', (req, res) => {
  const jobId = req.params.jobId;
  const filename = req.params.filename;
  if (!/^[0-9a-f-]{36}$/i.test(jobId) || filename.includes('..') || filename.includes('/')) {
    return res.status(400).send('Bad request');
  }
  const filePath = path.join(WEB_OUTPUT_DIR, jobId, filename);
  if (!existsSync(filePath)) return res.status(404).send('Not found');
  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`deck-sop-agent web server listening on http://localhost:${PORT}`);
  if (SITE_PASSWORD) console.log('Password protection is ON.');
  else console.log('No SITE_PASSWORD set — anyone with the URL can use this. Set SITE_PASSWORD before sharing publicly.');
});
