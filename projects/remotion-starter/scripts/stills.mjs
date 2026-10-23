import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
});
const composition = await selectComposition({ serveUrl, id: "ClaudeAd" });
const frames = [600, 1560, 2520, 4320];
for (const frame of frames) {
  const output = path.resolve(`out/chk-${frame}.png`);
  await renderStill({ composition, serveUrl, frame, output });
  console.log("wrote", output);
}
