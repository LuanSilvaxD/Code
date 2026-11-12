import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { BRAND } from "../brand";
import { scenes, track } from "../data/scenes";
import { LIGHTING } from "../theme";
import { clamp, lerp } from "../utils/animation";
import { MascotFromTracks } from "./Mascot";
import { AFrame, Crib, Chips, Hammerstone, isLintelOn, isStanding, linPos, Monument, Rails, Rope, Sledge, Sun, upPos } from "./Monument";
import { neolithicLooks, Person } from "./Person";
import { Lintel, Sarsen } from "./Stones";
import { Cremations, Grass, Ground, heightAt, R, Sheep, Strata, Tree } from "./Terrain";

// Cenário persistente de "Como construíram Stonehenge?". Tudo em METROS dentro de <group scale={0.1}>
// (1 m = 0,1 u3d). Eixo do solstício = +x (nordeste). O canteiro fica no lugar da pedra 7 do anel (z = +15 m).

const U = 0.1;
const P = 1.7 / 1.8;
const LOOKS = neolithicLooks(14, "obra");
const sceneIdx = (frame: number) => {
  let k = 0;
  scenes.forEach((s, i) => {
    if (frame >= s.startFrame) k = i;
  });
  return k;
};
const T = (k: string, f: number, fb = 0) => track(k, f, fb);

// pedras e lintéis que o canteiro controla a partir da cena 6 (o anel nasce em volta deles)
const WS_UP = [6, 7, 8];
const WS_LIN = [6, 7];
const BASE_STAND: [number, number] = [-1.5, 15.0]; // base (y, z) da pedra-modelo em pé

/** Pose da pedra-modelo (base em metros + ângulo acima da horizontal, rad). */
export const workStonePose = (frame: number) => {
  const sz = T("sledge.z", frame, 6.5) / U;
  const slide = clamp(T("workStone.slide", frame), 0, 1);
  const tilt = (T("workStone.tilt", frame) * Math.PI) / 180;
  const lying: [number, number] = [1.13, sz - 2.8];
  const y = lerp(lying[0], BASE_STAND[0], slide);
  const z = lerp(lying[1], BASE_STAND[1], slide);
  return { y, z, a: tilt };
};

/** Posições (m) e pose de cada trabalhador no frame, por cena. Usado pelo 3D e pelos "?" 2D. */
export const crewAt = (frame: number) => {
  const k = sceneIdx(frame);
  const sz = T("sledge.z", frame, 6.5) / U;
  const moving = Math.abs(T("sledge.z", frame, 6.5) - T("sledge.z", frame - 1, 6.5)) > 1e-5;
  const out: { x: number; z: number; rot: number; walk: number; point: number; rope?: [number, number, number] }[] = [];
  if (k === 5 || k === 6) {
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1;
      const row = Math.floor(i / 2);
      out.push({ x: side * 1.3, z: sz - 5 - row * 1.5, rot: Math.PI, walk: moving ? 1 : 0, point: 0, rope: [side * 0.6, 0.9, sz - 2.9] });
    }
  } else if (k === 7) {
    const sw = (i: number) => 0.5 + 0.5 * Math.sin(frame * 0.5 + i * 1.7);
    out.push({ x: -1.5, z: sz - 0.6, rot: Math.PI / 2, walk: 0, point: sw(0) });
    out.push({ x: 1.5, z: sz + 1.0, rot: -Math.PI / 2, walk: 0, point: sw(1) });
    out.push({ x: -1.5, z: sz + 1.8, rot: Math.PI / 2, walk: 0, point: sw(2) });
    for (let i = 3; i < 8; i++) out.push({ x: -4.5 - (i % 2) * 1.2, z: sz - 2 + i * 0.9, rot: 2.0, walk: 0, point: 0 });
  } else if (k === 8) {
    const tilt = T("workStone.tilt", frame);
    const pulling = Math.abs(tilt - T("workStone.tilt", frame - 1)) > 0.01;
    for (let i = 0; i < 8; i++) out.push({ x: -0.8 - (i % 2) * 1.1, z: 9.6 - Math.floor(i / 2) * 1.3, rot: Math.PI, walk: pulling ? 1 : 0, point: 0, rope: [0, 0, 0] });
  } else if (k === 9) {
    const L = linPos(7);
    const sw = (i: number) => 0.5 + 0.5 * Math.sin(frame * 0.3 + i * 2.1);
    [[-2.6, 1.8], [2.6, 1.8], [-2.6, 4.4], [2.6, 4.4]].forEach(([t, r], i) => {
      const ang = L.a;
      const tx = -Math.sin(ang);
      const tz = Math.cos(ang);
      const rx = Math.cos(ang);
      const rz = Math.sin(ang);
      out.push({ x: L.x + tx * t + rx * r, z: L.z + tz * t + rz * r, rot: Math.atan2(-(tx * t), -(tz * t)), walk: 0, point: sw(i) });
    });
    for (let i = 4; i < 9; i++) out.push({ x: -4 + i * 1.3, z: 23 + (i % 2) * 1.1, rot: Math.PI, walk: 0, point: 0 });
  } else if (k === 10 || k === 11) {
    for (let i = 0; i < 9; i++) out.push({ x: -5 + i * 1.25, z: 22 + (i % 3) * 1.0, rot: Math.PI, walk: 0, point: 0 });
  }
  return out;
};

