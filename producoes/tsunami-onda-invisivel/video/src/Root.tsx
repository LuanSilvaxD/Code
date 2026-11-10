import { Composition, Still } from "remotion";
import { MainSequence } from "./MainSequence";
import { Thumbnail } from "./Thumbnail";

// durationInFrames = SECONDS × 30 (utils/timing.ts); scenes.ts valida a soma.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TsunamiShort" component={MainSequence} durationInFrames={2700} fps={30} width={1080} height={1920} />
      <Still id="CapaVertical" component={Thumbnail} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
      <Still id="ThumbYouTube" component={Thumbnail} width={1280} height={720} defaultProps={{ layout: "horizontal" as const }} />
    </>
  );
};
