import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ClaudeColors } from "./theme";

export const Stage: React.FC<{ scene: number }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const wash =
    scene === 1 ? "rgba(239,68,68,0.16)" : scene === 4 ? "rgba(217,119,87,0.22)" : "rgba(217,119,87,0.1)";
  const drift = frame * 1.6;

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(168deg, ${ClaudeColors.bgTop} 0%, ${ClaudeColors.bgBottom} 78%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${18 + Math.sin(frame / 70) * 8}% ${12 + Math.cos(frame / 80) * 6}%, ${wash} 0%, transparent 42%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${78 + Math.cos(frame / 60) * 6}% ${48 + Math.sin(frame / 90) * 8}%, rgba(16,185,129,0.12) 0%, transparent 36%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,249,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(250,249,245,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `0px ${drift}px`,
          opacity: 0.45,
          maskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 78%, transparent)",
        }}
      />
      {Array.from({ length: 10 }, (_, i) => {
        const y = ((i * 190 + frame * (1.2 + (i % 3) * 0.35)) % 2100) - 80;
        const x = 40 + ((i * 97) % 980);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: i % 2 === 0 ? 8 : 5,
              height: i % 2 === 0 ? 8 : 5,
              borderRadius: 99,
              background: i % 3 === 0 ? ClaudeColors.coral : ClaudeColors.alabaster,
              opacity: 0.35,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const KineticWords: React.FC<{
  text: string;
  size?: number;
  delay?: number;
  accent?: string[];
  align?: "left" | "center";
}> = ({ text, size = 76, delay = 0, accent = [], align = "left" }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: "6px 14px",
        letterSpacing: 0,
      }}
    >
      {words.map((word, i) => {
        const age = frame - delay - i * 2;
        const p = Math.max(0, Math.min(1, age / 10));
        const eased = 1 - Math.pow(1 - p, 3);
        const hot = accent.some((a) => word.toLowerCase().includes(a.toLowerCase()));
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              fontFamily: '"Hind Siliguri", sans-serif',
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.08,
              letterSpacing: 0,
              color: hot ? ClaudeColors.coral : ClaudeColors.alabaster,
              opacity: eased,
              transform: `translateY(${(1 - eased) * 46}px) scale(${0.9 + eased * 0.1})`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
