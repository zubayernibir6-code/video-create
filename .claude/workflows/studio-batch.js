export const meta = {
  name: 'studio-batch',
  description: 'Build several Motion Studio pieces at once: builder, then an independent critic, then a fix pass (no rendering)',
  whenToUse: 'Two or more Motion Studio pieces whose projects/<p>/BRIEF.md already exist (tools/studio/new-piece.mjs + a brief). args: {projects: ["pf-…", …], critique: true}. Afterwards render serially with node tools/studio/render-queue.mjs <projects…> and look at the contact sheets.',
  phases: [
    { title: 'Build', detail: 'one studio-builder per piece, following docs/studio/AGENT-BRIEF.md' },
    { title: 'Critique', detail: 'a fresh studio-critic per piece checks docs/studio/QUALITY.md on its own snapshots' },
    { title: 'Fix', detail: 'a builder applies the critic defects and re-checks' },
  ],
}

// Motion Studio batch (2026-11-07). Pieces run in parallel; heavy Chrome work queues through tools/studio/slot.mjs,
// so the laptop never holds more than 2 headless Chromes. Rendering is NOT done here (one render at a time:
// tools/studio/render-queue.mjs). Each piece: build → critique → (fix if needed). No barrier between pieces.

const REPORT = {
  type: 'object',
  properties: {
    project: { type: 'string' },
    ok: { type: 'boolean' },
    duration: { type: 'number' },
    beats: { type: 'array', items: { type: 'string' } },
    check: { type: 'string' },
    inspected: { type: 'array', items: { type: 'number' } },
    doubts: { type: 'array', items: { type: 'string' } },
    kitBugs: { type: 'array', items: { type: 'string' } },
  },
  required: ['project', 'ok', 'check'],
}
const VERDICT = {
  type: 'object',
  properties: {
    project: { type: 'string' },
    verdict: { type: 'string', enum: ['ship', 'fix'] },
    defects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time: { type: 'number' },
          issue: { type: 'string' },
          fix: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['issue', 'fix'],
      },
    },
  },
  required: ['project', 'verdict', 'defects'],
}

// Custom agent types (.claude/agents/studio-*.md) register only when a session starts; in the session that created
// them (or a client without them) agent() throws "agent type not found". Fall back to the default subagent and let
// it read the same role file, so the workflow runs anywhere. (Found on its first run, 2026-11-07.)
const ROLE = { 'studio-builder': '.claude/agents/studio-builder.md', 'studio-critic': '.claude/agents/studio-critic.md' }
async function run(prompt, opts) {
  try {
    return await agent(prompt, opts)
  } catch (e) {
    if (!opts.agentType || !/not found/i.test(String(e && e.message))) throw e
    const { agentType, ...rest } = opts
    return await agent(`First read ${ROLE[agentType]} and act exactly as that agent (role, rules, limits). ${prompt}`, rest)
  }
}

const projects = (args && args.projects) || []
const critique = !(args && args.critique === false)
if (!projects.length) {
  log('Nothing to do: pass args {projects: ["pf-…", …]}')
  return []
}
log(`${projects.length} piece(s); critique ${critique ? 'on' : 'off'}`)

const results = await pipeline(
  projects,
  (p) =>
    run(
      `Build the Motion Studio piece projects/${p} from its BRIEF.md, following docs/studio/AGENT-BRIEF.md exactly ` +
        `(read it first), with projects/pf-pl1-lumen as the craft reference and docs/studio/QUALITY.md as the bar. ` +
        `If the piece is already built, review it against QUALITY.md and improve it. Finish only when ` +
        `node tools/studio/check.mjs projects/${p} passes and you have looked at every held moment. Do not render or commit.`,
      { label: `build:${p}`, phase: 'Build', schema: REPORT, agentType: 'studio-builder' },
    ),
  (rep, p) =>
    critique
      ? run(
          `Review projects/${p} as the studio's creative director, following your instructions and docs/studio/QUALITY.md. ` +
            `The builder reported: ${JSON.stringify(rep || {}).slice(0, 1500)}`,
          { label: `critic:${p}`, phase: 'Critique', schema: VERDICT, agentType: 'studio-critic' },
        ).then((v) => ({ project: p, report: rep, verdict: v }))
      : { project: p, report: rep, verdict: null },
  (x, p) => {
    const defects = (x && x.verdict && x.verdict.verdict === 'fix' && x.verdict.defects) || []
    if (!defects.length) return x
    return run(
      `Fix these review findings in projects/${p} (each has a time and a concrete fix): ${JSON.stringify(defects)}. ` +
        `Follow docs/studio/AGENT-BRIEF.md. Re-run node tools/studio/check.mjs projects/${p} with snapshots at the ` +
        `listed times and look at them. Do not render or commit.`,
      { label: `fix:${p}`, phase: 'Fix', schema: REPORT, agentType: 'studio-builder' },
    ).then((rep2) => ({ ...x, report: rep2 || x.report, fixed: defects.length }))
  },
)

const done = results.filter(Boolean)
log(`${done.length}/${projects.length} pieces returned; render them with tools/studio/render-queue.mjs`)
return done
