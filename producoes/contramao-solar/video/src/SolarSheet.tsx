import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Mascot } from "./components/Mascot";
import { AlienStar, Observatory, ProtoDisk, r631Orbit, R631Orbit, Rock, SolarSystem } from "./components/Solar";
import { Stars } from "./components/SpaceScene";
import { FONT } from "./theme";

const SPACE = "radial-gradient(circle at 50% 42%,#2a2260 0%,#0b0812 78%)";
const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 22, color: "#c4b5fd" }}>{sub}</div>
  </div>
);

export const SolarSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="CONTRAMÃO · DESIGNS" sub="para aprovar · Sistema Solar, R631, observatório, disco, outra estrela" />
    <TileView t={{ name: "SISTEMA SOLAR + R631 NA CONTRAMÃO", size: "planetas ↺ (setas verdes) · órbita vermelha inclinada 142° · ESQUEMA", target: [0, 0, 0], fit: 20, az: 15, el: 34, scene: (f) => (<><Stars count={500} radius={80} frame={f} /><SolarSystem f={f} t={2} arrows={1} /><R631Orbit /><group position={r631Orbit(2.6)}><Rock s={0.45} /></group></>) }} w={1080} h={760} bg={SPACE} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "ROCHA R631", size: "~100 km (estimativa) · irregular", target: [0, 0, 0], fit: 3.2, az: 20, el: 15, scene: () => <Rock s={1} /> }} w={540} h={500} bg={SPACE} />
      <TileView t={{ name: "OBSERVATÓRIO (ESTILO RUBIN)", size: "montanha no Chile · cúpula cilíndrica + mascote", target: [0, 0.6, 0], fit: 5.5, az: 25, el: 14, scene: (f) => (<><Stars count={400} radius={60} frame={f} /><Observatory f={f} /><Mascot frame={f} position={[-0.3, 0.05, 1.3]} scale={0.32} rotY={0.4} /></>) }} w={540} h={500} bg={SPACE} />
      <TileView t={{ name: "DISCO DE GÁS (ORIGEM)", size: "form 0 → 1: grumos viram planetas", target: [0, 0, 0], fit: 13, az: 0, el: 55, scene: (f) => <ProtoDisk f={f * 8} form={0.25} /> }} w={540} h={500} bg={SPACE} />
      <TileView t={{ name: "OUTRA ESTRELA", size: "hipótese 2 · captura", target: [0, 0, 0], fit: 7, az: 0, el: 0, scene: (f) => (<><Stars count={400} radius={60} frame={f} /><AlienStar f={f} /><group position={[1.9, -0.8, 0]}><Rock s={0.3} /></group></>) }} w={540} h={500} bg={SPACE} />
    </div>
  </AbsoluteFill>
);
