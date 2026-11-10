/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// Three.js precisa do ANGLE (GPU) para renderizar no Chrome headless.
Config.setChromiumOpenGlRenderer("angle");
// Sem GPU (containers na nuvem): rode com --gl=swangle. Sem acesso a remotion.media, aponte um Chromium local:
// Config.setBrowserExecutable("/opt/pw-browsers/<versão>/chrome-headless-shell-linux64/chrome-headless-shell");
// (scripts/stills.mjs e scripts/render.mjs detectam GPU e Chromium sozinhos — ver scripts/env.mjs.)
