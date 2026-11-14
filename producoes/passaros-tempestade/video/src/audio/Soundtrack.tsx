import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { scenes } from "../data/scenes";
import { CTA_OFFSET, CTA_SECONDS, DURATION, f, HAS_CTA, OUTRO_SECONDS, VO } from "../utils/timing";

// Áudio: narração (prioridade), efeitos de cada cena e trilha instrumental discreta.
// A trilha abaixa sempre que a voz entra (sidechain simples por volume).
// Só toca o que está com status "ready" — cues "planned" ainda não existem em disco.

/**
 * Ligado por padrão: gere public/audio/music.wav (scripts/music.py) antes do render — sem o arquivo o render
 * falha alto (melhor que sair mudo: já saiu um MP4 inteiro sem trilha). Vídeo sem trilha de propósito → false.
 */
const HAS_MUSIC = true;
// ctaDucked: no encerramento o TEMA da marca toca inteiro — a trilha abaixa menos sob a chamada falada.
const MUSIC = { base: 0.5, ducked: 0.17, ctaDucked: 0.3, ramp: 8 };
/** Segundo absoluto em que a chamada falada começa (logo depois de a fenda fechar). */
const SECONDS_CTA_AT = () => DURATION / 30 - OUTRO_SECONDS + CTA_OFFSET;

const musicVolume = (frame: number) => {
  let level = MUSIC.base;
  // a chamada falada do encerramento também abaixa a trilha (menos que as falas das cenas)
  const segs = HAS_CTA ? [...VO.map((v) => ({ ...v, floor: MUSIC.ducked })), { at: SECONDS_CTA_AT(), seconds: CTA_SECONDS, floor: MUSIC.ctaDucked }] : VO.map((v) => ({ ...v, floor: MUSIC.ducked }));
  for (const seg of segs) {
    const start = f(seg.at);
    const end = f(seg.at + seg.seconds);
    const d = Math.min(Math.max(0, (frame - (start - MUSIC.ramp)) / MUSIC.ramp), Math.max(0, (end + MUSIC.ramp * 2 - frame) / (MUSIC.ramp * 2)), 1);
    level = Math.min(level, MUSIC.base - (MUSIC.base - seg.floor) * d);
  }
  const fadeOut = Math.min(1, Math.max(0, (DURATION - frame) / 24));
  return level * fadeOut;
};

/** Sons fixos da marca (scripts/sfx.py gera fenda-open/fenda-close). Mude para false se não gerar. */
const BRAND_SFX = true;

export const Soundtrack: React.FC = () => (
  <>
    {BRAND_SFX ? (
      <>
        <Audio name="Marca · fenda abre" src={staticFile("audio/sfx/fenda-open.wav")} volume={0.3} />
        <Sequence name="Marca · fenda fecha" from={DURATION - f(OUTRO_SECONDS)} layout="none">
          <Audio src={staticFile("audio/sfx/fenda-close.wav")} volume={0.34} />
        </Sequence>
        {HAS_CTA ? (
          <Sequence name="Marca · chamada falada" from={DURATION - f(OUTRO_SECONDS) + f(CTA_OFFSET)} layout="none">
            <Audio src={staticFile("audio/vo/cta.wav")} volume={1} />
          </Sequence>
        ) : null}
      </>
    ) : null}
    {HAS_MUSIC ? <Audio name="Trilha instrumental" src={staticFile("audio/music.wav")} volume={musicVolume} /> : null}
    {scenes.map((sc) => (
      <Sequence key={sc.id} name={`Áudio · ${sc.id}`} from={sc.startFrame} durationInFrames={sc.durationInFrames + 120} layout="none">
        {sc.audioCues
          .filter((cue) => cue.status === "ready")
          .map((cue, i) => (
            <Audio key={`${cue.src}-${i}`} name={`${cue.kind} · ${cue.src}`} src={staticFile(cue.src)} from={Math.max(0, cue.at)} volume={cue.volume} />
          ))}
      </Sequence>
    ))}
  </>
);
