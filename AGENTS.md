# AGENTS.md — how any AI agent works in this repo

This is **Video Create**: Talha Zubayer's private, code-driven video studio (Bangladesh). Claude Code is the main
operator, but any agent (Codex, Cursor, Gemini CLI, Copilot, Aider…) can use it. The full handbook is `CLAUDE.md` —
read its §00 (fast start) and §0 (how to work with the owner) before acting. This file is the short version.

## Ground rules (non-negotiable)
- Talk to the owner in **simple Bengali**; he is a non-coder. Explain any technical word the first time.
- **Plan before building** any video: `projects/<name>/PLAN.md` + `node tools/plan-check.mjs projects/<name>`, show
  him, wait for OK (CLAUDE.md §0e). Exceptions are written in CLAUDE.md §0.
- Never print or ask for secrets (`.env.local`). Never spend money (paid APIs: Gemini voice, Lyria music, fal) or
  publish/deploy/post/send anything without his explicit OK.
- Never upgrade the HyperFrames CLI (pinned 0.8.134) or run `hyperframes init` / `skills update`.
- Renders and media never go to git (see `.gitignore`); deliver files, commit sources. `git pull` before work,
  `git push` after (with his OK). Never force-push.
- Python only via `tools/pyenv` (Windows) — never pip-install into the system Python.

## Where things are
| Need | Go to |
| --- | --- |
| Route a job (his folder or request → style code → skill → engine) | `CLAUDE.md` §00 table, `node tools/route.mjs <folder>` |
| The named styles (codes) | `VARIANTS.md` (Bengali), `tools/variants.json` |
| His taste and feedback | `STYLE.md`, `LESSONS.md` |
| Skills (step-by-step workflows per style) | `.claude/skills/<name>/SKILL.md` |
| Motion-graphics client work by catalog CODE | `.claude/skills/motion-studio/SKILL.md`, `tools/studio/`, `docs/studio/` |
| Business plan, prices, outreach, payments | `docs/business/PLAYBOOK.md` (Bengali), `docs/business/` |
| Planning without running code (another chat model) | `transfer-kit/PROMPT.md` + `transfer-kit/knowledge/` |
| Cloud machine setup | `CLOUD.md`, `bash tools/cloud/ready.sh` |

## Motion Studio quick path (client video by CODE)
```bash
node tools/studio/new-piece.mjs <name> --code=PL1 --brand="Client"   # scaffold from tools/studio/catalog.json
# write projects/<name>/BRIEF.md + PLAN.md → node tools/plan-check.mjs projects/<name> → owner's OK
# author index.html on tools/studio/runtime/studio.js (rules: docs/studio/AGENT-BRIEF.md, bar: docs/studio/QUALITY.md)
node tools/studio/sound.mjs projects/<name>                           # soundtrack from piece.json
node tools/studio/check.mjs projects/<name> --at=<held moments>       # must pass; then LOOK at the contact sheets
node tools/studio/render-queue.mjs <name>                             # one render at a time → renders/portfolio/
```
Reference piece: `projects/pf-pl1-lumen`. Portfolio samples: `projects/pf-*` (all fictional brands, concept work).

## Machine notes
Windows laptop (i5-8265U, 16 GB, Intel UHD 620): one render at a time, ≤ 2 headless Chromes (`tools/studio/slot.mjs`
enforces it); ~10 s of render per second of 1080p30 CSS-3D video. In Git Bash never leave a bare `cd` (the session
follows it) — use `cd "/d/Video Create" && …` and `( cd sub && … )`.
