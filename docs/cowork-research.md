# Video Create in Cowork: research (2026-11-04)

Question from Talha: run the whole Video Create capability (HyperFrames, every tool, renders) inside Claude Cowork,
web-based, without depending on this laptop. Below: what the official pages say, what that means for each part of the
pipeline, and the test that settles the unknowns. Nothing here has been run in Cowork yet.

## 1. Facts from official pages

| Fact | Quote / source |
| --- | --- |
| Cowork now runs in the cloud | "Cowork sessions run in the cloud by default" ([architecture](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview)); "On October 6, 2026, new Cowork tasks on Pro, Max, and Ultra plans run in the cloud" ([web, desktop, mobile](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile)) |
| No local option on Pro/Max | "There's no setting to choose where a task runs on Pro, Max, and Ultra plans." (same page) |
| Shell commands run there | "Runs code and shell commands in an isolated environment on Anthropic's servers." ([get started](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)) |
| Sandbox per session | "Each session gets its own sandbox, created when the session starts and destroyed when it ends" (architecture). Installed software is probably gone next session: install it in every session (a setup script). |
| His PC folder is reachable | "A cloud session can read and write files in folders you've connected on your computer only while the desktop app is open on that computer and the session was started on desktop or is a scheduled task." Claude "fetches a copy of just that file." (web, desktop, mobile) |
| Any folder can be attached | "Users can attach any folder they have OS-level access to." ([local access](https://claude.com/docs/third-party/claude-desktop/local-access)). Removable drives are not mounted. |
| Network | Cloud sessions use "the same network-access setting that governs local Cowork and chat" (architecture). Individual plans: "Network access is enabled, allowing Claude to install packages from approved sources." ([files article](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)) |
| Approved domains | github.com · registry.npmjs.org, npmjs.com · pypi.org, files.pythonhosted.org · crates.io · archive.ubuntu.com, security.ubuntu.com · yarnpkg.com · api.anthropic.com (files article). Not listed: huggingface.co, storage.googleapis.com, generativelanguage.googleapis.com, nodejs.org. |
| Changing egress | The four modes (off / package managers / + domains / all) are described for Team and Enterprise owners. For Pro/Max it is a toggle in Settings > Capabilities; whether a domain can be added is not stated. |
| Results out | "Delivers finished outputs to your session, where you can preview and download them." (get started). The 30 MB per-file limit is stated for chat file creation; a Cowork limit is not stated. |
| Skills and plugins | Custom skills: a ZIP of the skill folder, Customize > Skills > Upload ([skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude), [custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)). Plugins: `.claude-plugin/plugin.json` with `name`, skills in `skills/<name>/SKILL.md`, no `bin/` folder ([plugins reference](https://code.claude.com/docs/en/plugins-reference), [plugins in Cowork](https://support.claude.com/en/articles/13837440-use-plugins-in-cowork)). Cowork "doesn't read the Claude Code CLI's ~/.claude directory" ([Cowork overview](https://claude.com/docs/cowork/overview.md)). |
| HyperFrames needs | "Node.js 22+, FFmpeg" ([README](https://github.com/heygen-com/hyperframes)); the engine "launches and pools headless Chrome instances (`chrome-headless-shell`)" ([engine](https://github.com/heygen-com/hyperframes/blob/main/packages/engine)). The CLI reads `HYPERFRAMES_BROWSER_PATH` for a Chrome binary (found in the 0.8.134 CLI on this PC). Its own download uses googlechromelabs.github.io (Chrome for Testing), which is NOT on the approved list. |
| HeyGen's hosted HyperFrames (claude.ai connector) | `compose` "does not edit the user's own footage: it cannot trim, cut or transcribe a linked video" and "Audio files linked in the prompt are not used"; `render_video` "is a paid action". So it cannot make his client promo from his clips + voice + BGM. |

## 2. What this means for each part

| Part | In Cowork cloud | Plan |
| --- | --- | --- |
| Node 22, npm packages, GSAP, HyperFrames CLI | likely (npm is approved) | `npm i hyperframes`; if Node < 22: `npm i -g node@22` (binary comes from the npm registry) |
| FFmpeg + FFprobe | likely | `apt-get install ffmpeg` (Ubuntu archive is approved); else PyPI `imageio-ffmpeg` + npm `@ffprobe-installer/ffprobe` |
| Chrome for rendering | **unknown** (its normal download host is not approved) | try `npx hyperframes browser ensure`; else npm `@sparticuz/chromium` (the binary ships inside the npm package) and set `HYPERFRAMES_BROWSER_PATH` |
| Fonts, SFX, icons, skills, PLAN template | yes | read from the connected `D:\Video Create` folder |
| His voice-over + BGM files | yes | he provides them (his decision, 2026-11-04) |
| His cloned voice (Gemini TTS) | **probably blocked** (generativelanguage.googleapis.com not approved) | he brings the voice file; test the domain anyway |
| Bengali transcriber (2.4 GB model) | **probably blocked** (huggingface.co not approved, too big) | the voice script text + real pauses from FFmpeg `silencedetect` give phrase and list-word times; test HF anyway |
| Our workspace tools (`tools/*.mjs`) | partly: about 12 files hard-code Windows paths | make them OS-aware once, proven on Windows (step 2) |
| Long renders | **unknown** (CPU, RAM, time not published) | the test measures one; a 40 s promo is ~1,000 frames |
| Getting the MP4 out | likely: written back into the connected folder, or downloaded from the session | the test writes into `D:\Video Create\cowork-test\` |

## 3. The order

1. **Smoke test in Cowork** (`transfer-kit/cowork/SMOKE-TEST.md`, ~10–20 min, nothing on his PC changes except a new
   `cowork-test` folder): machine size, which domains answer, install Node/FFmpeg/HyperFrames/Chrome, render a 5 s
   Bengali clip, burn a Bengali .ass line, loudness, write the MP4 back. Its report says exactly which fallbacks were
   needed.
2. **Workspace becomes Cowork-ready** (on this PC, proven on Windows): OS-aware paths for the ~12 tools, a Linux
   `tools/cowork/setup.sh` built from the test's working commands, a short `COWORK.md` entry file, and the workspace
   skills zipped for Customize > Skills.
3. **First real job in Cowork:** the client promo (CP1) from his clips + voice + BGM, both formats, all checks.
