import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { BlackHole, Clock3D, CmbParticles, Earth, GiantWave, GpsSat, gridY, OceanPlanet, OceanSurface, SpacetimeGrid } from "./components/Interstellar";
import { Clock2D, DayCounter, PhoneMap, SpinGauge, Thermo, YearsCard } from "./components/Interstellar2D";
import { Mascot } from "./components/Mascot";
import { SeriesCard } from "./components/Series";
import { Stars } from "./components/SpaceScene";
import { VerdictMeter } from "./components/Verdict";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

const SPACE = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const SEA = "linear-gradient(180deg,#0b0812 0%,#1a1438 45%,#4a3a5a 70%,#8a6a5a 100%)";
const FOV = 14;
/** posição da câmera de um TileView (para o buraco negro virar a "imagem" para ela). */
const camOf = (target: Vec3, fit: number, az: number, el: number, w: number, h: number): Vec3 => orbit(target, fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * Math.min(1, w / h)), az, el).position;
const Header: React.FC = () => (
  <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 2 }}>FILME × REALIDADE #1 · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · buraco negro, planeta-oceano, onda gigante, GPS, malha do espaço-tempo, 2D</div>
  </div>
);

export const ISheet: React.FC = () => {
  const f = useCurrentFrame();
  const bhCam = camOf([0, 0, 0], 11, 20, 14, 1080, 600);
  return (
    <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
      <Header />
      <TileView t={{ name: "BURACO NEGRO (GENÉRICO) + PLANETA-OCEANO", size: "sombra · anel de luz · disco girando · imagem do disco curvada pela gravidade", target: [0, 0, 0], fit: 11, az: 20, el: 14, scene: (f) => (<><Stars count={900} radius={70} frame={f} /><BlackHole f={f} r={1.2} camera={bhCam} spin={0.5} /><group position={[3.4, -0.9, 3]}><OceanPlanet f={f} r={0.4} /></group><Mascot frame={f} position={[-3.2, 0.6, 3]} scale={0.7} rotY={0.5} /></>) }} w={1080} h={600} bg={SPACE} />
      <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
        <TileView t={{ name: "POUSO: OCEANO RASO + ONDA GIGANTE", size: "mascote com água no tornozelo · buraco negro no céu", target: [0, 3.4, -4], fit: 13, az: 8, el: 2, scene: (f) => (<><group position={[6, 11, -48]}><BlackHole f={f} r={3.2} camera={[0, 3, 30]} world={[6, 11, -48]} spin={0.5} tilt={0.3} /></group><OceanSurface f={f} wave={0} /><group position={[0, 0, -12]}><GiantWave f={f} h={9} /></group><Mascot frame={f} position={[0.4, -0.08, 2.2]} scale={0.55} rotY={2.8} /></>) }} w={540} h={420} bg={SEA} />
        <TileView t={{ name: "PLANETA-OCEANO DE PERTO", size: "água rasa · bancos claros", target: [0, 0, 0], fit: 3.2, az: 10, el: 10, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><OceanPlanet f={f} r={1} /></>) }} w={540} h={420} bg={SPACE} />
        <TileView t={{ name: "TERRA + SATÉLITE DE GPS", size: "manta dourada · painéis · luz do relógio atômico", target: [0, 0.4, 0], fit: 5.6, az: 20, el: 12, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><group position={[0, -1.6, 0]}><Earth f={f} r={1.4} /></group><group position={[0.4, 1.3, 0.5]} rotation={[0.2, 0.5, 0.1]}><GpsSat s={0.9} clockGlow={1} /></group></>) }} w={540} h={420} bg={SPACE} />
        <TileView t={{ name: "MALHA DO ESPAÇO-TEMPO (ESQUEMA)", size: "perto = relógio lento · longe = rápido", target: [0, -1.6, 0], fit: 13, az: 20, el: 30, scene: (f) => (<><SpacetimeGrid depth={1} /><BlackHole f={f} r={0.7} camera={camOf([0, -1.6, 0], 13, 20, 30, 540, 420)} world={[0, -3.6, 0]} /><group position={[0, -3.6, 0]} /><group position={[1.6, gridY(1.6, 0) + 0.3, 0]} rotation={[0.9, 0, 0]}><Clock3D t={f * 0.01} r={0.75} /></group><group position={[4.5, gridY(4.5, 1.5) + 0.3, 1.5]} rotation={[0.9, 0, 0]}><Clock3D t={f * 0.12} r={0.75} /></group></>) }} w={540} h={420} bg={SPACE} />
        <TileView t={{ name: "BRILHO DO BIG BANG ESQUENTANDO", size: "azul longe → laranja perto · ILUSTRAÇÃO", target: [0, 0, 0], fit: 12, az: 0, el: 5, scene: (f) => (<><CmbParticles t={f / 60} /><OceanPlanet f={f} r={1} /></>) }} w={540} h={420} bg={SPACE} />
        <div style={{ position: "relative", width: 540, height: 420, background: SPACE, overflow: "hidden", fontFamily: FONT }}>
          <div style={{ position: "absolute", left: 14, top: 10, color: "#fff", fontWeight: 900, fontSize: 22 }}>CARTÃO DO QUADRO + VEREDITO</div>
          <div style={{ position: "absolute", left: -270, top: -230, width: 1080, transform: "scale(0.5)", transformOrigin: "50% 0" }}><div style={{ position: "relative", height: 900 }}><SeriesCard v={1} top={380} /></div></div>
          <div style={{ position: "absolute", left: 60, top: 220, width: 1080, transform: "scale(0.62)", transformOrigin: "0 0" }}><div style={{ position: "relative", left: -330 }}><VerdictMeter show={1} needle={58} size={420} top={0} labels={["✖ NÃO FUNCIONA", "FUNCIONA ✔"]} /></div></div>
        </div>
      </div>
      <div style={{ position: "relative", height: 470, background: SPACE, overflow: "hidden", fontFamily: FONT }}>
        <div style={{ position: "absolute", left: 14, top: 8, color: "#fff", fontWeight: 900, fontSize: 22 }}>2D: RELÓGIO × CALENDÁRIO · DIAS POR TIC · GPS NO CELULAR · ROTAÇÃO · TERMÔMETRO · VEREDITO</div>
        {[
          { x: 10, y: 80, el: <Clock2D ticks={f / 42} size={300} /> },
          { x: 160, y: 80, el: <YearsCard years={7} /> },
          { x: 300, y: 90, el: <DayCounter ticks={23.1} /> },
          { x: 500, y: 60, el: <PhoneMap drift={0.7} fix={0} w={300} /> },
          { x: 650, y: 70, el: <SpinGauge v={0.999} size={420} /> },
          { x: 850, y: 60, el: <Thermo v={0.7} /> },
        ].map((it, i) => (
          <div key={i} style={{ position: "absolute", left: it.x, top: it.y, transform: "scale(0.42)", transformOrigin: "0 0" }}>{it.el}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
