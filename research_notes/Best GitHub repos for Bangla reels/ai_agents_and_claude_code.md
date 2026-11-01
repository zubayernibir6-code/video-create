# AI agents & Claude Code power-ups: best GitHub repos for the "৫টা GitHub রিপো" Reels (research notes, 2026-10-30)

Method note. Every star count, licence, archive flag and release date below was read on 2026-10-30 from the repo's own github.com page, releases page or commits page through WebFetch. No api.github.com call was made. WebFetch passes the page through a summariser, so the numbers are "as the page shows them". The 309.1k for obra/superpowers was re-read with a verbatim prompt and confirmed ("309.1k stars"). GitHub prints release dates without a year when they fall in the current year. Where a page showed "28 Oct" with no year, these notes read it as 2026. Where a year was printed (commit pages, changelog headers), it is quoted.

## Q1. Which repos give the biggest real-world result for the least setup? (ranked 8 per theme, final TOP 5 + 2 backups, fact sheets)

### Takeaway
- **Theme A (Claude Code power-ups), TOP 5:** obra/superpowers, anthropics/skills, upstash/context7, microsoft/playwright-mcp, ccusage/ccusage.
- **Theme A backups:** github/spec-kit, nextlevelbuilder/ui-ux-pro-max-skill.
- **Theme B (no-code agents and automation), TOP 5:** n8n-io/n8n, nanobrowser/nanobrowser, langgenius/dify, activepieces/activepieces, langflow-ai/langflow.
- **Theme B backups:** browser-use/browser-use, openclaw/openclaw. OpenClaw needs a strong safety warning.
- **The biggest catch for the whole of Theme A:** Claude Code itself needs a paid Claude plan (Pro, Max, Team, Enterprise or Console). The free claude.ai plan does not include it. Context7, Playwright MCP, ccusage and spec-kit also work with other coding agents (Copilot, Cursor, Gemini CLI, Codex, OpenCode), so a viewer without a paid plan still gets something from them.
- **The biggest catch for Theme B:** most self-hosted options need Docker. On an 8 GB Windows laptop, the safe same-day paths are `npx n8n`, the Nanobrowser Chrome extension, Langflow Desktop, or the free cloud plans of Dify and Activepieces.

### Cited Findings

