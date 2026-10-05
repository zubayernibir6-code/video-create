import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={TitleCard}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title rises and settles with a spring — no bounce overshoot.
  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const titleY = interpolate(titleIn, [0, 1], [60, 0]);

  // Subtitle follows 12 frames later.
  const subIn = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  // Accent rule wipes out from the centre.
  const ruleW = interpolate(spring({ frame: frame - 20, fps, durationInFrames: 35 }), [0, 1], [0, 420]);

  // Slow push-in on the whole frame for life.
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  // Gentle fade at the tail so it cuts cleanly.
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0b1020 0%, #131a33 55%, #1d2550 100%)",
        opacity: fadeOut,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Segoe UI, Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleIn,
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: -4,
            color: "#ffffff",
          }}
        >
          Video Create
        </div>

        <div
          style={{
            width: ruleW,
            height: 6,
            borderRadius: 3,
            marginTop: 28,
            background: "linear-gradient(90deg, #38bdf8, #818cf8, #f472b6)",
          }}
        />

        <div
          style={{
            opacity: subIn,
            marginTop: 28,
            fontSize: 38,
            fontWeight: 500,
            letterSpacing: 2,
            color: "#9fb0d8",
          }}
        >
          Remotion 4 · 1920×1080 · 30fps
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
