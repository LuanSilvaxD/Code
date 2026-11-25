import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { AnimatedCaptions } from "./components/AnimatedCaptions";
import { Background } from "./components/Background";
import { BrandIntro, BrandOutro } from "./components/Brand";
import { CornerBug, HookText, SeriesTag } from "./components/Hook2D";
import { LikeSubscribe } from "./components/LikeSubscribe";
import { HOOK, OPENING } from "./opening";
import { CameraController } from "./components/CameraController";
import { MascotFromTracks } from "./components/Mascot";
import { PostFx, ProgressBar, Scrims } from "./components/PostFx";
import { PostFx3D } from "./components/PostFx3D";
import { ScreenFxOverlay, useScreenFx } from "./components/ScreenFx";
import { BadgeLayer } from "./components/TechnicalBadge";
import { World } from "./components/World";
import { scenes, track } from "./data/scenes";
import { VoyOverlay } from "./scenes/VoyOverlay";
import type { SceneModule } from "./scenes/types";
import { CAMERA, POST } from "./theme";

// Orquestra o vídeo a partir do array tipado de cenas (src/data/scenes.ts):
// um único canvas 3D com o cenário persistente + extras 3D de cada cena,
// e por cima as camadas 2D de cada cena (rótulos, tela dividida), badges, legendas e áudio.

const MODULES: Record<string, SceneModule> = {};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = track("fade", frame);
  if (fade <= 0.001) return null;
  return <AbsoluteFill style={{ background: "#050b14", opacity: fade }} />;
};

/** Abertura nova: gancho + etiqueta do quadro (trilhas "hook"/"tag"), selo no canto e "curte e se inscreve" (trilha "ls"). */
const OpeningHook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {HOOK.tag ? <SeriesTag v={track("tag", frame)} text={HOOK.tag} top={(HOOK.top ?? 560) - 90} /> : null}
      <HookText v={track("hook", frame)} lines={HOOK.lines} top={HOOK.top} />
      <LikeSubscribe t={track("ls", frame)} top={400} side="right" />
      <CornerBug />
    </>
  );
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
        {POST.bloom > 0 ? <PostFx3D bloom={POST.bloom} /> : null}
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
      <VoyOverlay />
      <PostFx />
      <AnimatedCaptions />
      <ProgressBar />
      <FadeOut />
      {/* abertura (opening.ts): "hook" = gancho escrito no frame 1 + selo no canto; "fenda" = a fenda abre */}
      {OPENING === "fenda" ? <BrandIntro /> : <OpeningHook />}
      <BrandOutro />
      <Soundtrack />
    </AbsoluteFill>
  );
};