/** Luz do diorama: de dia é a luz de estúdio; na madrugada/pôr do sol vem baixa, quente, do lado do Sol. */
export const StoneLighting: React.FC = () => {
  const frame = useCurrentFrame();
  const p = T("sun.phase", frame, 0.5);
  const day: [number, number, number] = LIGHTING.key.position;
  const dawn: [number, number, number] = [30, 4, -3];
  const dusk: [number, number, number] = [-30, 4, 1];
  const m = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t)) as [number, number, number];
  const pos = p < 0.5 ? m(dawn, day, p * 2) : m(day, dusk, (p - 0.5) * 2);
  const w = 1 - Math.abs(p - 0.5) * 2; // 1 = dia
  const col = new THREE.Color(p < 0.5 ? "#ffc27a" : "#ff8f55").lerp(new THREE.Color(LIGHTING.key.color), w);
  const ext = 11;
  return (
    <>
      <ambientLight intensity={LIGHTING.ambient * lerp(0.6, 1, w)} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity * lerp(0.55, 1, w)]} />
      <directionalLight
        position={pos}
        intensity={LIGHTING.key.intensity * lerp(1.15, 1, w)}
        color={col}
        castShadow
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-ext}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      <directionalLight position={LIGHTING.fill.position} intensity={LIGHTING.fill.intensity * w} color={LIGHTING.fill.color} />
      <directionalLight position={LIGHTING.rim.position} intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} />
    </>
  );
};

