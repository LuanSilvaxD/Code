import { Composition } from "remotion";
import { JoanaSheet1, JoanaSheet2, JoanaSheet3 } from "./JoanaSheet";
import { MainSequence } from "./MainSequence";
import { Thumbnail } from "./Thumbnail";
import { DURATION } from "./utils/timing";

// A duração vem de utils/timing.ts (SECONDS × 30); scenes.ts valida a soma.
// Capa e thumbnail são Composições (não <Still>) para poder escolher o quadro com --frame=<N>.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Joana" component={MainSequence} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
      <Composition id="CapaVertical" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
      <Composition id="ThumbYouTube" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1280} height={720} defaultProps={{ layout: "horizontal" as const }} />
      <Composition id="JoanaSheet1" component={JoanaSheet1} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="JoanaSheet2" component={JoanaSheet2} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="JoanaSheet3" component={JoanaSheet3} durationInFrames={120} fps={30} width={1080} height={1920} />
    </>
  );
};
