import { Composition } from "remotion";
import { JoanaSheet1, JoanaSheet2, JoanaSheet3 } from "./JoanaSheet";

// Fase 2, passo 1: só as folhas de design (o vídeo entra depois da aprovação dos designs).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="JoanaSheet1" component={JoanaSheet1} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="JoanaSheet2" component={JoanaSheet2} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="JoanaSheet3" component={JoanaSheet3} durationInFrames={120} fps={30} width={1080} height={1920} />
    </>
  );
};
