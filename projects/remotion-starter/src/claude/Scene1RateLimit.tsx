import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AlertTriangle, Ban, CreditCard } from "lucide-react";
import { ClaudeColors } from "./theme";

export const Scene1RateLimit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const bannerPulse = 0.55 + 0.45 * Math.sin(frame / 8);
  const headlineIn = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const badgeA = spring({ frame: frame - 18, fps, config: { damping: 14 } });
  const badgeB = spring({ frame: frame - 26, fps, config: { damping: 14 } });

  const words = "প্রজেক্টের মাঝখানে বারবার Claude-এর Usage Limit শেষ?".split(" ");

  return (
    <AbsoluteFill
      style={{
        padding: "140px 56px 280px",
        justifyContent: "flex-start",
        gap: 36,
      }}
    >
      <div
        style={{
          opacity: headlineIn,
          transform: `translateY(${interpolate(headlineIn, [0, 1], [36, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 14px",
            fontFamily: '"Hind Siliguri", sans-serif',
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.25,
            color: ClaudeColors.alabaster,
            letterSpacing: 0,
          }}
        >
          {words.map((word, i) => {
            const w = spring({
              frame: frame - 12 - i * 3,
              fps,
              config: { damping: 16, stiffness: 140 },
            });
            return (
              <span
                key={`${word}-${i}`}
                style={{
                  opacity: w,
                  transform: `translateY(${interpolate(w, [0, 1], [28, 0])}px)`,
                  color: word.includes("Claude") || word.includes("Usage") || word.includes("Limit")
                    ? ClaudeColors.coral
                    : ClaudeColors.alabaster,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <div
        style={{
          borderRadius: 28,
          background: "linear-gradient(165deg, #1C1B1A, #10100F)",
          border: `1px solid ${ClaudeColors.glassBorder}`,
          boxShadow: "0 28px 70px rgba(0,0,0,0.5)",
          overflow: "hidden",
          opacity: cardIn,
          transform: `translateY(${interpolate(cardIn, [0, 1], [50, 0])}px) scale(${interpolate(cardIn, [0, 1], [0.96, 1])})`,
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1px solid ${ClaudeColors.glassBorder}`,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 18,
            color: ClaudeColors.alabaster,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: ClaudeColors.coral }}>✻</span>
          Claude • chat.claude.ai
        </div>

        <div
          style={{
            margin: 18,
            borderRadius: 16,
            padding: "18px 20px",
            background: `rgba(239, 68, 68, ${0.16 + bannerPulse * 0.12})`,
            border: `1.5px solid rgba(239, 68, 68, ${0.55 + bannerPulse * 0.35})`,
            boxShadow: `0 0 ${20 + bannerPulse * 24}px rgba(239, 68, 68, 0.35)`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: '"Hind Siliguri", sans-serif',
            fontSize: 28,
            fontWeight: 700,
            color: "#FECACA",
          }}
        >
          <AlertTriangle size={32} color="#FCA5A5" />
          <span>Claude Usage Limit Reached • Come back later</span>
        </div>

        <div style={{ padding: "8px 22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "80%",
              background: "rgba(217, 119, 87, 0.18)",
              border: `1px solid ${ClaudeColors.coral}55`,
              color: ClaudeColors.alabaster,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 18,
              padding: "14px 16px",
              borderRadius: "16px 16px 4px 16px",
            }}
          >
            Continue the refactor… please?
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              background: "rgba(250,249,245,0.06)",
              border: `1px solid ${ClaudeColors.glassBorder}`,
              color: ClaudeColors.muted,
              fontFamily: '"Hind Siliguri", sans-serif',
              fontSize: 22,
              padding: "14px 16px",
              borderRadius: "16px 16px 16px 4px",
            }}
          >
            You&apos;ve hit your usage limit for this period.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            opacity: badgeA,
            transform: `scale(${interpolate(badgeA, [0, 1], [0.85, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.45)",
            color: "#FECACA",
            fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
            fontSize: 22,
            fontWeight: 700,
            textDecoration: "line-through",
            textDecorationThickness: 3,
          }}
        >
          <CreditCard size={26} />
          ❌ Card Declined
        </div>
        <div
          style={{
            opacity: badgeB,
            transform: `scale(${interpolate(badgeB, [0, 1], [0.85, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.45)",
            color: "#FECACA",
            fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
            fontSize: 22,
            fontWeight: 700,
            textDecoration: "line-through",
            textDecorationThickness: 3,
          }}
        >
          <Ban size={26} />
          ❌ Shared Cookie Ban Risk
        </div>
      </div>
    </AbsoluteFill>
  );
};
