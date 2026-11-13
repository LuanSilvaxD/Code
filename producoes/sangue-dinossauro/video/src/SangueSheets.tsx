import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Mascot } from "./components/Mascot";
import { Person, personLook } from "./components/Person";
import { AmberMosquito, BloodDrop, BoneSection, CanalClose, CretaceousDiorama, DNAHelix, FossilLeg, GypsumMine, Heme, Hourglass, Microscope, MuseumFacade, RBC } from "./components/Sangue";
import { Aratasaurus } from "./components/Dino";
import { FONT } from "./theme";

const PS = 1.7 / 1.8;
const DEEP = "radial-gradient(circle at 50% 45%,#3a1a20 0%,#120a0c 80%)";
const LAB = "radial-gradient(circle at 50% 45%,#22345e 0%,#0c1226 78%)";
const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 22, color: "#c4b5fd" }}>{sub}</div>
  </div>
);

export const SangueSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="CENÁRIOS" sub="para aprovar · metros · pessoa de 1,7 m" />
    <TileView t={{ name: "CRETÁCEO DO ARARIPE", size: "lagoa rasa · samambaias · coníferas · cavalinhas · mascote visitante", target: [0, 1.1, 0], fit: 9.5, az: 15, el: 14, scene: (f) => (<><CretaceousDiorama f={f} /><group position={[-0.6, 0, 0.6]}><Aratasaurus frame={f} walk={1} /></group><Mascot frame={f} position={[2.9, 0, 1.9]} scale={0.45} rotY={-0.8} /></>) }} w={1080} h={700} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "MINA DE GESSO (ESQUEMA)", size: "cava em degraus · camada cinza com o fóssil", target: [0, -2.2, 0.5], fit: 15, az: 30, el: 45, scene: (f) => (<><GypsumMine fossil={1} /><Person {...personLook(3)} frame={f} position={[1.8, -3.5, 1.2]} scale={PS} /></>) }} w={540} h={530} />
      <TileView t={{ name: "MUSEU (FACHADA GENÉRICA)", size: "sem logo · chamas estilizadas (2018)", target: [0, 3.4, 0], fit: 24, az: 12, el: 8, scene: (f) => (<><MuseumFacade f={f} fire={1} /><Person {...personLook(4)} frame={f} position={[4.5, 0, 3]} scale={PS} /></>) }} w={540} h={530} />
    </div>
  </AbsoluteFill>
);

export const SangueSheet3: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="DENTRO DO OSSO E O CLONE" sub="para aprovar · esquemáticos (fora de escala)" />
    <div style={{ display: "grid", gridTemplateColumns: "360px 360px 360px" }}>
      <TileView t={{ name: "FÓSSIL DA PERNA", size: "fêmur + tíbia parciais + pé (como o holótipo)", target: [0, 0.1, 0], fit: 3.4, az: 20, el: 22, scene: () => <FossilLeg glow={0.15} /> }} w={360} h={440} bg={LAB} />
      <TileView t={{ name: "CORTE DO OSSO", size: "canais vasculares (sangue = vida)", target: [0, 0, 0], fit: 3.2, az: 0, el: 70, scene: (f) => <BoneSection f={f} flow={0.8} /> }} w={360} h={440} bg={LAB} />
      <TileView t={{ name: "CANAL AMPLIADO", size: "\"hemácias\" minerais presas", target: [0, 0, 0], fit: 6.4, az: 20, el: 10, scene: (f) => <CanalClose f={f} /> }} w={360} h={440} bg={DEEP} />
      <TileView t={{ name: "ESPERADA × ACHADA", size: "abaulada c/ núcleo × côncava", target: [0, 0, 0], fit: 3.2, az: 0, el: 32, scene: () => (<><group position={[-0.8, 0, 0]} rotation={[0, 0, 0]}><RBC kind="domed" s={0.65} /></group><group position={[0.8, 0, 0]} rotation={[0, 0, 0]}><RBC kind="concave" s={0.65} /></group></>) }} w={360} h={440} bg={DEEP} />
      <TileView t={{ name: "HEME", size: "anel + ferro (dourado) + O₂", target: [0, 0, 0], fit: 4.2, az: 0, el: 10, scene: (f) => <Heme f={f} o2={0.7} /> }} w={360} h={440} bg={DEEP} />
      <TileView t={{ name: "NÃO É LÍQUIDO", size: "gota → pó", target: [0, 0.2, 0], fit: 3.2, az: 0, el: 10, scene: () => (<><group position={[-0.7, 0, 0]}><BloodDrop /></group><group position={[0.8, 0, 0]}><BloodDrop brk={0.5} /></group></>) }} w={360} h={440} bg={DEEP} />
      <TileView t={{ name: "DNA (INTEIRO × 50%)", size: "degraus caem com o tempo", target: [0, 0, 0], fit: 5.2, az: 0, el: 6, scene: (f) => (<><group position={[-1.1, 0, 0]}><DNAHelix f={f} /></group><group position={[1.1, 0, 0]}><DNAHelix f={f} decay={0.5} /></group></>) }} w={360} h={440} bg={LAB} />
      <TileView t={{ name: "ÂMBAR + AMPULHETA", size: "mosquito preso · ~500 anos", target: [0, 0, 0], fit: 5.4, az: 0, el: 8, scene: (f) => (<><group position={[-1.1, 0, 0]}><AmberMosquito f={f} s={0.9} /></group><group position={[1.4, 0, 0]}><Hourglass f={f} s={0.8} /></group></>) }} w={360} h={440} bg={LAB} />
      <TileView t={{ name: "MASCOTE NO MICROSCÓPIO", size: "metros", target: [0, 0.55, 0], fit: 2.2, az: 25, el: 10, scene: (f) => (<><mesh position={[0.3, 0.38, 0]}><boxGeometry args={[0.9, 0.04, 0.5]} /><meshStandardMaterial color="#6b5040" /></mesh><group position={[0.35, 0.4, 0]}><Microscope /></group><Mascot frame={f} position={[-0.3, 0, 0.1]} scale={0.5} rotY={1.2} point={1} /></>) }} w={360} h={440} bg={LAB} />
    </div>
  </AbsoluteFill>
);
