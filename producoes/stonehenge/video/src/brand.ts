// Identidade do canal FENDA UMBRA — um único lugar para nome, cores, abertura e encerramento.
// Conceito: uma FENDA de luz que se abre na SOMBRA (umbra) e revela o que está escondido dentro das coisas.
// Por isso o vídeo abre com a fenda se abrindo sobre a maquete e fecha com ela se fechando sobre a marca.
// Troque aqui (e só aqui) se a marca mudar; componentes em components/Brand.tsx leem estes valores.

import { OUTRO_SECONDS } from "./utils/timing";

export const BRAND = {
  name: "FENDA UMBRA",
  /** chamada escrita no encerramento */
  cta: "Comente o próximo tema · siga e compartilhe",
  /**
   * Chamada FALADA pelo narrador no encerramento (a "propaganda" do canal). Vai em scripts/narration.json
   * com a chave "cta" — sempre este texto, igual em todo vídeo, para virar a assinatura sonora do canal.
   * Curta de propósito (~3 s): cada segundo aqui sai do tempo da explicação.
   */
  ctaVoice: "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!",
  // paleta do logo (public/brand/logo.png): sombra arroxeada + fenda de luz roxa com núcleo quase branco
  colors: {
    umbra: "#0b0812", // sombra (fundo da marca, abertura/encerramento)
    umbra2: "#171222", // pedestal e cartões
    accent: "#8b5cf6", // a luz roxa da fenda: destaque da marca, cápsula da legenda
    accentDeep: "#5b33d6", // brilho/halo
    light: "#c4b5fd", // lavanda (texto secundário, bordas)
    core: "#f5f0ff", // núcleo branco da rachadura
    cream: "#ece6ff", // texto principal da marca
  },
  /** logo oficial em public/brand/logo.png (800×800, fundo escuro — aparece com máscara radial) */
  logo: "brand/logo.png",
  intro: {
    /** fenda abre entre estes frames (a 1ª fala entra em ~0,45 s = frame 13) */
    openStart: 2,
    openEnd: 22,
    /** marca pequena no topo some até este frame */
    wordmarkUntil: 62,
  },
  outro: { seconds: OUTRO_SECONDS },
} as const;
