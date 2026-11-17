import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { LikeSubscribe } from "./components/LikeSubscribe";
import { Mascot } from "./components/Mascot";
import { AlignedOrbits, Nibiru, ObservatoryV2, OldObservatory, PlanetNine, Pluto } from "./components/PlanetX";
import { Planet, SolarSystem } from "./components/Solar";
import { Stars } from "./components/SpaceScene";
import { FONT } from "./theme";

const SPACE = "radial-gradient(circle at 50% 42%,#2a2260 0%,#0b0812 78%)";
const NIGHT = "linear-gradient(180deg,#0e1430 0%,#2a2a5a 70%,#5a4a6a 100%)";
const DUSK = "linear-gradient(180deg,#e8b070 0%,#c8a07a 60%,#8a8070 100%)";
const Header: React.FC = () => (
  <div style={{ height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 2 }}>PLANETA X · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 21, color: "#c4b5fd" }}>para aprovar · observatório v2, planetas, órbitas, curtir + inscrever</div>
  </div>
);

export const PXSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
      <Header />
      <TileView t={{ name: "OBSERVATÓRIO v2 (ESTILO RUBIN) · NOITE", size: "cume terraplanado · prédio com janelas · cúpula com fenda e persianas · telescópio de treliça", target: [0, 0.6, 0], fit: 7.2, az: 28, el: 14, scene: (f) => (<><Stars count={600} radius={60} frame={f} /><ObservatoryV2 f={f} night={1} scan={0.3} /><Mascot frame={f} position={[-0.2, 0.0, 1.2]} scale={0.3} rotY={0.4} /></>) }} w={1080} h={560} bg={NIGHT} />
      <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
        <TileView t={{ name: "OBSERVATÓRIO v2 · DIA", size: "mesma peça, luzes apagadas", target: [0.2, 0.7, 0], fit: 5.5, az: -30, el: 18, scene: (f) => <ObservatoryV2 f={f} night={0} scan={0.6} /> }} w={540} h={340} bg="linear-gradient(180deg,#6aa8d8,#cfe4ee)" />
        <TileView t={{ name: "OBSERVATÓRIO ANTIGO (~1900)", size: "torre de madeira, cúpula, refrator de latão", target: [-0.2, 0.9, 0], fit: 5.2, az: 20, el: 12, scene: (f) => <OldObservatory f={f} /> }} w={540} h={340} bg={DUSK} />
        <TileView t={{ name: "PLANETA NOVE (ILUSTRAÇÃO)", size: "gigante de gelo · 5–10 Terras", target: [0, 0, 0], fit: 4.4, az: 20, el: 10, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><PlanetNine f={f} /><group position={[1.9, -0.6, 0.5]}><Planet r={0.3} color="#3f8fe0" /></group></>) }} w={540} h={340} bg={SPACE} />
        <TileView t={{ name: "PLUTÃO × NETUNO", size: "pequeno demais", target: [0.6, 0, 0], fit: 4.4, az: 0, el: 6, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><group position={[-0.3, 0, 0]}><Planet r={1.2} color="#4a6ae0" spin={f * 0.01} /></group><group position={[1.9, 0, 0]}><Pluto f={f} r={0.22} /></group></>) }} w={540} h={340} bg={SPACE} />
        <TileView t={{ name: "NIBIRU (BOATO)", size: "planeta de desenho, claramente fictício", target: [-0.6, 0, 0], fit: 5, az: 10, el: 8, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><Nibiru f={f} /></>) }} w={540} h={340} bg={SPACE} />
        <TileView t={{ name: "ÓRBITAS ALINHADAS", size: "objetos distantes apontando para o mesmo lado · ESQUEMA", target: [-14, 0, 0], fit: 70, az: 0, el: 80, scene: (f) => (<><SolarSystem f={f} t={2} /><AlignedOrbits k={1} /></>) }} w={540} h={340} bg={SPACE} />
      </div>
      <div style={{ position: "relative", height: 300, background: SPACE, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 20, top: 12, fontFamily: FONT, color: "#fff", fontWeight: 900, fontSize: 26 }}>CURTIR + INSCREVER (CURSOR) · lateral, ~2,5 s</div>
        <div style={{ position: "absolute", left: 20, top: 46, fontFamily: FONT, color: "#c4b5fd", fontWeight: 700, fontSize: 18 }}>quadros: entrada → clique no polegar → clique no botão → saída</div>
        {[6, 20, 40, 60].map((t, i) => (
          <div key={i} style={{ position: "absolute", left: 20 + i * 262, top: 80, width: 250, height: 200, overflow: "hidden" }}>
            <div style={{ transform: "scale(0.6)", transformOrigin: "0 0", position: "absolute", left: 0, top: 0, width: 520, height: 300 }}>
              <LikeSubscribe t={t} top={30} side="left" />
            </div>
          </div>
        ))}
        <div style={{ display: "none" }}>{f}</div>
      </div>
    </AbsoluteFill>
  );
};
