import { Composition } from "remotion";
import { KolaSheet1, KolaSheet2, KolaSheet3 } from "./KolaSheet";

// Fase de design: só as folhas (o vídeo entra depois da aprovação).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="KolaSheet1" component={KolaSheet1} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="KolaSheet2" component={KolaSheet2} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="KolaSheet3" component={KolaSheet3} durationInFrames={120} fps={30} width={1080} height={1920} />
  </>
);
