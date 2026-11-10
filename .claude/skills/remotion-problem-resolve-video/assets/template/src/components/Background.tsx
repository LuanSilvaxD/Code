import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { BACKDROP, SKY } from "../theme";
import { clamp } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";

// Fundo atrás do diorama.
// "studio" (identidade Fenda Umbra): sombra quente com um halo de luz atrás da maquete, tingido pelo tema;
//   o halo acompanha levemente a câmera (parallax) para o fundo não parecer um papel parado.
// "sky": céu claro com a câmera acima do solo, azul profundo quando ela mergulha.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = cameraPoseAt(frame);
  if (BACKDROP.mode === "studio") {
    const az = Math.atan2(pose.position[0] - pose.target[0], pose.position[2] - pose.target[2]);
    const hx = 50 - clamp(az / Math.PI, -0.5, 0.5) * 24;
    const { umbra } = BRAND.colors;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${umbra} 0%, ${BACKDROP.tint} 55%, ${umbra} 100%)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 34% at ${hx}% 52%, ${BACKDROP.halo}55 0%, ${BACKDROP.halo}14 45%, rgba(0,0,0,0) 75%)` }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 70% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)" }} />
      </AbsoluteFill>
    );
  }
  const camY = pose.position[1];
  const t = clamp((1.2 - camY) / 4.2, 0, 1);
  const c = SKY.surface.map((top, i) => interpolateColors(t, [0, 1], [top, SKY.underground[i]]));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 52%, ${c[2]} 100%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 48%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 55%, rgba(4,10,22,0.32) 100%)" }} />
      {/* brilho de horizonte: dá profundidade atrás do diorama (some quando a câmera "mergulha") */}
      <AbsoluteFill style={{ opacity: 1 - t, background: "radial-gradient(ellipse 70% 22% at 50% 58%, rgba(255,250,235,0.55) 0%, rgba(255,250,235,0) 100%)" }} />
    </AbsoluteFill>
  );
};
