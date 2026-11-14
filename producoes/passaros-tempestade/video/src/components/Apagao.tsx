import { useMemo } from "react";
import { AdditiveBlending, BackSide, CanvasTexture, CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, RepeatWrapping, Shape, ShaderMaterial, SphereGeometry, SRGBColorSpace, TextureLoader, Vector2, Vector3 } from "three";
import { useLoader } from "@react-three/fiber";
import { staticFile } from "remotion";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";
import BR from "../data/brazil-states.json";

// "Vai ter apagão mundial?" — elementos novos (aprovar na folha de design antes de usar).
// Globo, Sol, satélite e mapa do Brasil: u3d ESQUEMÁTICOS. Sala e Itaipu: METROS (na cena: <group scale={U}>).

const MATTE = { roughness: 0.9, metalness: 0, flatShading: true } as const;
const B: React.FC<{ p?: Vec3; s: Vec3; c: string; r?: Vec3; e?: string; ei?: number; m?: number }> = ({ p = [0, 0, 0], s, c, r, e, ei = 0, m = 0 }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} {...MATTE} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} />
  </mesh>
);
const Cy: React.FC<{ p?: Vec3; r1: number; r2?: number; h: number; c: string; rot?: Vec3; seg?: number; e?: string; ei?: number }> = ({ p = [0, 0, 0], r1, r2, h, c, rot, seg = 16, e, ei = 0 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r1, r1, h, seg]} />
    <meshStandardMaterial color={c} {...MATTE} emissive={e ?? "#000"} emissiveIntensity={ei} />
  </mesh>
);

/* ------------------------------------------------------------------ GLOBO NOTURNO */

/** lon/lat (graus) → ponto na esfera de raio R (mesmo mapeamento de UV do SphereGeometry). */
export const onGlobe = (lon: number, lat: number, R: number): Vec3 => {
  const phi = ((lon + 180) * Math.PI) / 180;
  const la = (lat * Math.PI) / 180;
  return [-R * Math.cos(phi) * Math.cos(la), R * Math.sin(la), R * Math.sin(phi) * Math.cos(la)];
};

const useTex = (name: string) => {
  const t = useLoader(TextureLoader, staticFile(name));
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  return t;
};

const GLOBE_VS = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`;
const GLOBE_FS = /* glsl */ `
uniform sampler2D uBase; uniform sampler2D uLights; uniform sampler2D uGrids;
uniform float uOn; uniform float uGrid; uniform vec2 uOff; uniform float uOffR; uniform float uOffK; uniform vec3 uSun;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 base = texture2D(uBase, vUv).rgb;
  vec3 grid = texture2D(uGrids, vUv).rgb;
  vec3 lit = texture2D(uLights, vUv).rgb;
  float lam = max(dot(normalize(vN), normalize(vV + uSun * 0.35)), 0.0);
  vec3 col = mix(base * (0.55 + 0.9 * lam), grid * (0.45 + 0.75 * lam), uGrid);
  // apagar: varre de leste (u alto) para oeste
  float on = smoothstep(vUv.x - 0.06, vUv.x + 0.06, uOn * 1.14 - 0.02);
  // apagão regional (Quebec): disco em uv
  vec2 d = vUv - uOff; d.x *= 2.0;
  on *= 1.0 - uOffK * (1.0 - smoothstep(uOffR, uOffR * 1.4, length(d)));
  col += lit * 1.35 * on * (1.0 - 0.75 * uGrid);
  float rim = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 3.0);
  col += vec3(0.25, 0.45, 1.0) * rim * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

export const NightGlobe: React.FC<{ R?: number; spin?: number; on?: number; grids?: number; quebec?: number }> = ({ R = 3, spin = 0, on = 1, grids = 0, quebec = 0 }) => {
  const base = useTex("globe-night.png");
  const lights = useTex("globe-lights.png");
  const gridT = useTex("globe-grids.png");
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: GLOBE_VS,
        fragmentShader: GLOBE_FS,
        uniforms: {
          uBase: { value: base }, uLights: { value: lights }, uGrids: { value: gridT },
          uOn: { value: 1 }, uGrid: { value: 0 }, uOff: { value: new Vector2((-72 + 180) / 360, (50 + 90) / 180) }, uOffR: { value: 0.035 }, uOffK: { value: 0 },
          uSun: { value: new Vector3(0.4, 0.5, 0.8) },
        },
      }),
    [base, lights, gridT],
  );
  mat.uniforms.uOn.value = clamp(on, 0, 1);
  mat.uniforms.uGrid.value = clamp(grids, 0, 1);
  mat.uniforms.uOffK.value = clamp(quebec, 0, 1);
  const geo = useMemo(() => new SphereGeometry(R, 96, 64), [R]);
  return (
    <group rotation={[0, spin, 0]}>
      <mesh geometry={geo} material={mat} />
      {/* halo da atmosfera */}
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 48, 32]} />
        <meshBasicMaterial color="#3c6dff" transparent opacity={0.12} side={DoubleSide} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Cabo único "da tomada do planeta" em volta do globo + plugue; break 0..1 parte o cabo em pedaços que caem. */
