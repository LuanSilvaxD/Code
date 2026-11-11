import { useMemo } from "react";
import { AdditiveBlending, BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Quaternion, ShaderMaterial, Vector3 } from "three";
import { useCurrentFrame } from "remotion";
import { isVisible, track } from "../data/scenes";
import { CLUSTER_N, clusterMolecule, DOME, domeEntry, EYE, EYE_RAY_POINTS, HILL, hillY, insideDome, isN2, lerp3, NOON_SUN, PRISM, sunPos } from "../data/sky";
import { MATTE } from "../theme";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";
import { Arrow3D } from "./Arrow3D";
import { BrandPedestal } from "./BrandPedestal";
import { crowdLooks, Person, worldScale } from "./Person";

// Mundo persistente: maquete (mar · morro · deserto) sob a meia-cúpula de ar, o Sol num arco e o feixe de
// fótons. Tudo lê as trilhas no frame GLOBAL (continuidade entre cortes).

const LAND = { w: 8, d: 3.6 };
const SPECTRUM = ["#ff3b3b", "#ff8a1f", "#ffd52a", "#39d353", "#2f8bff", "#8b5cff"];
/** quanto cada cor é desviada (Rayleigh: muito mais para onda curta) */
const SCATTER_K = [0.06, 0.14, 0.28, 0.5, 1, 1.1];
/** no fim de tarde, ao longo do caminho longo */
const STRIP_K = [0, 0.1, 0.45, 0.85, 1, 1];

const quatTo = (dir: Vec3) => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...dir).normalize());

/** Cilindro fino de a até b (opcionalmente só a fração `t` a partir de a). */
const Segment: React.FC<{ a: Vec3; b: Vec3; t?: number; r: number; color: string; opacity?: number; additive?: boolean }> = ({ a, b, t = 1, r, color, opacity = 1, additive }) => {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d) * clamp(t, 0, 1);
  if (len < 0.002 || opacity < 0.01) return null;
  const q = quatTo(d);
  const n = Math.hypot(...d);
  const mid: Vec3 = [a[0] + (d[0] / n) * (len / 2), a[1] + (d[1] / n) * (len / 2), a[2] + (d[2] / n) * (len / 2)];
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} blending={additive ? AdditiveBlending : undefined} />
    </mesh>
  );
};

// ------------------------------------------------------------------------------------------- maquete
const Tree: React.FC<{ p: Vec3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.5, 6]} />
      <meshStandardMaterial {...MATTE} color="#7a5634" />
    </mesh>
    <mesh position={[0, 0.72, 0]} castShadow>
      <icosahedronGeometry args={[0.42, 0]} />
      <meshStandardMaterial {...MATTE} color="#4f9d6a" />
    </mesh>
  </group>
);

const Cactus: React.FC<{ p: Vec3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.06, 0.5, 6]} />
      <meshStandardMaterial {...MATTE} color="#5f9a57" />
    </mesh>
    <mesh position={[0.1, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.035, 0.035, 0.18, 6]} />
      <meshStandardMaterial {...MATTE} color="#5f9a57" />
    </mesh>
    <mesh position={[-0.09, 0.22, 0]} castShadow>
      <cylinderGeometry args={[0.032, 0.032, 0.14, 6]} />
      <meshStandardMaterial {...MATTE} color="#5f9a57" />
    </mesh>
  </group>
);

