import { Composition } from "remotion";
import { KolaSheet1, KolaSheet2, KolaSheet3 } from "./KolaSheet";
import { MainSequence } from "./MainSequence";
import { Thumbnail } from "./Thumbnail";
import { DURATION } from "./utils/timing";

// A duração vem de utils/timing.ts (SECONDS × 30); scenes.ts valida a soma.
// Capa e thumbnail são Composições (não <Still>) para poder escolher o quadro com --frame=<N>.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Kola" component={MainSequence} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="CapaVertical" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
    <Composition id="ThumbYouTube" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1280} height={720} defaultProps={{ layout: "horizontal" as const }} />
    <Composition id="KolaSheet1" component={KolaSheet1} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="KolaSheet2" component={KolaSheet2} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="KolaSheet3" component={KolaSheet3} durationInFrames={120} fps={30} width={1080} height={1920} />
  </>
);
