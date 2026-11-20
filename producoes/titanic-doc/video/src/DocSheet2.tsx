import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Mascot } from "./components/Mascot";
import { worldScale } from "./components/Person";
import { Stars } from "./components/SpaceScene";
import { Iceberg, TitanicHero } from "./components/Doc3D";
import { BoatDeck, Californian, Carpathia, IceField, MarineSnow, Quay, Rocket, Rusticles, Seabed, Submersible, Treat } from "./components/Doc3D2";
import { Figure1912, type Role } from "./components/Figures1912";
import { Lifeboat, NightSea } from "./components/Titanic";
import { FONT } from "./theme";
import type { Vec3 } from "./utils/animation";

const NIGHT = "linear-gradient(180deg,#03050f 0%,#0a1430 60%,#13244a 100%)";
const DAY = "linear-gradient(180deg,#8fb4d4 0%,#cfdbe4 65%,#e8e2d2 100%)";
const DAWN = "linear-gradient(180deg,#1a2448 0%,#6a5a7a 45%,#e89a6a 72%,#f4c890 100%)";
const DEEP = "radial-gradient(circle at 60% 40%,#0c1a2a 0%,#020408 75%)";
const WS = worldScale(1);
const P = WS.person;

type Light = "studio" | "night" | "deep";
const CamTile: React.FC<{ name: string; size: string; pos: Vec3; target: Vec3; fov: number; w: number; h: number; bg: string; light?: Light; scene: (f: number) => React.ReactNode }> = ({ name, size, pos, target, fov, w, h, bg, light = "studio", scene }) => {
  const f = useCurrentFrame();
  const Cam = () => {
    usePose({ position: pos, target, fov });
    return null;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov, near: 0.1, far: 3000, position: pos }} onCreated={({ gl }) => { gl.localClippingEnabled = true; }}>
        <Cam />
        {light === "studio" ? <Lighting shadowExtent={30} /> : null}
        {light === "night" ? (
          <>
            <ambientLight intensity={0.35} color="#8aa0d0" />
            <hemisphereLight args={["#5a6a9a", "#101018", 0.5]} />
            <directionalLight position={[-30, 40, 20]} intensity={0.6} color="#a8b8e8" />
          </>
        ) : null}
        {light === "deep" ? (
          <>
            <ambientLight intensity={0.8} color="#6a8aaa" />
            <hemisphereLight args={["#4a6a8a", "#080a0c", 0.6]} />
            <directionalLight position={[20, 30, 10]} intensity={0.35} color="#8ab0d0" />
          </>
        ) : null}
        {scene(f)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>{name}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f0ebff" }}>{size}</div>
      </div>
    </div>
  );
};
const Water: React.FC<{ y: number; c?: string; size?: number }> = ({ y, c = "#2f5f88", size = 3000 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
    <planeGeometry args={[size, size]} />
    <meshBasicMaterial color={c} />
  </mesh>
);
const Header: React.FC = () => (
  <div style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 2 }}>DOCUMENTÁRIO TITANIC · DESIGNS (FOLHA 2)</div>
    <div style={{ fontWeight: 700, fontSize: 18, color: "#c4b5fd" }}>Southampton · navio se partindo · convés dos botes · Carpathia · Californian · destroços de 1985 · mascote</div>
  </div>
);
const CROWD: [Role, string?][] = [["gent"], ["lady"], ["lady", "#2a3a5a"], ["steerageMan"], ["steerageWoman"], ["child"], ["gent", "#2a2622"], ["officer"], ["lady", "#4a5a3a"], ["steerageMan", "#3a3a44"], ["steerageWoman", "#5a3a3a"], ["gent"]];
const BREAK = -2.0;