export const WorldCable: React.FC<{ R?: number; on?: number; brk?: number }> = ({ R = 3, on = 1, brk = 0 }) => {
  const n = 24;
  const k = clamp(on, 0, 1);
  const b = clamp(brk, 0, 1);
  if (k < 0.01) return null;
  return (
    <group rotation={[0.35, 0, 0.2]}>
      {Array.from({ length: n }, (_, i) => {
        if (i / n > k) return null;
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        const am = (a0 + a1) / 2;
        const rr = R * 1.12;
        const drift = b * (0.6 + rand(`cab${i}`) * 1.2);
        const p: Vec3 = [Math.cos(am) * (rr + drift), Math.sin(am) * (rr + drift) - b * b * 1.5, (rand(`cz${i}`) - 0.5) * drift];
        const len = rr * (a1 - a0) * (1 - b * 0.35);
        return (
          <mesh key={i} position={p} rotation={[rand(`crx${i}`) * b * 2, 0, am + b * (rand(`cr${i}`) - 0.5) * 2]}>
            <cylinderGeometry args={[0.07, 0.07, len * 1.04, 8]} />
            <meshStandardMaterial color={b > 0.05 ? "#ff4d3d" : "#ffd35a"} emissive={b > 0.05 ? "#ff2a1a" : "#ffb020"} emissiveIntensity={0.9 * (1 - b * 0.6)} transparent opacity={1 - b * 0.85} />
          </mesh>
        );
      })}
      {/* plugue no topo do anel */}
      <group position={[0, R * 1.12, 0]} scale={1 - b}>
        <B s={[0.5, 0.36, 0.36]} c="#f2f2f5" />
        {[-0.1, 0.1].map((x) => <B key={x} p={[x, 0.3, 0]} s={[0.05, 0.25, 0.1]} c="#c9a227" m={0.6} />)}
      </group>
    </group>
  );
};

/** Mini-rotores (geradores) pulsando juntos sobre uma região do globo. */
export const MiniRotor: React.FC<{ angle: number; s?: number; color?: string }> = ({ angle, s = 0.12, color = "#3d8bff" }) => (
  <group scale={s}>
    <Cy r1={1} h={0.35} c="#2b3446" seg={20} />
    <group position={[0, 0.25, 0]} rotation={[0, angle, 0]}>
      {[0, 1, 2].map((i) => <B key={i} s={[1.7, 0.12, 0.25]} r={[0, (i * Math.PI) / 3, 0]} c={color} e={color} ei={0.6} />)}
    </group>
  </group>
);

/* ------------------------------------------------------------------ SOL, EJEÇÃO, CAMPO, SATÉLITE */

