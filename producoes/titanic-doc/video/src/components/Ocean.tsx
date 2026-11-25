import { useMemo } from "react";
import { Color, PlaneGeometry, ShaderMaterial, Vector3 } from "three";

/**
 * Mar v3 (shader): ondas tipo Gerstner (cristas pontudas e vales largos), reflexo do céu por Fresnel,
 * trilha de brilho da lua/sol, espuma nas cristas e névoa até o horizonte. Determinístico (tempo = frame/30),
 * não depende das luzes da cena (não fica roxo com a luz de estúdio).
 *
 * Substitui o NightSea (Titanic.tsx) com a mesma escala de altura. Para boiar objetos use `oceanY(x, z, f, calm)`
 * (mesma conta das ondas, só a parte vertical: erro < 2 cm na escala 1 u = 1 m).
 *
 * mood: "night" (lua), "dusk" (pôr do sol), "day" (céu claro). lightDir: direção para a lua/sol (x, y, z).
 */
type Wave = { dir: [number, number]; k: number; amp: number; speed: number; phase: number; steep: number };
const WAVES: Wave[] = [
  { dir: [0.92, 0.39], k: 0.42, amp: 0.085, speed: 0.9, phase: 0.0, steep: 0.55 },
  { dir: [-0.41, 0.91], k: 0.55, amp: 0.06, speed: 0.75, phase: 1.3, steep: 0.5 },
  { dir: [0.7, -0.71], k: 0.95, amp: 0.035, speed: 1.2, phase: 2.1, steep: 0.45 },
  { dir: [0.2, 0.98], k: 1.6, amp: 0.018, speed: 1.6, phase: 0.7, steep: 0.4 },
  { dir: [-0.85, -0.53], k: 2.4, amp: 0.01, speed: 2.1, phase: 4.0, steep: 0.35 },
  { dir: [0.55, 0.83], k: 3.7, amp: 0.006, speed: 2.7, phase: 2.9, steep: 0.3 },
];

/** Altura do mar no ponto (x, z) no frame f (mesma conta do shader). */
export const oceanY = (x: number, z: number, f: number, calm = 1) => {
  const t = f / 30;
  let y = 0;
  for (const w of WAVES) {
    const th = w.k * (w.dir[0] * x + w.dir[1] * z) - w.speed * t + w.phase;
    // perfil trocoidal aproximado: cristas pontudas (somar harmônico), vales largos
    y += w.amp * (Math.sin(th) + w.steep * 0.5 * (1 - Math.cos(2 * th)) - w.steep * 0.5);
  }
  return y * calm;
};

const MOODS = {
  night: { deep: "#062440", shallow: "#18507c", sky: "#2c4c7c", horizon: "#22406a", glint: "#f6eccf", foam: "#b8d0e2", glintPow: 420, glintGain: 0.9 },
  dusk: { deep: "#0a1830", shallow: "#25486a", sky: "#9a6a72", horizon: "#b07a6e", glint: "#ffcf90", foam: "#e8d6cc", glintPow: 260, glintGain: 1.0 },
  day: { deep: "#0a3f66", shallow: "#1f7aa8", sky: "#9cc4e0", horizon: "#cfe0ea", glint: "#ffffff", foam: "#eef6fb", glintPow: 500, glintGain: 0.9 },
} as const;

