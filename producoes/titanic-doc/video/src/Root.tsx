import { Composition } from "remotion";
import { DinoSheet } from "./DinoSheet";
import { DocSheet } from "./DocSheet";
import { DocSheet2 } from "./DocSheet2";
import { MainSequence } from "./MainSequence";
import { Thumbnail } from "./Thumbnail";
import { DURATION } from "./utils/timing";

// A duração vem de utils/timing.ts (SECONDS × 30); scenes.ts valida a soma.
// Capa e thumbnail são Composições (não <Still>) para poder escolher o quadro com --frame=<N>.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DinoSheet" component={DinoSheet} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="DocSheet" component={DocSheet} durationInFrames={120} fps={30} width={1920} height={1580} />
    <Composition id="DocSheet2" component={DocSheet2} durationInFrames={120} fps={30} width={1920} height={1620} />
    <Composition id="Titanic" component={MainSequence} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="CapaVertical" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
    <Composition id="ThumbYouTube" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1280} height={720} defaultProps={{ layout: "horizontal" as const }} />
  </>
);
