import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Sun } from "./components/Apagao";
import { Earth } from "./components/Interstellar";
import { Mascot } from "./components/Mascot";
import { Stars } from "./components/SpaceScene";
import { FrostEarth, HydrothermalVent, IceOceanSlice, LightTrain, WiltingTree } from "./components/SunGone";
import { CornerBug, Countdown, HookText } from "./components/SunGone2D";
import { FONT } from "./theme";

const SPACE = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const DEEP = "linear-gradient(180deg,#0a1a30 0%,#040810 100%)";
const Header: React.FC = () => (
  <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 36, letterSpacing: 2 }}>E SE O SOL SUMISSE? · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · abertura nova, Terra congelando, árvore, oceano, fonte hidrotermal</div>
  </div>
);

export const SSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ position: "relative", width: 1080, height: 600 }}>
      <TileView t={{ name: "ABERTURA NOVA (FRAME 1)", size: "sem fenda: cena + pergunta gigante + contador + selo no canto", target: [3, 0, 0], fit: 14, az: 0, el: 6, scene: (f) => (<><Stars count={600} radius={60} frame={f} /><group position={[-2.5, 0, -2]}><Sun r={2.2} f={f} /></group><group position={[6.5, -0.6, 1]}><Earth f={f} r={0.9} /></group><LightTrain L={8.5} t={0.6} y={-0.3} /><Mascot frame={f} position={[7.6, 0.6, 1.6]} scale={0.32} rotY={-0.6} float={1} /></>) }} w={1080} h={600} bg={SPACE} />
      <div style={{ position: "absolute", inset: 0, transform: "scale(0.56)", transformOrigin: "50% 30%", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1080 }}>
          <CornerBug />
          <Countdown secs={500} v={1} top={140} />
          <HookText v={1} lines={[["E SE O", "#ffffff"], ["SOL", "#ffb02a"], ["SUMISSE?", "#ffffff"]]} top={430} />
        </div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "TERRA CONGELANDO", size: "1 semana (gelo nos polos) → 1 ano (quase toda branca)", target: [0, 0, 0], fit: 5.2, az: 0, el: 6, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><group position={[-1.2, 0, 0]}><FrostEarth f={f} r={1} frost={0.35} dark={0.3} /></group><group position={[1.25, 0, 0]}><FrostEarth f={f} r={1} frost={1} dark={0.45} /></group></>) }} w={540} h={380} bg={SPACE} />
      <TileView t={{ name: "ÁRVORE MURCHANDO + GEADA", size: "fotossíntese para · folhas marrons caem · neve", target: [0, 0.9, 0], fit: 3.6, az: 20, el: 12, scene: (f) => <WiltingTree f={f} wilt={0.75} frost={0.7} /> }} w={540} h={380} bg="linear-gradient(180deg,#1a2030,#3a4a5a)" />
      <TileView t={{ name: "OCEANO: GELO POR CIMA, ÁGUA EMBAIXO", size: "corte · o gelo isola o fundo", target: [0, -1.6, 0], fit: 9, az: 18, el: 18, scene: () => <IceOceanSlice ice={1} /> }} w={540} h={420} bg={SPACE} />
      <TileView t={{ name: "FONTE HIDROTERMAL (VIDA SEM SOL)", size: "chaminés · fumaça quente · vermes-tubo · bactérias", target: [0, 0.6, 0], fit: 3.4, az: 20, el: 12, scene: (f) => (<><HydrothermalVent f={f} /><Mascot frame={f} position={[0.95, 0, 0.55]} scale={0.22} rotY={-0.7} /></>) }} w={540} h={420} bg={DEEP} />
    </div>
  </AbsoluteFill>
);
