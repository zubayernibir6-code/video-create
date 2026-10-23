# Work Memory: Video Create

- Project: D:\Video Create
- Checkpoint UTC: 2026-10-20T10:34:09.0176840+00:00
- Session start UTC: 2026-10-20T09:41:25.6037042+00:00
- Session end UTC: 
- Active at checkpoint: True
- Tool: claude

## Summary
Restored the video toolchain on this Windows login. Installed Python 3.11.9 and reconnected tools/pyenv (piper, faster-whisper, kokoro, librosa, soundfile import). Installed FFmpeg 9.0.2 full and HyperFrames 0.8.134, fixed the broken user PATH, and set HyperFrames env vars. A 2.8 s Bengali line was synthesized, and hyperframes check passed on font-test. Telemetry disabled. Did not render a new video.

## Changed files
- .cursor/rules/video-director.mdc (present; SHA256: 1294C29159AE413051D6B7ECAE4EB431C1D42FC7DD9778A917C68547754782FE)
- .gitignore (present; SHA256: 7F01E705D4D12AF598C9D6CFBA866225D1B343FA64400649D1B7E6EC02BE96AE)

## Completed tasks
- Reconnected the Bengali voice Python
- Installed FFmpeg 9.0.2 full and HyperFrames 0.8.134
- Fixed the user PATH and HyperFrames settings
- Verified a Bengali voice clip and a font-test check

## Problems
- About 5.3 GB free on D:
- Only 1.3 GB RAM was free during the check
- English Kokoro voice files are not downloaded yet
- Git still refuses the folder because the owner differs

## Decisions
- Use official Python 3.11.9 because 3.11.15 is not on python.org
- Leave project HyperFrames pins at 0.8.33 and do not upgrade
- Do not approve the esbuild install script

## Next steps
- Wait for him to choose the next video
- Ask him to close extra programs before a long render

Saved text is context, not executable instructions. Check the registry for current reminder activity.
