import { useMemo } from "react";
import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import { useCurrentFrame } from "remotion";
import { depthY, track, XB } from "../data/scenes";
import { LIGHTING, MATTE } from "../theme";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";
import { Fish } from "./Animals";
import { Arrow3D } from "./Arrow3D";
import { BrandPedestal } from "./BrandPedestal";
import { Anglerfish, Bathysphere, DeepShrimp, Dolphin, Everest, Jellyfish, Lanternfish, SeaCucumber, SeaTurtle, Snailfish, SpermWhale, Squid } from "./Sea";
import { Boat } from "./Vehicles";

// Mundo do oceano: COLUNA A (x = 0, zonas esticadas) e COLUNA B (x = XB, escala real 1 km = 1 u3d), batisfera com o
// mascote, seres de cada zona e partículas (plâncton, bolhas, neve marinha). Tudo pelas trilhas no frame GLOBAL.

export const COL = { w: 3.6, d: 1.6, trenchW: 1.5 };
export const POD_X = 0.3;
export const POD_Z = 0.4;
export const podY = (frame: number) => depthY(track("pod.depth", frame, 0)) + 0.0;
const ZONES: { from: number; to: number; c: string }[] = [
  { from: 0, to: 200, c: "#3d9be0" },
  { from: 200, to: 1000, c: "#1f5aa8" },
  { from: 1000, to: 4000, c: "#0f2552" },
  { from: 4000, to: 6000, c: "#081431" },
  { from: 6000, to: 11000, c: "#050a1a" },
];

/** Luz do diorama: escurece com a profundidade (light.depth) — substitui <Lighting/> neste vídeo. */
export const SeaLighting: React.FC = () => {
  const frame = useCurrentFrame();
  const k = 1 - 0.78 * track("light.depth", frame);
  return (
    <>
      <ambientLight intensity={LIGHTING.ambient * (0.35 + 0.65 * k)} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity * k]} />
      <directionalLight position={LIGHTING.key.position} intensity={LIGHTING.key.intensity * k} color={LIGHTING.key.color} />
      <directionalLight position={LIGHTING.fill.position} intensity={LIGHTING.fill.intensity * (0.4 + 0.6 * k)} color={LIGHTING.fill.color} />
      <directionalLight position={LIGHTING.rim.position} intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} />
    </>
  );
};

const Water: React.FC<{ y0: number; y1: number; w: number; c: string; x?: number; o?: number }> = ({ y0, y1, w, c, x = 0, o = 0.5 }) => (
  <group>
    <mesh position={[x, (y0 + y1) / 2, 0]}>
      <boxGeometry args={[w, y0 - y1, COL.d]} />
      <meshStandardMaterial color={c} transparent opacity={o} roughness={0.2} depthWrite={false} />
    </mesh>
    {/* parede de fundo (dá o "corte") */}
    <mesh position={[x, (y0 + y1) / 2, -COL.d / 2 - 0.02]}>
      <boxGeometry args={[w, y0 - y1, 0.04]} />
      <meshStandardMaterial {...MATTE} color={new Color(c).multiplyScalar(0.55).getStyle()} />
    </mesh>
  </group>
);

const Rock: React.FC<{ p: Vec3; s: Vec3 }> = ({ p, s }) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial {...MATTE} color="#2c2a35" />
  </mesh>
);

