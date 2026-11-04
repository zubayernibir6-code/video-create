You are testing whether Talha's video studio can run in THIS Cowork environment. Do every step below in order. Do not
stop at the first failure: try the listed fallback, note the result, and continue. Reply to him in simple Bengali,
then give the technical report block in English (§10) that he will paste back to Claude Code on his PC.

Rules: in the connected folder `D:\Video Create` you may READ only `transfer-kit/client-promo/kit/` and you may WRITE
only inside a new folder `cowork-test/`. Do not change, move or delete anything else there. Install software only
inside your own sandbox. Spend no money. Never print secrets.

## 1. The machine

Run and record: `cat /etc/os-release`, `uname -m`, `id`, `nproc`, `free -m`, `df -h . /tmp`, `node -v`, `npm -v`,
`python3 -V`, `pip -V`, `ffmpeg -version | head -1`, `ffprobe -version | head -1`, `which chromium chromium-browser
google-chrome`, `sudo -n true && echo sudo-ok`.

## 2. Which websites answer

For each, run `curl -sS -o /dev/null -w "%{http_code} %{time_total}\n" --max-time 12 <url>` and record the code (or
the error):
https://registry.npmjs.org/hyperframes · https://pypi.org/simple/faster-whisper/ · https://github.com ·
https://objects.githubusercontent.com · http://archive.ubuntu.com/ubuntu/ · https://googlechromelabs.github.io/chrome-for-testing/ ·
https://storage.googleapis.com · https://huggingface.co · https://generativelanguage.googleapis.com ·
https://fonts.googleapis.com · https://nodejs.org/dist/

## 3. Node 22 or newer

If `node -v` is below 22: try `npm i -g node@22` (the binary comes from the npm registry), then `node -v` again.
Record what worked.

## 4. FFmpeg and FFprobe

If missing, try in this order and record which worked:
1. `sudo apt-get update && sudo apt-get install -y ffmpeg` (or without sudo if you are root);
2. `pip install imageio-ffmpeg` → `python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"`, plus
   `npm i @ffprobe-installer/ffprobe` for ffprobe;
3. `npm i @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe`.
Export `HYPERFRAMES_FFMPEG_PATH` and `HYPERFRAMES_FFPROBE_PATH` to the binaries. Record `ffmpeg -version | head -1` and
whether `ffmpeg -hide_banner -filters | grep -E " ass | subtitles | loudnorm | xfade "` lists those four filters.

## 5. HyperFrames and Chrome

1. In a work folder: `npm init -y && npm i hyperframes@latest gsap` → `npx hyperframes --version` → `npx hyperframes doctor`.
2. Chrome: `npx hyperframes browser ensure`. If it fails (its download host may be blocked):
   `npm i @sparticuz/chromium` →
   `node --input-type=module -e "import c from '@sparticuz/chromium'; console.log(await c.executablePath())"` →
   `export HYPERFRAMES_BROWSER_PATH=<that path>` → `npx hyperframes doctor` again.
   If that also fails, try `sudo apt-get install -y chromium` and record the error.
3. Record the doctor output lines for Node, FFmpeg and Chrome.

## 6. Render a 5-second Bengali test

1. `npx hyperframes init cowork-smoke` (read `npx hyperframes docs` for the composition rules if needed).
2. Copy `BalooDa2-Variable.ttf` and `HindSiliguri-SemiBold.ttf` from `D:\Video Create\transfer-kit\client-promo\kit\fonts\`
   into the project's `assets/fonts/` and load them with local `@font-face` (quote the names: `"Baloo Da 2"`,
   `"Hind Siliguri"`; no letter-spacing).
3. Make the composition 1080×1920, 24 fps, 5 s: background `#0D3A26`; title "মোহনা অ্যাগ্রো ফুড" (Baloo Da 2, 700,
   112 px, colour `#EDC060`) scaling from 0.965 to 1 and fading in over 0.8 s; below it "আমদানি · রপ্তানি · সরবরাহ"
   (Hind Siliguri 600, 46 px, `#FFF5E1`, the dots drawn as small gold circles, not the • character) appearing at 1.5 s.
   Use local GSAP (`node_modules/gsap/dist/gsap.min.js` copied into the project), one paused timeline.
4. `npx hyperframes check` → `time npx hyperframes render -q draft -o out/smoke.mp4`. Record the time and any error.
5. `ffprobe` the result (duration, size, fps) and extract the frame at 3 s as `out/frame3.png`. LOOK at it: is the
   Bengali drawn correctly (the conjuncts in অ্যাগ্রো, রপ্তানি joined, the মাত্রা line unbroken)?

## 7. FFmpeg finishing test

1. Make a 5 s test tone: `ffmpeg -f lavfi -i "sine=frequency=440:duration=5" -ar 48000 out/tone.wav`.
2. Burn one Bengali line with an `.ass` file using Hind Siliguri from `assets/fonts` (`-vf "ass=line.ass:fontsdir=assets/fonts"`),
   add the tone as audio, and normalise loudness to −14 LUFS (`loudnorm=I=-14:TP=-1:LRA=11`) → `out/final.mp4`.
3. Measure it: `ffmpeg -i out/final.mp4 -af ebur128 -f null - 2>&1 | tail -12`. Record integrated LUFS and true peak.
4. Extract the frame at 3 s, LOOK at the burned Bengali line, and say if it is correct.

## 8. Transcriber check (only to learn what is possible)

`pip install faster-whisper` then try
`python3 -c "from faster_whisper import WhisperModel; WhisperModel('tiny', device='cpu', compute_type='int8'); print('model ok')"`.
Record whether the package and the model download worked (the model comes from huggingface.co).

## 9. Write the results back

Copy `out/smoke.mp4`, `out/final.mp4`, both PNG frames and a text file `report.txt` (the §10 block) into
`D:\Video Create\cowork-test\`. Also offer the two MP4 files for download in this session. Record the file sizes and
whether writing to the folder worked.

## 10. The report

First, in simple Bengali for Talha: what worked, what did not, and what that means for making his videos here.
Then this block in English, filled in, inside one code fence:

```
COWORK SMOKE TEST — <date>
machine: os=… arch=… cpus=… ram_mb=… disk_free=… root/sudo=…
preinstalled: node=… python=… ffmpeg=… chrome=…
reach: npm=… pypi=… github=… objects.githubusercontent=… ubuntu=… chrome-for-testing=… storage.googleapis=… huggingface=… gemini-api=… google-fonts=… nodejs.org=…
node22: <how>          ffmpeg: <how, version, filters ass/subtitles/loudnorm/xfade>
hyperframes: <version, doctor lines>
chrome: <ensure | sparticuz | apt | failed + error>
render 5s 1080x1920 draft: <seconds, ok/error>   bengali in frame: <correct / broken + what>
ffmpeg ass + loudnorm: <ok/error>   lufs=… tp=…   bengali burned: <correct / broken>
faster-whisper: package=<ok/fail> model=<ok/fail + error>
write to D:\Video Create\cowork-test: <ok/fail>   download offered: <yes/no>   sizes: …
total time of this test: …
errors (verbatim, short): …
```
