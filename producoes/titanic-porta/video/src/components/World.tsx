import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { Stars } from "./SpaceScene";
import { Debris, LifeJacket, Lifeboat, Liner1912, MuseumCase, NightSea, SensorWire, TestTank, WaterSlice, WoodPanel, seaY } from "./Titanic";
import { Thermometer3D } from "./Heat";
import { Mascot } from "./Mascot";
import { Person, personLook, worldScale } from "./Person";
import { MUS, PAN, SEA, SL, TK } from "../data/tit";

// Mundos do "O Jack cabia na porta?". Tudo lê track("alvo.prop", frameGlobal). Posições em data/tit.ts.

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
const WS = worldScale(1);

/** Pessoa deitada de costas sobre o painel (cabeça para +x). */
const Lying: React.FC<{ f: number; p: Vec3; seed: number }> = ({ f, p, seed }) => (
  <group position={p} rotation={[0, 0, -Math.PI / 2]}>
    <Person {...personLook(seed)} frame={f} position={[0, 0, 0]} scale={WS.person} rotY={-Math.PI / 2} seed={seed} />
  </group>
);
const Moon: React.FC = () => (
  <group position={[4, 9, -40]}>
    <mesh><circleGeometry args={[2.2, 40]} /><meshBasicMaterial color="#f2ead6" toneMapped={false} /></mesh>
    <mesh position={[0, 0, -0.1]}><circleGeometry args={[3.6, 40]} /><meshBasicMaterial color="#3a4a78" transparent opacity={0.35} depthWrite={false} /></mesh>
  </group>
);

/** Mar: painel (mascote sentado; pessoa na água ou deitada no painel), navio ao longe, bote, termômetro. */
const SeaWorld: React.FC<{ f: number }> = ({ f }) => {
  const both = track("both", f) > 0.5; // final: os dois em cima, colete embaixo
  const by = seaY(PAN[0], PAN[2], f) - 0.02 + (both ? 0.05 : 0);
  const bx = track("boat.x", f, -40);
  const th = track("thermo", f);
  return (
    <group position={SEA}>
      <Stars count={700} radius={80} frame={f} />
      <Moon />
      <NightSea f={f} moonX={3} />
      <Debris f={f} />
      <group position={[-2.2, 0, -30]} scale={0.24}>
        <Liner1912 f={f} sink={track("ship.sink", f, 0.55)} lights={track("ship.lights", f, 1)} />
      </group>
      <group position={[PAN[0], by, PAN[2]]} rotation={[0.03 * Math.sin(f / 20), 0.25, 0.02 * Math.sin(f / 27)]}>
        <WoodPanel wet={0.4} />
        {track("m.on", f, 1) > 0.5 ? <Mascot frame={f} position={[-0.25, 0.08, both ? 0.18 : 0]} scale={WS.mascot * 0.95} rotY={0.5} sit={1} look={both ? 0.2 : -0.7} cheer={track("m.cheer", f)} wave={track("m.wave", f)} /> : null}
        {both ? (
          <>
            <group position={[0, -0.05, 0]}><LifeJacket s={1.3} /></group>
            <Lying f={f} p={[0.15, 0.1, -0.2]} seed={4} />
          </>
        ) : (
          <Person {...personLook(4)} frame={f} position={[1.25, -1.2, 0.1]} scale={WS.person} rotY={-Math.PI / 2 + 0.4} point={1} seed={4} />
        )}
      </group>
      {bx > -30 ? (
        <group position={[bx, seaY(bx, -3, f) + 0.12, -3.5]} rotation={[0, 0.15, 0]} scale={0.8}>
          <Lifeboat f={f} />
        </group>
      ) : null}
      {th > 0.01 ? (
        <group position={[-1.3, 0.1, 1.2]} scale={0.55 * clamp(th, 0, 1.1)}>
          <Thermometer3D v={track("thermo.v", f, 0.6)} h={2.4} />
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  const sy = track("sl.y", f, 0.02);
  return (
    <>
      {show("sea", f) ? <SeaWorld f={f} /> : null}
      {show("mus", f) ? (
        <group position={MUS}>
          <group position={[-0.6, 1.1, 0]} rotation={[Math.PI / 2 - 0.12, 0, track("pan.rot", f)]}>
            <WoodPanel s={0.9} />
          </group>
          <group position={[1.0, 0, -0.1]} scale={0.8}>
            <MuseumCase />
          </group>
          <mesh position={[0, -0.03, 0]} receiveShadow>
            <cylinderGeometry args={[2.4, 2.5, 0.06, 32]} />
            <meshStandardMaterial color="#2a2232" flatShading />
          </mesh>
        </group>
      ) : null}
      {show("sl", f) ? (
        <group position={SL}>
          <WaterSlice f={f} />
          <group position={[0, sy + 0.01 * Math.sin(f / 12), 0]}>
            <WoodPanel wet={0.5} />
            <Lying f={f} p={[0.25, 0.11, -0.18]} seed={4} />
            {track("m2", f) > 0.01 ? <Mascot frame={f} position={[-0.45, 0.08 + (1 - clamp(track("m2", f), 0, 1)) * 0.8, 0.2]} scale={WS.mascot * 0.95} rotY={0.4} sit={1} jump={0} /> : null}
          </group>
          {track("jk", f) > 0.01 ? (
            <group position={[-3 + 3 * clamp(track("jk", f), 0, 1), sy - 0.06, 0]}>
              <LifeJacket s={1.3} />
            </group>
          ) : null}
        </group>
      ) : null}
      {show("tk", f) ? (
        <group position={TK}>
          <TestTank f={f} />
          <group position={[0.3, -0.02, 0]} rotation={[0, 0.2, 0]}>
            <WoodPanel wet={0.5} />
            <Lying f={f} p={[0.05, 0.1, 0.18]} seed={2} />
            <Lying f={f} p={[-0.1, 0.1, -0.22]} seed={11} />
          </group>
          <SensorWire a={[0.4, 0.3, 0.1]} b={[-2.4, 1.3, 2.6]} />
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
