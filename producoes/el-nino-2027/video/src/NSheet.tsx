import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { PacificSlice } from "./components/Heat";
import { OceanSurface } from "./components/Interstellar";
import { Mascot } from "./components/Mascot";
import { BrazilMap, FishingBoat, StrawHat } from "./components/Nino";
import { IntensityMeter, NinoTimeline, XmasCalendar } from "./components/Nino2D";
import { FONT } from "./theme";

const SPACE = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const DUSK = "linear-gradient(180deg,#1a1438 0%,#5a3a5a 55%,#d88a5a 100%)";
const Header: React.FC = () => (
  <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 2 }}>EL NIÑO 2026–2027 · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · barco de pesca, mapa do Brasil 3D, linha do tempo, medidor</div>
  </div>
);

export const NSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "BARCO DE PESCA (PERU)", size: "referências geek: chapéu de palha · 42 no casco · patinho de borracha", target: [0.1, 0.55, 0], fit: 3.2, az: 35, el: 14, scene: (f) => (<><group position={[0, -0.02, 0]}><OceanSurface f={f} size={14} /></group><FishingBoat f={f} /><Mascot frame={f} position={[0.12, 0.36, 0.12]} scale={0.26} rotY={1.0} /><group position={[0.12, 0.36 + 0.26 * 1.85, 0.12]} rotation={[0.08, 0, -0.1]}><StrawHat s={0.26} /></group></>) }} w={540} h={480} bg={DUSK} />
      <TileView t={{ name: "BARCO NA COSTA (DIORAMA)", size: "perto dos Andes, Pacífico em El Niño", target: [4.6, 0.5, 0.6], fit: 6.0, az: 40, el: 22, scene: (f) => (<><PacificSlice f={f} warm={1} /><group position={[4.0, 0.0, 1.0]} rotation={[0, 0.6, 0]}><FishingBoat f={f} s={0.7} /></group></>) }} w={540} h={480} bg={SPACE} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "BRASIL 3D (NORMAL)", size: "regiões · Amazônia com floresta e rio · ESQUEMA", target: [0, 0, 0.3], fit: 6.4, az: 0, el: 52, scene: (f) => <BrazilMap f={f} /> }} w={540} h={600} bg={SPACE} />
      <TileView t={{ name: "BRASIL 3D (EL NIÑO)", size: "N/NE seco + fogo · Sul azul + temporal", target: [0, 0.2, 0.3], fit: 6.4, az: 0, el: 52, scene: (f) => <BrazilMap f={f} dryN={0.7} dryNE={1} wetS={1} fire={1} storm={1} bolt={1} /> }} w={540} h={600} bg={SPACE} />
    </div>
    <div style={{ position: "relative", height: 580, background: SPACE, overflow: "hidden", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 14, top: 8, color: "#fff", fontWeight: 900, fontSize: 22 }}>2D: MEDIDOR DE INTENSIDADE · CALENDÁRIO DO NATAL · LINHA DO TEMPO (PREVISÃO)</div>
      <div style={{ position: "absolute", left: 30, top: 60, transform: "scale(0.6)", transformOrigin: "0 0" }}><IntensityMeter v={0.95} /></div>
      <div style={{ position: "absolute", left: 60, top: 200, transform: "scale(0.85)", transformOrigin: "0 0" }}><XmasCalendar star={1} /></div>
      <div style={{ position: "absolute", left: 500, top: 60, transform: "scale(0.62)", transformOrigin: "0 0" }}><NinoTimeline draw={1} peak={1} neutral={1} /></div>
    </div>
  </AbsoluteFill>
);
