import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { PALETTE } from "../theme";
import { rand, smoothstep, type Vec3 } from "../utils/animation";
import { cameraPoseAt, projectPoint } from "./CameraController";

// Explosão 2D ancorada num ponto 3D (projetado com a pose da câmera do frame): confete para revelações,
// faíscas/brilho para "acertou"/descobertas. Dirigida pela trilha `burst.<id>` (0→1), criada com fx.burst().
// Partículas são funções puras do progresso (sem estado), então qualquer frame renderiza isolado.

/** `sceneStart`: passe scene.startFrame quando usar dentro do Overlay de uma cena (lá o frame é local). */
type Props = { id: string; point: Vec3; kind?: "confetti" | "sparkle"; count?: number; colors?: string[]; sceneStart?: number };

export const Burst: React.FC<Props> = ({ id, point, kind = "confetti", count = 46, colors, sceneStart = 0 }) => {
  const frame = useCurrentFrame() + sceneStart;
  const c = track(`burst.${id}`, frame);
  if (c <= 0.001 || c >= 0.999) return null;
  const o = projectPoint(cameraPoseAt(frame), point);
  if (!o.visible) return null;
  const pal = colors ?? [PALETTE.warning, PALETTE.positive, PALETTE.info, "#ffffff", PALETTE.negative];
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = rand(`${id}a${i}`) * Math.PI * 2;
        // faíscas saem rápido e desaceleram (easing out); confete sobe e cai com gravidade
        const v = (kind === "confetti" ? 260 : 220) + (kind === "confetti" ? 420 : 380) * rand(`${id}v${i}`);
        const cc = kind === "sparkle" ? 1 - (1 - c) * (1 - c) : c;
        const g = kind === "confetti" ? 700 : 0;
        const x = o.x + Math.cos(a) * v * cc;
        const y = o.y + Math.sin(a) * v * cc * 0.8 + g * c * c;
        const fade = 1 - smoothstep(c) * 0.95;
        if (kind === "sparkle") {
          const s = (16 + 22 * rand(`${id}s${i}`)) * (1 - 0.5 * c);
          return <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, rotate: "45deg", background: pal[i % pal.length], boxShadow: `0 0 14px ${pal[i % pal.length]}`, opacity: fade }} />;
        }
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 10, background: pal[i % pal.length], rotate: `${(a + c * 9) * 57}deg`, opacity: fade }} />;
      })}
    </>
  );
};
