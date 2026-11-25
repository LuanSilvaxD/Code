import { useMemo } from "react";
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, LatheGeometry, Quaternion, ShaderMaterial, Vector2, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

/**
 * Sonda Voyager (desenho próprio, proporções reais; 1 u = 1 m).
 * Antena parabólica de 3,7 m virada para +Z, corpo decagonal de 1,78 m atrás dela, haste dos 3 geradores de plutônio
 * para −X, haste de ciência com a plataforma de câmeras para +X, haste longa do magnetômetro (13 m, diagonal) e as duas
 * antenas de rádio de 10 m em V para trás. Disco de ouro preso numa face lateral do corpo.
 *
 * rtg 0..1: brilho dos geradores · lights 0..6: luzes de status acesas · recordOut 0..1: o disco sai e gira para a câmera
 * mag 0..1: comprimento da haste do magnetômetro (para planos fechados, use ~0,35)
 */

const WHITE = "#efece4";
const GREY = "#9aa0a8";
const DARK = "#2c2f36";
const GOLD = "#c99a3a";
const FOIL = "#b88a2c";
const BLACKFOIL = "#1d1f26";

const up = new Vector3(0, 1, 0);
/** Cilindro entre dois pontos. */
export const Rod: React.FC<{ a: Vec3; b: Vec3; r: number; c: string; seg?: number; e?: string; ei?: number }> = ({ a, b, r, c, seg = 6, e, ei = 0 }) => {
  const va = new Vector3(...a), vb = new Vector3(...b);
  const len = va.distanceTo(vb);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new Quaternion().setFromUnitVectors(up, vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, seg]} />
      <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} emissive={e ?? "#000"} emissiveIntensity={ei} transparent />
    </mesh>
  );
};

/** Treliça triangular (3 longarinas + diagonais em zigue-zague), como as hastes reais. */
export const Truss: React.FC<{ a: Vec3; b: Vec3; w?: number; c?: string; bays?: number }> = ({ a, b, w = 0.12, c = GREY, bays = 8 }) => {
  const va = new Vector3(...a), vb = new Vector3(...b);
  const dir = vb.clone().sub(va).normalize();
  const side = new Vector3().crossVectors(dir, Math.abs(dir.y) > 0.9 ? new Vector3(1, 0, 0) : up).normalize();
  const side2 = new Vector3().crossVectors(dir, side).normalize();
  const corners = [0, 1, 2].map((k) => side.clone().multiplyScalar(Math.cos((k * 2 * Math.PI) / 3) * w).add(side2.clone().multiplyScalar(Math.sin((k * 2 * Math.PI) / 3) * w)));
  const P = (t: number, k: number): Vec3 => { const p = va.clone().lerp(vb, t).add(corners[k % 3]); return [p.x, p.y, p.z]; };
  const parts: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) parts.push(<Rod key={`l${k}`} a={P(0, k)} b={P(1, k)} r={0.012} c={c} />);
  for (let i = 0; i < bays; i++) for (let k = 0; k < 3; k++) parts.push(<Rod key={`d${i}-${k}`} a={P(i / bays, k)} b={P((i + 1) / bays, k + 1)} r={0.007} c={c} seg={4} />);
  return <group>{parts}</group>;
};

/** Painel de cobertura térmica com "rugas" (faixas de tom) — dourado ou preto. */
const foilTex = (base: string, seed: string) => {
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 64;
  const g = cv.getContext("2d")!;
  g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 18; i++) {
    const c = new Color(base).offsetHSL(0, 0, (rand(`${seed}${i}`) - 0.5) * 0.18);
    g.fillStyle = `#${c.getHexString()}`;
    g.globalAlpha = 0.6;
    const x = rand(`${seed}x${i}`) * 64, w = 3 + rand(`${seed}w${i}`) * 10;
    g.fillRect(x, 0, w, 64);
  }
  const t = new CanvasTexture(cv);
  return t;
};

