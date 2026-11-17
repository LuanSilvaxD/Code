import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { EARTH, ESC, PAC, THERMO_AT } from "../data/heat";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { BlanketShell, Escalator, GreenhouseArrows, PacificSlice, SmokePuffs, Thermometer3D } from "./Heat";
import { Earth } from "./Interstellar";
import { Stars } from "./SpaceScene";

// Mundos do "Por que 2026 está tão quente?". Tudo lê track("alvo.prop", frameGlobal). Posições em data/heat.ts.

/** Luz que acompanha o alvo da câmera (a sombra cobre só o que está em quadro). */
export const KolaLighting: React.FC = () => {
  const f = useCurrentFrame();
  const pose = cameraPoseAt(f);
  const d = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const ext = clamp(d * 0.55, 0.4, 12);
  const myth = 0;
  const k = 1 - 0.3 * myth;
  const t = pose.target;
  const L: Vec3 = [t[0] + ext * 1.2, t[1] + ext * 2.2, t[2] + ext * 1.4];
  return (
    <>
      <ambientLight intensity={LIGHTING.ambient * k} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity * k]} />
      <directionalLight
        position={L}
        target-position={t}
        intensity={LIGHTING.key.intensity * k}
        color={new Color(LIGHTING.key.color).lerp(new Color("#ff9a7a"), myth * 0.5)}
        castShadow
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-ext}
        shadow-camera-near={0.01}
        shadow-camera-far={ext * 8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02 * Math.max(0.05, ext / 4)}
        shadow-radius={3}
      />
      <directionalLight position={LIGHTING.fill.position} intensity={LIGHTING.fill.intensity * k} color={LIGHTING.fill.color} />
      <directionalLight position={LIGHTING.rim.position} intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} />
    </>
  );
};


const show = (k: string, f: number) => track(`${k}.show`, f) > 0.5;

/** s1/s2/s7: Terra + cobertor + setas + fumaça. */
const EarthWorld: React.FC<{ f: number }> = ({ f }) => {
  const k = clamp(track("blanket.k", f), 0, 1.2);
  const shell = 1.4 * (1.12 + 0.16 * k);
  return (
    <group position={EARTH}>
      <Stars count={1400} radius={120} frame={f} />
      <Earth f={f} r={1.4} />
      {k > 0.01 ? <BlanketShell f={f} r={1.4} k={k} /> : null}
      {track("smoke", f) > 0.01 ? <SmokePuffs f={f} r={1.4} k={track("smoke", f)} /> : null}
      <group scale={1.4}>
        <GreenhouseArrows r={1} shell={shell / 1.4} sun={track("sun", f)} heat={track("heat", f)} trapped={track("trapped", f)} />
      </group>
      {/* brilho quente em volta (temperatura) */}
      <mesh scale={1.4 * 1.32}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshBasicMaterial color={new Color("#ff7a3a")} transparent opacity={0.06 + 0.1 * clamp(track("hot", f), 0, 1)} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** s3/s5/s8: escada rolante + termômetro gigante. */
const EscWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={ESC}>
    <Stars count={700} radius={80} frame={f} />
    <Escalator f={f} speed={0.02} />
    <group position={THERMO_AT}>
      <Thermometer3D v={track("thermo.v", f, 0.3)} h={3.8} glow={track("thermo.glow", f)} />
    </group>
  </group>
);

/** s4/s6: Pacífico em corte. */
const PacWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={PAC}>
    <Stars count={900} radius={80} frame={f} />
    <PacificSlice f={f} warm={track("warm", f)} plumes={track("plumes", f)} />
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("earth", f) ? <EarthWorld f={f} /> : null}
      {show("esc", f) ? <EscWorld f={f} /> : null}
      {show("pac", f) ? <PacWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