const Land: React.FC<{ frame: number }> = ({ frame }) => {
  const look = crowdLooks(1, "ceu")[0];
  const { person } = worldScale(0.3);
  const px = 0.95;
  const pz = 0.6;
  return (
    <group>
      {/* corpo da maquete */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[LAND.w, 0.8, LAND.d]} />
        <meshStandardMaterial {...MATTE} color="#8a6448" />
      </mesh>
      {/* mar (esquerda) */}
      <mesh position={[-2.75, -0.13, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.16, LAND.d]} />
        <meshStandardMaterial {...MATTE} color="#2f7fc4" emissive="#1d5a9c" emissiveIntensity={0.25} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const x = -3.8 + (i % 3) * 0.8 + 0.15 * Math.sin(frame / 30 + i);
        const z = -1.2 + Math.floor(i / 3) * 1.2;
        return (
          <mesh key={i} position={[x, -0.04 + 0.015 * Math.sin(frame / 12 + i * 1.7), z]} scale={[0.34, 0.03, 0.12]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial {...MATTE} color="#5aa6e6" />
          </mesh>
        );
      })}
      {/* praia */}
      <mesh position={[-1.3, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.1, LAND.d]} />
        <meshStandardMaterial {...MATTE} color="#e8d29a" />
      </mesh>
      {/* grama */}
      <mesh position={[0.4, -0.05, 0]} receiveShadow>
        <boxGeometry args={[3.0, 0.1, LAND.d]} />
        <meshStandardMaterial {...MATTE} color="#7fae6a" />
      </mesh>
      {/* deserto (direita) */}
      <mesh position={[2.95, -0.05, 0]} receiveShadow>
        <boxGeometry args={[2.1, 0.1, LAND.d]} />
        <meshStandardMaterial {...MATTE} color="#e2c07c" />
      </mesh>
      {[
        [2.6, -0.6, 0.7, 0.3, 0.6],
        [3.45, 0.7, 0.6, 0.24, 0.5],
        [2.35, 1.15, 0.5, 0.18, 0.4],
      ].map(([x, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, 0, z]} scale={[sx, sy, sz]} receiveShadow castShadow>
          <sphereGeometry args={[1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...MATTE} color="#d9b268" />
        </mesh>
      ))}
      <Cactus p={[3.05, 0, 0.15]} />
      <Cactus p={[3.6, 0, -0.9]} s={0.8} />
      {/* morro com os observadores */}
      <mesh position={HILL.c} scale={HILL.r} receiveShadow castShadow>
        <sphereGeometry args={[1, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...MATTE} color="#6fa35c" />
      </mesh>
      <Tree p={[-0.55, 0, -0.95]} s={1.05} />
      <Tree p={[1.75, 0, -1.05]} s={0.9} />
      <Tree p={[-0.85, 0, 1.25]} s={0.75} />
      <Person {...look} seed={3} frame={frame} position={[px, hillY(px, pz), pz]} rotY={-0.35} scale={person} look={-0.5 * track("person.look", frame)} />
      <BrandPedestal width={LAND.w} depth={LAND.d} y={-0.9} />
    </group>
  );
};

// ------------------------------------------------------------------------------------------- cúpula de ar
const domeVert = /* glsl */ `
varying vec3 vLocal; varying vec3 vWorld; varying vec3 vNormal;
void main() {
  vLocal = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const domeFrag = /* glsl */ `