const Dish: React.FC = () => {
  // paraboloide com a concavidade para +Y (local); o grupo gira para a concavidade olhar para +Z
  const R = 1.83, depth = 0.42;
  const geo = useMemo(() => {
    const pts: Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const r = (i / 24) * R; pts.push(new Vector2(r, (r * r) / (R * R) * depth)); }
    return new LatheGeometry(pts, 48);
  }, []);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={WHITE} roughness={0.5} side={DoubleSide} transparent />
      </mesh>
      {/* nervuras nas costas */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const c = Math.cos(a), sn = Math.sin(a);
        return (
          <group key={i}>
            <Rod a={[0, -0.06, 0]} b={[c * 0.9, 0.05, sn * 0.9]} r={0.014} c={GREY} seg={4} />
            <Rod a={[c * 0.9, 0.05, sn * 0.9]} b={[c * 1.78, depth - 0.05, sn * 1.78]} r={0.014} c={GREY} seg={4} />
          </group>
        );
      })}
      <mesh position={[0, depth, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.025, 6, 64]} />
        <meshStandardMaterial color={GREY} metalness={0.5} roughness={0.4} transparent />
      </mesh>
      {/* corneta no centro e subrefletor sobre 4 suportes */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.07, 0.13, 0.26, 14]} />
        <meshStandardMaterial color={WHITE} roughness={0.5} transparent />
      </mesh>
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        return <Rod key={k} a={[Math.cos(a) * 1.15, (1.15 * 1.15) / (R * R) * depth, Math.sin(a) * 1.15]} b={[0, 1.12, 0]} r={0.014} c={GREY} seg={4} />;
      })}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.25, 0.22, 0.06, 20]} />
        <meshStandardMaterial color={GREY} metalness={0.45} roughness={0.35} transparent />
      </mesh>
      <mesh position={[0, 1.24, 0]}>
        <cylinderGeometry args={[0.05, 0.09, 0.12, 12]} />
        <meshStandardMaterial color={WHITE} roughness={0.5} transparent />
      </mesh>
      {/* suporte atrás (liga ao corpo) */}
      <mesh position={[0, -0.14, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 0.2, 14]} />
        <meshStandardMaterial color={DARK} roughness={0.5} transparent />
      </mesh>
    </group>
  );
};

/** Gerador de plutônio (cilindro com 6 aletas). glow 0..1. */
const RTG: React.FC<{ p: Vec3; glow: number }> = ({ p, glow }) => (
  <group position={p} rotation={[0, 0, Math.PI / 2]}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
      <meshStandardMaterial color="#6a6e78" roughness={0.45} metalness={0.45} emissive="#ff5a10" emissiveIntensity={0.0} transparent />
    </mesh>
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.18, 0.46, 0.015]} />
          <meshStandardMaterial color="#555963" roughness={0.5} metalness={0.4} emissive="#ff5a10" emissiveIntensity={0.0} transparent />
        </mesh>
      );
    })}
    {/* anel de energia (brilha com o bloom; apaga quando a energia cai) */}
    <mesh>
      <cylinderGeometry args={[0.205, 0.205, 0.06, 16]} />
      <meshBasicMaterial color={new Color("#ff7a2a").multiplyScalar(0.25 + 1.1 * glow)} toneMapped={false} transparent />
    </mesh>
    {[-0.27, 0.27].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
        <meshStandardMaterial color={GREY} metalness={0.4} transparent />
      </mesh>
    ))}
  </group>
);