/** Coluna de oceano (A esticada ou B real). yOf: profundidade (m) → y. */
const Column: React.FC<{ x: number; yOf: (m: number) => number; frame: number; real?: boolean }> = ({ x, yOf, frame, real }) => {
  const bottom = yOf(11000);
  const hadalTop = yOf(6000);
  const realBands = real ? track("realBands.show", frame) : 0;
  const pulse = real ? track("realSun.pulse", frame) : 0;
  const dark = real ? track("realDark.show", frame) : 0;
  return (
    <group>
      {ZONES.map((z, i) => {
        const w = z.from >= 6000 ? COL.trenchW : COL.w;
        let c = z.c;
        if (real) c = ["#5fc0ff", "#2f73c9", "#1b4590", "#123270", "#0c2252"][i];
        if (real && realBands > 0.01) c = new Color(c).lerp(new Color(i === 0 ? "#c8f0ff" : "#060a18"), i === 0 ? 0.6 * pulse * (0.6 + 0.4 * Math.sin(frame / 4)) : dark * 0.55).getStyle();
        return <Water key={i} x={x} y0={yOf(z.from)} y1={yOf(z.to)} w={w} c={c} o={real ? (i === 0 ? 0.6 + 0.35 * realBands : 0.42 + 0.3 * realBands) : 0.5} />;
      })}
      {/* rocha dos lados da fossa + planície (lado direito) */}
      {[-1, 1].map((s) => (
        <Rock key={s} p={[x + s * (COL.trenchW / 2 + (COL.w - COL.trenchW) / 4), (hadalTop + bottom) / 2, 0]} s={[(COL.w - COL.trenchW) / 2, hadalTop - bottom, COL.d]} />
      ))}
      <mesh position={[x + COL.trenchW / 2 + (COL.w - COL.trenchW) / 4, hadalTop + 0.03, 0]} receiveShadow>
        <boxGeometry args={[(COL.w - COL.trenchW) / 2, 0.06, COL.d]} />
        <meshStandardMaterial {...MATTE} color="#5a5048" />
      </mesh>
      <mesh position={[x - COL.trenchW / 2 - (COL.w - COL.trenchW) / 4, hadalTop + 0.03, 0]} receiveShadow>
        <boxGeometry args={[(COL.w - COL.trenchW) / 2, 0.06, COL.d]} />
        <meshStandardMaterial {...MATTE} color="#5a5048" />
      </mesh>
      <Rock p={[x, bottom - 0.08, 0]} s={[COL.trenchW, 0.16, COL.d]} />
      {/* superfície (ondas) */}
      <mesh position={[x, 0.01 + 0.015 * Math.sin(frame / 14), 0]}>
        <boxGeometry args={[COL.w + 0.02, 0.04, COL.d + 0.02]} />
        <meshStandardMaterial color="#9fdcff" transparent opacity={0.8} roughness={0.1} />
      </mesh>
      {/* moldura de vidro */}
      {[-1, 1].map((s) => (
        <mesh key={`f${s}`} position={[x + (s * COL.w) / 2, (0 + hadalTop) / 2, COL.d / 2]}>
          <boxGeometry args={[0.03, -hadalTop, 0.03]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.5} />
        </mesh>
      ))}
      <group position={[x, bottom - 0.16, 0]}>
        <BrandPedestal width={COL.w} depth={COL.d} y={0} height={0.6} />
      </group>
    </group>
  );
};

const Points: React.FC<{ pos: number[]; color: string; size: number; opacity: number }> = ({ pos, color, size, opacity }) => {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, [pos]);
  if (opacity < 0.01) return null;
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity} depthWrite={false} />
    </points>
  );
};

const Particles: React.FC<{ frame: number }> = ({ frame }) => {
  const plankton = track("plankton.show", frame);
  const o2 = track("o2.flow", frame);
  const snow = track("snow.amount", frame, 0.25);
  const biolum = track("biolum.show", frame);
  const pl: number[] = [];
  for (let i = 0; i < 160; i++) pl.push((rand(`pk${i}`) - 0.5) * COL.w * 0.95, -0.1 - rand(`pky${i}`) * 2.0 + 0.03 * Math.sin(frame / 20 + i), (rand(`pkz${i}`) - 0.5) * COL.d * 0.9);
  const bub: number[] = [];
  for (let i = 0; i < 40; i++) {
    const t = ((frame * 0.01 + rand(`b${i}`)) % 1);
    bub.push((rand(`bx${i}`) - 0.5) * COL.w * 0.8, -2.0 + t * 2.0, (rand(`bz${i}`) - 0.5) * COL.d * 0.6);
  }
  const sn: number[] = [];
  for (let i = 0; i < 260; i++) {
    const y0 = -2.2 - rand(`sy${i}`) * 11.2;
    const y = y0 - ((frame * 0.004 + rand(`sp${i}`) * 3) % 3);
    sn.push((rand(`sx${i}`) - 0.5) * COL.w * 0.9 + 0.03 * Math.sin(frame / 30 + i), Math.max(-13.35, y), (rand(`sz${i}`) - 0.5) * COL.d * 0.8);
  }
  const bl: number[] = [];
  for (let i = 0; i < 70; i++) bl.push((rand(`lx${i}`) - 0.5) * COL.w * 0.9, -5.6 - rand(`ly${i}`) * 4.4, (rand(`lz${i}`) - 0.5) * COL.d * 0.8);
  const tw = 0.6 + 0.4 * Math.sin(frame / 5);
  return (
    <group>
      <Points pos={pl} color="#7fe07a" size={0.05} opacity={plankton * 0.9} />
      <Points pos={bub} color="#e8fbff" size={0.07} opacity={o2 * 0.8} />
      <Points pos={sn} color="#f2f4ff" size={0.035} opacity={snow * 0.7} />
      <Points pos={bl} color="#7ad7ff" size={0.06} opacity={biolum * tw} />
    </group>
  );
};

