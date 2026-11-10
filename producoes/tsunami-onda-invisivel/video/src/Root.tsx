import { Composition } from "remotion";
import { MainSequence } from "./MainSequence";
import { Thumbnail } from "./Thumbnail";

// durationInFrames = SECONDS × 30 (utils/timing.ts); scenes.ts valida a soma.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TsunamiShort" component={MainSequence} durationInFrames={2700} fps={30} width={1080} height={1920} />
      <Composition id="CapaVertical" component={Thumbnail} durationInFrames={2700} fps={30} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
      <Composition id="ThumbYouTube" component={Thumbnail} durationInFrames={2700} fps={30} width={1280} height={720} defaultProps={{ layout: "horizontal" as const }} />
    </>
  );
};