/** Disco de ouro (desenho próprio): sulcos concêntricos, rótulo central e capa de alumínio com desenhos simples. */
export const GoldenRecord: React.FC<{ cover?: number; r?: number }> = ({ cover = 0, r = 0.155 }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r, 0.012, 48]} />
      <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.28} emissive="#5a3a08" emissiveIntensity={0.25} transparent />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[0, 0, 0.0065]}>
        <ringGeometry args={[r * (0.32 + i * 0.075), r * (0.32 + i * 0.075) + r * 0.012, 64]} />
        <meshStandardMaterial color="#8a6420" metalness={0.8} roughness={0.35} transparent />
      </mesh>
    ))}
    <mesh position={[0, 0, 0.007]}>
      <circleGeometry args={[r * 0.26, 32]} />
      <meshStandardMaterial color="#e2b85a" metalness={0.7} roughness={0.3} transparent />
    </mesh>
    <mesh position={[0, 0, 0.008]}>
      <circleGeometry args={[r * 0.03, 12]} />
      <meshStandardMaterial color="#3a2a10" transparent />
    </mesh>
    {cover > 0.01 ? (
      <group position={[0, 0, 0.012]}>
        <mesh>
          <circleGeometry args={[r * 1.04, 48]} />
          <meshStandardMaterial color="#b8bcc4" metalness={0.75} roughness={0.35} transparent opacity={cover} />
        </mesh>
        {/* desenhos gravados (abstratos, desenho próprio): um disco, uma agulha, um mapa de pontos */}
        {[[-0.05, 0.05, 0.035], [0.06, -0.05, 0.02]].map(([x, y, rr], i) => (
          <mesh key={i} position={[x * r / 0.155, y * r / 0.155, 0.001]}>
            <ringGeometry args={[rr * r / 0.155, rr * r / 0.155 + 0.002, 32]} />
            <meshBasicMaterial color="#5a5e66" transparent opacity={cover} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={`s${i}`} position={[0.06 * r / 0.155, 0.06 * r / 0.155, 0.001]} rotation={[0, 0, (i / 8) * Math.PI]}>
            <planeGeometry args={[0.002, (0.02 + rand(`cv${i}`) * 0.03) * r / 0.155]} />
            <meshBasicMaterial color="#5a5e66" transparent opacity={cover} />
          </mesh>
        ))}
      </group>
    ) : null}
  </group>
);

