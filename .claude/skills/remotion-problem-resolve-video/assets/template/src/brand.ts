// Identidade do canal FENDA UMBRA — um único lugar para nome, cores, abertura e encerramento.
// Conceito: uma FENDA de luz que se abre na SOMBRA (umbra) e revela o que está escondido dentro das coisas.
// Por isso o vídeo abre com a fenda se abrindo sobre a maquete e fecha com ela se fechando sobre a marca.
// Troque aqui (e só aqui) se a marca mudar; componentes em components/Brand.tsx leem estes valores.

import { OUTRO_SECONDS } from "./utils/timing";

export const BRAND = {
  name: "FENDA UMBRA",
  /** chamada fixa do encerramento (visual; não entra na narração) */
  cta: "Siga para abrir a próxima fenda",
  colors: {
    umbra: "#0e0b0a", // sombra quente (fundo da marca, abertura/encerramento)
    umbra2: "#1d1714", // pedestal e cartões
    amber: "#f2b544", // a luz da fenda: destaque da marca, cápsula da legenda
    amberDeep: "#c9862a",
    cream: "#f6ead6",
  },
  intro: {
    /** fenda abre entre estes frames (a 1ª fala entra em ~0,45 s = frame 13) */
    openStart: 2,
    openEnd: 22,
    /** marca pequena no topo some até este frame */
    wordmarkUntil: 62,
  },
  outro: { seconds: OUTRO_SECONDS },
} as const;
