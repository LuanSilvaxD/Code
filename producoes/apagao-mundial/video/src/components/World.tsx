import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { add, BRAZIL, GLOBE, GLOBE_R, ITAIPU, ROOM, SATELLITE, SUN, SUN_R } from "../data/apagao";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { BrazilMap, CME, Itaipu, LivingRoom, MagField, MiniRotor, NightGlobe, onGlobe, Satellite, Sun, WorldCable } from "./Apagao";
import { Stars } from "./SpaceScene";
import { MascotFromTracks } from "./Mascot";

// Mundos do "apagão mundial": espaço (globo noturno, Sol, satélite), sala, Itaipu e mapa do Brasil.
// Tudo lê o estado de track("alvo.prop", frameGlobal). Posições em data/apagao.ts.

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
const sunDir = (): Vec3 => {
  const d = Math.hypot(SUN[0], SUN[1], SUN[2]);
  return [SUN[0] / d, SUN[1] / d, SUN[2] / d];
};

const Space: React.FC<{ f: number }> = ({ f }) => {
  const sun = track("sun.show", f);
  const rotors = track("rotors.sync", f);
  const sat = track("satellite.show", f);
  const flare = track("flare.t", f);
  const warn = track("warning.wave", f);
  const cme2 = track("cme2.t", f);
  const sd = sunDir();
  const earthFace: Vec3 = [sd[0] * (GLOBE_R + 1.2), sd[1] * (GLOBE_R + 1.2), sd[2] * (GLOBE_R + 1.2)];
  const sunFace: Vec3 = add(SUN, [-sd[0] * (SUN_R + 0.8), -sd[1] * (SUN_R + 0.8), -sd[2] * (SUN_R + 0.8)]);
  return (
    <group>
      <Stars count={1400} radius={190} frame={f} />
      <group position={GLOBE}>
        <NightGlobe R={GLOBE_R} spin={track("globe.spin", f)} on={track("lights.on", f, 1)} grids={track("grids.k", f)} quebec={track("quebec.off", f)} />
        <WorldCable R={GLOBE_R} on={track("cable.on", f)} brk={track("cable.break", f)} />
        {rotors > 0.01
          ? [[-47, -8], [-43, -20], [-53, -14], [-38, -11], [-50, -25], [-60, -10]].map(([lo, la], i) => (
              <group key={i} position={onGlobe(lo, la, GLOBE_R + 0.02)} scale={clamp(rotors, 0, 1)}>
                <MiniRotor angle={f * 0.35} s={0.11} />
              </group>
            ))
          : null}
        <MagField R={GLOBE_R} show={track("field.show", f)} shake={track("field.shake", f)} f={f} sunDir={sd} />
      </group>
      {sun > 0.5 ? (
        <>
          <group position={SUN} rotation={[0, Math.atan2(sd[2], -sd[0]), 0]}>
            <Sun r={SUN_R} f={f} pulse={track("sun.pulse", f)} flare={flare} />
          </group>
          <CME from={sunFace} to={earthFace} t={track("cme.t", f)} />
          {cme2 > 0.01 ? <CME from={sunFace} to={earthFace} t={cme2} n={70} spread={1.4} /> : null}
          {sat > 0.01 ? (
            <group position={SATELLITE} scale={clamp(sat, 0, 1)}>
              <Satellite f={f} s={1.3} />
            </group>
          ) : null}
          {warn > 0.01 && warn < 0.999 ? <WarningWave from={SATELLITE} to={earthFace} t={warn} /> : null}
        </>
      ) : null}
    </group>
  );
};

/** Aviso do satélite: pulsos de luz azul indo até a Terra (chegam antes da nuvem). */
const WarningWave: React.FC<{ from: Vec3; to: Vec3; t: number }> = ({ from, to, t }) => (
  <group>
    {[0, 1, 2, 3, 4].map((i) => {
      const u = clamp(t * 1.4 - i * 0.1, 0, 1);
      if (u <= 0 || u >= 1) return null;
      const p: Vec3 = [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (to[2] - from[2]) * u];
      return (
        <mesh key={i} position={p} rotation={[0, Math.atan2(to[0] - from[0], to[2] - from[2]), 0]}>
          <torusGeometry args={[0.9 + i * 0.1, 0.12, 6, 24]} />
          <meshBasicMaterial color="#7fd0ff" toneMapped={false} transparent opacity={1 - u * 0.5} />
        </mesh>
      );
    })}
  </group>
);

const Room: React.FC<{ f: number }> = ({ f }) => (
  <group position={ROOM}>
    <LivingRoom
      f={f}
      tvOn={track("tv.on", f)}
      city={1}
      dark={track("tv.dark", f)}
      cal={track("tv.calendar", f)}
      alert={track("tv.alert", f)}
      x1={track("tv.cross1", f)}
      x2={track("tv.cross2", f)}
      radio={track("radio.waves", f)}
    />
  </group>
);

const ItaipuWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={ITAIPU}>
    <Itaipu a60={f * 0.2} a50={f * 0.1667} />
  </group>
);

const BrazilWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={BRAZIL}>
    <BrazilMap f={f} domino={track("domino.t", f)} spark={track("line.spark", f)} rrGlow={track("roraima.glow", f)} gap={track("gap.show", f)} trace={track("lines.trace", f)} />
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("space", f) ? <Space f={f} /> : null}
      {show("room", f) ? <Room f={f} /> : null}
      {show("itaipu", f) ? <ItaipuWorld f={f} /> : null}
      {show("brazil", f) ? <BrazilWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
