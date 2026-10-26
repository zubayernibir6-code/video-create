// The single timing source for the ad. All times are seconds on the finished video
// (= original recording time − 1.5 s up to the hover; the hover is held 25 frames longer so the click lands
// just after the voice says "decision?"). Measured on 2026-10-25 from Video.mp4 and VoiceOverCLaude.wav.

export const FPS = 30;
export const CLICK = 2386 / FPS; // 79.533: the submit click (orig 80.617); last camera frame is orig 4835 @60 fps
export const TOTAL = 90; // the voice file is 90.04 s; its last word ends at 89.14
export const CAM_HOLD = 0.5; // the clip holds its last frame this long past the click (under the flash)

// the 24 keystrokes of "So what's your Decision?" (caret tracking, orig − 1.5)
export const KEYS = [67.62, 67.7, 68.917, 69.1, 69.25, 69.383, 69.667, 70.433, 70.6, 70.683, 71.017, 71.167,
  71.267, 71.4, 71.7, 73.033, 73.25, 73.867, 74.0, 74.083, 74.233, 74.3, 74.517, 74.9];

export const T = {
  // mouse clicks, 1 frame before the UI reacts (scene-change detection on the edit clip)
  clicks: [3.2, 6.44, 7.24, 10.84, 16.94, 19.24, 20.5, 22.74, 38.04, 40.27, 41.14, 42.74, 45.54, 54.54, 57.57, 62.24, 63.67],
  // [time, file, volume] — one whoosh per camera move
  whooshes: [[0.2, "whoosh-short", 0.4], [12.6, "whoosh-short", 0.36], [16.95, "whoosh-short", 0.36],
    [20.6, "whoosh-short", 0.34], [22.95, "whoosh-short", 0.36], [42.85, "whoosh", 0.45], [45.65, "whoosh-short", 0.34],
    [53.0, "whoosh-short", 0.34], [56.8, "whoosh", 0.42], [66.5, "whoosh-short", 0.36]],
  xfade0: 66.5, // BGM1 → BGM2 crossfade (orig 1:08 → 1:09)
  xfade1: 67.5,
  hover: 77.583, // the cursor reaches the orange button (orig 79.083): the zoom reaches 1.8 here
  slam1: [80.15, 80.45, 80.75, 81.1], // SO, / WHAT'S / YOUR / DECISION?
  lift: 82.9, // line 1 moves up
  slam2: [83.3, 83.6, 83.95], // UNLOCK / CLAUDE 5X / ENTERPRISE POWER
  sheen2: 84.5,
  cta: 86.3, // GET INSTANT ACCESS NOW (voice: "এখনই নিচে দেয়া বাটনে ক্লিক" at 86.66)
};
