import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { usePose } from "./components/CameraController";
import { Mascot } from "./components/Mascot";
import { PostFx3D } from "./components/PostFx3D";
import { Stars } from "./components/SpaceScene";
import { Earth } from "./components/Interstellar";
import { GoldenRecord, Heliosphere, SignalPulse, SunGlow, Voyager } from "./components/Voyager";
import { FONT } from "./theme";
import type { Vec3 } from "./utils/animation";

// Folha de design: Voyager 1, disco de ouro, bolha do Sol, sinal de rádio, mascote como régua de escala.
const SpaceLight: React.FC<{ sun?: Vec3 }> = ({ sun = [-8, 4, 6] }) => (
  <>
    <ambientLight intensity={0.55} color="#9aa0c8" />
    <hemisphereLight args={["#c8c0ff", "#1a1430", 0.5]} />
    <directionalLight position={sun} intensity={2.4} color="#fff3dc" />
    <directionalLight position={[6, -2, -6]} intensity={0.5} color="#8b5cf6" />
  </>
);

const Tile: React.FC<{ name: string; sub: string; w: number; h: number; pos: Vec3; target: Vec3; fov: number; glow?: number; scene: (f: number) => React.ReactNode }> = ({ name, sub, w, h, pos, target, fov, glow = 0.8, scene }) => {
  const f = useCurrentFrame();
  const Cam = () => { usePose({ position: pos, target, fov }); return null; };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: "radial-gradient(circle at 50% 40%,#141030 0%,#05040c 80%)", outline: "1px solid rgba(139,92,246,0.35)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} flat camera={{ fov, near: 0.02, far: 2000, position: pos }}>
        <Cam />
        <Stars count={500} radius={300} frame={f} />
        {scene(f)}
        {glow > 0 ? <PostFx3D bloom={glow} threshold={0.7} /> : null}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 16, top: 12, right: 12, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
        <div style={{ fontWeight: 900, fontSize: 24 }}>{name}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#d8ccff" }}>{sub}</div>
      </div>
    </div>
  );
};

export const VoyagerSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0812", padding: 24, fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 2 }}>FOLHA DE DESIGN · VOYAGER 1 <span style={{ color: "#c4b5fd", fontSize: 24 }}>· "A Voyager chegou a 1 dia-luz"</span></div>
    <div style={{ fontSize: 18, color: "#b9b0d8", margin: "4px 0 14px" }}>Desenho próprio com proporções reais (antena 3,7 m · corpo 1,78 m · haste do magnetômetro 13 m · antenas de rádio 10 m). 1 u = 1 m.</div>
    <div style={{ display: "flex", gap: 12 }}>
      <Tile name="VOYAGER 1 · 3/4 TRÁS" sub="corpo decagonal dourado, geradores, câmeras, magnetômetro e antenas de rádio" w={1150} h={700} pos={[7, 3.4, -8.5]} target={[0.4, 0.1, 0]} fov={36}
        scene={(f) => (<><SpaceLight /><group rotation={[0, -0.2, 0]}><Voyager f={f} mag={0.42} whips={0.45} /></group></>)} />
      <Tile name="FRENTE 3/4 · ESCALA" sub="antena de 3,7 m (subrefletor no foco) · mascote de 1,6 m" w={710} h={700} pos={[3.5, 1.6, 10]} target={[-0.6, 0.0, 0]} fov={34}
        scene={(f) => (<><SpaceLight sun={[4, 6, 8]} /><group rotation={[0, 0.5, 0]}><Voyager f={f} mag={0.3} whips={0.35} /></group><Mascot frame={f} position={[-2.9, -0.9, 1.6]} scale={1} float={1} rotY={0.5} wave={1} happy={1} /></>)} />
    </div>
    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
      <Tile name="GERADORES DE PLUTÔNIO" sub="3 cilindros com aletas · brilho laranja = energia (cai no vídeo)" w={612} h={480} pos={[-2.4, 1.1, -2.6]} target={[-2.0, -0.1, -0.15]} fov={36} glow={1}
        scene={(f) => (<><SpaceLight /><Voyager f={f} rtg={1} mag={0} whips={0} /></>)} />
      <Tile name="PLATAFORMA DE CÂMERAS" sub="haste de ciência · luzes de status (apagam uma a uma)" w={612} h={480} pos={[3.8, 0.6, -2.4]} target={[1.9, -0.4, 0]} fov={38}
        scene={(f) => (<><SpaceLight /><Voyager f={f} mag={0} whips={0} lights={4} /></>)} />
      <Tile name="DISCO DE OURO" sub="sulcos, rótulo · à direita com a capa de alumínio" w={612} h={480} pos={[0, 0, 0.75]} target={[0, 0, 0]} fov={36} glow={0.6}
        scene={() => (<><SpaceLight sun={[2, 3, 4]} /><group position={[-0.19, 0, 0]}><GoldenRecord /></group><group position={[0.19, 0, 0]}><GoldenRecord cover={1} /></group></>)} />
    </div>
    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
      <Tile name="BOLHA DO SOL (HELIOSFERA)" sub="esquemática · borda acende quando a nave atravessa (2012)" w={930} h={330} pos={[2, 9, 30]} target={[-1, 0, 0]} fov={40} glow={1}
        scene={(f) => (<><Heliosphere f={f} R={9} glow={0.8} /><SunGlow r={0.7} /><group position={[9.6, 1.2, 2]} scale={0.18}><Voyager f={f} mag={0} whips={0} /></group><ambientLight intensity={0.6} /></>)} />
      <Tile name="SINAL DE RÁDIO" sub="pulso de luz Terra → nave (régua de 1 dia-luz)" w={930} h={330} pos={[0, 2.5, 12]} target={[0, 0, 0]} fov={40} glow={1}
        scene={(f) => (<><SpaceLight /><group position={[-6, 0, 0]} scale={0.45}><Earth f={f} /></group><SignalPulse from={[-5.4, 0, 0]} to={[4.5, 0, 0]} t={0.62} size={0.45} /><group position={[5.4, 0, 0]} scale={0.35} rotation={[0, -Math.PI / 2, 0]}><Voyager f={f} mag={0} whips={0} /></group></>)} />
    </div>
  </AbsoluteFill>
);