/** Pedestal redondo com o fio de luz roxa da marca. */
const RoundPedestal: React.FC = () => {
  const { umbra2, accent, core } = BRAND.colors;
  const r = R * U + 0.25;
  return (
    <group position={[0, -0.9 - 0.3, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[r, r + 0.1, 0.6, 96]} />
        <meshStandardMaterial color={umbra2} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[r + 0.11, r + 0.11, 0.035, 96, 1, true]} />
        <meshBasicMaterial color={core} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[r + 0.13, r + 0.13, 0.12, 96, 1, true]} />
        <meshBasicMaterial color={accent} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

const TREES: [number, number][] = [[-84, 30], [-86, 22], [-80, 38], [-76, 26], [-40, -84], [-30, -88], [-36, -80], [62, 62], [68, 56], [58, -66], [84, -30], [86, -22]];
const SHEEP: [number, number, number][] = [[30, 34, 0.4], [36, 38, 2.2], [-34, 30, 1.2], [-30, -36, 3.4], [40, -30, 5.0], [-62, 10, 1.0]];

/** O canteiro: trenó, trilhos, pedra-modelo, buraco em corte, escoras, plataforma, encaixes e as pedras vizinhas. */
const WorkSite: React.FC<{ frame: number; k: number; clip: THREE.Plane[] }> = ({ frame, k }) => {
  if (k < 5) return null;
  const ruin = clamp(T("monument.ruin", frame), 0, 1);
  const sz = T("sledge.z", frame, 6.5) / U;
  const ws = workStonePose(frame);
  const rough = clamp(T("workStone.rough", frame, 1), 0, 1);
  const tenon = clamp(T("workStone.tenon", frame), 0, 1);
  const dig = clamp(T("pit.dig", frame), 0, 1);
  const props = clamp(T("props.show", frame), 0, 1);
  const crib = T("crib.layers", frame);
  const cribFade = k >= 10 ? clamp(T("crib.fade", frame, 1), 0, 1) : 1;
  const ly = T("lintel.y", frame) / U;
  const lintelShow = clamp(T("lintel.show", frame), 0, 1);
  const explode = clamp(T("joint.explode", frame), 0, 1);
  const neighbor = clamp(T("neighbor.show", frame), 0, 1);
  const l2 = clamp(T("lintel2.slide", frame), 0, 1);
  const glow = clamp(T("lintels.glow", frame), 0, 1);
  const L7 = linPos(7);
  const L6 = linPos(6);
  const radialOff = 2.4 * clamp((0.43 / U - ly) / 0.3, 0, 1);
  const topY = 4.1 + 0.25;
  const showSledge = k <= 8 && !(k === 8 && T("workStone.slide", frame) > 0.98);
  const ropeTop: [number, number, number] = [0, ws.y + Math.sin(ws.a) * 5.4, ws.z + Math.cos(ws.a) * 5.4];
  const crewNow = crewAt(frame);
  return (
    <group>
      {/* pilha de sarsens brutas à espera, fora do anel */}
      {k <= 7 ? (
        <group>
          {[[-7, 46, 0.3], [-4.5, 50, 1.2], [7, 44, 2.6]].map(([x, z, r], i) => (
            <group key={i} position={[x, heightAt(x, z) + 0.55, z]} rotation={[Math.PI / 2, r, 0]}>
              <group position={[0, -2.3, 0]}>
                <Sarsen h={4.6} w={2.0} d={1.1} seed={30 + i} rough={1} tenons={0} lichen={false} />
              </group>
            </group>
          ))}
        </group>
      ) : null}
      {/* trilhos de troncos, ao longo de z, até o canteiro */}
      {k <= 8 ? (
        <group position={[0, heightAt(0, 45), 45]} rotation={[0, Math.PI / 2, 0]}>
          <Rails len={44} show={T("rails.show", frame)} />
        </group>
      ) : null}
      {showSledge ? (
        <group position={[0, 0.42 * 0 + 0.1, sz]} rotation={[0, Math.PI / 2, 0]}>
          <Sledge stone={false} />
        </group>
      ) : null}
      {/* pedra-modelo (vira a pedra 7 do anel) */}
      {k <= 12 || isStanding(7) || ruin < 1 ? (
        <group position={[0, ws.y, ws.z]} rotation={[Math.PI / 2 - ws.a, 0, 0]}>
          <Sarsen h={5.6} w={2.1} d={1.1} seed={8} rough={rough} tenons={k >= 8 ? tenon : 0} />
        </group>
      ) : null}
      {/* cordas: do trenó até a equipe / do topo da pedra até a equipe (cena 9) */}
      {crewNow.map((c, i) =>
        c.rope ? (
          <Rope key={i} a={k === 8 ? ropeTop : c.rope} b={[c.x * 0.94, 1.0, c.z + 0.4]} r={0.035} />
        ) : null,
      )}
      {/* martelos de pedra e lascas (cena 8) */}
      {k === 7 ? (
        <group>
          {[0, 1].map((j) => {
            const big = T("hammer.big", frame);
            const small = T("hammer.small", frame);
            const on = j ? small > 0 : big > 0 && small <= 0;
            if (!on) return null;
            const hit = (frame * (j ? 0.12 : 0.08)) % 1;
            const hx = j ? 0.35 : -0.35;
            const hz = sz + (j ? 0.9 : -0.3);
            return (
              <group key={j}>
                <Hammerstone size={j ? 0.14 : 0.34} seed={3 + j} position={[hx, 1.85 + 0.7 * Math.abs(Math.sin(hit * Math.PI)), hz]} />
                <Chips t={hit < 0.5 ? hit * 2 : 0} origin={[hx, 1.7, hz]} seed={j} />
              </group>
            );
          })}
        </group>
      ) : null}
      {/* vala com rampa escavada no chão (buraco fundo + rampa de giz) e o monte de giz retirado */}
      {dig > 0.01 && k <= 9 ? (
        <group>
          {/* rampa: do nível do chão (z ≈ 19,5) até a boca do buraco (z ≈ 15,9) */}
          <mesh position={[0, heightAt(0, 17.7) + 0.04, 17.7]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, dig, 1]}>
            <planeGeometry args={[2.8, 3.6]} />
            <meshStandardMaterial color="#d8cfb8" roughness={1} />
          </mesh>
          {[0.25, 0.5, 0.75].map((t) => (
            <mesh key={t} position={[0, heightAt(0, 17.7) + 0.05, 15.9 + t * 3.6]} rotation={[-Math.PI / 2, 0, 0]} scale={[dig, 1, 1]}>
              <planeGeometry args={[2.6, 0.08]} />
              <meshBasicMaterial color="#b9ae95" />
            </mesh>
          ))}
          {/* buraco */}
          <mesh position={[0, heightAt(0, 15) + 0.05, 15]} rotation={[-Math.PI / 2, 0, 0]} scale={dig}>
            <planeGeometry args={[2.8, 1.9]} />
            <meshBasicMaterial color="#2e241c" />
          </mesh>
          {/* borda de giz e monte de terra retirada */}
          <mesh position={[0, heightAt(0, 15) + 0.03, 15]} rotation={[-Math.PI / 2, 0, 0]} scale={dig}>
            <planeGeometry args={[3.5, 2.6]} />
            <meshStandardMaterial color="#e6dfcd" roughness={1} />
          </mesh>
          <mesh position={[3.4, heightAt(3.4, 16.5), 16.5]} scale={[1.6 * dig, 0.9 * dig, 2.6 * dig]} castShadow>
            <sphereGeometry args={[1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e3dccb" roughness={1} flatShading />
          </mesh>
        </group>
      ) : null}
      {props > 0.01 && k <= 9 ? (
        <group position={[-0.6, 0, 11.6]} scale={[1, props, 1]}>
          <AFrame h={4.6} spread={2.4} />
        </group>
      ) : null}
      {/* vizinhas: pedra 8 (cena 10) e pedra 6 (cena 11) */}
      {[8, 6].map((i) => {
        const p = upPos(i);
        const show = i === 8 ? neighbor : clamp(l2 * 3, 0, 1);
        if (show <= 0) return null;
        const fall = ruin > 0 && !isStanding(i) ? ruin : 0;
        return (
          <group key={i} position={[p.x, heightAt(p.x, p.z) - 4.4 * (1 - show), p.z]} rotation={[0, Math.PI / 2 - p.a, 0]}>
            <group rotation={[fall * 1.45, 0, 0]}>
              <Sarsen h={4.1} seed={i + 1} tenons={1} />
            </group>
          </group>
        );
      })}
      {/* plataforma de troncos (fora do anel) + lintel 7 */}
      {crib > 0.01 && cribFade > 0.01 ? (
        <group position={[L7.x + Math.cos(L7.a) * 2.4, 0, L7.z + Math.sin(L7.a) * 2.4]} rotation={[0, Math.PI / 2 - L7.a, 0]} scale={[1, cribFade, 1]}>
          <Crib layers={crib} w={3.6} d={2.6} />
        </group>
      ) : null}
      {lintelShow > 0.01 && (ruin < 0.999 || isLintelOn(7)) ? (
        <group
          position={[L7.x + Math.cos(L7.a) * radialOff, (k >= 10 ? topY : Math.max(ly, 0) + 0.02) + explode * 1.2 + (ruin > 0 && !isLintelOn(7) ? 6 * ruin : 0), L7.z + Math.sin(L7.a) * radialOff]}
          rotation={[0, Math.PI / 2 - L7.a, 0]}
          scale={lintelShow * (1 - (isLintelOn(7) ? 0 : ruin))}
        >
          <Lintel R={15} mortises={k >= 9 && k <= 11} joints={k >= 9 && k <= 11} glow={glow} />
        </group>
      ) : null}
      {l2 > 0.01 && (ruin < 0.999 || isLintelOn(6)) ? (
        <group
          position={[L6.x + Math.sin(L6.a) * -3 * (1 - l2) * -1, topY + (ruin > 0 && !isLintelOn(6) ? 6 * ruin : 0), L6.z - Math.cos(L6.a) * 3 * (1 - l2)]}
          rotation={[0, Math.PI / 2 - L6.a, 0]}
          scale={1 - (isLintelOn(6) ? 0 : ruin)}
        >
          <Lintel R={15} mortises={false} joints={k <= 11} glow={glow} />
        </group>
      ) : null}
    </group>
  );
};

const Crew: React.FC<{ frame: number }> = ({ frame }) => {
  const show = clamp(T("crew.show", frame), 0, 1);
  if (show <= 0.01) return null;
  const list = crewAt(frame);
  return (
    <group>
      {list.map((c, i) => (
        <Person key={i} {...LOOKS[i % LOOKS.length]} seed={i} frame={frame} position={[c.x, heightAt(c.x, c.z), c.z]} rotY={c.rot} scale={P * show} walk={c.walk} point={c.point} />
      ))}
    </group>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const k = sceneIdx(frame);
  const dig = clamp(T("ditch.dig", frame, 1), 0, 1);
  const chalk = clamp(T("ditch.chalk", frame), 0, 1);
  const cut = clamp(T("pit.cut", frame), 0, 1);
  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 12)], []);
  clip[0].constant = 1e5; // corte por plano desativado (vala de rampa vista de cima)
  void cut;
  // quantiza para não reconstruir a malha do terreno a cada frame sem necessidade
  const dq = Math.round(dig * 40) / 40;
  const cq = Math.round(chalk * 40) / 40;
  const built = clamp(T("monument.built", frame, 1), 0, 1);
  const ruin = clamp(T("monument.ruin", frame), 0, 1);
  const ghost = clamp(T("ghost.show", frame), 0, 1);
  const heel = clamp(T("heel.show", frame, 1), 0, 1);
  const glow = clamp(T("lintels.glow", frame), 0, 1);
  const axis = clamp(T("axis.show", frame), 0, 1);
  const phase = T("sun.phase", frame, 0.5);
  const rise = clamp(T("sun.rise", frame), 0, 1);
  const set = clamp(T("sun.set", frame), 0, 1);
  const rays = clamp(T("sunRays.show", frame), 0, 1);
  const personRef = clamp(T("personRef.show", frame), 0, 1);
  const pre = k >= 5;
  return (
    <group>
      <group scale={U}>
        <Ground dig={dq} chalk={cq} clip={clip} />
        <Strata />
        <Grass dig={dq} clip={clip} />
        {TREES.map(([x, z], i) => (
          <Tree key={i} position={[x, heightAt(x, z), z]} s={1.4 + (i % 2) * 0.4} seed={i} />
        ))}
        {SHEEP.map(([x, z, r], i) => (
          <Sheep key={i} frame={frame} position={[x, heightAt(x, z), z]} rotY={r} seed={i} />
        ))}
        <Cremations show={clamp(T("cremations.show", frame), 0, 1)} />
        <Monument built={built} ruin={ruin} ghost={ghost} heel={heel} glow={glow} skipUp={pre ? WS_UP : []} skipLin={pre ? WS_LIN : []} />
        <WorkSite frame={frame} k={k} clip={clip} />
        <Crew frame={frame} />
        {personRef > 0.01 && k === 0 ? <Person {...LOOKS[3]} frame={frame} position={[5.2, 0, 16.9]} rotY={0.55} scale={P * personRef} seed={3} /> : null}
        {axis > 0.01 ? (
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[R * 2 * axis, 0.08, 0.3]} />
            <meshBasicMaterial color="#d9ccff" transparent opacity={0.6} />
          </mesh>
        ) : null}
        {/* raios do pôr do sol atravessando o monumento (−x → +x) */}
        {rays > 0.01 ? (
          <group>
            {[-2.2, 0, 2.2].map((z, i) => (
              <mesh key={i} position={[0, 2.4, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.6, 1.6, 60, 8, 1, true]} />
                <meshBasicMaterial color="#ffb070" transparent opacity={0.12 * rays} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        ) : null}
      </group>
      {/* Sol: nascente de verão a +x (um pouco à esquerda do Calcanhar), poente de inverno a −x */}
      {phase < 0.3 ? <Sun position={[44, lerp(-1.4, 1.1, rise), -0.8]} color="#ffcf7a" size={1.3} glow={1 - phase / 0.3} /> : null}
      {phase > 0.7 ? <Sun position={[-44, lerp(1.4, 0.35, set), 0]} color="#ff9a52" size={1.3} glow={(phase - 0.7) / 0.3} /> : null}
      <RoundPedestal />
      <MascotFromTracks />
    </group>
  );
};
