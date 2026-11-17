// Detecção de ambiente compartilhada por stills.mjs e render.mjs.
//   GL      : "angle" (GPU) ou "swangle" (render por software — sem GPU, ex.: containers na nuvem).
//   BROWSER : Chromium/Chrome headless a usar (evita o download do Remotion, que falha atrás de proxy).
// Variáveis GL / BROWSER sobrescrevem a detecção.
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const hasGpu = () => {
  try {
    execSync("nvidia-smi -L", { stdio: "ignore" });
    return true;
  } catch {
    // macOS e Windows com GPU integrada também rodam ANGLE; só Linux sem nvidia-smi cai no software
    return process.platform !== "linux";
  }
};

const findPlaywrightShell = () => {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers", path.join(process.env.HOME ?? "", ".cache/ms-playwright")].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const dir of readdirSync(root).sort().reverse()) {
      for (const rel of ["chrome-headless-shell-linux64/chrome-headless-shell", "chrome-linux64/chrome", "chrome-linux/chrome"]) {
        const p = path.join(root, dir, rel);
        if (existsSync(p)) return p;
      }
    }
  }
  return undefined;
};

export const detectEnv = () => {
  const gl = process.env.GL ?? (hasGpu() ? "angle" : "swangle");
  const browserExecutable = process.env.BROWSER ?? findPlaywrightShell() ?? null;
  return { gl, browserExecutable, chromiumOptions: { gl } };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(detectEnv(), null, 2));
}
