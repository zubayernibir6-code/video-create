import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ClaudeColors } from "./theme";
import { lineAt, wordIndexAt, voiceWords } from "./voiceWords";

export const VoiceLock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const line = lineAt(time);
  const activeId = (() => {
    const idx = wordIndexAt(time);
    return idx >= 0 ? voiceWords[idx].id : "";
  })();

  if (!line) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        right: 48,
        bottom: 36,
        zIndex: 30,
        padding: "22px 22px 24px",
        borderRadius: 28,
        background: "rgba(8,8,7,0.94)",
        border: "2px solid rgba(250,249,245,0.16)",
        boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px 8px",
          minHeight: 92,
          letterSpacing: 0,
        }}
      >
        {line.words.map((w) => {
          const active = w.id === activeId;
          return (
            <span
              key={w.id}
              style={{
                fontFamily: '"Hind Siliguri", sans-serif',
                fontWeight: 700,
                letterSpacing: 0,
                fontSize: 48,
                lineHeight: 1.15,
                color: active ? "#1A0E0A" : ClaudeColors.alabaster,
                background: active ? ClaudeColors.coral : "transparent",
                borderRadius: 12,
                padding: active ? "2px 12px" : "2px 4px",
                boxShadow: active ? `0 0 22px ${ClaudeColors.coral}` : "none",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
