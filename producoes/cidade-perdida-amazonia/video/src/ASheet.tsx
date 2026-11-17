import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { CasarabeMound, DIO_W, LidarPlane, Rainforest, RatanabaFake, UpanoGrid } from "./components/Amazon";
import { BigCount, HeightTag, TimeRuler, ViralCard } from "./components/Amazon2D";
import { Mascot } from "./components/Mascot";
import { VerdictMeter } from "./components/Verdict";
import { FONT } from "./theme";

const SKY = "linear-gradient(180deg,#1a1438 0%,#2a3a4a 60%,#4a6a5a 100%)";
const NIGHT = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const Header: React.FC = () => (
  <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 36, letterSpacing: 2 }}>CIDADE PERDIDA NA AMAZÔNIA · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · floresta + laser LiDAR, Ratanabá (boato), Upano, Casarabe, 2D</div>
  </div>
);

export const ASheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <TileView t={{ name: "LIDAR: O LASER QUE 'ENXERGA' POR BAIXO DAS ÁRVORES", size: "avião varre a mata · onde o laser passa, as árvores somem e aparece a cidade escondida", target: [0, 0.4, 0], fit: 10.5, az: 18, el: 30, scene: (f) => (<><Rainforest f={f} scanX={0.6} scanW={0.7}><UpanoGrid k={1} roads={1} /></Rainforest><group position={[0.6, 0, 0]}><LidarPlane f={f} h={2.6} /></group></>) }} w={1080} h={560} bg={SKY} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "FLORESTA (ANTES)", size: "copas densas, rio, diorama em corte", target: [0, 0.2, 0], fit: DIO_W + 0.6, az: 20, el: 32, scene: (f) => <Rainforest f={f}><UpanoGrid k={1} /></Rainforest> }} w={540} h={420} bg={SKY} />
      <TileView t={{ name: "UPANO (EQUADOR) REVELADO", size: "plataformas de terra + praças + estradas retas", target: [0, 0.1, 0], fit: DIO_W - 1, az: 10, el: 50, scene: (f) => <Rainforest f={f} revealed={1}><UpanoGrid k={1} roads={1} /></Rainforest> }} w={540} h={420} bg={SKY} />
      <TileView t={{ name: "\"RATANABÁ\" (BOATO)", size: "pirâmides douradas de 'lenda' — de propósito fantasioso", target: [0, 1.0, 0.6], fit: 6.5, az: 15, el: 14, scene: (f) => (<><Rainforest f={f} /><RatanabaFake f={f} /></>) }} w={540} h={420} bg={NIGHT} />
      <TileView t={{ name: "CASARABE (BOLÍVIA)", size: "pirâmide até 22 m · mascote na base em ESCALA REAL (1 pessoa)", target: [0.6, 0.6, 0.3], fit: 6.8, az: 28, el: 22, scene: (f) => (<><CasarabeMound k={1} water={1} /><Mascot frame={f} position={[1.25, 0.0, 1.1]} scale={0.075} rotY={-0.6} /></>) }} w={540} h={420} bg={SKY} />
    </div>
    <div style={{ position: "relative", height: 460, background: NIGHT, overflow: "hidden", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 14, top: 8, color: "#fff", fontWeight: 900, fontSize: 22 }}>2D: POST VIRAL · LINHA DO TEMPO REAL · CONTADOR · VEREDITO DUPLO</div>
      <div style={{ position: "absolute", left: 20, top: 50, transform: "scale(0.6)", transformOrigin: "0 0" }}><ViralCard views={2400000} t={20} /></div>
      <div style={{ position: "absolute", left: 360, top: 50, transform: "scale(0.6)", transformOrigin: "0 0" }}><TimeRuler k={1} dino={1} human={1} /></div>
      <div style={{ position: "absolute", left: 30, top: 270, transform: "scale(0.55)", transformOrigin: "0 0" }}><BigCount v={6000} label="PLATAFORMAS DE TERRA" /></div>
      <div style={{ position: "absolute", left: 360, top: 300, transform: "scale(0.55)", transformOrigin: "0 0" }}><HeightTag /></div>
      <div style={{ position: "absolute", left: 560, top: 240, width: 1080, transform: "scale(0.5)", transformOrigin: "0 0" }}><div style={{ position: "relative", left: -330 }}><VerdictMeter show={1} needle={70} size={420} top={0} /></div></div>
      <div style={{ position: "absolute", left: 820, top: 250, fontWeight: 900, fontSize: 20, lineHeight: 1.5 }}><div style={{ color: "#ff4a3d" }}>RATANABÁ: BOATO</div><div style={{ color: "#3fd27a" }}>CIDADES ANTIGAS: VERDADE</div></div>
    </div>
  </AbsoluteFill>
);