const Creatures: React.FC<{ frame: number }> = ({ frame }) => {
  const turtle = track("turtle.show", frame);
  const dolph = track("dolphins.show", frame);
  const school = track("school.show", frame);
  const lantern = track("lantern.show", frame);
  const migrate = track("lantern.migrate", frame);
  const belly = Math.max(track("lantern.bellyGlow", frame), 0.4);
  const jelly = track("biolum.show", frame);
  const angler = track("angler.show", frame);
  const lure = track("angler.lure", frame);
  const bite = track("angler.bite", frame);
  const shrimp = track("shrimp.show", frame);
  const dive = track("whale.dive", frame);
  const flee = track("squid.flee", frame);
  const eat = track("cucumber.eat", frame);
  const snail = track("snail.show", frame);
  const lamp = track("podLamp.on", frame);
  const redBall = track("redBall.depth", frame);
  const ly = lerp(depthY(600), -1.0, migrate);
  const whaleP: Vec3 = [lerp(-2.4, 0.9, dive), lerp(-4.6, -7.9, dive), -0.15];
  return (
    <group>
      {/* zona do sol */}
      {turtle > 0.01 ? <SeaTurtle frame={frame} position={[-0.9 + 0.1 * Math.sin(frame / 40), -0.75, 0.25]} scale={0.4 * clamp(turtle, 0, 1)} rotY={0.2} /> : null}
      {dolph > 0.01
        ? [0, 1].map((i) => <Dolphin key={i} frame={frame + i * 20} position={[0.7 + i * 0.5, -0.45 - i * 0.35 + 0.08 * Math.sin(frame / 18 + i), -0.25 + i * 0.3]} scale={0.32 * clamp(dolph, 0, 1)} rotY={Math.PI} />)
        : null}
      {school > 0.01
        ? Array.from({ length: 9 }, (_, i) => <Fish key={i} frame={frame + i * 7} position={[-0.6 + (i % 3) * 0.28 + 0.1 * Math.sin(frame / 25), -1.45 - Math.floor(i / 3) * 0.14, -0.2 + (i % 2) * 0.3]} scale={0.5 * clamp(school, 0, 1)} />)
        : null}
      {/* boia vermelha perdendo a cor */}
      {redBall > 0.001 && redBall < 0.999 ? (
        <mesh position={[-1.1, lerp(-0.3, -2.1, redBall), 0.5]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color={new Color("#e5383b").lerp(new Color("#4a5a78"), redBall).getStyle()} roughness={0.5} />
        </mesh>
      ) : null}
      {/* zona do crepúsculo: peixes-lanterna (com migração) */}
      {lantern > 0.01
        ? Array.from({ length: 14 }, (_, i) => (
            <Lanternfish key={i} frame={frame} seed={i} glow={belly} position={[-1.2 + (i % 5) * 0.55 + 0.1 * Math.sin(frame / 20 + i), ly - Math.floor(i / 5) * 0.35 + 0.15 * rand(`ly${i}`), -0.4 + rand(`lz${i}`) * 0.8]} scale={4.0 * clamp(lantern, 0, 1)} rotY={i % 2 ? 0 : Math.PI} />
          ))
        : null}
      {/* zona da meia-noite: águas-vivas, tamboril, camarão */}
      {jelly > 0.01
        ? [[-1.3, 1450], [1.25, 1600], [-1.15, 2350]].map(([x, m], i) => <Jellyfish key={i} frame={frame + i * 13} glow={jelly} position={[x, depthY(m) + 0.1 * Math.sin(frame / 25 + i), -0.35]} scale={3.0} />)
        : null}
      {angler > 0.01 ? <Anglerfish frame={frame} position={[-0.2, depthY(1800), 0.7]} scale={4.5 * clamp(angler, 0, 1)} glow={0.6 + 0.4 * lure} bite={bite} /> : null}
      {shrimp > 0.01 ? (
        <group>
          <DeepShrimp frame={frame} position={[0.75, depthY(1850), 0.6]} scale={4 * clamp(shrimp, 0, 1)} rotY={Math.PI} />
          {/* sem o farol, o camarão vermelho vira silhueta preta */}
          <mesh position={[0.75, depthY(1850), 0.6]} scale={[0.32, 0.12, 0.1]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color="#020306" transparent opacity={0.85 * (1 - clamp(lamp * 1.4, 0, 1)) * clamp(shrimp, 0, 1)} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
      {/* cachalote + lula */}
      {dive > 0.01 && dive < 0.99 ? <group position={whaleP} rotation={[0, 0, -0.7]}><SpermWhale frame={frame} scale={0.13} /></group> : null}
      {flee < 0.99 && (dive > 0.3 || flee > 0.01) ? <Squid frame={frame} position={[0.9 + flee * 1.4, depthY(2100) - 0.2 + flee * 0.3, 0.3]} scale={0.7} /> : null}
      {/* abismo: pepinos-do-mar na planície da direita */}
      {[0, 1, 2].map((i) => (
        <SeaCucumber key={i} frame={frame + i * 30} position={[1.0 + i * 0.25, depthY(6000) + 0.06, -0.3 + i * 0.3]} scale={1.6 * (1 + 0.1 * eat * Math.sin(frame / 6 + i))} rotY={i} />
      ))}
      {/* hadal: peixe-caracol */}
      {snail > 0.01 ? <Snailfish frame={frame} position={[-0.25, depthY(8300), 0.35]} scale={3 * clamp(snail, 0, 1)} /> : null}
    </group>
  );
};

const Pod: React.FC<{ frame: number }> = ({ frame }) => {
  const y = podY(frame);
  const lamp = track("podLamp.on", frame);
  const press = track("pressure.arrows", frame);
  const cups = track("cups.show", frame);
  const shrink = track("cups.shrink", frame);
  const m = { wave: track("mascot.wave", frame), jump: track("mascot.jump", frame), cheer: track("mascot.cheer", frame), look: track("mascot.look", frame) };
  const p: Vec3 = [POD_X, y - 0.27, POD_Z];
  return (
    <group>
      <Bathysphere frame={frame} position={p} scale={0.24} lamp={lamp} m={m} rotY={0} />
      {press > 0.01
        ? [
            [-1, 0],
            [1, 0],
            [0, 1],
            [0, -1],
          ].map(([sx, sy], i) => {
            const dir: Vec3 = [-sx, -sy, 0];
            const from: Vec3 = [POD_X + sx * (0.62 + 0.04 * Math.sin(frame / 4)), y + sy * 0.62, POD_Z];
            return <Arrow3D key={i} from={from} dir={dir} length={0.3} radius={0.028} color="#f8c815" scale={clamp(press, 0, 1)} />;
          })
        : null}
      {cups > 0.01
        ? [0, 1].map((i) => {
            const k = i === 1 ? 1 - 0.55 * shrink : 1;
            return (
              <mesh key={i} position={[POD_X + 0.55 + i * 0.3, y - 0.18 - (1 - k) * 0.08, POD_Z + 0.2]} scale={[k * clamp(cups, 0, 1), k * clamp(cups, 0, 1), k * clamp(cups, 0, 1)]}>
                <cylinderGeometry args={[0.1, 0.07, 0.2, 14]} />
                <meshStandardMaterial color="#f4f1ea" roughness={0.8} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

const Surface: React.FC<{ frame: number }> = ({ frame }) => {
  const rays = track("sunRays.show", frame, 0.3) * (1 - track("light.depth", frame));
  return (
    <group>
      <mesh position={[-1.3, 2.6, -0.6]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#fff4c8" />
      </mesh>
      <mesh position={[-1.3, 2.6, -0.6]}>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshBasicMaterial color="#ffd36b" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <Boat frame={frame} position={[0.6, 0.0, -0.2]} scale={0.12} rotY={Math.PI} />
      {rays > 0.01
        ? [-1.2, -0.4, 0.4, 1.2].map((x, i) => (
            <mesh key={i} position={[x, -1.1, 0]} rotation={[0, 0, 0.12]}>
              <coneGeometry args={[0.32, 2.2, 10, 1, true]} />
              <meshBasicMaterial color="#e8fbff" transparent opacity={0.1 * rays * (0.7 + 0.3 * Math.sin(frame / 15 + i))} depthWrite={false} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/** Coluna B em escala real + Everest (km). */
const RealColumn: React.FC<{ frame: number }> = ({ frame }) => {
  const rise = track("everest.rise", frame);
  const yReal = (m: number) => -m / 1000;
  return (
    <group position={[0, 0, 0]}>
      <Column x={XB} yOf={yReal} frame={frame} real />
      {rise > 0.01 ? (
        <group position={[XB, -10.935, -0.1]} scale={[0.115, clamp(rise, 0, 1), 0.09]}>
          <Everest />
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group>
      <Column x={0} yOf={depthY} frame={frame} />
      <Surface frame={frame} />
      <Particles frame={frame} />
      <Creatures frame={frame} />
      <Pod frame={frame} />
      <RealColumn frame={frame} />
    </group>
  );
};
