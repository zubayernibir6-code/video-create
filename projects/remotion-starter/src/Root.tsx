import "./index.css";
import React from "react";
import { Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { ClaudeEnterpriseAd } from "./ClaudeEnterpriseAd";
import { MyComposition } from "./Composition";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const FALLBACK_FRAMES = 46 * 60; // 2760 — brief default only
/** ffprobe-verified 2026-10-20: public/voiceover.wav */
const VOICEOVER_SECONDS_PROBE = 88.36;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClaudeAd"
        component={ClaudeEnterpriseAd}
        durationInFrames={Math.ceil(VOICEOVER_SECONDS_PROBE * FPS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        calculateMetadata={async () => {
          try {
            const seconds = await getAudioDurationInSeconds(
              staticFile("voiceover.wav"),
            );
            return {
              durationInFrames: Math.max(1, Math.ceil(seconds * FPS)),
            };
          } catch {
            try {
              return {
                durationInFrames: Math.max(
                  1,
                  Math.ceil(VOICEOVER_SECONDS_PROBE * FPS),
                ),
              };
            } catch {
              return { durationInFrames: FALLBACK_FRAMES };
            }
          }
        }}
      />
      <MyComposition />
    </>
  );
};