export const DocSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ display: "grid", gridTemplateColumns: "960px 960px" }}>
      <CamTile name="CAIS DE SOUTHAMPTON · 10/4/1912" size="multidão de época no cais · o mascote acena · navio em escala real" pos={[-27, 3.4, -12]} target={[-8, 12, 16]} fov={56} w={960} h={500} bg={DAY}
        scene={(f) => (<><Water y={-2} /><Quay /><group position={[30, -2, 17.5]} scale={10}><TitanicHero f={f} smoke={1} /></group>{CROWD.map(([r, t], i) => <Figure1912 key={i} role={r} tint={t} frame={f} position={[-30 + (i % 6) * 2.2 + (i > 5 ? 1 : 0), 1, -0.5 + (i > 5 ? -1.6 : 0)]} rotY={Math.PI * 0.15 + (i % 3) * 0.1} scale={P} seed={i} wave={i % 4 === 0 ? 1 : 0} />)}<Mascot frame={f} position={[-33.5, 1, 0.3]} scale={WS.mascot} rotY={0.6} wave={1} /></>)} />
      <CamTile name="O NAVIO SE PARTE · 2h17" size="proa debaixo d'água, popa erguida, casco rompendo entre a 3ª e a 4ª chaminé" pos={[-4, 2.2, 26]} target={[-2.5, 1.5, 0]} fov={44} w={960} h={500} bg={NIGHT} light="night"
        scene={(f) => (<><Stars count={900} radius={120} frame={f} /><NightSea f={f} size={160} seg={140} moonX={-30} />
          <group position={[BREAK + 0.6, -1.4, 0]} rotation={[0, 0, -0.32]}><group position={[-BREAK, 0, 0]}><Treat clip={{ normal: [1, 0, 0], constant: -BREAK }}><TitanicHero f={f} lights={0.3} /></Treat></group></group>
          <group position={[BREAK - 0.9, -0.1, 0]} rotation={[0, 0, -0.42]}><group position={[-BREAK, 0, 0]}><Treat clip={{ normal: [-1, 0, 0], constant: BREAK }}><TitanicHero f={f} lights={1} /></Treat><mesh position={[BREAK - 0.05, 0.6, 0]}><boxGeometry args={[0.06, 3.2, 2.7]} /><meshStandardMaterial color="#141016" flatShading /></mesh></group></group>
          {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[BREAK - 0.8 + (i % 5) * 0.4, 0.2 + Math.abs(Math.sin(f / 9 + i)) * 0.6, -1 + (i % 3)]} scale={0.25}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#e8f4fa" transparent opacity={0.6} depthWrite={false} /></mesh>)}
        </>)} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "960px 960px" }}>
      <CamTile name="CONVÉS DOS BOTES · 0h45" size="oficial organiza · 'mulheres e crianças primeiro' · foguete de socorro no céu" pos={[-6.8, 2.5, 0.2]} target={[3, 1.6, 3.4]} fov={58} w={960} h={540} bg={NIGHT} light="night"
        scene={(f) => (<><group position={[0, -18, 0]}><NightSea f={f} size={300} seg={90} /></group><group position={[30, 25, 60]}><Stars count={600} radius={80} frame={f} /></group><Rocket p={[14, 16, 30]} t={0.45} s={4} /><BoatDeck f={f} lower={0.08} />
          <Figure1912 role="officer" frame={f} position={[-2.6, 0, 1.6]} rotY={0.9} scale={P} point={1} seed={1} />
          <Figure1912 role="lady" frame={f} position={[-1.2, 0, 1.9]} rotY={0.4} scale={P} seed={2} />
          <Figure1912 role="child" frame={f} position={[-0.6, 0, 2.0]} rotY={0.5} scale={P} seed={3} />
          <Figure1912 role="gent" frame={f} position={[-3.8, 0, 0.6]} rotY={0.7} scale={P} seed={4} />
          <Figure1912 role="lady" tint="#2a3a5a" frame={f} position={[-4.6, 0, 1.2]} rotY={0.8} scale={P} seed={5} />
          <Figure1912 role="steerageWoman" frame={f} position={[-5.6, 0, 0.2]} rotY={0.6} scale={P} seed={6} />
          <Figure1912 role="seaman" frame={f} position={[1.6, 0, 2.2]} rotY={-1.2} scale={P} seed={7} />
          <Mascot frame={f} position={[-2.0, 0, -0.6]} scale={WS.mascot} rotY={1.2} look={-0.4} />
        </>)} />
      <CamTile name="O CARPATHIA CHEGA · 4h" size="amanhecer, mar cheio de gelo, botes se aproximando" pos={[-15, 2.8, 13]} target={[0, 1.6, 0]} fov={40} w={960} h={540} bg={DAWN} light="studio"
        scene={(f) => (<><NightSea f={f} size={200} seg={120} moonX={0} calm={0.6} /><group rotation={[0, 0.5, 0]}><Carpathia f={f} lights={0.7} smoke={1} /></group><IceField n={60} R={30} /><group position={[16, 0, -14]} scale={1.1}><Iceberg f={f} under={false} /></group><group position={[-14, 0, -18]} scale={0.7}><Iceberg f={f} seed={7} under={false} /></group>{[[-8, 6], [-11, 3], [-6, 9]].map(([x, z], i) => <group key={i} position={[x, 0.03, z]} rotation={[0, 0.6, 0]} scale={0.1}><Lifeboat f={f} people={6} /></group>)}</>)} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "640px 640px 640px" }}>
      <CamTile name="O CALIFORNIAN · PARADO NO GELO" size="quase às escuras · foguetes do Titanic no horizonte" pos={[-14, 2.6, 16]} target={[4, 2, -8]} fov={40} w={640} h={500} bg={NIGHT} light="night"
        scene={(f) => (<><Stars count={800} radius={120} frame={f} /><NightSea f={f} size={200} seg={120} calm={0.3} /><IceField n={70} R={22} seed="cf" /><group rotation={[0, -0.3, 0]}><Californian f={f} /></group><Rocket p={[60, 10, -90]} t={((f % 75) / 75) * 0.75 + 0.15} s={2.5} /></>)} />
      <CamTile name="OS DESTROÇOS · 1985 · ~3.800 m" size="proa enferrujada no fundo · submersível com faróis" pos={[17, 4.6, 9]} target={[7, 0.9, 0]} fov={44} w={640} h={500} bg={DEEP} light="deep"
        scene={(f) => (<><Seabed size={120} /><group position={[0, -0.7, 0]} rotation={[0.04, 0.2, -0.03]}><Treat clip={{ normal: [1, 0, 0], constant: 1.0 }} rust={0.82}><TitanicHero f={f} wreck /></Treat><Rusticles x0={2} x1={12.5} y={1.55} z={1.42} /></group><group position={[15.5, 2.3, 1.2]} rotation={[0, Math.PI + 0.35, -0.1]} scale={0.12}><Submersible f={f} /></group><MarineSnow f={f} R={14} H={8} /><pointLight position={[13, 3, 4]} intensity={6} distance={18} color="#cfe8ff" /></>)} />
      <CamTile name="O MASCOTE (PERSONAGEM SECUNDÁRIO)" size="aparece em 4 momentos: cais · convés · bote · submersível" pos={[0, 1.4, 7.5]} target={[0, 0.9, 0]} fov={40} w={640} h={500} bg="radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)"
        scene={(f) => (<><Mascot frame={f} position={[-2.1, 0, 0]} scale={WS.mascot} rotY={0.4} wave={1} /><Mascot frame={f} position={[-0.7, 0, 0]} scale={WS.mascot} rotY={0.2} point={1} /><group position={[0.9, 0.3, 0]} scale={0.32}><Lifeboat f={f} people={0} row={0} lamp={0} /></group><Mascot frame={f} position={[0.9, 0.24, 0]} scale={WS.mascot * 0.9} rotY={-0.3} sit={1} /><group position={[2.45, 0.7, 0]} rotation={[0, -0.6, 0]} scale={0.22}><Submersible f={f} beams={0} /></group><Mascot frame={f} position={[2.6, 0.5, 0.2]} scale={WS.mascot * 0.55} rotY={-0.5} /></>)} />
    </div>
  </AbsoluteFill>
);