export const Voyager: React.FC<{ f: number; rtg?: number; lights?: number; recordOut?: number; mag?: number; whips?: number }> = ({ f, rtg = 0.4, lights = 6, recordOut = 0, mag = 1, whips = 1 }) => {
  const gold = useMemo(() => foilTex(FOIL, "gf"), []);
  const black = useMemo(() => foilTex(BLACKFOIL, "bf"), []);
  const ro = clamp(recordOut, 0, 1);
  const blink = Math.floor(f / 18) % 2;
  return (
    <group>
      {/* antena parabólica (virada para +Z) */}
      <group position={[0, 0, 0.35]}>
        <Dish />
      </group>
      {/* corpo decagonal com cobertura térmica alternando dourado/preto */}
      <group position={[0, 0, -0.05]}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const R = 0.82;
          return (
            <mesh key={i} position={[Math.cos(a) * R, Math.sin(a) * R, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.04, 0.53, 0.47]} />
              <meshStandardMaterial map={i % 3 === 0 ? black : gold} color="#ffffff" metalness={0.15} roughness={0.5} transparent />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.46, 10]} />
          <meshStandardMaterial color={BLACKFOIL} roughness={0.7} transparent />
        </mesh>
        {/* tanque esférico de combustível atrás */}
        <mesh position={[0, 0, -0.32]}>
          <sphereGeometry args={[0.27, 20, 14]} />
          <meshStandardMaterial map={gold} color="#ffffff" metalness={0.15} roughness={0.5} transparent />
        </mesh>
        {/* disco de ouro na face lateral (+Y), sai e gira para a câmera com recordOut */}
        <group position={[0, 0.86 + ro * 1.5, 0.02 + ro * 1.3]} rotation={[-Math.PI / 2 + ro * Math.PI / 2, 0, ro * f * 0.01]}>
          <GoldenRecord cover={ro > 0.05 ? 0 : 1} />
        </group>
        {/* luzes de status (estilizadas) */}
        {Array.from({ length: 6 }, (_, i) => {
          const on = i < lights;
          const a = -0.9 + i * 0.16;
          return (
            <mesh key={`led${i}`} position={[Math.cos(a) * 0.86, Math.sin(a) * 0.86, -0.25]}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <meshBasicMaterial color={on ? (i === 0 && blink ? "#c8ffd8" : "#58ff8a") : "#1a2a1e"} toneMapped={false} transparent />
            </mesh>
          );
        })}
        {/* propulsores */}
        {[0.6, -0.6].map((x) => (
          <mesh key={x} position={[x, -0.55, -0.15]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.05, 0.12, 8]} />
            <meshStandardMaterial color={GREY} metalness={0.5} transparent />
          </mesh>
        ))}
      </group>
      {/* haste dos geradores (−X) */}
      <Truss a={[-0.8, 0, -0.1]} b={[-2.9, -0.1, -0.2]} w={0.09} bays={7} />
      {[-1.45, -2.0, -2.55].map((x) => <RTG key={x} p={[x, -0.06, -0.17]} glow={rtg} />)}
      {/* haste de ciência (+X) com plataforma de câmeras */}
      <Truss a={[0.8, 0, -0.1]} b={[2.3, -0.45, -0.1]} w={0.09} bays={6} />
      <group position={[2.45, -0.55, -0.05]}>
        <mesh><boxGeometry args={[0.42, 0.32, 0.36]} /><meshStandardMaterial map={black} color="#ffffff" roughness={0.6} transparent /></mesh>
        <mesh position={[0.05, -0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.08, 0.32, 14]} /><meshStandardMaterial color={WHITE} roughness={0.5} transparent /></mesh>
        <mesh position={[-0.12, 0.06, 0.24]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.05, 0.2, 12]} /><meshStandardMaterial color={WHITE} roughness={0.5} transparent /></mesh>
        <mesh position={[0.05, -0.05, 0.47]}><circleGeometry args={[0.06, 14]} /><meshStandardMaterial color="#1a2030" metalness={0.6} roughness={0.2} transparent /></mesh>
        <mesh position={[0.18, 0.14, 0]}><boxGeometry args={[0.16, 0.14, 0.2]} /><meshStandardMaterial map={gold} color="#ffffff" metalness={0.5} transparent /></mesh>
        <mesh position={[-0.2, -0.12, 0.05]}><boxGeometry args={[0.14, 0.2, 0.26]} /><meshStandardMaterial color={WHITE} roughness={0.5} transparent /></mesh>
        <mesh position={[0.0, 0.2, -0.05]} rotation={[0.4, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 0.05, 14]} /><meshStandardMaterial color={GREY} metalness={0.5} transparent /></mesh>
      </group>
      {/* haste do magnetômetro (13 m, diagonal) com sensores */}
      {mag > 0.01 ? (
        <group>
          <Truss a={[0.3, 0.75, -0.2]} b={[0.3 + 12.4 * mag * 0.92, 0.75 + 12.4 * mag * 0.36, -0.2 - 12.4 * mag * 0.15]} w={0.06} bays={Math.max(4, Math.round(26 * mag))} c="#868a94" />
          <mesh position={[0.3 + 12.4 * mag * 0.92, 0.75 + 12.4 * mag * 0.36, -0.2 - 12.4 * mag * 0.15]}><boxGeometry args={[0.14, 0.14, 0.14]} /><meshStandardMaterial color={WHITE} transparent /></mesh>
        </group>
      ) : null}
      {/* antenas de rádio de 10 m em V para trás */}
      {whips > 0.01 ? [1, -1].map((s) => <Rod key={s} a={[0, -0.6, -0.3]} b={[s * 5 * whips, -1.9 * whips, -8.4 * whips]} r={0.008} c="#d8d8d8" seg={4} />) : null}
    </group>
  );
};

