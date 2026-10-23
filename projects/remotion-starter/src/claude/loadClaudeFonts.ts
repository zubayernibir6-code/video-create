import { continueRender, delayRender, staticFile } from "remotion";

let started = false;

export const ensureClaudeFonts = () => {
  if (typeof document === "undefined" || started) {
    return;
  }
  started = true;
  const handle = delayRender("Loading Claude fonts");
  const css = `
    @font-face {
      font-family: "Hind Siliguri";
      src: url("${staticFile("fonts/HindSiliguri-Regular.ttf")}") format("truetype");
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: "Hind Siliguri";
      src: url("${staticFile("fonts/HindSiliguri-SemiBold.ttf")}") format("truetype");
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: "Hind Siliguri";
      src: url("${staticFile("fonts/HindSiliguri-Bold.ttf")}") format("truetype");
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: "Playfair Display";
      src: url("${staticFile("fonts/PlayfairDisplay-Variable.ttf")}") format("truetype");
      font-weight: 400 900;
      font-style: normal;
    }
    @font-face {
      font-family: "JetBrains Mono";
      src: url("${staticFile("fonts/JetBrainsMono-Variable.ttf")}") format("truetype");
      font-weight: 100 800;
      font-style: normal;
    }
  `;
  const style = document.createElement("style");
  style.setAttribute("data-claude-fonts", "1");
  style.textContent = css;
  document.head.appendChild(style);
  Promise.all([
    document.fonts.load('700 80px "Hind Siliguri"'),
    document.fonts.load('600 40px "Hind Siliguri"'),
    document.fonts.load('700 72px "Playfair Display"'),
    document.fonts.load('600 28px "JetBrains Mono"'),
  ])
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