uniform float uGlow; uniform float uSunset; uniform float uViolet; uniform float uSpace; uniform float uDesert; uniform float uSplit;
varying vec3 vLocal; varying vec3 vWorld; varying vec3 vNormal;
void main() {
  // vLocal: esfera unitária (achatada pelo scale do mesh)
  float h = clamp(vLocal.y, 0.0, 1.0);
  float xs = clamp(vLocal.x, -1.0, 1.0);
  vec3 blue = vec3(0.30, 0.62, 1.0);
  vec3 deep = vec3(0.13, 0.27, 0.80);
  vec3 violet = vec3(0.62, 0.40, 1.0);
  vec3 day = mix(blue, deep, h * 0.55);
  day = mix(day, violet, uViolet);
  float side = clamp(0.5 - xs * 0.5, 0.0, 1.0);
  float warm = (1.0 - h) * (0.45 + 0.55 * side);
  vec3 dusk = mix(vec3(0.26, 0.16, 0.48), vec3(1.0, 0.50, 0.16), smoothstep(0.05, 0.85, warm));
  dusk = mix(dusk, vec3(0.95, 0.27, 0.18), smoothstep(0.75, 1.0, warm) * 0.6);
  float m = mix(uSunset, smoothstep(0.18, -0.18, xs), uSplit);
  vec3 col = mix(day, dusk, m);
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - abs(dot(normalize(vNormal), v)), 2.0);
  float desert = uDesert * smoothstep(0.3, 0.55, xs);
  float a = (0.07 + 0.2 * uGlow + 0.22 * desert + 0.08 * m) * (1.0 - 0.75 * uSpace) + fres * (0.25 + 0.35 * uGlow + 0.5 * uSpace);
  col = mix(col, vec3(1.0), fres * 0.18) + desert * 0.12;
  gl_FragColor = vec4(col, clamp(a, 0.0, 0.85));
}`;

const Dome: React.FC<{ frame: number }> = ({ frame }) => {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: domeVert,
        fragmentShader: domeFrag,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        uniforms: { uGlow: { value: 0 }, uSunset: { value: 0 }, uViolet: { value: 0 }, uSpace: { value: 0 }, uDesert: { value: 0 }, uSplit: { value: 0 } },
      }),
    [],
  );
  const u = mat.uniforms;
  u.uGlow.value = Math.max(track("sky.glowBlue", frame), 0.35);
  u.uSunset.value = track("sky.sunset", frame);
  u.uViolet.value = track("sky.violetTint", frame) * 0.85;
  u.uSpace.value = track("space.view", frame);
  u.uDesert.value = track("desert.skyGlow", frame) * (1 - track("sky.glowBlue", frame));
  u.uSplit.value = track("finalSplit", frame);
  return (
    <mesh position={[0, 0, 0]} scale={[DOME.rx, DOME.ry, DOME.rz]} material={mat} renderOrder={5}>
      <sphereGeometry args={[1, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </mesh>
  );
};

// ------------------------------------------------------------------------------------------- Sol
const SunBall: React.FC<{ p: Vec3; warm: number; scale?: number; opacity?: number }> = ({ p, warm, scale = 1, opacity = 1 }) => {
  const core = new Color("#fff4c8").lerp(new Color("#ff8a3a"), warm);
  const halo = new Color("#ffd36b").lerp(new Color("#ff5a24"), warm);
  if (opacity < 0.01) return null;
  return (
    <group position={p} scale={scale}>
      <mesh>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshBasicMaterial color={core} transparent opacity={opacity} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.8, 20, 14]} />
        <meshBasicMaterial color={halo} transparent opacity={0.32 * opacity} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.3, 20, 14]} />
        <meshBasicMaterial color={halo} transparent opacity={0.12 * opacity} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------------------------------- fótons
const N_PHOTONS = 64;
const N_VIOLET = 14;

const Photons: React.FC<{ frame: number; sun: Vec3 }> = ({ frame, sun }) => {
  const flow = track("photons.flow", frame);
  const scatter = track("photons.scatter", frame);
  const strip = track("photons.sunsetStrip", frame);
  const violet = track("photons.violet", frame);
  if (flow < 0.01) return null;
  const uIn = domeEntry(sun, EYE);
  const out: React.ReactNode[] = [];
  const total = N_PHOTONS + N_VIOLET;
  for (let i = 0; i < total; i++) {
    const isV = i >= N_PHOTONS;
    const c = isV ? 5 : i % 5;
    const vis = isV ? violet : 1;
    if (vis < 0.01) continue;
    const T = 62 + 16 * rand(`ph-t${i}`);
    const u = (rand(`ph-p${i}`) + frame / T) % 1;
    const a0 = rand(`ph-a${i}`) * Math.PI * 2;
    const r0 = Math.sqrt(rand(`ph-r${i}`));
    const start: Vec3 = [sun[0] + Math.cos(a0) * 0.42 * r0, sun[1] + Math.sin(a0) * 0.42 * r0, sun[2] + 0.3 * Math.sin(a0 * 2)];
    const end: Vec3 = [EYE[0] + Math.cos(a0) * 0.12 * r0, EYE[1] + Math.sin(a0) * 0.12 * r0, EYE[2]];
    const prob = clamp(scatter * SCATTER_K[c] + strip * STRIP_K[c], 0, 1);
    const scattered = rand(`ph-s${i}`) < prob;
    const us = uIn + (1 - uIn) * (0.05 + 0.85 * rand(`ph-u${i}`) * (1 - 0.7 * strip));
    let p = lerp3(start, end, u);
    let alpha = Math.min(1, u * 12, (1 - u) * 14);
    if (scattered && u > us) {
      const k = (u - us) / Math.max(0.05, 1 - us);
      const th = rand(`ph-d${i}`) * Math.PI * 2;
      const el = (rand(`ph-e${i}`) - 0.35) * 2.2;
      const dir: Vec3 = [Math.cos(th) * Math.cos(el), Math.sin(el), Math.sin(th) * Math.cos(el) * 0.6];
      const base = lerp3(start, end, us);
      const L = 3.2 * k;
      p = [base[0] + dir[0] * L, base[1] + dir[1] * L, base[2] + dir[2] * L];
      alpha = Math.min(alpha, 1 - k * 0.85);
      if (!insideDome(p) && k > 0.3) alpha *= 0.4;
    }
    const o = alpha * flow * vis;
    if (o < 0.02) continue;
    out.push(
      <mesh key={i} position={p}>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshBasicMaterial color={SPECTRUM[c]} transparent opacity={o} depthWrite={false} />
      </mesh>,
    );
  }
  return <group>{out}</group>;
};

// ------------------------------------------------------------------------------------------- moléculas
const Molecule: React.FC<{ p: Vec3; r: number; n2: boolean; spin: number }> = ({ p, r, n2, spin }) => {
  const color = n2 ? "#a9bddf" : "#ff8f7a";
  return (
    <group position={p} rotation={[spin * 0.7, spin, 0.4]}>
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[sgn * r * 0.8, 0, 0]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial {...MATTE} color={color} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
};

const Molecules: React.FC<{ frame: number }> = ({ frame }) => {
  const zoom = track("molecules.zoom", frame);
  const field = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const u = rand(`mf-u${i}`) * 2 - 1;
        const a = rand(`mf-a${i}`) * Math.PI * 2;
        const rr = 0.25 + 0.7 * Math.cbrt(rand(`mf-r${i}`));
        const sq = Math.sqrt(1 - u * u);
        return [DOME.rx * rr * sq * Math.cos(a), DOME.ry * rr * Math.abs(u), DOME.rz * rr * sq * Math.sin(a)] as Vec3;
      }),
    [],
  );
  return (
    <group>
      {field.map((p, i) => (
        <Molecule key={`f${i}`} p={p} r={0.028} n2={i % 5 !== 0} spin={frame * 0.02 + i} />
      ))}
      {Array.from({ length: CLUSTER_N }, (_, i) => (
        <Molecule key={`c${i}`} p={clusterMolecule(i, frame)} r={lerp(0.028, 0.085, zoom)} n2={isN2(i)} spin={frame * 0.015 + i * 1.3} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------- extras
const Stars: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const geo = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 1100; i++) {
      const u = rand(`st-u${i}`) * 2 - 1;
      const a = rand(`st-a${i}`) * Math.PI * 2;
      const r = 70 * (0.7 + 0.3 * rand(`st-r${i}`));
      const sq = Math.sqrt(1 - u * u);
      pos.push(r * sq * Math.cos(a), r * u, r * sq * Math.sin(a));
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, []);
  if (opacity < 0.01) return null;
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.2} sizeAttenuation transparent opacity={opacity * (0.85 + 0.15 * Math.sin(frame / 7))} depthWrite={false} />
    </points>
  );
};

const Prism: React.FC<{ frame: number; sun: Vec3 }> = ({ frame, sun }) => {
  const show = track("prism.show", frame);
  const white = track("ray.white", frame);
  const fan = track("spectrum.fan", frame);
  if (show < 0.01 && white < 0.01) return null;
  const out = [PRISM[0] + 0.12, PRISM[1] - 0.12, PRISM[2]] as Vec3;
  return (
    <group>
      <Segment a={sun} b={PRISM} t={white} r={0.07} color="#fffbe8" opacity={0.95 * white} />
      <Segment a={sun} b={PRISM} t={white} r={0.16} color="#fff2b0" opacity={0.25 * white} additive />
      {show > 0.01 ? (
        <mesh position={PRISM} rotation={[Math.PI / 2, 0.3 + frame * 0.004, 0.4]} scale={clamp(show, 0, 1.2) * 0.42}>
          <cylinderGeometry args={[1, 1, 0.9, 3]} />
          <meshStandardMaterial color="#dff3ff" transparent opacity={0.72} roughness={0.15} metalness={0.1} flatShading emissive="#bfe6ff" emissiveIntensity={0.25} />
        </mesh>
      ) : null}
      {SPECTRUM.map((col, i) => {
        // leque para baixo e à direita
        const ang = -0.95 + (i - 2.5) * 0.11;
        const L = 1.25;
        const b: Vec3 = [out[0] + Math.cos(ang) * L, out[1] + Math.sin(ang) * L, out[2] + 0.1];
        return <Segment key={i} a={out} b={b} t={fan} r={0.035} color={col} opacity={0.95 * fan * clamp(show, 0, 1)} />;
      })}
    </group>
  );
};

const EyeRays: React.FC<{ frame: number }> = ({ frame }) => {
  const show = track("eyeRays.show", frame);
  if (show < 0.01) return null;
  return (
    <group>
      {EYE_RAY_POINTS.map((p, i) => {
        const t = clamp(show * 1.4 - i * 0.03, 0, 1);
        const k = ((frame + i * 9) % 36) / 36;
        const pulse = lerp3(p, EYE, k);
        return (
          <group key={i}>
            <Segment a={p} b={EYE} t={t} r={0.018} color="#7cc0ff" opacity={0.75 * t} />
            {t > 0.98 ? (
              <mesh position={pulse}>
                <sphereGeometry args={[0.05, 8, 6]} />
                <meshBasicMaterial color="#2f8bff" />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

const Dashes: React.FC<{ a: Vec3; b: Vec3; reveal: number; inColor: string; outColor: string; r?: number }> = ({ a, b, reveal, inColor, outColor, r = 0.035 }) => {
  if (reveal < 0.01) return null;
  const n = 34;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    if (i / n > reveal) break;
    const p = lerp3(a, b, (i + 0.5) / n);
    const q = lerp3(a, b, (i + 0.95) / n);
    const inside = insideDome(p);
    out.push(<Segment key={i} a={p} b={q} r={inside ? r * 1.4 : r * 0.7} color={inside ? inColor : outColor} opacity={inside ? 1 : 0.45} />);
  }
  return <group>{out}</group>;
};

const MythArrows: React.FC<{ frame: number }> = ({ frame }) => {
  const s = track("myth.arrows", frame);
  const strike = track("myth.strike", frame);
  if (s < 0.01) return null;
  const color = new Color("#53d6ff").lerp(new Color("#e5383b"), strike).getStyle();
  const xs = [-3.3, -2.6, -1.9];
  return (
    <group>
      {xs.map((x, i) => (
        <Arrow3D key={i} from={[x, 0.05, 0.4]} dir={[0.18, 1, 0]} length={1.5} radius={0.06} color={color} scale={s} />
      ))}
      {strike > 0.01 ? (
        <group position={[-2.55, 1.0, 0.9]} scale={clamp(strike, 0, 1) * s}>
          {[0.78, -0.78].map((rz) => (
            <mesh key={rz} rotation={[0, 0, rz]}>
              <boxGeometry args={[1.7, 0.16, 0.08]} />
              <meshBasicMaterial color="#e5383b" />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const a = track("sun.angle", frame, 0.12);
  const sun = sunPos(a);
  const warm = clamp((a - 0.45) / 0.45, 0, 1);
  const space = track("space.view", frame);
  const noon = Math.max(track("path.noon", frame), track("finalSplit", frame));
  return (
    <group>
      <Land frame={frame} />
      <MythArrows frame={frame} />
      <SunBall p={sun} warm={warm} scale={1 - 0.45 * track("sun.space", frame)} />
      {/* "Sol do meio-dia" de comparação (caminho curto) */}
      <SunBall p={NOON_SUN} warm={0} opacity={noon * 0.9} scale={0.85} />
      <Prism frame={frame} sun={sun} />
      {isVisible("molecules", frame) ? <Molecules frame={frame} /> : null}
      <Photons frame={frame} sun={sun} />
      <EyeRays frame={frame} />
      <Dashes a={NOON_SUN} b={EYE} reveal={track("path.noon", frame)} inColor="#9fd0ff" outColor="#e8f2ff" />
      <Dashes a={sun} b={EYE} reveal={track("path.sunset", frame)} inColor="#ff9a3c" outColor="#ffe2c2" r={0.04} />
      <Stars frame={frame} opacity={track("stars.show", frame) * clamp(space * 1.3, 0, 1)} />
      <Dome frame={frame} />
    </group>
  );
};
