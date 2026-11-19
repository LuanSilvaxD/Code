import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Mascot } from "./components/Mascot";
import { Person, personLook, worldScale } from "./components/Person";
import { Stars } from "./components/SpaceScene";
import { Thermometer3D } from "./components/Heat";
import { Debris, LifeJacket, Lifeboat, Liner1912, MuseumCase, NightSea, SensorWire, TestTank, WaterSlice, WoodPanel, seaY } from "./components/Titanic";
import { SeriesTag } from "./components/Ptero2D";
import { CornerBug, HookText } from "./components/SunGone2D";
import { FONT } from "./theme";

const NIGHT = "linear-gradient(180deg,#05081a 0%,#0e1834 60%,#16264a 100%)";
const STUDIO = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const WS = worldScale(1);
const Header: React.FC = () => (
  <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: 2 }}>O JACK CABIA NA PORTA? · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · mar à noite, navio, painel, corte da flutuação, bote, tanque de teste</div>
  </div>
);
/** Pessoa deitada de costas sobre o painel (cabeça para +x). */
export const Lying: React.FC<{ f: number; p: [number, number, number]; seed: number }> = ({ f, p, seed }) => (
  <group position={p} rotation={[0, 0, -Math.PI / 2]}>
    <Person {...personLook(seed)} frame={f} position={[0, 0, 0]} scale={WS.person} rotY={-Math.PI / 2} seed={seed} />
  </group>
);
const Moon: React.FC = () => (
  <group position={[6, 9, -40]}>
    <mesh><circleGeometry args={[2.2, 40]} /><meshBasicMaterial color="#f2ead6" toneMapped={false} /></mesh>
    <mesh position={[0, 0, -0.1]}><circleGeometry args={[3.4, 40]} /><meshBasicMaterial color="#3a4a78" transparent opacity={0.35} depthWrite={false} /></mesh>
  </group>
);
export const TSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ position: "relative", width: 1080, height: 560 }}>
      <TileView t={{ name: "ABERTURA (FRAME 1)", size: "mar à noite · navio afundando ao longe · painel boiando · gancho", target: [0.3, 0.45, 0.4], fit: 4.2, az: 10, el: 9, scene: (f) => (<><Stars count={600} radius={70} frame={f} /><Moon /><NightSea f={f} /><group position={[-5, 0, -30]} scale={0.24}><Liner1912 f={f} sink={0.55} /></group><Debris f={f} /><group position={[0.3, seaY(0.3, 0.6, f) - 0.02, 0.6]} rotation={[0.03 * Math.sin(f / 20), 0.25, 0.02 * Math.sin(f / 27)]}><WoodPanel wet={0.4} /><Mascot frame={f} position={[-0.25, 0.08, 0]} scale={WS.mascot * 0.95} rotY={0.5} sit={1} look={-0.7} /><Person {...personLook(4)} frame={f} position={[1.25, -1.2, 0.1]} scale={WS.person} rotY={-Math.PI / 2 + 0.4} point={1} seed={4} /></group></>) }} w={1080} h={560} bg={NIGHT} />
      <div style={{ position: "absolute", inset: 0, transform: "scale(0.5)", transformOrigin: "50% 20%", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1120 }}>
          <CornerBug />
          <SeriesTag v={1} text="FILME × REALIDADE #2" top={60} />
          <HookText v={1} lines={[["CABIA", "#ffffff"], ["OS DOIS?", "#ffb02a"]]} top={760} />
        </div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "NAVIO DE 1912 (DESENHO PRÓPRIO)", size: "4 chaminés · escotilhas acesas · afunda pela proa", target: [0, 2.4, 0], fit: 32, az: 25, el: 8, scene: (f) => (<><Stars count={400} radius={60} frame={f} /><group position={[0, 0, 0]}><Liner1912 f={f} sink={0.2} /></group><group position={[0, 0, 0]} scale={0.6}><NightSea f={f} /></group></>) }} w={540} h={400} bg={NIGHT} />
      <TileView t={{ name: "NÃO ERA PORTA: PAINEL ENTALHADO", size: "moldura, medalhão, volutas · vitrine com o pedaço real", target: [0, 1.0, 0], fit: 3.4, az: 12, el: 10, scene: () => (<><group position={[-0.7, 1.05, 0]} rotation={[Math.PI / 2 - 0.15, 0, 0.0]}><group rotation={[0, 0, 0]}><WoodPanel s={0.85} /></group></group><group position={[0.95, 0, -0.1]} scale={0.8}><MuseumCase /></group></>) }} w={540} h={400} bg={STUDIO} />
      <TileView t={{ name: "CORTE: COM O COLETE, BOIA", size: "frente transparente · linha d'água · 2 pessoas + colete", target: [0, 0.0, 0], fit: 4.8, az: 10, el: 8, scene: (f) => (<><WaterSlice f={f} /><group position={[0, 0.02, 0]}><WoodPanel wet={0.5} /><group position={[0, -0.06, 0]}><LifeJacket s={1.3} /></group><Lying f={f} p={[0.05, 0.11, 0.2]} seed={4} /><Lying f={f} p={[-0.1, 0.11, -0.22]} seed={9} /></group></>) }} w={540} h={400} bg={STUDIO} />
      <TileView t={{ name: "BOTE SALVA-VIDAS (v2)", size: "baleeira de madeira · passageiros · remos · lanterna", target: [0.6, 0.3, 0], fit: 10, az: 28, el: 9, scene: (f) => (<><Stars count={400} radius={60} frame={f} /><NightSea f={f} size={40} /><group position={[0.6, 0.15, 0]} rotation={[0, -0.25, 0]}><Lifeboat f={f} /></group><group position={[-4.2, 0.2, 1.6]}><Thermometer3D v={0.12} h={2.2} /></group></>) }} w={540} h={400} bg={NIGHT} />
      <TileView t={{ name: "TANQUE DE TESTE (DUBLÊS)", size: "água gelada · sensores · monitor de temperatura", target: [0, 0.2, 0.4], fit: 7.2, az: 15, el: 26, scene: (f) => (<><TestTank f={f} /><group position={[0.3, -0.02, 0]} rotation={[0, 0.2, 0]}><WoodPanel wet={0.5} /><Lying f={f} p={[0.05, 0.1, 0.18]} seed={2} /><Lying f={f} p={[-0.1, 0.1, -0.22]} seed={11} /></group><SensorWire a={[0.4, 0.3, 0.1]} b={[-2.4, 1.3, 2.6]} /></>) }} w={540} h={400} bg={STUDIO} />
      <TileView t={{ name: "CORTE: SEM COLETE, AFUNDA", size: "os dois em cima → o corpo fica na água gelada", target: [0, 0.0, 0], fit: 4.8, az: 10, el: 8, scene: (f) => (<><WaterSlice f={f} /><group position={[0, -0.2, 0]}><WoodPanel wet={0.8} /><Lying f={f} p={[0.05, 0.11, 0.2]} seed={4} /><Lying f={f} p={[-0.1, 0.11, -0.22]} seed={9} /></group></>) }} w={540} h={400} bg={STUDIO} />
    </div>
  </AbsoluteFill>
);

export const TOpenCheck: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <TileView t={{ name: "", size: "", target: [0.3, 0.45, 0.4], fit: 4.2, az: 10, el: 9, scene: (f) => (<><Stars count={600} radius={70} frame={f} /><Moon /><NightSea f={f} /><Debris f={f} /><group position={[0.3, seaY(0.3, 0.6, f) - 0.02, 0.6]} rotation={[0.03 * Math.sin(f / 20), 0.25, 0.02 * Math.sin(f / 27)]}><WoodPanel wet={0.4} /><Mascot frame={f} position={[-0.25, 0.08, 0]} scale={WS.mascot * 0.95} rotY={0.5} sit={1} look={-0.7} /><Person {...personLook(4)} frame={f} position={[1.25, -1.2, 0.1]} scale={WS.person} rotY={-Math.PI / 2 + 0.4} point={1} seed={4} /></group></>) }} w={1080} h={1080} bg={NIGHT} />
  </AbsoluteFill>
);
