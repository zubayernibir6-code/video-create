export const ClaudeColors = {
  bgTop: "#141413",
  bgBottom: "#0B0B0A",
  coral: "#D97757",
  emerald: "#10B981",
  alabaster: "#FAF9F5",
  danger: "#EF4444",
  muted: "rgba(250, 249, 245, 0.62)",
  glass: "rgba(250, 249, 245, 0.06)",
  glassBorder: "rgba(250, 249, 245, 0.14)",
} as const;

/** Cuts follow the spoken voiceover (measured 2026-10-20), not equal slices. */
export const sceneRanges = [
  { id: 1, start: 0, end: 0.216 },
  { id: 2, start: 0.216, end: 0.375 },
  { id: 3, start: 0.375, end: 0.556 },
  { id: 4, start: 0.556, end: 0.786 },
  { id: 5, start: 0.786, end: 0.907 },
  { id: 6, start: 0.907, end: 1 },
] as const;

export const sceneSubtitles: Record<number, string> = {
  1: "প্রজেক্টের মাঝখানে বারবার Claude-এর Usage Limit শেষ?",
  2: "সরাসরি আপনার ইমেইলে অফিশিয়াল Claude Enterprise — বিকাশ ও নগদে!",
  3: "Claude Core Enterprise — বেশি Usage, প্রাইভেট Workspace",
  4: "Claude 5X Max — Claude Code ও ফ্ল্যাগশিপ মডেল",
  5: "ফ্রি বোনাস: Playbook, ২ ঘণ্টার গ্যারান্টি, B2B Invoice",
  6: "কমেন্ট করুন 'CLAUDE' অথবা সরাসরি ইনবক্স করুন",
};