export const Sun: React.FC<{ r?: number; f: number; pulse?: number; flare?: number }> = ({ r = 4, f, pulse = 0, flare = 0 }) => {
  const k = 1 + 0.05 * clamp(pulse, 0, 1) * Math.sin(f * 0.5) + 0.015 * Math.sin(f / 9);
  return (
    <group scale={k}>
      <mesh rotation={[0, f * 0.003, 0]}>
        <icosahedronGeometry args={[r, 2]} />
        <meshStandardMaterial color="#ffb02a" emissive="#ff8a10" emissiveIntensity={1.6} flatShading roughness={1} />
      </mesh>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + f * 0.004;
        const L = r * (0.22 + 0.12 * Math.sin(f / 11 + i * 1.7));
        return (
          <mesh key={i} position={[Math.cos(a) * (r + L * 0.4), Math.sin(a) * (r + L * 0.4), 0]} rotation={[0, 0, a - Math.PI / 2]}>
            <coneGeometry args={[r * 0.12, L, 5]} />
            <meshBasicMaterial color="#ffd36a" toneMapped={false} />
          </mesh>
        );
      })}
      <mesh scale={1.08}>
        <icosahedronGeometry args={[r, 1]} />
        <meshBasicMaterial color="#ff9a2a" toneMapped={false} side={BackSide} />
      </mesh>
      {flare > 0.01 ? (
        <mesh position={[r * 0.95, r * 0.25, 0]} scale={clamp(flare, 0, 1) * r * 0.5}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#fff2b0" transparent opacity={0.85 * (1 - Math.max(0, flare - 0.7) / 0.3)} blending={AdditiveBlending} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Nuvem de partículas da ejeção (CME) indo de "from" a "to" em t 0..1. */
export const CME: React.FC<{ from: Vec3; to: Vec3; t: number; n?: number; spread?: number }> = ({ from, to, t, n = 140, spread = 2.2 }) => {
  const k = clamp(t, 0, 1);
  if (k <= 0.001 || k >= 0.999) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const lag = rand(`cm${i}`) * 0.25;
        const u = clamp((k - lag) / (1 - 0.25), 0, 1);
        if (u <= 0) return null;
        const w = spread * (0.3 + u) * (rand(`cw${i}`) - 0.5) * 2;
        const h = spread * (0.3 + u) * (rand(`ch${i}`) - 0.5) * 1.4;
        const p: Vec3 = [lerp(from[0], to[0], u), lerp(from[1], to[1], u) + h, lerp(from[2], to[2], u) + w];
        return (
          <mesh key={i} position={p}>
            <icosahedronGeometry args={[0.09 + rand(`cs${i}`) * 0.12, 0]} />
            <meshBasicMaterial color={i % 3 ? "#ff9a3c" : "#ffd36a"} transparent opacity={0.8 * (1 - u * 0.4)} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Linhas do campo magnético (dipolo) em volta do globo; shake 0..1 achata o lado do Sol. */
export const MagField: React.FC<{ R?: number; show?: number; shake?: number; f: number; sunDir?: Vec3 }> = ({ R = 3, show = 1, shake = 0, f, sunDir = [-1, 0, -0.2] }) => {
  const s = clamp(show, 0, 1);
  const curves = useMemo(
    () =>
      [1.6, 2.1, 2.7].flatMap((L) =>
        [0, 1, 2, 3, 4, 5].map((j) => {
          const az = (j / 6) * Math.PI * 2;
          const pts: Vector3[] = [];
          for (let i = 0; i <= 40; i++) {
            const th = 0.25 + (i / 40) * (Math.PI - 0.5);
            const r = L * R * Math.sin(th) ** 2;
            pts.push(new Vector3(r * Math.sin(th) * Math.cos(az), r * Math.cos(th), r * Math.sin(th) * Math.sin(az)));
          }
          return { curve: new CatmullRomCurve3(pts), az };
        }),
      ),
    [R],
  );
  if (s < 0.01) return null;
  const sd = new Vector3(...sunDir).normalize();
  return (
    <group>
      {curves.map(({ curve, az }, i) => {
        const facing = Math.cos(az) * sd.x + Math.sin(az) * sd.z; // >0 = lado do Sol
        const squash = 1 - clamp(shake, 0, 1) * 0.35 * Math.max(0, facing) * (1 + 0.3 * Math.sin(f * 0.6 + i));
        return (
          <mesh key={i} scale={[squash, 1, squash]}>
            <tubeGeometry args={[curve, 48, 0.025, 5, false]} />
            <meshBasicMaterial color="#7fb2ff" transparent opacity={0.45 * s} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Satellite: React.FC<{ f: number; s?: number }> = ({ f, s = 1 }) => (
  <group scale={s} rotation={[0.2, f * 0.004, 0.1]}>
    <B s={[0.8, 0.8, 1.1]} c="#d9a92c" m={0.4} e="#5a3d00" ei={0.15} />
    {[-1, 1].map((k) => (
      <group key={k} position={[k * 1.55, 0, 0]}>
        <B s={[2.1, 0.06, 0.9]} c="#2c4aa8" e="#16245a" ei={0.3} />
        {[-0.6, 0, 0.6].map((x) => <B key={x} p={[x, 0.04, 0]} s={[0.02, 0.02, 0.9]} c="#9fb4e8" />)}
      </group>
    ))}
    <group position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
      <Cy r1={0.38} r2={0.05} h={0.25} c="#e8e8ee" seg={18} />
    </group>
    <Cy p={[0, 0.6, 0]} r1={0.03} h={0.5} c="#c9ced8" />
  </group>
);

/* ------------------------------------------------------------------ SALA (metros) */

/** Tela da TV desenhada num canvas: cidade genérica (sem personagens), calendário, alerta de teste e ✖. */
const useScreen = (city: number, dark: number, cal: number, alert: number, x1: number, x2: number, f: number) => {
  const { tex, ctx } = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 300;
    const t = new CanvasTexture(cv);
    t.colorSpace = SRGBColorSpace;
    return { tex: t, ctx: cv.getContext("2d")! };
  }, []);
  const c = ctx;
  const W = 512, H = 300;
  c.fillStyle = "#06070c";
  c.fillRect(0, 0, W, H);
  if (city > 0.01) {
    c.globalAlpha = clamp(city, 0, 1);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, lerpHex("#4a78c8", "#0b1230", dark));
    g.addColorStop(1, lerpHex("#f2a86a", "#1a1430", dark));
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // prédios estilo desenho animado (genéricos)
    for (let i = 0; i < 11; i++) {
      const bw = 34 + rand(`bw${i}`) * 26;
      const bh = 80 + rand(`bh${i}`) * 130;
      const bx = i * 47 - 8;
      c.fillStyle = lerpHex(["#e7c46a", "#d98b5f", "#9fc2a0", "#c6a3d8"][i % 4], "#232838", dark);
      c.fillRect(bx, H - bh, bw, bh);
      c.strokeStyle = "#1b1b24";
      c.lineWidth = 3;
      c.strokeRect(bx, H - bh, bw, bh);
      for (let y = H - bh + 12; y < H - 14; y += 22)
        for (let x = bx + 7; x < bx + bw - 10; x += 14) {
          const lit = dark < rand(`w${i}${x}${y}`) * 0.9 + 0.05;
          c.fillStyle = lit ? "#fff3a8" : "#151824";
          c.fillRect(x, y, 7, 10);
        }
    }
    c.globalAlpha = 1;
  }
  if (cal > 0.01) {
    const k = clamp(cal, 0, 1);
    c.save();
    c.translate(W - 120, 70);
    c.scale(k, k);
    c.fillStyle = "#fbfbf7";
    c.fillRect(-70, -50, 140, 120);
    c.fillStyle = "#e2483d";
    c.fillRect(-70, -50, 140, 34);
    c.fillStyle = "#fff";
    c.font = "900 24px sans-serif";
    c.textAlign = "center";
    c.fillText("NOV", 0, -24);
    c.fillStyle = "#1b1b24";
    c.font = "900 64px sans-serif";
    c.fillText("17", 0, 50);
    c.restore();
  }
  if (alert > 0.01) {
    const blink = 0.75 + 0.25 * Math.sin(f * 0.5);
    c.globalAlpha = clamp(alert, 0, 1);
    c.fillStyle = "#0c0c10";
    c.fillRect(0, 0, W, H);
    // barras de teste
    ["#d8d8d8", "#e8d84a", "#4ad8d8", "#4ad84a", "#d84ad8", "#d84a4a", "#4a4ad8"].forEach((col, i) => {
      c.fillStyle = col;
      c.fillRect((i * W) / 7, 0, W / 7 + 1, H * 0.55);
    });
    c.fillStyle = `rgba(214,40,40,${blink})`;
    c.fillRect(0, H * 0.58, W, 86);
    c.fillStyle = "#fff";
    c.font = "900 34px sans-serif";
    c.textAlign = "center";
    c.fillText("TESTE DE ALERTA", W / 2, H * 0.58 + 38);
    c.font = "800 24px sans-serif";
    c.fillText("DE EMERGÊNCIA · SÓ UM TESTE", W / 2, H * 0.58 + 72);
    c.globalAlpha = 1;
  }
  const cross = (cx: number, cy: number, k: number) => {
    if (k < 0.01) return;
    c.save();
    c.translate(cx, cy);
    c.scale(k, k);
    c.strokeStyle = "#ff2d2d";
    c.lineWidth = 18;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-50, -50); c.lineTo(50, 50); c.moveTo(50, -50); c.lineTo(-50, 50);
    c.stroke();
    c.restore();
  };
  cross(W - 120, 80, clamp(x1, 0, 1.2));
  cross(W / 2, H * 0.58 + 43, clamp(x2, 0, 1.2));
  tex.needsUpdate = true;
  return tex;
};
const lerpHex = (a: string, b: string, t: number) => "#" + new Color(a).lerp(new Color(b), clamp(t, 0, 1)).getHexString();

export const LivingRoom: React.FC<{ f: number; tvOn?: number; city?: number; dark?: number; cal?: number; alert?: number; x1?: number; x2?: number; radio?: number }> = ({ f, tvOn = 1, city = 1, dark = 0, cal = 0, alert = 0, x1 = 0, x2 = 0, radio = 0 }) => {
  const tex = useScreen(city, dark, cal, alert, x1, x2, f);
  const on = clamp(tvOn, 0, 1);
  return (
    <group>
      {/* chão e paredes */}
      <B p={[0, -0.05, 0]} s={[6, 0.1, 5]} c="#6b5040" />
      <B p={[0, 1.4, -2.45]} s={[6, 2.9, 0.1]} c="#3a4660" />
      <B p={[-2.95, 1.4, 0]} s={[0.1, 2.9, 5]} c="#334058" />
      <B p={[0.2, 0.005, 0.6]} s={[2.8, 0.02, 1.8]} c="#8a4d5c" />
      {/* rack + TV */}
      <B p={[0, 0.25, -2.05]} s={[2, 0.5, 0.5]} c="#4a3626" />
      <B p={[0, 1.15, -2.2]} s={[1.6, 0.95, 0.08]} c="#14161c" />
      <mesh position={[0, 1.15, -2.155]}>
        <planeGeometry args={[1.48, 0.86]} />
        <meshBasicMaterial map={tex} color={new Color().setScalar(0.08 + 0.92 * on)} toneMapped={false} />
      </mesh>
      <B p={[0, 0.6, -2.2]} s={[0.3, 0.12, 0.2]} c="#14161c" />
      {/* brilho da tela no chão */}
      <mesh position={[0, 0.02, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.6]} />
        <meshBasicMaterial color={alert > 0.5 ? "#ff5a4a" : "#7fa8ff"} transparent opacity={0.12 * on} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* rádio de mesa sobre o rack */}
      <group position={[0.75, 0.62, -2.0]}>
        <B s={[0.38, 0.22, 0.16]} c="#a05a3a" />
        <Cy p={[-0.08, 0, 0.085]} r1={0.065} h={0.01} c="#2a2a30" rot={[Math.PI / 2, 0, 0]} />
        <B p={[0.1, 0.02, 0.085]} s={[0.12, 0.08, 0.01]} c="#f2d48a" e="#f2b84a" ei={0.4 + radio} />
        <Cy p={[0.13, 0.25, 0]} r1={0.008} h={0.3} c="#c9ced8" />
        {radio > 0.01
          ? [0, 1, 2].map((i) => {
              const ph = (f * 0.06 + i / 3) % 1;
              return (
                <mesh key={i} position={[0, 0.05, 0.1]} scale={0.15 + ph * 0.5}>
                  <torusGeometry args={[1, 0.03, 6, 32, Math.PI * 0.6]} />
                  <meshBasicMaterial color="#ffd36a" transparent opacity={clamp(radio, 0, 1) * (1 - ph)} />
                </mesh>
              );
            })
          : null}
      </group>
      {/* sofá (2 m), de costas para a câmera, virado para a TV */}
      <group position={[0, 0, 0.9]}>
        <B p={[0, 0.22, 0]} s={[2, 0.44, 0.9]} c="#4f6b8a" />
        <B p={[0, 0.5, 0.05]} s={[1.8, 0.14, 0.75]} c="#5d7b9c" />
        <B p={[0, 0.75, 0.38]} s={[2, 0.6, 0.18]} c="#4f6b8a" />
        {[-1, 1].map((k) => <B key={k} p={[k * 0.95, 0.5, 0]} s={[0.16, 0.5, 0.9]} c="#476282" />)}
      </group>
      {/* abajur */}
      <group position={[-1.9, 0, -1.6]}>
        <Cy p={[0, 0.7, 0]} r1={0.02} h={1.4} c="#2a2a30" />
        <Cy p={[0, 1.45, 0]} r1={0.25} r2={0.15} h={0.3} c="#f2e2b8" e="#f2c66a" ei={0.6} />
        <pointLight position={[0, 1.3, 0]} intensity={0.6} distance={4} color="#ffd9a0" />
      </group>
      {/* planta */}
      <group position={[1.9, 0, -1.8]}>
        <Cy p={[0, 0.2, 0]} r1={0.18} r2={0.22} h={0.4} c="#b5653a" />
        {[0, 1, 2, 3, 4].map((i) => <B key={i} p={[Math.cos(i * 1.3) * 0.1, 0.65, Math.sin(i * 1.3) * 0.1]} r={[Math.cos(i * 1.3) * 0.5, 0, Math.sin(i * 1.3) * 0.5]} s={[0.12, 0.6, 0.04]} c="#4f8a4a" />)}
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ ITAIPU (esquemática, u3d) */

/** Barragem em corte com 20 geradores: os 10 da esquerda (60 Hz, azuis) giram a6; os 10 da direita (50 Hz, laranja) a5. */
export const Itaipu: React.FC<{ a60: number; a50: number; water?: number }> = ({ a60, a50, water = 1 }) => {
  const N = 20;
  const sp = 0.42;
  const x0 = -((N - 1) * sp) / 2;
  return (
    <group>
      {/* lago (montante) e rio (jusante) */}
      <B p={[0, -0.1, -2.4]} s={[10, 0.2, 3.2]} c="#2c5a8a" e="#12345a" ei={0.2 * water} />
      <B p={[0, -0.9, 2.2]} s={[10, 0.2, 2.6]} c="#2f6290" e="#12345a" ei={0.15} />
      {/* barragem (perfil inclinado) */}
      <B p={[0, 0.2, -0.6]} s={[9.6, 1.6, 0.7]} c="#b9b6ac" />
      <B p={[0, -0.25, -0.05]} s={[9.6, 0.7, 0.9]} c="#a9a69c" r={[-0.35, 0, 0]} />
      {/* casa de força em corte (frente aberta) */}
      <B p={[0, -0.85, 0.75]} s={[9.6, 0.1, 1.3]} c="#8f8c84" />
      <B p={[0, -0.2, 0.15]} s={[9.6, 1.4, 0.08]} c="#9d9a92" />
      {Array.from({ length: N }, (_, i) => {
        const is60 = i < N / 2;
        const col = is60 ? "#3d8bff" : "#ff9a3c";
        const a = is60 ? a60 : a50;
        return (
          <group key={i} position={[x0 + i * sp, -0.5, 0.7]}>
            {/* estator */}
            <Cy r1={0.18} h={0.22} c="#d9dde6" seg={18} />
            {/* rotor com raios girando */}
            <group position={[0, 0.13, 0]} rotation={[0, a + i * 0.3, 0]}>
              <Cy r1={0.14} h={0.05} c={col} e={col} ei={0.5} seg={14} />
              {[0, 1, 2].map((k) => <B key={k} p={[0, 0.035, 0]} s={[0.27, 0.02, 0.035]} r={[0, (k * Math.PI) / 3, 0]} c="#f5f5f8" />)}
            </group>
            {/* eixo até a turbina */}
            <Cy p={[0, -0.22, 0]} r1={0.025} h={0.25} c="#7a7f8a" />
          </group>
        );
      })}
      {/* faixa divisória no meio */}
      <B p={[0, -0.45, 1.25]} s={[0.04, 0.6, 0.04]} c="#f5f0ff" e="#c4b5fd" ei={0.8} />
    </group>
  );
};

/* ------------------------------------------------------------------ MAPA DO BRASIL (esquemático, u3d) */

type UF = { uf: string; name: string; rings: [number, number][][]; c: [number, number]; dist: number };
const STATES = BR as unknown as UF[];
export const BR_STATES = STATES;
export const brPos = (uf: string): Vec3 => {
  const s = STATES.find((x) => x.uf === uf)!;
  return [s.c[0], 0.16, -s.c[1]];
};
const MAXD = Math.max(...STATES.map((s) => s.dist));

const inPoly = (x: number, y: number, r: [number, number][]) => {
  let ins = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
};

const useStateGeo = () =>
  useMemo(
    () =>
      STATES.map((s) => {
        const shapes = s.rings.map((r) => new Shape(r.map(([x, y]) => new Vector2(x, y))));
        const g = new ExtrudeGeometry(shapes, { depth: 0.12, bevelEnabled: false });
        g.rotateX(-Math.PI / 2); // (x, y) do mapa → (x, −z); extrusão para +y
        // luzinhas: pontos dentro do contorno principal
        const r0 = s.rings[0];
        const xs = r0.map((p) => p[0]);
        const ys = r0.map((p) => p[1]);
        const pts: Vec3[] = [];
        const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
        const want = clamp(Math.round(area * 9), 3, 40);
        for (let k = 0; k < 400 && pts.length < want; k++) {
          const x = lerp(Math.min(...xs), Math.max(...xs), rand(`${s.uf}x${k}`));
          const y = lerp(Math.min(...ys), Math.max(...ys), rand(`${s.uf}y${k}`));
          if (inPoly(x, y, r0)) pts.push([x, 0.135, -y]);
        }
        return { s, g, pts };
      }),
    [],
  );

/** domino 0..1: os estados apagam por distância ao Ceará (Roraima nunca apaga: fora da rede). */
export const stateOn = (uf: string, domino: number) => {
  if (uf === "RR") return 1;
  const s = STATES.find((x) => x.uf === uf)!;
  const t0 = (s.dist / MAXD) * 0.85;
  return 1 - clamp((domino - t0) / 0.12, 0, 1);
};

export const BrazilMap: React.FC<{ f: number; domino?: number; spark?: number; rrGlow?: number; gap?: number; trace?: number; base?: boolean }> = ({ f, domino = 0, spark = 0, rrGlow = 0, gap = 0, trace = 0, base = true }) => {
  const geos = useStateGeo();
  const ce = brPos("CE");
  const rr = brPos("RR");
  const am = brPos("AM");
  return (
    <group>
      {base ? <B p={[0, -0.12, 0]} s={[12.5, 0.2, 12]} c="#0b1020" /> : null}
      {geos.map(({ s, g, pts }) => {
        const on = stateOn(s.uf, domino);
        const isRR = s.uf === "RR";
        const tone = 0.92 + 0.16 * rand(`tone${s.uf}`);
        const top = new Color("#262d40").lerp(new Color(isRR ? "#4a7aa8" : "#3c5a8c"), on).multiplyScalar(tone);
        return (
          <group key={s.uf} position={[0, -0.03 * (1 - on), 0]}>
            <mesh geometry={g} castShadow receiveShadow>
              <meshStandardMaterial color={top} roughness={0.85} flatShading emissive={isRR ? "#ffcf6a" : "#000"} emissiveIntensity={isRR ? 0.12 * clamp(rrGlow, 0, 1) : 0} />
            </mesh>
            {s.rings.map((r, ri) => <Outline key={`o${ri}`} r={r} on={on} />)}
            {pts.map((p, i) => (
              <mesh key={i} position={p}>
                <boxGeometry args={[0.045, 0.03, 0.045]} />
                <meshBasicMaterial color={new Color("#1d2130").lerp(new Color("#ffd98a"), on)} toneMapped={false} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* linha de transmissão no Ceará (Quixadá → Fortaleza, esquemática) */}
      <group position={[ce[0] - 0.1, 0.12, ce[2] + 0.25]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[i * 0.17, 0, -i * 0.14]}>
            <B p={[0, 0.16, 0]} s={[0.02, 0.32, 0.02]} c="#c9ced8" />
            <B p={[0, 0.3, 0]} s={[0.14, 0.015, 0.015]} c="#c9ced8" />
          </group>
        ))}
        <mesh position={[0.255, 0.3, -0.21]} rotation={[0, 0.69, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.66, 4]} />
          <meshBasicMaterial color={spark > 0.01 ? "#ff5a3a" : "#ffd36a"} />
        </mesh>
        {spark > 0.01
          ? Array.from({ length: 14 }, (_, i) => {
              const k = clamp(spark, 0, 1);
              const a = rand(`sp${i}`) * Math.PI * 2;
              const d = k * (0.08 + rand(`sd${i}`) * 0.25);
              return (
                <mesh key={i} position={[0.25 + Math.cos(a) * d, 0.3 + Math.abs(Math.sin(a * 3)) * d, -0.2 + Math.sin(a) * d]}>
                  <boxGeometry args={[0.03, 0.03, 0.03]} />
                  <meshBasicMaterial color={i % 2 ? "#fff3a8" : "#ff8a3a"} transparent opacity={1 - Math.max(0, k - 0.6) * 2} />
                </mesh>
              );
            })
          : null}
      </group>
      {/* usina térmica de Roraima */}
      <group position={[rr[0] + 0.2, 0.12, rr[2] + 0.2]}>
        <B p={[0, 0.08, 0]} s={[0.28, 0.16, 0.2]} c="#c9c4b8" />
        <Cy p={[0.1, 0.25, -0.05]} r1={0.035} r2={0.025} h={0.36} c="#a9a49a" />
        {[0, 1, 2].map((i) => {
          const ph = (f * 0.012 + i / 3) % 1;
          return (
            <mesh key={i} position={[0.1 + ph * 0.1, 0.45 + ph * 0.35, -0.05]} scale={0.04 + ph * 0.07}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#d8dce4" transparent opacity={0.7 * (1 - ph)} flatShading />
            </mesh>
          );
        })}
        <pointLight position={[0, 0.5, 0]} intensity={0.5 * clamp(rrGlow, 0, 1)} distance={2.5} color="#ffd98a" />
      </group>
      {/* vão sem fios entre Roraima e o Amazonas (tracejado vermelho) */}
      {gap > 0.01
        ? Array.from({ length: 7 }, (_, i) => {
            const t = (i + 0.5) / 7;
            const p: Vec3 = [lerp(rr[0], am[0] + 0.4, t), 0.2, lerp(rr[2] + 0.5, am[2] - 0.3, t)];
            return (
              <mesh key={i} position={p} scale={clamp(gap * 7 - i, 0, 1)} rotation={[0, Math.atan2(am[0] + 0.4 - rr[0], am[2] - 0.3 - rr[2] - 0.5), 0]}>
                <boxGeometry args={[0.05, 0.03, 0.14]} />
                <meshBasicMaterial color="#ff3b30" toneMapped={false} />
              </mesh>
            );
          })
        : null}
      {/* rede nacional: linhas entre capitais (centros), acendem com trace */}
      {trace > 0.01 ? <Network trace={trace} /> : null}
    </group>
  );
};

/** Contorno do estado (linha clara no topo da placa). */
const Outline: React.FC<{ r: [number, number][]; on: number }> = ({ r, on }) => {
  const pos = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < r.length; i++) {
      const [x0, y0] = r[i];
      const [x1, y1] = r[(i + 1) % r.length];
      a.push(x0, 0.125, -y0, x1, 0.125, -y1);
    }
    return new Float32Array(a);
  }, [r]);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={new Color("#4a5470").lerp(new Color("#9fb8e8"), on)} />
    </lineSegments>
  );
};

const LINKS: [string, string][] = [
  ["CE", "RN"], ["CE", "PI"], ["CE", "PE"], ["RN", "PB"], ["PB", "PE"], ["PE", "AL"], ["AL", "SE"], ["SE", "BA"], ["PE", "BA"], ["PI", "MA"], ["MA", "PA"], ["PA", "AP"], ["PA", "AM"],
  ["PA", "TO"], ["TO", "GO"], ["GO", "DF"], ["BA", "MG"], ["GO", "MG"], ["MG", "ES"], ["MG", "RJ"], ["MG", "SP"], ["SP", "RJ"], ["SP", "PR"], ["PR", "SC"], ["SC", "RS"], ["SP", "MS"],
  ["GO", "MT"], ["MT", "RO"], ["RO", "AC"], ["MS", "MT"], ["TO", "MA"],
];
const Network: React.FC<{ trace: number }> = ({ trace }) => (
  <group>
    {LINKS.map(([a, b], i) => {
      const pa = brPos(a);
      const pb = brPos(b);
      const t0 = Math.min(STATES.find((s) => s.uf === a)!.dist, STATES.find((s) => s.uf === b)!.dist) / MAXD;
      const k = clamp((trace - t0 * 0.8) / 0.2, 0, 1);
      if (k <= 0) return null;
      const mid: Vec3 = [(pa[0] + pb[0]) / 2, 0.2, (pa[2] + pb[2]) / 2];
      const len = Math.hypot(pb[0] - pa[0], pb[2] - pa[2]);
      return (
        <mesh key={i} position={mid} rotation={[0, Math.atan2(pb[0] - pa[0], pb[2] - pa[2]), 0]} scale={[1, 1, k]}>
          <boxGeometry args={[0.035, 0.02, len]} />
          <meshBasicMaterial color="#7fd0ff" toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

export const MapSeal = "ESQUEMA";
