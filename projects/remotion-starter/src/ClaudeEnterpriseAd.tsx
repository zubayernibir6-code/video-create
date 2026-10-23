import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ClaudeBrandBadge } from "./claude/ClaudeBrandBadge";
import { ensureClaudeFonts } from "./claude/loadClaudeFonts";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from "./claude/scenes";
import { Stage } from "./claude/Stage";
import { sceneRanges } from "./claude/theme";
import { VoiceLock } from "./claude/VoiceLock";
import { voiceWords, wordIndexAt } from "./claude/voiceWords";

const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export const ClaudeEnterpriseAd: React.FC = () => {
  ensureClaudeFonts();
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const time = frame / fps;
  const progress = frame / Math.max(1, durationInFrames - 1);
  const active =
    sceneRanges.find((s) => progress >= s.start && progress < s.end) ?? sceneRanges[5];
  const idx = wordIndexAt(time);
  const word = idx >= 0 ? voiceWords[idx].text : "";

  const segments = sceneRanges.map((range) => {
    const from = Math.round(range.start * durationInFrames);
    const to = range.id === 6 ? durationInFrames : Math.round(range.end * durationInFrames);
    return { ...range, from, duration: Math.max(1, to - from) };
  });
  const here = segments.find((s) => s.id === active.id) ?? segments[0];
  const local = frame - here.from;
  const flash = interpolate(local, [0, 8], [0.72, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#0B0B0A", overflow: "hidden" }}>
      <Stage scene={active.id} />

      <div style={{ position: "absolute", top: 28, left: 28, zIndex: 40 }}>
        <ClaudeBrandBadge />
      </div>

      <div
        style={{
          position: "absolute",
          right: 16,
          top: 180,
          bottom: 340,
          width: 8,
          borderRadius: 99,
          background: "rgba(250,249,245,0.08)",
          zIndex: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${Math.min(100, progress * 100)}%`,
            borderRadius: 99,
            background: "#D97757",
            boxShadow: "0 0 12px #D97757",
          }}
        />
      </div>

      {segments.map((seg) => {
        const Comp = scenes[seg.id - 1];
        return (
          <Sequence key={seg.id} from={seg.from} durationInFrames={seg.duration} name={`Scene ${seg.id}`}>
            <Comp word={word} />
          </Sequence>
        );
      })}

      <AbsoluteFill
        style={{
          background: active.id === 1 ? "rgba(239,68,68,0.45)" : "rgba(217,119,87,0.5)",
          opacity: flash,
          pointerEvents: "none",
          zIndex: 25,
        }}
      />

      <VoiceLock />

      <Audio
        src={staticFile("voiceover.wav")}
        volume={(f) =>
          interpolate(f, [0, 8, durationInFrames - 12, durationInFrames - 1], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <Audio
        src={staticFile("bgm.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, Math.round(fps * 0.6), durationInFrames - Math.round(fps * 1.2), durationInFrames - 1],
            [0, 0.04, 0.04, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
