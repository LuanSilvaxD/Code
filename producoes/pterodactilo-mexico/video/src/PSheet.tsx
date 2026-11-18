import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Aratasaurus } from "./components/Dino";
import { Mascot } from "./components/Mascot";
import { Stars } from "./components/SpaceScene";
import { Asteroid, BorderMap, FamilyTree, Giraffe, HeronFly, JuarezNight, MapPin, PLACES, Quetzalcoatlus } from "./components/Ptero";
import { CctvFrame, SeriesTag } from "./components/Ptero2D";
import { CornerBug, HookText } from "./components/SunGone2D";
import { FONT } from "./theme";

const NIGHT = "linear-gradient(180deg,#0a0c22 0%,#1c1838 60%,#2a2040 100%)";
const STUDIO = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const Header: React.FC = () => (
  <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: 2 }}>PTERODÁCTILO NO MÉXICO? · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>para aprovar · Juárez à noite, Quetzalcoatlus, escala, mapa, câmera, silhuetas, árvore</div>
  </div>
);
export const PSheet: React.FC = () => {
  const f0 = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
      <Header />
      <div style={{ position: "relative", width: 1080, height: 560 }}>
        <TileView t={{ name: "ABERTURA (FRAME 1)", size: "noite em Ciudad Juárez · silhueta cruzando a lua · gancho + selo", target: [0.6, 1.4, -1.5], fit: 10, az: 0, el: 6, scene: (f) => (<><Stars count={500} radius={60} frame={f} /><JuarezNight f={f} /><group position={[1.2, 4.2, -6]} rotation={[0.25, 0.3, 0.15]} scale={0.32}><Quetzalcoatlus f={f} sil={1} flap={0.9} /></group><Mascot frame={f} position={[-2.8, 0.95, 0.4]} scale={0.3} rotY={0.4} look={0.5} /></>) }} w={1080} h={560} bg={NIGHT} />
        <div style={{ position: "absolute", inset: 0, transform: "scale(0.5)", transformOrigin: "50% 20%", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1120 }}>
            <CornerBug />
            <SeriesTag v={1} top={170} />
            <HookText v={1} lines={[["PTERODÁCTILO", "#ffffff"], ["NO MÉXICO?", "#ffb02a"]]} top={250} />
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
        <TileView t={{ name: "QUETZALCOATLUS (NOVO)", size: "pterossauro gigante · bico enorme, crista, asa de pele", target: [1.0, 0.3, 0.3], fit: 10, az: 40, el: 30, scene: (f) => <Quetzalcoatlus f={f} flap={0.6} /> }} w={540} h={400} bg={STUDIO} />
        <TileView t={{ name: "ESCALA: ~11 M DE ASA", size: "girafa (5 m) e mascote (1,6 m) como régua", target: [0, 2.3, 0], fit: 12.5, az: 0, el: 8, scene: (f) => (<><mesh position={[0, -0.05, 0]} receiveShadow><boxGeometry args={[13, 0.1, 4]} /><meshStandardMaterial color="#8a7a5a" /></mesh><group position={[0.4, 3.6, -0.6]} rotation={[0.25, -Math.PI / 2, 0]}><Quetzalcoatlus f={f} flap={0.25} /></group><group position={[-4.2, 0, 0.8]} rotation={[0, 0.5, 0]}><Giraffe f={f} /></group><Mascot frame={f} position={[3.4, 0, 1.0]} scale={0.97} rotY={-0.6} wave={1} /></>) }} w={540} h={400} bg={STUDIO} />
        <TileView t={{ name: "MAPA: FRONTEIRA + CHICXULUB", size: "Juárez · Big Bend (Texas) · asteroide no Iucatã", target: [-1.6, 0, 0.4], fit: 9.5, az: 0, el: 62, scene: (f) => (<><BorderMap f={f} crater={1} line={1} /><MapPin p={PLACES.juarez} c="#ffb02a" /><MapPin p={PLACES.bigbend} c="#ff4a3d" /><Asteroid from={[PLACES.chicxulub[0] + 2, 4, PLACES.chicxulub[2] - 2]} to={PLACES.chicxulub} t={0.55} f={f} /></>) }} w={540} h={400} bg="#0b1a2e" />
        <div style={{ position: "relative", width: 540, height: 400, overflow: "hidden" }}>
          <TileView t={{ name: "", size: "", target: [0.8, 3.6, -5], fit: 6, az: 0, el: -10, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><JuarezNight f={f} /><group position={[0.4 + ((f0 % 60) / 60) * 0.1, 3.6, -5]} rotation={[0.3, 0.5, 0]} scale={0.22}><Quetzalcoatlus f={f} sil={1} /></group></>) }} w={540} h={400} bg={NIGHT} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.5) translateY(-560px)", transformOrigin: "0 0" }}>
            <CctvFrame f={f0} v={1} secs={1.5} w={1080} h={1920} />
          </div>
          <div style={{ position: "absolute", left: 14, top: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px #000" }}>
            <div style={{ fontWeight: 900, fontSize: 22 }}>CÂMERA DE SEGURANÇA (2D)</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>granulado · REC · data/hora · cronômetro 1,5 s</div>
          </div>
        </div>
        <TileView t={{ name: "SILHUETAS: VÍDEO × AVE GRANDE", size: "pescoço dobrado + pernas para trás = forma 'pré-histórica'", target: [0, 0, 0], fit: 4.2, az: 0, el: 12, scene: (f) => (<><group position={[-1.0, 0.1, 0]} rotation={[1.35, 0, 0.45]} scale={0.15}><Quetzalcoatlus f={f} sil={1} /></group><group position={[1.0, 0.1, 0]} rotation={[1.35, 0, 0.45]} scale={0.85}><HeronFly f={f} sil={0} /></group></>) }} w={540} h={400} bg="linear-gradient(180deg,#6a7a9a,#c8c4d8)" />
        <TileView t={{ name: "ÁRVORE DA FAMÍLIA", size: "arcossauros → dinossauros | pterossauros", target: [0, 2.0, 0], fit: 7, az: 0, el: 10, scene: (f) => (<><FamilyTree grow={1} /><group position={[-2.1, 2.95, 0]} scale={0.32}><Aratasaurus frame={f} /></group><group position={[2.1, 3.3, 0]} rotation={[0.5, -0.6, 0]} scale={0.22}><Quetzalcoatlus f={f} flap={0.4} /></group></>) }} w={540} h={400} bg={STUDIO} />
      </div>
    </AbsoluteFill>
  );
};
