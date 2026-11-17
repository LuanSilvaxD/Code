// Renderiza frames específicos como PNG para revisão (um único bundle).
// Rode a partir da raiz do projeto Remotion:
//   node scripts/stills.mjs 0 60 150 ...            -> out/stills/f0000.png ...
// Variáveis opcionais: COMP=<id> (padrão: a primeira), SCALE=0.5, ENTRY=src/index.ts, PORT=3124,
//   GL=angle|swangle e BROWSER=<chrome> (padrão: detectados por scripts/env.mjs).
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { detectEnv } from "./env.mjs";

const frames = process.argv.slice(2).map(Number);
const outDir = path.resolve("out/stills");
mkdirSync(outDir, { recursive: true });

const { chromiumOptions, browserExecutable, gl } = detectEnv();
console.error(`[stills] gl=${gl} browser=${browserExecutable ?? "(do Remotion)"}`);
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY ?? "src/index.ts") });
const port = Number(process.env.PORT ?? 3124);
const comps = await getCompositions(serveUrl, { port, chromiumOptions, browserExecutable });
const composition = process.env.COMP ? comps.find((c) => c.id === process.env.COMP) : comps[0];
if (!composition) throw new Error(`Composição não encontrada: ${process.env.COMP}`);

for (const fr of frames) {
  const frame = Math.min(composition.durationInFrames - 1, fr);
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale: Number(process.env.SCALE ?? 0.5), port, chromiumOptions, browserExecutable });
  console.log(output);
}
