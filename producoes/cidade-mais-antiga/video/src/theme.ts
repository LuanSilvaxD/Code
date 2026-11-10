import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Configuração visual central: paleta, materiais, luz, câmera e áreas seguras.
// Montserrat (variável, 700–900) servida de public/fonts: o Chrome headless deste ambiente não
// consegue baixar do Google Fonts (certificado do proxy).

export const FONT = "Montserrat";
for (const [file, range] of [
  ["fonts/montserrat-latin.woff2", "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"],
  ["fonts/montserrat-latin-ext.woff2", "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"],
] as const) {
  loadFont({ family: FONT, url: staticFile(file), weight: "700 900", unicodeRange: range });
}

export const PALETTE = {
  // Estados didáticos (sempre com ícone + texto, nunca só cor)
  positive: "#20b85a",
  negative: "#e5383b",
  info: "#2f7df6",
  warning: "#f8c815",
  // Interface
  text: "#ffffff",
  outline: "#0a1420",
  accent: "#53d6ff",
  // Mundo (exemplo — troque pelo tema)
  ground: "#c9b46c",
  groundSide: "#b98a5d",
  subject: "#25b4dc",
  metal: "#a2abb5",
  pedestal: "#232c38",
} as const;

/** Acabamento levemente fosco para todo o diorama. */
export const MATTE = { roughness: 0.88, metalness: 0, flatShading: true } as const;
export const METAL = { roughness: 0.38, metalness: 0.55, flatShading: true } as const;

export const LIGHTING = {
  ambient: 0.55,
  hemisphere: { sky: "#dff2ff", ground: "#6b5a48", intensity: 1.05 },
  key: { position: [9, 16, 12] as [number, number, number], intensity: 2.5, color: "#fff4e2" },
  fill: { position: [-12, 6, 8] as [number, number, number], intensity: 0.75, color: "#cfe6ff" },
  rim: { position: [-4, 8, -12] as [number, number, number], intensity: 0.6, color: "#ffffff" },
  shadowMapSize: 2048,
} as const;

/** Perspectiva suave: FOV baixo e câmera afastada preservam a leitura do esquema. */
export const CAMERA = { fov: 24, near: 0.5, far: 400 } as const;

/** Faixas seguras para Shorts/Reels (px numa tela 1080x1920). */
export const SAFE = {
  top: 250,
  bottom: 1540,
  side: 90,
  badgeTop: 262,
  captionCenterY: 1418,
} as const;

/** Fundo: céu com a câmera acima do "chão", azul profundo quando ela desce (ver Background.tsx). */
export const SKY = {
  surface: ["#f2b27a", "#f8d6a8", "#fcefd9"],
  underground: ["#2a2340", "#4a3a52", "#2a1f2c"],
} as const;

/** Cores das palavras-chave nas legendas (as demais palavras ficam brancas). */
export const KEYWORD_COLOR: Record<string, string> = {};
export const KEYWORD_DEFAULT = "#4fdcff";