#### Cross-cutting prerequisite: Claude Code on Windows
- Native Windows install (PowerShell): `irm https://claude.ai/install.ps1 | iex`. CMD: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`. WinGet: `winget install Anthropic.ClaudeCode`. — [Claude Code setup docs](https://code.claude.com/docs/en/setup)
- Requirements: Windows 10 1809+ or Windows Server 2019+, 4 GB+ RAM, x64 or ARM64, an internet connection, and an Anthropic-supported country. Running as Administrator is not needed. Git for Windows is optional: it provides Git Bash for the Bash tool, and without it Claude Code uses PowerShell. — [Claude Code setup docs](https://code.claude.com/docs/en/setup)
- "Claude Code requires a Pro, Max, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access." — [Claude Code setup docs](https://code.claude.com/docs/en/setup)
- A Desktop app is offered for people who prefer a graphical interface over the terminal (Windows download linked). — [Claude Code setup docs](https://code.claude.com/docs/en/setup)
- The npm route (`npm install -g @anthropic-ai/claude-code`) needs Node.js 22 or later. — [Claude Code setup docs](https://code.claude.com/docs/en/setup)

#### THEME A: ranked list of 8 candidates

| # | Repo | Stars (read 2026-10-30) | Licence | Latest activity | Why this rank |
|---|---|---|---|---|---|
| 1 | obra/superpowers | 309.1k | MIT | v7.0.1, 21 Oct 2026 | 1–2 slash commands. Claude then asks questions, plans, tests and reviews on its own. The biggest behaviour change for the least setup. |
| 2 | anthropics/skills | 185.0k | Apache-2.0 for most skills; docx/pdf/pptx/xlsx are source-available | commit Oct 28, 2026 | Official from Anthropic. Word, Excel, PowerPoint and PDF output, which every freelancer and office user needs. |
| 3 | upstash/context7 | 64.0k | MIT | ctx7@0.8.2, 23 Oct 2026 | One setup command. Stops the AI writing old or made-up code. |
| 4 | microsoft/playwright-mcp | 38.9k | Apache-2.0 | v0.0.83, 28 Sep 2026 | One command. Claude can drive a real browser (open, click, fill, check). |
| 5 | ccusage/ccusage | 19.3k | MIT | v20.0.45, 26 Oct 2026 | Zero install (`npx`). Shows tokens and dollar value used. Works for several agents. |
| 6 | github/spec-kit | 144.0k | MIT | 1.2.5, 28 Oct 2026 | GitHub's own "spec first, then code" method. Needs Python 3.11 and uv, so more setup. |
| 7 | nextlevelbuilder/ui-ux-pro-max-skill | 142.9k | MIT | v2.15.0, 13 Aug 2026 | A plugin that makes AI-built websites look designed. Good for freelancers who sell web pages. |
| 8 | thedotmack/claude-mem | 105.5k | Apache-2.0 | v15.6.0, 29 Oct 2026 | Memory across sessions. Strong, but has a cloud sign-in path and an odd crypto-token section in its README (see caveats). |

Sources for the table: [superpowers](https://github.com/obra/superpowers), [superpowers releases](https://github.com/obra/superpowers/releases), [anthropics/skills](https://github.com/anthropics/skills), [skills commits](https://github.com/anthropics/skills/commits/main), [context7](https://github.com/upstash/context7), [context7 releases](https://github.com/upstash/context7/releases), [playwright-mcp](https://github.com/microsoft/playwright-mcp), [playwright-mcp releases](https://github.com/microsoft/playwright-mcp/releases), [ccusage](https://github.com/ccusage/ccusage), [ccusage releases](https://github.com/ccusage/ccusage/releases), [spec-kit](https://github.com/github/spec-kit), [spec-kit releases](https://github.com/github/spec-kit/releases), [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [ui-ux-pro-max releases](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases), [claude-mem](https://github.com/thedotmack/claude-mem), [claude-mem releases](https://github.com/thedotmack/claude-mem/releases)

**Considered for Theme A but not ranked in the 8** (each was verified on its own page):
- **affaan-m/ECC** (formerly everything-claude-code). 293.1k stars, MIT, release 2.2.3 dated 2026-10-01. It has 71 agents and 314 skills. The README itself warns about the context-window cost ("advertises the installed catalog to the model"), says not to stack installs, warns that unofficial mirrors "may contain malware", and notes native-Windows limits for some optional features. Too heavy for beginners. — [ECC](https://github.com/affaan-m/everything-claude-code)
- **wshobson/agents.** 42.0k stars, MIT, last commit Oct 17, 2026. It has 94 plugins, 202 agents, 185 skills and 105 commands. Install: `/plugin marketplace add wshobson/agents`, then for example `/plugin install python-development@claude-code-workflows`. Developer-centric. — [wshobson/agents](https://github.com/wshobson/agents), [commits](https://github.com/wshobson/agents/commits/main)
- **musistudio/claude-code-router.** 37.9k stars, MIT, v3.1.3 released 09 Oct 2026. Install with `npm install -g @musistudio/claude-code-router`, and `ccr ui` opens a UI at http://127.0.0.1:3458. Needs Node 22+. It routes Claude Code to OpenRouter, DeepSeek, Moonshot/Kimi, Mistral, Z.AI and others. That matters for cost-sensitive viewers, but it needs provider keys and configuration, and its "Chrome login-state import" handles sensitive credentials. — [claude-code-router](https://github.com/musistudio/claude-code-router), [releases](https://github.com/musistudio/claude-code-router/releases)
- **oraios/serena.** 30.9k stars. Licence: GPL-3.0-or-later (with an MIT part, SolidLSP). Install: `uv tool install -p 3.13 serena-agent`. It gives symbol-level code retrieval and editing over 40+ languages, and its JetBrains backend is paid. It pays off on big codebases, not for beginners. — [serena](https://github.com/oraios/serena)
- **SuperClaude-Org/SuperClaude_Framework.** 23.9k stars, MIT, v4.3.0 "current stable". Install: `pipx install superclaude`, then `superclaude install`. The plugin route is "not yet available (planned for v5.0)", and v5.0 has "no ETA". Last commit Sep 27, 2026. It is slowing next to superpowers. — [SuperClaude](https://github.com/SuperClaude-Org/SuperClaude_Framework), [commits](https://github.com/SuperClaude-Org/SuperClaude_Framework/commits/master)
- **ChromeDevTools/chrome-devtools-mcp.** 54.5k stars, Apache-2.0, v1.12.0 released 2026-10-22. Plugin install: `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`, then `/plugin install chrome-devtools-mcp@chrome-devtools-plugins`. Usage statistics are on by default (turn off with `--no-usage-statistics`), and performance traces can go to the Google CrUX API. It is the alternative to Playwright MCP. — [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp), [releases](https://github.com/ChromeDevTools/chrome-devtools-mcp/releases)
- **davila7/claude-code-templates.** 33.0k stars, MIT. Run with `npx claude-code-templates@latest`, browse at aitmpl.com, and use `--analytics` and `--health-check`. A friendly installer of agents, commands, hooks and MCPs. — [claude-code-templates](https://github.com/davila7/claude-code-templates)
- **czlonkowski/n8n-mcp.** 23.2k stars, MIT, v2.99.2 released 27 Oct 2026. It gives Claude knowledge of 3,143 n8n nodes and 2,352 templates. The hosted free tier allows "100 tool calls/day". The README warns: "NEVER edit your production workflows directly with AI!" It is a good crossover episode between Theme A and Theme B. — [n8n-mcp](https://github.com/czlonkowski/n8n-mcp), [releases](https://github.com/czlonkowski/n8n-mcp/releases)
- **hesreallyhim/awesome-claude-code.** 56.9k stars. Curated list, with a bot-updated ticker on Oct 30, 2026. Good to name as "where to find more", not as a tool. — [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code), [commits](https://github.com/hesreallyhim/awesome-claude-code/commits/main)
- **gsd-build/get-shit-done.** 64.2k stars. **Archived Jun 26, 2026**, and the README says it "now continues as GSD Core" at open-gsd/gsd-core. Dropped. — [get-shit-done](https://github.com/gsd-build/get-shit-done)
- A third-party roundup (mejba.me, revised Aug 15, 2026) was used only as a lead. Its star counts were older than today's pages (for example, superpowers ~272K there against 309.1k on the page today). — [mejba.me roundup](https://www.mejba.me/blog/top-github-repos-claude-code-2026)

#### THEME A: fact sheets (TOP 5 + 2 backups)

##### A1. obra/superpowers (TOP 5, #1)
- **URL:** https://github.com/obra/superpowers
- **What it does:** a set of skills that Claude uses on its own: brainstorming, writing plans, test-driven development, subagent-driven development with a two-stage review, systematic debugging and git worktrees. — [README](https://github.com/obra/superpowers)
- **Problem it solves for this viewer:** a beginner types "make me an app" and gets messy code. Superpowers makes Claude ask questions first, write a design and a small-step plan, then build and test it. — [README](https://github.com/obra/superpowers)
- **Stars:** ~309.1k (read 2026-10-30, confirmed verbatim). **Licence:** MIT. **Archived:** no. **Latest release:** v7.0.1, 21 Oct 2026 (v7.0.0 on 10 Oct). — [repo](https://github.com/obra/superpowers), [releases](https://github.com/obra/superpowers/releases)
- **Install (verbatim from the README):** `/plugin install superpowers@claude-plugins-official`. Alternative: `/plugin marketplace add obra/superpowers-marketplace`, then `/plugin install superpowers@superpowers-marketplace`. **Prerequisites:** Claude Code only (see the cross-cutting section). The README has no Windows-specific notes. — [README](https://github.com/obra/superpowers)
- **First use:** (1) Inside `claude`, paste the install line. (2) Ask for something to build, such as "a to-do web page for my shop". (3) Claude starts the brainstorming skill and asks clarifying questions, then writes a design and a task plan before any code. The README describes the workflow as automatic. — [README](https://github.com/obra/superpowers)
- **Hook:** it ships in Anthropic's official plugin marketplace (`superpowers@claude-plugins-official`), and with ~309k stars it is one of the most-starred Claude Code add-ons on GitHub. — [README](https://github.com/obra/superpowers)
- **Caveats:** it needs a paid Claude plan (Claude Code). The README states no other costs.
- **Difficulty:** 1/5 once Claude Code is installed (inference).

##### A2. anthropics/skills (TOP 5, #2)
- **URL:** https://github.com/anthropics/skills
- **What it does:** Anthropic's official skill library. It holds document skills (docx, pdf, pptx, xlsx), creative and design skills, development skills (web-app testing, MCP server builder), enterprise and communication skills, and a template for writing your own. — [README](https://github.com/anthropics/skills)
- **Problem it solves for this viewer:** freelancers, accountants and students need real Word, Excel, PowerPoint and PDF files, not chat text. These are the skills that "power Claude's document capabilities". — [README](https://github.com/anthropics/skills)
- **Stars:** ~185.0k (read 2026-10-30). **Licence:** "many skills" are Apache-2.0; `docx`, `pdf`, `pptx` and `xlsx` are "source-available, not open source". No root LICENSE file was visible. **Archived:** no. **Latest commit:** Oct 28, 2026 (mcp-builder update). The repo has no GitHub releases. — [README](https://github.com/anthropics/skills), [commits](https://github.com/anthropics/skills/commits/main)
- **Install (verbatim):** `/plugin marketplace add anthropics/skills`, then `/plugin install document-skills@anthropic-agent-skills` (or `example-skills@anthropic-agent-skills`). In the menu: "Browse and install plugins" → anthropic-agent-skills → document-skills → Install now. **Prerequisites:** Claude Code. — [README](https://github.com/anthropics/skills)
- **First use:** (1) Add the marketplace and install `document-skills`. (2) Ask Claude in plain words for a file, for example "make a 5-slide PowerPoint about my coaching centre" or "turn this table into an Excel sheet with totals". (3) Claude writes a real .pptx or .xlsx file into the folder. The example prompts are illustrative, not quoted from the README.
- **Hook:** the docx, pdf, pptx and xlsx skills in this repo are the ones behind Claude's own document features, and you can open their SKILL.md files and read them. — [README](https://github.com/anthropics/skills)
- **Caveats:** the README says the skills are "for demonstration and educational purposes" and should be tested before critical use. The document skills are source-available, not open source, so they cannot be re-licensed or resold. — [README](https://github.com/anthropics/skills)
- **Difficulty:** 1/5 (inference).

##### A3. upstash/context7 (TOP 5, #3)
- **URL:** https://github.com/upstash/context7
- **What it does:** fetches current, version-specific library documentation and code examples and passes them to the coding agent. — [README](https://github.com/upstash/context7)
- **Problem it solves for this viewer:** AI models learn from old data, so they write outdated code and "hallucinated APIs" for new library versions. With Context7 the code matches today's docs. — [README](https://github.com/upstash/context7)
- **Stars:** ~64.0k (read 2026-10-30). **Licence:** MIT. **Archived:** no. **Latest release:** ctx7@0.8.2 and @upstash/context7-sdk@0.6.0 (marked Latest), both 23 Oct 2026. — [repo](https://github.com/upstash/context7), [releases](https://github.com/upstash/context7/releases)
- **Install (verbatim):** `npx ctx7 setup`, which "Authenticates via OAuth, generates an API key, and installs the appropriate skill". Use `--claude`, `--cursor` or `--opencode` to target an agent. Manual MCP setup uses `https://mcp.context7.com/mcp` with an `Authorization: Bearer YOUR_API_KEY` header. **Prerequisites:** Node.js 22.13 or newer for the ctx7 CLI. — [README](https://github.com/upstash/context7)
- **First use:** (1) Run `npx ctx7 setup --claude` and log in through the browser. (2) In Claude Code, end a prompt with `use context7`; the README's example is a Cloudflare Worker cache prompt followed by "use context7". (3) The agent pulls the current docs and writes up-to-date code. You can pin a library ("use library /supabase/supabase") or a version ("Next.js 16"). — [README](https://github.com/upstash/context7)
- **Hook:** two words, "use context7", typed at the end of any prompt, switch the AI from memory to live documentation. — [README](https://github.com/upstash/context7)
- **Caveats:** setup goes through OAuth and an API key. The README offers "a free API key" for higher rate limits but gives no numbers and names no paid plan. It is a cloud service, so your library queries go to Upstash. — [README](https://github.com/upstash/context7)
- **Difficulty:** 2/5 (inference; Node 22.13+ and a browser login).

##### A4. microsoft/playwright-mcp (TOP 5, #4)
- **URL:** https://github.com/microsoft/playwright-mcp
- **What it does:** an MCP server that lets the agent control a real browser with Playwright. It reads the page through the accessibility tree, not screenshots. — [README](https://github.com/microsoft/playwright-mcp)
- **Problem it solves for this viewer:** Claude can open a website, click, fill forms and check that a site works, for example testing your own freelance client's page, with no manual clicking. — [README](https://github.com/microsoft/playwright-mcp)
- **Stars:** ~38.9k (read 2026-10-30). **Licence:** Apache-2.0. **Archived:** no. **Latest release:** v0.0.83, 28 Sep 2026 (v0.0.82 on 18 Sep). — [repo](https://github.com/microsoft/playwright-mcp), [releases](https://github.com/microsoft/playwright-mcp/releases)
- **Install (verbatim):** `claude mcp add playwright npx @playwright/mcp@latest`. Generic config: an `mcpServers` entry `playwright` running `npx` with `"@playwright/mcp@latest"`. **Prerequisites:** Node.js 18 or newer. — [README](https://github.com/microsoft/playwright-mcp)
- **First use:** (1) Run the `claude mcp add` line in a terminal. (2) Start `claude` and ask, for example, "open my website, fill the contact form with test data and tell me if it sends". (3) Claude drives the browser step by step and reports. The example prompt is illustrative.
- **Hook:** it needs no vision model. It "sees" a page through the accessibility tree, the same structure screen readers use. Microsoft's own README also says coding agents increasingly prefer the Playwright CLI with skills because it is more token-efficient. — [README](https://github.com/microsoft/playwright-mcp)
- **Caveats:** the browser acts with your logins if you let it use your profile, so it needs normal care. Do not point it at banking or other sensitive sites (inference). It is free, with no API key of its own.
- **Difficulty:** 2/5 (inference).

##### A5. ccusage/ccusage (TOP 5, #5)
- **URL:** https://github.com/ccusage/ccusage (`ryoppippi/ccusage` now opens this owner)
- **What it does:** a command-line report of the tokens and costs your coding agents used, by day, week, month or session, plus Claude Code's 5-hour billing windows and a status-line hook. — [README](https://github.com/ccusage/ccusage)
- **Problem it solves for this viewer:** someone paying around $20 a month in Bangladesh wants to know whether the plan is worth it and how close they are to the limit. ccusage shows it from local data. — [README](https://github.com/ccusage/ccusage)
- **Stars:** ~19.3k (read 2026-10-30). **Licence:** MIT. **Archived:** no. **Latest release:** v20.0.45, 26 Oct 2026 (two more on 24 Oct). — [repo](https://github.com/ccusage/ccusage), [releases](https://github.com/ccusage/ccusage/releases)
- **Install / run (verbatim):** `npx ccusage@latest`. Alternatives: `bunx ccusage`, `pnpm dlx ccusage`. Subcommands: `daily`, `weekly`, `monthly`, `session`, `blocks` (5-hour windows), and `statusline` (beta). **Prerequisites:** Node.js (npx); the README states no version. — [README](https://github.com/ccusage/ccusage)
- **First use:** (1) Open PowerShell. (2) Type `npx ccusage@latest`. (3) A table of daily tokens and cost appears. `npx ccusage@latest blocks` shows the current 5-hour window. — [README](https://github.com/ccusage/ccusage)
- **Hook:** one tool reads usage from Claude Code, Codex (`ccusage codex daily`), Gemini CLI, GitHub Copilot CLI, OpenCode, Amp, Qwen and others. — [README](https://github.com/ccusage/ccusage)
- **Caveats:** the dollar figures are estimates of API-equivalent cost, not your bill (inference; the README says it "reads local usage data"). It is read-only and local.
- **Difficulty:** 1/5 (inference).

##### A6. github/spec-kit (backup 1)
- **URL:** https://github.com/github/spec-kit
- **What it does:** GitHub's "spec-driven development" toolkit. The `specify` CLI sets up a project, and slash commands take you from a constitution to a spec, a plan, tasks and then the implementation. — [README](https://github.com/github/spec-kit)
- **Problem it solves for this viewer:** "vibe coding" a bigger project falls apart. Spec Kit forces a written spec and plan first, so the AI builds what you meant. — [README](https://github.com/github/spec-kit)
- **Stars:** ~144.0k (read 2026-10-30). **Licence:** MIT. **Archived:** no. **Latest release:** Spec Kit 1.2.5, 28 Oct 2026 (1.2.4 on 27 Oct, 1.2.3 on 22 Oct). — [repo](https://github.com/github/spec-kit), [releases](https://github.com/github/spec-kit/releases)
- **Install (verbatim):** `uv tool install specify-cli`, then `specify init my-project --integration copilot`, then `cd my-project`. **Prerequisites:** "Python 3.11+, uv, and a supported AI coding agent on Linux, macOS, or Windows." — [README](https://github.com/github/spec-kit)
- **First use (commands as the README shows them today, hyphenated):** `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` (there is also `/speckit-converge`). The README says the hyphen form follows GitHub Copilot's default skills syntax. — [README](https://github.com/github/spec-kit)
- **Hook:** it comes from GitHub itself, has ~144k stars, and shipped three releases in one week (22, 27 and 28 Oct 2026). — [releases](https://github.com/github/spec-kit/releases)
- **Caveats:** it needs Python, uv and an agent (more steps). The exact `--integration` value for Claude Code was not shown in what I read; see Gaps. Free.
- **Difficulty:** 3/5 (inference).

##### A7. nextlevelbuilder/ui-ux-pro-max-skill (backup 2)
- **URL:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **What it does:** a design-intelligence skill. When the agent builds a UI, it searches a local catalogue of styles, palettes, font pairings and UX rules. — [README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- **Problem it solves for this viewer:** AI-built websites all look the same. Freelancers selling landing pages get a designed look without being designers. — [README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- **Stars:** ~142.9k (read 2026-10-30). **Licence:** MIT. **Archived:** no. **Latest release:** v2.15.0, 13 Aug 2026 (v2.14.2 on 2026-08-12). — [repo](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [releases](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases)
- **Install (verbatim):** `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`, then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`. CLI alternative: `npm install -g ui-ux-pro-max-cli`, then `uipro init --ai claude`. The README says the old `uipro-cli` package is stale. **Prerequisites:** Python 3.x for the search script. — [README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- **First use:** (1) Install the plugin. (2) Ask "build a landing page for a bakery in Mirpur". (3) The skill picks a style, palette and font pair before coding. The example prompt is illustrative.
- **Hook:** 192 colour palettes, 74 font pairings and 79 UI styles, all searched on your machine; the script "makes no network calls". — [README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- **Caveats:** its last release (Aug 2026) is older than the others, though the repo is not archived. Python must be on PATH (inference).
- **Difficulty:** 2/5 (inference).

##### A8 (ranked #8, not in the final 7). thedotmack/claude-mem: facts for the writer
- 105.5k stars, Apache-2.0, v15.6.0 released 29 Oct 2026. Install: `npx claude-mem install`, or `/plugin marketplace add thedotmack/claude-mem` then `/plugin install claude-mem`. Needs Node 20+; Bun and uv are installed automatically if missing. On Windows the launcher goes to `%LOCALAPPDATA%\claude-mem\bin`. It captures what the agent did and injects a compressed summary into later sessions. `<private>` tags keep content out of storage. — [claude-mem](https://github.com/thedotmack/claude-mem), [releases](https://github.com/thedotmack/claude-mem/releases)
- Reasons it is out of the final 7: the README offers optional cloud sync to cmem.ai and an email sign-in with a hosted "observer" model. It also has a section on a third-party crypto token, "CMEM", with a contract address, presented as embraced by the creator. That is a trust signal to avoid pushing to beginners. — [claude-mem](https://github.com/thedotmack/claude-mem)

#### THEME B: ranked list of 8 candidates

| # | Repo | Stars (read 2026-10-30) | Licence | Latest activity | Why this rank |
|---|---|---|---|---|---|
| 1 | n8n-io/n8n | 209.1k | Sustainable Use License (fair-code) + n8n Enterprise License | n8n@2.45.7 (Latest), 30 Oct 2026 | Runs with one `npx n8n` (no Docker). Has 9,000+ templates and AI-agent nodes. The workhorse for freelancers. |
| 2 | nanobrowser/nanobrowser | 14.2k | Apache-2.0 | v0.3.0, 15 Oct 2026 | Nothing to install except a Chrome or Edge extension. An AI agent clicks and types in your browser. |
| 3 | langgenius/dify | 160.0k | Dify Open Source License (Apache-2.0 + conditions) | v1.18.0, 23 Oct 2026 | Build a chatbot or AI app on your own documents. Free cloud sandbox; self-hosting needs Docker and 4 GiB of RAM. |
| 4 | activepieces/activepieces | 25.3k | MIT (Community) + commercial `packages/ee` | 0.92.3-hotfix.2 (Latest), 28 Oct 2026 | A Zapier-style builder with a free cloud plan of 1,000 credits a month, or one `docker run`. |
| 5 | langflow-ai/langflow | 156.2k | MIT | v1.13.0, 22 Oct 2026 | A visual AI-agent builder with a Windows desktop app. Ships many security fixes. |
| 6 | browser-use/browser-use | 119.6k | MIT | 0.13.14, 26 Oct 2026 | The strongest browser-agent library, but it needs Python code and an API key. |
| 7 | openclaw/openclaw | 393.4k | MIT | 2026.10.9 (Latest), 29 Oct 2026 | A personal AI assistant on WhatsApp, Telegram and more. Huge wow factor, with serious security risks. |
| 8 | huginn/huginn | 50.2k | MIT | commits Oct 26, 2026 (v2026.10.26) | A self-hosted IFTTT/Zapier alternative. Still maintained, but Docker and Ruby-era UX make it hard for beginners. |

Sources for the table: [n8n](https://github.com/n8n-io/n8n), [n8n releases](https://github.com/n8n-io/n8n/releases), [nanobrowser](https://github.com/nanobrowser/nanobrowser), [nanobrowser releases](https://github.com/nanobrowser/nanobrowser/releases), [dify](https://github.com/langgenius/dify), [dify releases](https://github.com/langgenius/dify/releases), [activepieces](https://github.com/activepieces/activepieces), [activepieces releases](https://github.com/activepieces/activepieces/releases), [langflow](https://github.com/langflow-ai/langflow), [langflow releases](https://github.com/langflow-ai/langflow/releases), [browser-use](https://github.com/browser-use/browser-use), [browser-use releases](https://github.com/browser-use/browser-use/releases), [openclaw](https://github.com/openclaw/openclaw), [openclaw releases](https://github.com/openclaw/openclaw/releases), [huginn](https://github.com/huginn/huginn), [huginn commits](https://github.com/huginn/huginn/commits/master)

**Considered for Theme B and dropped:**
- **FlowiseAI/Flowise: ARCHIVED.** 55.5k stars, Apache-2.0. "This repository was archived by the owner on Aug 13, 2026. It is now read-only." The maintainer's "Future of Flowise" post set a code freeze on July 29, 2026, archival on August 13, 2026 and end of life on August 31, 2026. Its reason: developers rely more on coding agents, and a rigid low-code workflow "quickly hits the limit". No successor is named; forking is encouraged. Do not feature it (or feature it only as a "why this died" story). — [Flowise](https://github.com/FlowiseAI/Flowise), [Discussion #6727](https://github.com/FlowiseAI/Flowise/discussions/6727)
- **Significant-Gravitas/AutoGPT.** 187.8k stars. `autogpt_platform/` is under Polyform Shield 1.0.0 (free for personal and internal business use, not as a competing hosted service); the rest is MIT. Latest release: AutoGPT Platform v0.10.0 (autogpt-platform-beta-v0.10.0), 27 Oct 2026. Self-hosting is a Docker single container (`significantgravitas/autogpt`, `-p 127.0.0.1:3000:3000`, admin via `docker exec autogpt autogpt-admin promote you@example.com`). The hosted platform is a paid service with a trial. Docker-only and heavy on an 8 GB laptop. — [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT), [releases](https://github.com/Significant-Gravitas/AutoGPT/releases)
- **OpenHands/OpenHands.** 92.3k stars, MIT. Now launched as "Agent Canvas": `npm install -g @openhands/agent-canvas`, then `agent-canvas`, with the UI at http://localhost:8000. Needs Node 24+ and uv. On Windows it uses Docker Desktop, and the multi-sandbox mode needs WSL 2 ("The native Windows host is not supported by this runtime"). It is a developer coding agent, so it fits Theme A as "an alternative agent", not Theme B for non-coders. — [OpenHands](https://github.com/OpenHands/OpenHands), [README.windows.md](https://github.com/OpenHands/OpenHands/blob/main/README.windows.md)
- **Zie619/n8n-workflows.** 57.1k stars, MIT. It claims 4,343 n8n workflows and is browsable at zie619.github.io/n8n-workflows, with JSON downloads. The "100% Import Success Rate" claim is unverified, and the licensing of individual workflows is unclear. Useful as a bonus inside the n8n episode, not as one of the five. — [n8n-workflows](https://github.com/Zie619/n8n-workflows)

#### THEME B: fact sheets (TOP 5 + 2 backups)

##### B1. n8n-io/n8n (TOP 5, #1)
- **URL:** https://github.com/n8n-io/n8n
- **What it does:** a visual workflow automation tool. You connect apps with nodes, add AI-agent steps (OpenAI, Anthropic, Google or open models) with tool use and human approvals, and run it all on your own computer. — [README](https://github.com/n8n-io/n8n)
- **Problem it solves for this viewer:** repetitive work, such as new form entries going to a Google Sheet, an AI-written reply to an email, or a daily Telegram report, can be automated for free on your own laptop. It is also a skill freelancers sell. — [README](https://github.com/n8n-io/n8n)
- **Stars:** ~209.1k (read 2026-10-30). **Licence:** no SPDX id. "fair-code distributed under the Sustainable Use License", and files with `.ee.` in their name fall under the n8n Enterprise License. **Archived:** no. **Latest release:** n8n@2.45.7 (Latest), 30 Oct 2026; 2.46.3 is a pre-release. — [README](https://github.com/n8n-io/n8n), [LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md), [releases](https://github.com/n8n-io/n8n/releases)
- **Windows install (verbatim, official docs):** try it with `npx n8n`; global install `npm install n8n -g`, then start with `n8n` or `n8n start`; it opens at `http://localhost:5678`. **Prerequisite:** "n8n requires a Node.js version between 20.19 and 24.x, inclusive." Docker alternative from the README: `docker volume create n8n_data`, then `docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n`. — [n8n npm docs](https://docs.n8n.io/hosting/installation/npm/), [README](https://github.com/n8n-io/n8n)
- **First use:** (1) Install Node.js 22 LTS (inside the 20.19–24.x window) and run `npx n8n`. (2) Open http://localhost:5678 and create the local owner account. (3) Pick a template, connect a credential (Gmail, Telegram, Google Sheets) and press "Execute workflow". Steps 2–3 are inference from the standard UI; the docs confirm only the URL.
- **Hook:** the README claims "9,000+" ready-made workflow templates and 1,500+ integrations. The About box says 400+ integrations, so quote the templates figure. — [README](https://github.com/n8n-io/n8n)
- **Caveats:**
  - **Licence.** "You may use or modify the software only for your own internal business purposes or for non-commercial or personal use", and "You may distribute the software or provide it to others only if you do so free of charge for non-commercial purposes." Do not resell n8n itself as a hosted service. — [LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)
  - **Security.** n8n's advisory page listed six new advisories on Oct 28, 2026, two of them High. — [n8n security advisories](https://github.com/n8n-io/n8n/security/advisories)
  - **Earlier CVSS 10.0 flaw.** Censys reported an unauthenticated RCE ("Ni8mare", CVE-2026-21858) affecting versions below 1.121.0. This came from a search result; it was not visible on page 1 of n8n's advisory list. — [Censys advisory](https://censys.com/advisory/cve-2026-21858)
  - **Rule for viewers:** keep n8n updated and do not expose localhost:5678 to the internet.
  - **AI nodes** need your own model API key (inference).
- **Difficulty:** 2/5 to start, 3/5 to build real flows (inference).

##### B2. nanobrowser/nanobrowser (TOP 5, #2)
- **URL:** https://github.com/nanobrowser/nanobrowser
- **What it does:** a Chrome/Edge side-panel AI agent. It reads pages, clicks, types, moves between tabs, runs tasks side by side in tab groups and saves results as CSV or Markdown. — [README](https://github.com/nanobrowser/nanobrowser)
- **Problem it solves for this viewer:** copying prices into a table, summarising pages and comparing products, all in plain words, with no install beyond an extension. It suits phone-first users who have a laptop. — [README](https://github.com/nanobrowser/nanobrowser)
- **Stars:** ~14.2k (read 2026-10-30). **Licence:** Apache-2.0. **Archived:** no. **Latest release:** Nanobrowser v0.3.0, 15 Oct 2026 (v0.2.0 on 02 Oct). — [repo](https://github.com/nanobrowser/nanobrowser), [releases](https://github.com/nanobrowser/nanobrowser/releases)
- **Install path:** Chrome Web Store, `chromewebstore.google.com/detail/nanobrowser/imbddededgmcgfhfpcjmijokokekbkal` (Chrome and Edge supported). **Prerequisites:** a key from one model provider (Anthropic, OpenAI, Gemini, OpenRouter, xAI, DeepSeek, Mistral or any OpenAI-compatible endpoint), or local Ollama or LM Studio. Ollama needs `OLLAMA_ORIGINS` set. — [README](https://github.com/nanobrowser/nanobrowser)
- **First use (verbatim bits):** (1) Add the extension, then on the welcome page connect a provider ("You can also do it later in Settings → Providers"). (2) "click the Nanobrowser icon in the toolbar, or press `Alt+Shift+N`" to open the side panel, and choose the model and reasoning effort. (3) Type a task; README examples include "Summarize this page in a few bullet points." and "Compare the three laptops I have open and put the prices and specs in a table." — [README](https://github.com/nanobrowser/nanobrowser)
- **Hook:** free, "No subscription and no hidden costs". In the default Ask mode it waits for your OK before it submits, sends, deletes or uploads anything. — [README](https://github.com/nanobrowser/nanobrowser)
- **Caveats:** you pay your model provider unless you use a local model. A browser agent can act on logged-in sites, so keep Ask mode on (inference from the README's Ask/Auto modes). It is a smaller project (14.2k stars) than the others.
- **Difficulty:** 1/5 (inference).

##### B3. langgenius/dify (TOP 5, #3)
- **URL:** https://github.com/langgenius/dify
- **What it does:** a platform for building LLM apps (chatbots, agents, workflows, knowledge-base Q&A) in a visual editor. You can self-host it or use Dify Cloud. — [README](https://github.com/langgenius/dify)
- **Problem it solves for this viewer:** a small business can make a chatbot that answers from its own price list or FAQ document without writing code. — [README](https://github.com/langgenius/dify), [pricing](https://dify.ai/pricing)
- **Stars:** ~160.0k (read 2026-10-30). **Licence:** no SPDX id. The "Dify Open Source License, based on Apache 2.0 with additional conditions": "you may not use the Dify source code to operate a multi-tenant environment" unless Dify authorises it in writing, and "you may not remove or modify the LOGO or copyright information in the Dify console or applications". **Archived:** no. **Latest release:** v1.18.0, 23 Oct 2026. — [README](https://github.com/langgenius/dify), [LICENSE](https://github.com/langgenius/dify/blob/main/LICENSE), [releases](https://github.com/langgenius/dify/releases)
- **Install:** the easiest path is Dify Cloud's free Sandbox plan: "200 message credits", "5 Apps", "1 Team Member", "50MB Knowledge Data Storage". Paid plans: Professional "$590 per workspace / year", Team "$1590 per workspace / year". Self-host (verbatim): `cd dify`, `cd docker`, `cp .env.example .env`, `docker compose up -d`. **Requirements:** "CPU >= 2 Core", "RAM >= 4 GiB", plus Docker. — [pricing](https://dify.ai/pricing), [README](https://github.com/langgenius/dify)
- **First use:** (1) Sign up for Dify Cloud (Sandbox). (2) Create an app (a chatbot) and add a knowledge base by uploading a document. (3) Chat with it and publish a share link. The steps are inference from the product's described features.
- **Hook:** you can build a chatbot that answers from your own document for free in a browser: 200 free message credits and 5 apps on the Sandbox plan. — [pricing](https://dify.ai/pricing)
- **Caveats:** the licence bars running it as a multi-tenant SaaS and removing the logo. On an 8 GB Windows laptop, the 4 GiB minimum plus Docker Desktop is tight, so recommend the cloud (inference). Model usage beyond the credits needs an API key (inference).
- **Difficulty:** 1/5 on the cloud, 4/5 self-hosted (inference).

##### B4. activepieces/activepieces (TOP 5, #4)
- **URL:** https://github.com/activepieces/activepieces
- **What it does:** an open-source, Zapier-style automation builder with AI agents. It has 200+ "pieces" (integrations), and its description claims "~400 MCP servers for AI agents". — [README](https://github.com/activepieces/activepieces)
- **Problem it solves for this viewer:** a simpler, friendlier n8n alternative with a generous free cloud plan, so no install at all. — [pricing](https://www.activepieces.com/pricing)
- **Stars:** ~25.3k (read 2026-10-30). **Licence:** MIT for the Community Edition, with a Commercial License for `packages/ee`. **Archived:** no. **Latest release:** 0.92.3-hotfix.2 (marked Latest), 28 Oct 2026; several hotfixes followed on 29 Oct. — [README](https://github.com/activepieces/activepieces), [releases](https://github.com/activepieces/activepieces/releases)
- **Install:** cloud Free plan: "Unlimited flows", "1,000 credits a month", "Up to 5 users". The page also says that on Free, runs past the quota stop "until credits refresh the next day" (see the conflict note in Gaps). Paid: Plus $20 a month, Team $200 a month. Self-host (verbatim): `docker run -d --name activepieces -p 8080:80 -v ~/.activepieces:/root/.activepieces -e AP_DB_TYPE=PGLITE -e AP_REDIS_TYPE=MEMORY -e AP_FRONTEND_URL="http://localhost:8080" activepieces/activepieces:latest`, then open `http://localhost:8080`. "The first account you create becomes the administrator." Only Docker is needed, because the database is embedded. — [pricing](https://www.activepieces.com/pricing), [Docker docs](https://www.activepieces.com/docs/install/options/docker)
- **First use:** (1) Sign up on the cloud, or run the docker command. (2) Create a flow, pick a trigger (for example a new Gmail email) and add an AI step. (3) Test the flow. Steps 2–3 are inference.
- **Hook:** every one of its 280+ pieces is also available as an MCP server, so an AI agent such as Claude can use them as tools. — [README](https://github.com/activepieces/activepieces)
- **Caveats:** on the cloud, AI steps use more credits (2 for a fast model, 10 for a smart one, 20 for a frontier one). Self-hosting needs Docker. — [pricing](https://www.activepieces.com/pricing)
- **Difficulty:** 1/5 on the cloud, 3/5 self-hosted (inference).

##### B5. langflow-ai/langflow (TOP 5, #5)
- **URL:** https://github.com/langflow-ai/langflow
- **What it does:** a visual builder for AI agents and RAG flows: drag components and connect models, tools and data. Flows can be served as APIs or MCP servers. — [README](https://github.com/langflow-ai/langflow)
- **Problem it solves for this viewer:** an AI learner can see how an agent is wired (prompt → model → tool → memory) and build one on a canvas, with a Windows desktop app. — [README](https://github.com/langflow-ai/langflow), [Desktop page](https://www.langflow.org/desktop)
- **Stars:** ~156.2k (read 2026-10-30). **Licence:** MIT. **Archived:** no. **Latest release:** v1.13.0, 22 Oct 2026 (v1.12.8 also 22 Oct, v1.12.7 on 21 Oct). — [repo](https://github.com/langflow-ai/langflow), [releases](https://github.com/langflow-ai/langflow/releases)
- **Install (verbatim):** "📥 Download Langflow Desktop" (Windows and macOS). The site gates the download behind a form. Or: `uv pip install langflow -U`, then `uv run langflow run`, which opens http://127.0.0.1:7860. **Requirements:** "Requires Python 3.10–3.14" plus uv. — [README](https://github.com/langflow-ai/langflow), [Desktop page](https://www.langflow.org/desktop)
- **First use:** (1) Install Desktop, or use the uv commands. With official release packages, set `LANGFLOW_SUPERUSER_PASSWORD` before the first start and sign in as `langflow`, because auto-login is now off by default. (2) Open a starter template such as a basic agent. (3) Add a model API key and run it in the Playground. Steps 2–3 are inference. — [README](https://github.com/langflow-ai/langflow)
- **Hook:** it is the tool CISA put on its "Known Exploited Vulnerabilities" list in May 2025 (CVE-2025-3248, an unauthenticated RCE, CVSS 9.8, fixed in 1.3.0). Since then it ships security fixes quickly: v1.12.7 alone lists nine "fix(security)" items. Use it as a safety lesson. — [The Hacker News](https://thehackernews.com/2025/05/critical-langflow-flaw-added-to-cisa.html), [releases](https://github.com/langflow-ai/langflow/releases)
- **Caveats:** never expose it to the internet, and keep it updated (inference from its security history). The Desktop download needs a form with personal data. Models need API keys or a local model.
- **Difficulty:** 2/5 with Desktop, 3/5 with uv (inference).

##### B6. browser-use/browser-use (backup 1)
- **URL:** https://github.com/browser-use/browser-use
- **What it does:** an open-source library and CLI that lets an LLM operate a web browser to finish tasks. — [README](https://github.com/browser-use/browser-use)
- **Problem it solves for this viewer:** scrape, fill forms and research across sites automatically. It is for viewers ready to run a little Python, or to install it as a skill for their coding agent. — [README](https://github.com/browser-use/browser-use)
- **Stars:** ~119.6k (read 2026-10-30). **Licence:** MIT. **Archived:** no. **Latest release:** 0.13.14, 26 Oct 2026. — [repo](https://github.com/browser-use/browser-use), [releases](https://github.com/browser-use/browser-use/releases)
- **Install (verbatim):** library: `uv init --python 3.12` (new project), then `uv add browser-use`, then write `agent.py` and run `uv run agent.py`. CLI or agent route: install browser-use with uv on Python 3.12, then `browser-use skill install`. **Requirements:** Python 3.11+ for the library. — [README](https://github.com/browser-use/browser-use)
- **First use:** (1) Install uv, then run `uv init --python 3.12` and `uv add browser-use`. (2) Put `OPENAI_API_KEY` (or another provider's key) in `.env`. (3) Run the README's `agent.py`; its task is "Find the number of stars of the browser-use repo". — [README](https://github.com/browser-use/browser-use)
- **Hook:** the official demo task is the agent looking up browser-use's own GitHub star count. New cloud sign-ups get $1 of credit. — [README](https://github.com/browser-use/browser-use)
- **Caveats:** it needs coding and an API key. Cloud browsers cost "$0.02 per browser-hour" plus traffic. You can stay free with a local browser and Ollama. — [README](https://github.com/browser-use/browser-use)
- **Difficulty:** 4/5 for non-coders (inference).

##### B7. openclaw/openclaw (backup 2; feature only with a safety segment)
- **URL:** https://github.com/openclaw/openclaw
- **What it does:** a self-hosted personal AI assistant that runs on your computer and talks to you on WhatsApp, Telegram, Discord, Slack, Teams, iMessage and 20+ other channels. It has apps for Windows, macOS, Linux, iOS and Android. — [README](https://github.com/openclaw/openclaw)
- **Problem it solves for this viewer:** you message your own AI agent on WhatsApp or Telegram from your phone, and it does tasks on your PC. — [README](https://github.com/openclaw/openclaw)
- **Stars:** ~393.4k (read 2026-10-30), the highest of anything in these notes. **Licence:** MIT. **Archived:** no. **Latest release:** openclaw 2026.10.9 (Latest), 29 Oct 2026; a beta came on 30 Oct. — [repo](https://github.com/openclaw/openclaw), [releases](https://github.com/openclaw/openclaw/releases)
- **Install (verbatim):** Windows PowerShell: `iwr -useb https://openclaw.ai/install.ps1 | iex`. npm: `npm install -g openclaw@latest --allow-scripts=openclaw` (on npm 11.15 and older, drop the flag), then `openclaw onboard --install-daemon`. Check with `openclaw gateway status` and `openclaw dashboard`. **Requirements:** "Node 24.22.1+ or 26.12.1+; Node 26 recommended" (the installer provisions Node). — [README](https://github.com/openclaw/openclaw)
- **First use:** (1) Run the PowerShell installer. (2) Follow onboarding: pick a model provider and connect Telegram or WhatsApp. (3) Approve your own chat with `openclaw pairing approve <channel> <code>` and send it a message. Step 2 is inference; the pairing command is from the README. — [README](https://github.com/openclaw/openclaw)
- **Hook:** ~393k stars, almost double n8n's ~209k and more than double AutoGPT's ~188k on today's pages. — [openclaw](https://github.com/openclaw/openclaw), [n8n](https://github.com/n8n-io/n8n), [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)
- **Caveats (serious):**
  - The README says tools run on the host for the main session unless you configure sandboxing, and that inbound messages should be treated as untrusted. — [README](https://github.com/openclaw/openclaw)
  - Security researchers found hundreds of malicious "skills" on its ClawHub marketplace in early 2026. OpenSourceMalware counted 386 malicious skills posing as crypto tools for Windows and macOS. OpenClaw then added VirusTotal scanning, which its maintainers called "not a silver bullet". These details come from search results, with the primary articles linked. — [The Hacker News, Feb 2026](https://thehackernews.com/2026/02/openclaw-integrates-virustotal-scanning.html), [OpenSourceMalware](https://opensourcemalware.com/blog/malicious-clawhub-skills-target-openclaw-users)
  - The latest releases (29–30 Oct 2026) again patch credential exposure in logs and vulnerable dependencies. — [releases](https://github.com/openclaw/openclaw/releases)
- **Difficulty:** 3/5 to install; the safety risk is high (inference).

#### Belongs elsewhere (other themes of the series)
- **Offline/local AI on your laptop:** Ollama, LM Studio, Open WebUI, AnythingLLM. Nanobrowser's and browser-use's local-model mode depends on these. (Not researched here.)
- **Student and career learning:** dair-ai/Prompt-Engineering-Guide and teng-lin/notebooklm-py (an unofficial NotebookLM API that "may break"), both listed in the mejba.me roundup. — [mejba.me roundup](https://www.mejba.me/blog/top-github-repos-claude-code-2026)
- **Freelancer and office apps:** kepano/obsidian-skills (Obsidian notes skills), from the same roundup. — [mejba.me roundup](https://www.mejba.me/blog/top-github-repos-claude-code-2026)
- **Privacy and security:** OpenClaw's ClawHub malware story and n8n's or Langflow's CVEs could also feed a "how not to get hacked by your AI agent" episode there.

### Inferences
- For Theme A, the cheapest wins are the plugin-marketplace installs: superpowers, anthropics/skills and ui-ux-pro-max are each one or two `/plugin` lines. `npx` tools (ccusage, Context7 setup, Playwright MCP) come next. Anything needing Python and uv (spec-kit, Serena, SuperClaude) adds a step that non-coders often fail on Windows.
- For Theme B, the same-day result ranking on an 8 GB Windows laptop is: cloud plans (Dify, Activepieces) and the Nanobrowser extension first; `npx n8n` second; Langflow Desktop third; anything Docker-based (Dify or Activepieces self-hosted, AutoGPT, Huginn) last. Docker Desktop on Windows needs WSL 2 and eats RAM (general knowledge, not verified this session).
- The paid-plan requirement for Claude Code should be said on screen in every Theme A video. Without it, viewers on the free claude.ai plan will fail at step 0. The A-list tools that also work with free agents (ccusage reads Gemini CLI usage; spec-kit's README example uses Copilot) can be flagged as "works even without Claude".
- Two episode angles fell out of the research: (1) "n8n + n8n-mcp": Claude builds your n8n workflow; (2) "Flowise is dead, here is what replaced it": the maintainer's own reason was coding agents.
- A video idea with built-in credibility: every star figure in these notes is above 14k, and all top picks shipped a release or commit in Sep–Oct 2026.

### Gaps
- **The exact `specify init --integration` value for Claude Code** was not on the README text I read; only `--integration copilot` was shown. Check `specify init --help` or the spec-kit docs before quoting a Claude command.
- **The uv install command for Windows** was not verified this session. spec-kit, browser-use and Langflow-via-uv all need it. Quote it from docs.astral.sh before filming.
- **Context7 free-tier rate limits:** the README gives no numbers, and paid plans were not checked.
- **Activepieces free plan wording conflicts:** "1,000 credits a month", but runs past the quota stop "until credits refresh the next day". Unclear whether the quota is daily or monthly. — [pricing](https://www.activepieces.com/pricing)
- **Whether consulting or building workflows for paying clients is allowed under n8n's Sustainable Use License** was not settled. The licence text quoted above covers internal business use and free non-commercial distribution only; the n8n docs page for the licence returned 404.
- **CVE-2026-21858 (n8n)** is cited from a Censys advisory via search and was not visible on page 1 of n8n's own advisory list.
- **The OpenClaw malicious-skill counts** (14, 341, 386, 1,103) differ by researcher. Only the THN and OpenSourceMalware articles are cited, and both were reached through search snippets, not full reads.
- **Whether claude-code-router lets Claude Code run with no Anthropic subscription** (only third-party keys) was not confirmed on the page read. It would matter a lot for cost-sensitive Bangladeshi viewers.
- **Langflow Desktop:** the site does not say whether it is free or what the system requirements are.
- **Dify's free sandbox sign-up URL** was not opened; only the pricing page was read.
- **No RAM figures** were found for n8n via npx, Langflow, Nanobrowser or OpenClaw.

## Q2. Which are actively maintained in late 2026 (no archived or abandoned repos)?

### Takeaway
All 14 final picks (A: 5+2, B: 5+2) are un-archived and had a release or commit between Aug 13 and Oct 30, 2026. All but one were in Sep–Oct 2026; ui-ux-pro-max (last release 13 Aug) is the oldest. Two well-known names are dead or moved and must not be featured as live: Flowise (archived Aug 13, 2026, end of life Aug 31) and get-shit-done (archived Jun 26, 2026, moved to open-gsd/gsd-core). SuperClaude is alive but slowing.

### Cited Findings
| Repo | Archived? | Latest release / commit seen 2026-10-30 | Source |
|---|---|---|---|
| obra/superpowers | No | v7.0.1, 21 Oct | [releases](https://github.com/obra/superpowers/releases) |
| anthropics/skills | No | commit Oct 28, 2026 | [commits](https://github.com/anthropics/skills/commits/main) |
| upstash/context7 | No | ctx7@0.8.2, 23 Oct | [releases](https://github.com/upstash/context7/releases) |
| microsoft/playwright-mcp | No | v0.0.83, 28 Sep | [releases](https://github.com/microsoft/playwright-mcp/releases) |
| ccusage/ccusage | No | v20.0.45, 26 Oct | [releases](https://github.com/ccusage/ccusage/releases) |
| github/spec-kit | No | 1.2.5, 28 Oct | [releases](https://github.com/github/spec-kit/releases) |
| nextlevelbuilder/ui-ux-pro-max-skill | No | v2.15.0, 13 Aug | [releases](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases) |
| thedotmack/claude-mem | No | v15.6.0, 29 Oct | [releases](https://github.com/thedotmack/claude-mem/releases) |
| n8n-io/n8n | No | n8n@2.45.7, 30 Oct | [releases](https://github.com/n8n-io/n8n/releases) |
| nanobrowser/nanobrowser | No | v0.3.0, 15 Oct | [releases](https://github.com/nanobrowser/nanobrowser/releases) |
| langgenius/dify | No | v1.18.0, 23 Oct | [releases](https://github.com/langgenius/dify/releases) |
| activepieces/activepieces | No | 0.92.3-hotfix.2, 28 Oct | [releases](https://github.com/activepieces/activepieces/releases) |
| langflow-ai/langflow | No | v1.13.0, 22 Oct | [releases](https://github.com/langflow-ai/langflow/releases) |
| browser-use/browser-use | No | 0.13.14, 26 Oct | [releases](https://github.com/browser-use/browser-use/releases) |
| openclaw/openclaw | No | 2026.10.9, 29 Oct | [releases](https://github.com/openclaw/openclaw/releases) |
| huginn/huginn | No | commits Oct 26, 2026 | [commits](https://github.com/huginn/huginn/commits/master) |
| Significant-Gravitas/AutoGPT | No | Platform v0.10.0, 27 Oct | [releases](https://github.com/Significant-Gravitas/AutoGPT/releases) |
| musistudio/claude-code-router | No | v3.1.3, 09 Oct 2026 | [releases](https://github.com/musistudio/claude-code-router/releases) |
| ChromeDevTools/chrome-devtools-mcp | No | v1.12.0, 2026-10-22 | [releases](https://github.com/ChromeDevTools/chrome-devtools-mcp/releases) |
| czlonkowski/n8n-mcp | No | v2.99.2, 27 Oct | [releases](https://github.com/czlonkowski/n8n-mcp/releases) |
| wshobson/agents | No | commit Oct 17, 2026 | [commits](https://github.com/wshobson/agents/commits/main) |
| SuperClaude-Org/SuperClaude_Framework | No | commit Sep 27, 2026; plugin route "not yet available", v5.0 "No ETA" | [commits](https://github.com/SuperClaude-Org/SuperClaude_Framework/commits/master), [README](https://github.com/SuperClaude-Org/SuperClaude_Framework) |
| **FlowiseAI/Flowise** | **Yes, Aug 13, 2026** | code freeze Jul 29, end of life Aug 31, 2026 | [repo](https://github.com/FlowiseAI/Flowise), [Discussion #6727](https://github.com/FlowiseAI/Flowise/discussions/6727) |
| **gsd-build/get-shit-done** | **Yes, Jun 26, 2026** | "now continues as GSD Core" (open-gsd/gsd-core) | [repo](https://github.com/gsd-build/get-shit-done) |

### Inferences
- Release cadence is very fast across the board: several of these repos shipped several releases in the last 10 days (n8n, Langflow, Activepieces, claude-mem, ccusage, spec-kit). Any install command filmed now could change within weeks, so the description box should link the README rather than freeze a command in the video.
- Flowise's shutdown, with the maintainer blaming coding agents, is a signal for Theme B: pure low-code builders are under pressure. n8n, Dify, Langflow and Activepieces are all adding MCP or agent features to stay relevant. Their READMEs list MCP or agent features ([n8n](https://github.com/n8n-io/n8n), [Activepieces](https://github.com/activepieces/activepieces), [Langflow](https://github.com/langflow-ai/langflow)).

### Gaps
- Commit cadence (beyond the latest release) was not measured for the repos that have frequent releases.
- Flowise Cloud's status after the end of life is not stated in the shutdown post.
- open-gsd/gsd-core (GSD's successor) was not opened.

## Q3. Which install commands are current (verified against the README today)?

### Takeaway
Several commands widely quoted in 2025 roundups have changed. Use the 2026-10-30 versions below, and never copy commands from blog posts.

### Cited Findings
**Changed since common 2025 tutorials:**
- **ccusage:** the repo now lives at **ccusage/ccusage** (the old ryoppippi/ccusage URL leads there). It now covers Codex, Gemini CLI, Copilot CLI, OpenCode, Amp and more. The command is still `npx ccusage@latest`. — [ccusage](https://github.com/ccusage/ccusage)
- **Context7:** the README's first path is now `npx ctx7 setup` (OAuth plus an API key plus a skill), not a bare `claude mcp add` line. It needs Node 22.13+. — [context7](https://github.com/upstash/context7)
- **spec-kit:** the install is `uv tool install specify-cli`, then `specify init my-project --integration copilot`. The README's slash commands are now **hyphenated**: `/speckit-specify`, not `/speckit.specify`. — [spec-kit](https://github.com/github/spec-kit)
- **Superpowers:** now in the official marketplace: `/plugin install superpowers@claude-plugins-official`. — [superpowers](https://github.com/obra/superpowers)
- **ui-ux-pro-max:** the npm package is `ui-ux-pro-max-cli`, and the README says the old `uipro-cli` is stale. — [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- **claude-mem:** `npx claude-mem install`, or the `/plugin` pair. `npm install -g claude-mem` installs only the SDK and does not register the hooks. — [claude-mem](https://github.com/thedotmack/claude-mem)
- **Serena:** the README now shows `uv tool install -p 3.13 serena-agent` instead of a long `claude mcp add … uvx --from git+…` line. — [serena](https://github.com/oraios/serena)
- **Chrome DevTools MCP:** the README gives a plugin route (`/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`, then `/plugin install chrome-devtools-mcp@chrome-devtools-plugins`) plus generic `npx -y chrome-devtools-mcp@latest` config. — [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- **SuperClaude:** `pipx install superclaude`, then `superclaude install`. Its `/plugin` commands are marked "not yet available". — [SuperClaude](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- **ECC (everything-claude-code):** renamed affaan-m/ECC. It installs with `/plugin marketplace add https://github.com/affaan-m/ECC` and `/plugin install ecc@ecc`, or `npx ecc-universal@2.2.3 setup`. — [ECC](https://github.com/affaan-m/everything-claude-code)
- **OpenHands:** the README now launches **Agent Canvas**: `npm install -g @openhands/agent-canvas`, then `agent-canvas` (UI at localhost:8000). The page no longer contains `uv tool install openhands` or `openhands serve`. — [OpenHands](https://github.com/OpenHands/OpenHands)
- **n8n:** the GitHub README now leads with Docker (`curl -fsSL https://get.n8n.io | sh` or `docker run …`). `npx n8n` remains the official no-Docker path in the docs, with Node 20.19–24.x. — [n8n README](https://github.com/n8n-io/n8n), [n8n npm docs](https://docs.n8n.io/hosting/installation/npm/)
- **Langflow:** official release packages now turn auto-login off. Set `LANGFLOW_SUPERUSER_PASSWORD` before the first `uv run langflow run`, or sign-in fails. It needs Python 3.10–3.14. — [langflow](https://github.com/langflow-ai/langflow)
- **browser-use:** the README now offers a CLI/skill path (`browser-use skill install`) alongside `uv add browser-use`. The page does not contain `uvx browser-use install`. — [browser-use](https://github.com/browser-use/browser-use)
- **OpenClaw:** `npm install -g openclaw@latest --allow-scripts=openclaw` needs the flag only on npm 12 or npm 11.16+. Windows users should use `iwr -useb https://openclaw.ai/install.ps1 | iex`. — [openclaw](https://github.com/openclaw/openclaw)
- **Claude Code itself (Windows):** `irm https://claude.ai/install.ps1 | iex` is the recommended native install. The npm package needs Node 22+. — [Claude Code setup docs](https://code.claude.com/docs/en/setup)

**Unchanged and verified today:**
- `claude mcp add playwright npx @playwright/mcp@latest`, Node 18+. — [playwright-mcp](https://github.com/microsoft/playwright-mcp)
- `/plugin marketplace add anthropics/skills`, then `/plugin install document-skills@anthropic-agent-skills`. — [anthropics/skills](https://github.com/anthropics/skills)
- Dify: `cd dify`, `cd docker`, `cp .env.example .env`, `docker compose up -d`. — [dify](https://github.com/langgenius/dify)
- Activepieces single-container `docker run … AP_DB_TYPE=PGLITE …` to localhost:8080. — [Activepieces docs](https://www.activepieces.com/docs/install/options/docker)
- Huginn: `docker run -it -p 3000:3000 ghcr.io/huginn/huginn`. User `admin`; the Docker password is printed once in the container log. — [huginn](https://github.com/huginn/huginn)
- Nanobrowser: Chrome Web Store listing `imbddededgmcgfhfpcjmijokokekbkal`. Open the panel with `Alt+Shift+N`. — [nanobrowser](https://github.com/nanobrowser/nanobrowser)

### Inferences
- Commands drift monthly (ccusage's owner move, spec-kit's hyphen syntax, OpenHands' relaunch as Agent Canvas, Context7's ctx7 CLI). Each Reel should show the command on screen only as "from the README, 30 Oct 2026" and point to the repo link in the caption or comment.
- The safest commands to film for Windows non-coders are the ones with no extra runtime: Claude Code `/plugin` lines (superpowers, skills, ui-ux-pro-max), `npx` one-liners (ccusage, Playwright MCP, n8n), and the Nanobrowser Web Store link.

### Gaps
- None of the commands above were run on a Windows machine in this research. They were read from the READMEs and docs only. Before filming, run each one on the target laptop.
- The `npx ctx7 setup --claude` combination is assembled from the README's statement that `--claude` targets Claude. It is not a single quoted line.
