import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ClaudeColors } from "./theme";

const CODE = [
  "export async function ship() {",
  "  await fixMemoryLeaks();",
  "  return claude.agent({ x: 5 });",
  "}",
];

const Tick: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <circle cx="9" cy="9" r="8" fill={ClaudeColors.emerald} />
    <path d="M5 9.2 L7.6 12 L13 6.2" fill="none" stroke="#052e1a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ClaudeChatAndArtifactMockup: React.FC<{ hot?: boolean }> = ({ hot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const y = interpolate(enter, [0, 1], [70, 0]);
  const spin = interpolate(frame, [0, 50], [0, 360], { extrapolateRight: "extend" });
  const full = CODE.join("\n");
  const typed = Math.floor(
    interpolate(frame, [12, 70], [0, full.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const ready = frame > 78;
  const bob = Math.sin(frame / 14) * 4;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 28,
        overflow: "hidden",
        background: "linear-gradient(165deg, #221F1D 0%, #0E0E0D 100%)",
        border: `2px solid ${hot || ready ? ClaudeColors.coral : ClaudeColors.glassBorder}`,
        boxShadow: hot
          ? `0 0 48px ${ClaudeColors.coral}88`
          : "0 24px 60px rgba(0,0,0,0.45)",
        transform: `translateY(${y + bob}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
        opacity: enter,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
          borderBottom: `1px solid ${ClaudeColors.glassBorder}`,
          fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
          fontSize: 22,
          fontWeight: 700,
          color: ClaudeColors.alabaster,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 99,
            background: ClaudeColors.coral,
            boxShadow: `0 0 12px ${ClaudeColors.coral}`,
          }}
        />
        Claude 5X Max • Private Workspace
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "96%",
            background: "rgba(250,249,245,0.08)",
            color: ClaudeColors.alabaster,
            fontFamily: '"Hind Siliguri", sans-serif',
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.3,
            letterSpacing: 0,
            padding: "14px 16px",
            borderRadius: "18px 18px 18px 6px",
          }}
        >
          Refactor full-stack architecture & fix memory leaks
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: ClaudeColors.coral,
            fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span style={{ display: "inline-block", transform: `rotate(${spin}deg)`, fontSize: 28 }}>✻</span>
          Claude is thinking deeply...
        </div>
        <div
          style={{
            borderRadius: 16,
            background: "#090908",
            border: `1.5px solid ${ready ? ClaudeColors.emerald : ClaudeColors.glassBorder}`,
            padding: "14px 14px 16px",
            boxShadow: ready ? `0 0 24px ${ClaudeColors.emerald}44` : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
              fontSize: 18,
              fontWeight: 700,
              color: ready ? ClaudeColors.emerald : ClaudeColors.muted,
            }}
          >
            {ready ? <Tick /> : null}
            {ready ? "Claude Code Artifact Ready" : "Compiling Claude Code…"}
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 20,
              lineHeight: 1.45,
              color: "#D5F5E3",
              whiteSpace: "pre-wrap",
            }}
          >
            {full.slice(0, typed)}
            <span style={{ opacity: frame % 16 < 8 ? 1 : 0.15, color: ClaudeColors.coral }}>|</span>
          </pre>
        </div>
      </div>
    </div>
  );
};
