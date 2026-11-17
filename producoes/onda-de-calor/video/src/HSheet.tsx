import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { BlanketShell, Escalator, escalatorTop, GreenhouseArrows, PacificSlice, SmokePuffs, Thermometer3D } from "./components/Heat";
import { HeatPodium, ParisGraph, RecordCalendar, TempCounter } from "./components/Heat2D";
import { Earth } from "./components/Interstellar";
import { Mascot } from "./components/Mascot";
import { Stars } from "./components/SpaceScene";
import { FONT } from "./theme";

const SPACE = "radial-gradient(circle at 50% 45%,#3a1d2a 0%,#0b0812 80%)";
const WARM = "linear-gradient(180deg,#2a1430 0%,#5a2a2a 60%,#8a4a2a 100%)";
const Header: React.FC = () => (
  <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 2 }}>POR QUE 2026 ESTÁ TÃO QUENTE? · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · cobertor (efeito estufa), escada rolante, Pacífico/El Niño, 2D</div>
  </div>
);

export const HSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "TERRA + COBERTOR (FINO)", size: "início: pouco CO₂ · calor escapa", target: [0, 0, 0], fit: 4.6, az: 15, el: 10, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><Earth f={f} r={1} /><BlanketShell f={f} k={0.15} /><GreenhouseArrows shell={1.15} trapped={0} /></>) }} w={540} h={480} bg={SPACE} />
      <TileView t={{ name: "TERRA + COBERTOR (GROSSO)", size: "CO₂ engrossa · calor volta · fumaça", target: [0, 0, 0], fit: 4.6, az: 15, el: 10, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><Earth f={f} r={1} /><BlanketShell f={f} k={1} /><SmokePuffs f={f} /><GreenhouseArrows shell={1.28} trapped={1} /></>) }} w={540} h={480} bg={SPACE} />
    </div>
    <TileView t={{ name: "ESCADA ROLANTE + TERMÔMETRO", size: "aquecimento = escada que sobe sempre · mascote no degrau (no vídeo: pulo = El Niño)", target: [2.4, 1.6, 0], fit: 7.2, az: 24, el: 24, scene: (f) => (<><Escalator f={f} /><Mascot frame={f} position={escalatorTop(0.45)} scale={0.8} rotY={1.2} jump={0.3} /><group position={[6.2, 0.4, -1.0]}><Thermometer3D v={0.7} h={3.6} /></group></>) }} w={1080} h={500} bg={WARM} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "PACÍFICO NORMAL", size: "ventos levam a água quente p/ oeste · água fria sobe na América do Sul", target: [0, 0.0, 0], fit: 12.5, az: 12, el: 22, scene: (f) => <PacificSlice f={f} warm={0} /> }} w={540} h={420} bg={SPACE} />
      <TileView t={{ name: "PACÍFICO COM EL NIÑO", size: "ventos fracos · camada quente escorrega p/ leste · calor sobe", target: [0, 0.2, 0], fit: 12.5, az: 12, el: 22, scene: (f) => <PacificSlice f={f} warm={1} plumes={1} /> }} w={540} h={420} bg={SPACE} />
    </div>
    <div style={{ position: "relative", height: 400, background: SPACE, overflow: "hidden", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 14, top: 8, color: "#fff", fontWeight: 900, fontSize: 22 }}>2D: RECORDE DE OUTUBRO · PÓDIO (2027?) · +1,75 °C · GRÁFICO DO ACORDO DE PARIS</div>
      <div style={{ position: "absolute", left: 20, top: 60, transform: "scale(0.62)", transformOrigin: "0 0" }}><RecordCalendar stamp={1} /></div>
      <div style={{ position: "absolute", left: 230, top: 50, transform: "scale(0.62)", transformOrigin: "0 0" }}><HeatPodium k={1} y2027={1} /></div>
      <div style={{ position: "absolute", left: 20, top: 300, transform: "scale(0.5)", transformOrigin: "0 0" }}><TempCounter v={1.75} /></div>
      <div style={{ position: "absolute", left: 640, top: 60, transform: "scale(0.48)", transformOrigin: "0 0" }}><ParisGraph bars={1} draw={1} /></div>
    </div>
  </AbsoluteFill>
);
