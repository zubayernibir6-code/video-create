// series-lines.mjs — the spoken lines of one series episode in voice order, shared by series.mjs (it aligns them to
// the voice) and voice-script.mjs (it writes them as the TTS script), so the script and the captions never drift apart.
// Order: hook · promise (what this video is for, optional) · per tool: intro · body · how (how to use it, optional) · cta.
export function seriesLines(R) {
  const lines = [], kind = [], tool = [];
  const add = (text, k, t) => { lines.push(text); kind.push(k); tool.push(t); return lines.length - 1; };
  const L = { hook: add(R.hook.line, "hook", -1) };
  if (R.promise?.line) L.promise = add(R.promise.line, "promise", -1);
  L.tools = (R.tools ?? []).map((t, k) => ({ intro: add(t.intro, "intro", k), body: add(t.body, "body", k), ...(t.how?.line ? { how: add(t.how.line, "how", k) } : {}) }));
  L.cta = add(R.cta.line, "cta", -1);
  return { lines, kind, tool, L };
}
