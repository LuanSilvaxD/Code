// Render do MP4 (H.264 + AAC) com GPU ou por software, detectados automaticamente.
//   node scripts/render.mjs <CompId> out/<nome>-raw.mp4              (vídeo inteiro)
//   node scripts/render.mjs <CompId> out/tail.mp4 --frames=2459-2699  (só um trecho, p/ emendar)
// Opções: --crf=17 --concurrency=4. Variáveis GL/BROWSER sobrescrevem a detecção (scripts/env.mjs).
// Para emendar um trecho re-renderizado sem refazer tudo, ver references/pipeline-fase2.md §8.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import os from "node:os";
import path from "node:path";
import { detectEnv } from "./env.mjs";

const [id, out, ...rest] = process.argv.slice(2);
if (!id || !out) {
  console.error("uso: node scripts/render.mjs <CompId> <saida.mp4> [--frames=a-b] [--crf=17] [--concurrency=4]");
  process.exit(1);
}
const opt = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const { chromiumOptions, browserExecutable, gl } = detectEnv();
const concurrency = Number(opt.concurrency ?? Math.max(1, Math.min(4, os.cpus().length)));
const frameRange = opt.frames ? opt.frames.split("-").map(Number) : null;
console.error(`[render] ${id} → ${out} | gl=${gl} | concurrency=${concurrency}${frameRange ? ` | frames ${frameRange.join("-")}` : ""}`);
if (gl === "swangle") console.error("[render] sem GPU: render por software (~0,4–0,6 s/frame com 4 núcleos em 1080×1920). Rode em segundo plano.");

const serveUrl = await bundle({ entryPoint: path.resolve(opt.entry ?? "src/index.ts") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions, browserExecutable });
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: "h264",
  audioCodec: "aac",
  crf: Number(opt.crf ?? 17),
  outputLocation: path.resolve(out),
  concurrency,
  chromiumOptions,
  browserExecutable,
  frameRange: frameRange ? [frameRange[0], frameRange[1]] : null,
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 100);
    if (p !== last && p % 5 === 0) {
      last = p;
      console.error(`[render] ${p}%`);
    }
  },
});
console.log(path.resolve(out));