const rimMat = (color: string, power: number, gain: number) =>
  new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
    uniforms: { uColor: { value: new Color(color) }, uPow: { value: power }, uGain: { value: gain } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uPow; uniform float uGain; varying vec3 vN; varying vec3 vV; void main(){ float r = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow); gl_FragColor = vec4(uColor * r * uGain, r * uGain); }`,
  });

/** Bolha do Sol (heliosfera): casca transparente que só brilha na borda (como bolha de sabão), com cauda; centro no Sol. glow 0..1 acende a borda. */
export const Heliosphere: React.FC<{ f: number; R?: number; glow?: number }> = ({ f, R = 10, glow = 0 }) => {
  const shell = useMemo(() => rimMat("#7f8cff", 2.6, 1), []);
  const nose = useMemo(() => rimMat("#d6dcff", 5.0, 1), []);
  shell.uniforms.uGain.value = 0.55 + 0.6 * glow;
  nose.uniforms.uGain.value = 0.25 + 0.9 * glow;
  return (
    <group>
      <mesh scale={[1.55, 0.9, 0.9]} position={[-0.5 * R, 0, 0]} material={shell}>
        <sphereGeometry args={[R, 64, 40]} />
      </mesh>
      <mesh scale={[1.58, 0.93, 0.93]} position={[-0.5 * R, 0, 0]} material={nose}>
        <sphereGeometry args={[R, 64, 40]} />
      </mesh>
      {/* vento solar: partículas saindo do Sol */}
      {Array.from({ length: 70 }, (_, i) => {
        const th = rand(`hw${i}`) * Math.PI * 2, ph = Math.acos(2 * rand(`hp${i}`) - 1);
        const d = ((rand(`hd${i}`) + f * 0.004) % 1) * R * 0.95;
        return (
          <mesh key={i} position={[Math.sin(ph) * Math.cos(th) * d, Math.cos(ph) * d * 0.85, Math.sin(ph) * Math.sin(th) * d * 0.85]}>
            <sphereGeometry args={[0.045, 6, 4]} />
            <meshBasicMaterial color="#ffd9a0" transparent opacity={0.7 * (1 - d / R)} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Sol com halo (brilha com o bloom). */
export const SunGlow: React.FC<{ r?: number }> = ({ r = 1 }) => (
  <group>
    <mesh><sphereGeometry args={[r, 32, 20]} /><meshBasicMaterial color="#fff2c8" toneMapped={false} /></mesh>
    {[1.6, 2.4, 3.6].map((k, i) => (
      <mesh key={i}><sphereGeometry args={[r * k, 24, 16]} /><meshBasicMaterial color="#ffb24a" transparent opacity={0.16 / (i + 1)} depthWrite={false} blending={AdditiveBlending} /></mesh>
    ))}
  </group>
);

/** Pulso de rádio viajando de `from` a `to` (t 0..1): cabeça brilhante, ondinhas atrás e rastro de luz. */
export const SignalPulse: React.FC<{ from: Vec3; to: Vec3; t: number; color?: string; size?: number }> = ({ from, to, t, color = "#c4b5fd", size = 0.5 }) => {
  if (t <= 0 || t >= 0.999) return null;
  const a = new Vector3(...from), b = new Vector3(...to);
  const at = (k: number): Vec3 => { const p = a.clone().lerp(b, clamp(k, 0, 1)); return [p.x, p.y, p.z]; };
  return (
    <group>
      <mesh position={at(t)}><sphereGeometry args={[size * 0.32, 16, 12]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh position={at(t)}><sphereGeometry args={[size * 0.7, 16, 12]} /><meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} /></mesh>
      {[1, 2, 3, 4].map((i) => (
        <mesh key={i} position={at(t - i * 0.025)}><sphereGeometry args={[size * (0.28 - i * 0.05), 10, 8]} /><meshBasicMaterial color={color} transparent opacity={0.7 - i * 0.15} toneMapped={false} depthWrite={false} blending={AdditiveBlending} /></mesh>
      ))}
      <Rod a={from} b={at(t)} r={size * 0.035} c={color} e={color} ei={1.6} />
    </group>
  );
};
