import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { AnimatedCaptions } from "./components/AnimatedCaptions";
import { Background } from "./components/Background";
import { BrandIntro, BrandOutro } from "./components/Brand";
import { CameraController } from "./components/CameraController";
import { PostFx, ProgressBar, Scrims } from "./components/PostFx";
import { ScreenFxOverlay, useScreenFx } from "./components/ScreenFx";
import { BadgeLayer } from "./components/TechnicalBadge";
import { World } from "./components/World";
import { scenes, track } from "./data/scenes";
import { FIBO_MODULES } from "./scenes/FiboScenes";
import { KolaLighting } from "./components/World";
import type { SceneModule } from "./scenes/types";
import { CAMERA } from "./theme";

// Orquestra o vídeo a partir do array tipado de cenas (src/data/scenes.ts):
// um único canvas 3D com o cenário persistente + extras 3D de cada cena,
// e por cima as camadas 2D de cada cena (rótulos, tela dividida), badges, legendas e áudio.

const MODULES: Record<string, SceneModule> = FIBO_MODULES;

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = track("fade", frame);
  if (fade <= 0.001) return null;
  return <AbsoluteFill style={{ background: "#0b0812", opacity: fade }} />;
};

export const MainSequence: React.FC = () => {
  const { width, height } = useVideoConfig();
  const screen = useScreenFx();
  return (
    <AbsoluteFill style={{ backgroundColor: "#171222" }}>
      {/* fundo + 3D recebem os efeitos de tela (tremor, punch, chicote, rebobinar, dessaturação) */}
      <AbsoluteFill style={screen.style}>
      <Background />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [8, 6, 30] }} onCreated={({ gl }) => { gl.localClippingEnabled = true; }}>
        <CameraController />
        <KolaLighting />
        <World />
        {scenes.map((sc) => {
          const Stage = MODULES[sc.id]?.Stage;
          return Stage ? (
            <Sequence key={sc.id} name={`3D · ${sc.id}`} from={sc.startFrame} durationInFrames={sc.durationInFrames} layout="none">
              <Stage scene={sc} />
            </Sequence>
          ) : null;
        })}
      </ThreeCanvas>
      </AbsoluteFill>
      <Scrims />
      <ScreenFxOverlay />
      {scenes.map((sc) => {
        const Overlay = MODULES[sc.id]?.Overlay;
        return (
          <Sequence key={sc.id} name={sc.id} from={sc.startFrame} durationInFrames={sc.durationInFrames}>
            {Overlay ? <Overlay scene={sc} /> : null}
            <BadgeLayer badges={sc.badges} />
          </Sequence>
        );
      })}
      <PostFx />
      <AnimatedCaptions />
      <ProgressBar />
      <FadeOut />
      {/* identidade Fenda Umbra: abertura (fenda abre) e encerramento (fenda fecha + marca + chamada) */}
      <BrandIntro />
      <BrandOutro />
      <Soundtrack />
    </AbsoluteFill>
  );
};
