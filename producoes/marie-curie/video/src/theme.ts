import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Configuração visual central: paleta, materiais, luz, câmera, áreas seguras e acabamento (pós-efeitos).
// Adapte a paleta ao tema; mantenha os papéis semânticos (positive/negative/info/warning).

// Montserrat variável (700–900) servida de public/fonts (licença OFL em public/fonts/OFL.txt).
// Local de propósito: o Chrome headless atrás de proxies corporativos/na nuvem costuma falhar ao baixar
// do Google Fonts (certificado), e o render trava esperando a fonte.
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
  // maquete premium Fenda Umbra: pedestal em sombra arroxeada + fio de luz roxa (BrandPedestal)
  pedestal: "#171222",
} as const;

/** Acabamento levemente fosco para todo o diorama. */
export const MATTE = { roughness: 0.88, metalness: 0, flatShading: true } as const;
export const METAL = { roughness: 0.38, metalness: 0.55, flatShading: true } as const;

// Luz de estúdio (maquete de museu): chave branca levemente quente para as cores da maquete ficarem fiéis,
// preenchimento lavanda fraco e contraluz roxa forte (a cor da marca) recortando a silhueta no fundo escuro.
export const LIGHTING = {
  ambient: 0.5,
  hemisphere: { sky: "#f4efff", ground: "#2a2038", intensity: 1.0 },
  key: { position: [9, 16, 12] as [number, number, number], intensity: 2.6, color: "#fff2e2" },
  fill: { position: [-12, 6, 8] as [number, number, number], intensity: 0.6, color: "#d9ccff" },
  rim: { position: [-4, 8, -12] as [number, number, number], intensity: 1.2, color: "#a78bfa" },
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
  surface: ["#86c9ef", "#c5e7f6", "#eef3ea"],
  underground: ["#16304f", "#1d3f63", "#0e2036"],
} as const;

/**
 * Fundo. "studio" (padrão da marca): maquete sobre fundo escuro de estúdio com um halo roxo atrás —
 * o "tint" dá o clima do tema sem perder a identidade (padrão roxo da marca #2a1d48; oceano #182a4e,
 * história #2e1f3a, espaço #1f1a4d, natureza #1b2e33, tecnologia #16244a). "sky": céu/subsolo (cenas ao ar livre).
 */
export const BACKDROP = { mode: "studio" as "studio" | "sky", tint: "#2e1f3a", halo: "#b9a3ff" };

/** Cores das palavras-chave nas legendas (as demais palavras ficam brancas). */
export const KEYWORD_COLOR: Record<string, string> = {};
// palavras-chave em lavanda-roxo da marca (legível com o contorno escuro); cápsula de palavra-chave usa texto escuro
export const KEYWORD_DEFAULT = "#b794ff";

/**
 * Acabamento de imagem (camada 2D por cima de tudo, barato até em render por software):
 * vinheta, grão de filme, correção de cor suave e "scrims" que escurecem de leve o topo e a base
 * para badges e legendas lerem sobre qualquer cenário. Ajuste por tema; 0 desliga.
 */
export const POST = {
  vignette: 0.4,
  grain: 0.05,
  grade: { color: "#8b5cf6", opacity: 0.05 },
  scrimTop: 0.22,
  scrimBottom: 0.3,
  /** barra de progresso fina no topo (retenção em Shorts/Reels); desligada por padrão */
  progressBar: false,
} as const;

/** Legenda: "pill" = palavra falada numa cápsula colorida (estilo Shorts); "color" = só muda a cor. */
export const CAPTION_STYLE = { active: "pill" as "pill" | "color", pillColor: "#8b5cf6", pillText: "#ffffff" }; // roxo da marca