const vert = /* glsl */ `
uniform float uTime; uniform float uCalm;
uniform vec4 uW[6]; uniform vec4 uW2[6];
varying vec3 vPos; varying vec3 vNormal; varying float vH;
void main() {
  vec3 p = position;
  float y = 0.0; vec2 d = vec2(0.0); vec2 disp = vec2(0.0);
  for (int i = 0; i < 6; i++) {
    vec2 dir = uW[i].xy; float k = uW[i].z; float amp = uW[i].w * uCalm;
    float speed = uW2[i].x; float phase = uW2[i].y; float steep = uW2[i].z;
    float th = k * dot(dir, p.xz) - speed * uTime + phase;
    y += amp * (sin(th) + steep * 0.5 * (1.0 - cos(2.0 * th)) - steep * 0.5);
    float dy = amp * k * (cos(th) + steep * sin(2.0 * th));
    d += dir * dy;
    disp += dir * (-amp * steep * 0.8 * cos(th)); // cristas se juntam (choppy) — só visual
  }
  p.xz += disp; p.y += y;
  vH = y / max(0.05, uCalm);
  vNormal = normalize(vec3(-d.x, 1.0, -d.y));
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const frag = /* glsl */ `
uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uHorizon; uniform vec3 uGlint; uniform vec3 uFoam;
uniform vec3 uLight; uniform float uGlintPow; uniform float uGlintGain; uniform float uFogNear; uniform float uFogFar;
uniform float uFoamAmt;
varying vec3 vPos; varying vec3 vNormal; varying float vH;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
void main() {
  // micro-ondulação (só no sombreamento): quebra o brilho em pontinhos e tira o aspecto de plástico
  vec2 q = vPos.xz * 3.1;
  float e = 0.08;
  float n0 = noise(q), nx = noise(q + vec2(e, 0.0)), nz = noise(q + vec2(0.0, e));
  vec3 N = normalize(vNormal + vec3(-(nx - n0), 0.0, -(nz - n0)) * 2.2);
  vec3 V = normalize(cameraPosition - vPos);
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  float h = clamp((vH + 0.22) / 0.44, 0.0, 1.0); // 0 vale .. 1 crista (amplitude total ~±0,27)
  vec3 water = mix(uDeep, uShallow, smoothstep(0.25, 1.0, h));
  vec3 col = mix(water, uSky, clamp(fres, 0.0, 0.6));
  vec3 R = reflect(-V, N);
  float spec = pow(max(dot(R, normalize(uLight)), 0.0), uGlintPow);
  col += uGlint * spec * uGlintGain;
  float n = noise(vPos.xz * 9.0) * 0.6 + noise(vPos.xz * 23.0) * 0.4;
  float foam = smoothstep(0.86, 1.0, h + (n - 0.5) * 0.25) * smoothstep(0.45, 0.75, n) * uFoamAmt;
  col = mix(col, uFoam, foam * 0.45);
  float dist = length(cameraPosition.xz - vPos.xz);
  col = mix(col, uHorizon, smoothstep(uFogNear, uFogFar, dist) * 0.9);
  gl_FragColor = vec4(col, 1.0);
}`;

export const Ocean: React.FC<{
  f: number; size?: number; seg?: number; calm?: number; mood?: keyof typeof MOODS;
  lightDir?: [number, number, number]; foam?: number; fog?: [number, number];
}> = ({ f, size = 120, seg = 220, calm = 1, mood = "night", lightDir = [-0.3, 0.35, -1], foam = 1, fog }) => {
  const geo = useMemo(() => new PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2), [size, seg]);
  const mat = useMemo(() => {
    const m = MOODS[mood];
    return new ShaderMaterial({
      vertexShader: vert, fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 }, uCalm: { value: 1 },
        uW: { value: WAVES.map((w) => [w.dir[0], w.dir[1], w.k, w.amp]).flat() },
        uW2: { value: WAVES.map((w) => [w.speed, w.phase, w.steep, 0]).flat() },
        uDeep: { value: new Color(m.deep) }, uShallow: { value: new Color(m.shallow) }, uSky: { value: new Color(m.sky) },
        uHorizon: { value: new Color(m.horizon) }, uGlint: { value: new Color(m.glint) }, uFoam: { value: new Color(m.foam) },
        uLight: { value: new Vector3() }, uGlintPow: { value: m.glintPow }, uGlintGain: { value: m.glintGain },
        uFogNear: { value: 0 }, uFogFar: { value: 1 }, uFoamAmt: { value: 1 },
      },
    });
  }, [mood]);
  mat.uniforms.uTime.value = f / 30;
  mat.uniforms.uCalm.value = calm;
  mat.uniforms.uLight.value.set(...lightDir);
  mat.uniforms.uFoamAmt.value = foam;
  mat.uniforms.uFogNear.value = fog ? fog[0] : size * 0.12;
  mat.uniforms.uFogFar.value = fog ? fog[1] : size * 0.5;
  return <mesh geometry={geo} material={mat} />;
};
