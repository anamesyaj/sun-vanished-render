# sun-vanished-render

Parallel GitHub Actions render farm for **"What if the Sun vanished?"** — a
code-drawn, Kurzgesagt-style explainer rendered entirely from a single HTML
file (`index.html`, 1080×1920 portrait, `window.seek(t)` draws frame `t`).

## How it works

- `.github/workflows/render.yml` runs on **push to `main`** and on manual
  **workflow_dispatch** (Actions tab → *Render Sun Vanished* → Run workflow).
- The `render` job is a 10-shard matrix. Each shard renders 120 of the 1,200
  frames (30 fps × 40 s) with Playwright/Chromium:
  `node render-farm.js <start> <end>` → `frames/fNNNN.jpg` (JPEG q88),
  uploaded as an artifact named `frames-<start>-<end>`.
- The `assemble` job downloads all shards, verifies ~1,200 frames, and
  encodes a **silent picture-only** video with ffmpeg:
  `sun-vanished-silent.mp4` (libx264 CRF 20, 30 fps, 1080×1920), uploaded as
  the `final-silent-video` artifact. If the file is under 25 MB it is also
  committed to the `render-output` branch.

## Notes

- Narration (Charon, AI Studio) and the music/SFX mix are added **locally**
  afterwards — no audio files live in this repo.
- Total runtime should be a few minutes wall-clock, versus ~1 frame every
  couple of seconds on a small local VM.
