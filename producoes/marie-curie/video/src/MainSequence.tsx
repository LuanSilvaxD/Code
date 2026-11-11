import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { AnimatedCaptions } from "./components/AnimatedCaptions";
import { Background } from "./components/Background";
import { BrandIntro, BrandOutro } from "./components/Brand";
import { CameraController } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { MascotFromTracks } from "./components/Mascot";
import { PostFx, ProgressBar, Scrims } from "./components/PostFx";
import { ScreenFxOverlay, useScreenFx } from "./components/ScreenFx";
import { BadgeLayer } from "./components/TechnicalBadge";
import { World } from "./components/World";
import { scenes, track } from "./data/scenes";
import { CURIE_MODULES, HerMark, YearChips } from "./scenes/CurieScenes";
import type { SceneModule } from "./scenes/types";
import { CAMERA } from "./theme";

// Orquestra o vídeo a partir do array tipado de cenas (src/data/scenes.ts):
// um único canvas 3D com o cenário persistente + extras 3D de cada cena,
// e por cima as camadas 2D de cada cena (rótulos, tela dividida), badges, legendas e áudio.

const MODULES: Record<string, SceneModule> = CURIE_MODULES;

/** Marcas globais do episódio: "?" sobre a silhueta dela e placas de ano na borda da maquete. */
const GlobalMarks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <YearChips frame={frame} />
      <HerMark frame={frame} />
    </AbsoluteFill>
  );
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = track("fade", frame);
  if (fade <= 0.001) return null;
  return <AbsoluteFill style={{ background: "#050b14", opacity: fade }} />;
};

export const MainSequence: React.FC = () => {
  const { width, height } = useVideoConfig();
  const screen = useScreenFx();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0e2036" }}>
      {/* fundo + 3D recebem os efeitos de tela (tremor, punch, chicote, rebobinar, dessaturação) */}
      <AbsoluteFill style={screen.style}>
      <Background />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [8, 6, 30] }}>
        <CameraController />
        <Lighting shadowExtent={19} />
        <World />
        {/* mascote da Fenda Umbra (aparece em todo vídeo; dirigido pelas trilhas mascot.* — utils/mascot.ts) */}
        <MascotFromTracks />
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
      <GlobalMarks />
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
