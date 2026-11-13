import vo from "../data/vo.json";

// Linha do tempo única do vídeo. Antes do TTS, os cortes vêm de PLANNED_SECONDS (roteiro aprovado).
// Depois de scripts/voiceover.py + prepare_vo.py preencherem src/data/vo.json, os cortes passam a
// ser derivados da duração REAL de cada fala: cada fala começa LEAD s depois do corte da sua cena
// e as falas são encadeadas com GAPS. Cenas, legendas, efeitos e trilha leem estes mesmos valores.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
/** Duração-alvo total (s). O último plano termina exatamente aqui. */
export const SECONDS = 66; // 1980 frames (1:06 — meta 60–75 s)
export const DURATION = SECONDS * FPS;

export const f = (seconds: number) => Math.round(seconds * FPS);
/** Segundo local (dentro da cena) -> frame local. */
export const s = (seconds: number) => Math.round(seconds * FPS);

/** Uma fala por cena, na ordem das cenas. */
export const VO_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"] as const;
export type VoKey = (typeof VO_KEYS)[number];

/** Durações planejadas no roteiro (s), uma por cena; somam SECONDS. */
const PLANNED_SECONDS = [8.7, 6.4, 4.8, 7.17, 5.83, 5.03, 10.43, 8.33, 9.31];
/** A 1ª fala entra depois do whoosh de abertura. */
const FIRST_VO = 0.45;
/** O corte de cada cena acontece este tanto antes da 1ª sílaba da sua fala. */
const LEAD = 0.25;
/** Pausa entre o fim de uma fala e o início da próxima (len = cenas - 1). */
// viradas (energia escura→Euclid, lente→pacote, pacote→iceberg) ganham 0,8 s
const GAPS: number[] = [0.55, 0.55, 0.55, 0.8, 0.55, 0.55, 0.8, 0.8];

type VoWord = { text: string; start: number; end: number };
type VoLine = { text: string; seconds: number; words: VoWord[] };
const VO_DATA = vo as unknown as Partial<Record<string, VoLine>>;

/**
 * Encerramento fixo da marca (components/Brand.tsx): a fenda fecha e o narrador fala a chamada fixa
 * ("cta" em scripts/narration.json → src/data/vo.json, texto em brand.ts → BRAND.ctaVoice).
 * A duração se ajusta à fala real: começa CTA_OFFSET s depois do início do encerramento e deixa ~0,6 s no fim.
 * Sem a fala gerada, o encerramento dura 2,6 s (só visual). A última fala das cenas termina antes dele.
 */
export const CTA_OFFSET = 0.6;
export const HAS_CTA = VO_DATA["cta"] !== undefined;
export const CTA_SECONDS = VO_DATA["cta"]?.seconds ?? 0;
export const OUTRO_SECONDS = Math.max(2.6, HAS_CTA ? CTA_OFFSET + CTA_SECONDS + 0.6 : 0);

/** true quando todas as falas já têm áudio medido. */
export const HAS_VO = VO_KEYS.every((k) => VO_DATA[k] !== undefined);

const voStart = {} as Record<VoKey, number>;
{
  let t = FIRST_VO;
  let planned = 0;
  VO_KEYS.forEach((key, i) => {
    const line = VO_DATA[key];
    voStart[key] = HAS_VO ? t : planned + LEAD;
    t += (line?.seconds ?? 0) + (GAPS[i] ?? 0);
    planned += PLANNED_SECONDS[i];
  });
  // t = fim da última fala: ela termina antes do encerramento da marca (+0,2 s de respiro)
  if (HAS_VO && t > SECONDS - OUTRO_SECONDS - 0.2) {
    throw new Error(`A narração (${t.toFixed(2)} s) invade o encerramento (${OUTRO_SECONDS} s) de um vídeo de ${SECONDS} s: encurte o texto, a voz ou GAPS, ou aumente SECONDS.`);
  }
}

/** Segundo absoluto em que cada fala começa. */
export const VO_START: Readonly<Record<VoKey, number>> = voStart;

export const VO = VO_KEYS.filter((k) => VO_DATA[k]).map((id) => ({ id, at: VO_START[id], seconds: VO_DATA[id]!.seconds, text: VO_DATA[id]!.text }));

/** Cortes das cenas em frames globais: [início, fim). Somam exatamente DURATION. */
export const SCENE_FRAMES = VO_KEYS.map((key, i) => {
  const next = VO_KEYS[i + 1];
  if (!HAS_VO) {
    const from = f(PLANNED_SECONDS.slice(0, i).reduce((a, b) => a + b, 0));
    const to = next ? f(PLANNED_SECONDS.slice(0, i + 1).reduce((a, b) => a + b, 0)) : DURATION;
    return { from, durationInFrames: to - from };
  }
  const from = i === 0 ? 0 : f(VO_START[key] - LEAD);
  const to = next ? f(VO_START[next] - LEAD) : DURATION;
  return { from, durationInFrames: to - from };
});

/** Palavras da fala com tempos (relativos ao início da fala), ou [] antes do TTS. */
export const voWords = (key: VoKey): VoWord[] => VO_DATA[key]?.words ?? [];

/**
 * Frame LOCAL (dentro da cena) em que a palavra `index` da fala começa.
 * Antes do TTS devolve uma estimativa a ~155 palavras/min — provisória, realinhe depois.
 */
export const wordLocal = (key: VoKey, index: number) => {
  const scene = SCENE_FRAMES[VO_KEYS.indexOf(key)];
  const w = VO_DATA[key]?.words[index];
  const t = w ? w.start : index * (60 / 155);
  return f(VO_START[key] + t) - scene.from;
};

/** Frame local em que a fala da cena começa. */
export const voLocal = (key: VoKey) => f(VO_START[key]) - SCENE_FRAMES[VO_KEYS.indexOf(key)].from;
