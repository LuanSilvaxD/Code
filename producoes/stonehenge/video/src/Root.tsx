import { Composition } from "remotion";
import { MainSequence } from "./MainSequence";
import { Thumbnail } from "./Thumbnail";
import { StoneSheet, StoneSheet2 } from "./StoneSheet";
import { DURATION } from "./utils/timing";

// Troque o id. A duração vem de utils/timing.ts (SECONDS × 30); scenes.ts valida a soma.
// Capa e thumbnail são Composições (não <Still>) para poder escolher o quadro com --frame=<N>.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="OceanoZonas" component={MainSequence} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
      <Composition id="CapaVertical" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
      <Composition id="ThumbYouTube" component={Thumbnail} durationInFrames={DURATION} fps={30} width={1280} height={720} defaultProps={{ layout: "horizontal" as const }} />
      <Composition id="StoneSheet" component={StoneSheet} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="StoneSheet2" component={StoneSheet2} durationInFrames={120} fps={30} width={1080} height={1920} />
    </>
  );
};
