import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ClaudeColors } from "./theme";

const Starburst: React.FC<{ size: number; spin: number }> = ({ size, spin }) => {
  const points = 12;
  const outer = size / 2;
  const inner = outer * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const d =
    Array.from({ length: points * 2 }, (_, i) => {
      const angle = (Math.PI * i) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ") + " Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        transform: `rotate(${spin}deg)`,
        filter: `drop-shadow(0 0 12px ${ClaudeColors.coral})`,
        flexShrink: 0,
      }}
    >
      <path d={d} fill={ClaudeColors.coral} />
    </svg>
  );
};

export const ClaudeBrandBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = interpolate(frame, [0, 240], [0, 360], { extrapolateRight: "extend" });
  const glow = 0.45 + Math.sin(frame / 10) * 0.25;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 22px 12px 14px",
        borderRadius: 999,
        background: "rgba(11, 11, 10, 0.88)",
        border: `1.5px solid rgba(217, 119, 87, ${0.35 + glow * 0.4})`,
        boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 ${18 + glow * 16}px ${ClaudeColors.coral}55`,
      }}
    >
      <Starburst size={52} spin={spin} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: 42,
            color: ClaudeColors.alabaster,
            lineHeight: 0.95,
          }}
        >
          Claude
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
            fontSize: 15,
            fontWeight: 700,
            color: "#1A0E0A",
            background: ClaudeColors.coral,
            padding: "4px 10px",
            borderRadius: 999,
            boxShadow: `0 0 ${16 + glow * 10}px ${ClaudeColors.coral}`,
          }}
        >
          ENTERPRISE WORKSPACE
        </div>
      </div>
    </div>
  );
};
