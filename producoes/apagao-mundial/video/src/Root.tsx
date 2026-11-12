import { Composition } from "remotion";
import { ApagaoSheet1, ApagaoSheet2, ApagaoSheet3 } from "./ApagaoSheet";
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
    <Composition id="ApagaoSheet1" component={ApagaoSheet1} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="ApagaoSheet2" component={ApagaoSheet2} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="ApagaoSheet3" component={ApagaoSheet3} durationInFrames={120} fps={30} width={1080} height={1920} />
  </>
);
