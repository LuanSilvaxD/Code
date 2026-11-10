import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "./brand";
import { BrandPedestal } from "./components/BrandPedestal";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Mascot } from "./components/Mascot";
import { Person } from "./components/Person";
import { orbit } from "./utils/animation";

// Folha de personagens (design): mascote e pessoa lado a lado sobre o pedestal da marca, de frente
// (view="front") ou em 3/4 (view="threeQuarter"). Renderize como still: --props='{"view":"front"}'.

export const CharacterSheet: React.FC<{ view: "front" | "threeQuarter"; extra?: React.ReactNode }> = ({ view, extra }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pose = view === "front" ? orbit([-0.55, 0.9, 0], 9.5, 0, 4) : orbit([-0.55, 0.9, 0], 9.5, 28, 11);
  const Cam = () => {
    usePose({ ...pose, fov: 24 });
    return null;
  };
  const { umbra } = BRAND.colors;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${umbra} 0%, #2a1d48 60%, ${umbra} 100%)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 50% 55%, #b9a3ff38 0%, rgba(0,0,0,0) 75%)" }} />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: 24, near: 0.3, far: 200, position: [0, 2, 12] }}>
        <Cam />
        <Lighting />
        <BrandPedestal width={5.2} depth={1.8} y={0} />
        {extra}
        <Mascot frame={frame} position={[-0.75, 0, 0]} rotY={view === "front" ? 0 : 0.1} scale={1} />
        <Person frame={frame} position={[0.85, 0, 0]} rotY={view === "front" ? 0 : -0.1} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
