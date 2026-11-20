import { RoundedBox } from "@react-three/drei";
import { AdditiveBlending, DoubleSide } from "three";
import type { Vec3 } from "../utils/animation";
import { Rod } from "./Doc3D";

/**
 * Submersível tripulado de águas profundas, no estilo dos anos 1980 (inspirado nos DSV de pesquisa):
 * casco branco de espuma sintática, torre laranja, esfera de titânio para 3 pessoas na frente com vigia,
 * braço manipulador, cesto de amostras, propulsores com carenagem, trilhos e faróis. 1 u = 1 m (~7 m).
 * A vigia frontal é aberta (ampliada por legibilidade) para ver quem está dentro: coloque o personagem
 * em torno de PORT_INSIDE.
 */
const WHITE = "#eeebe2";
const ORANGE = "#e0602a";
const TITAN = "#b4bac2";
const DARK = "#2e3036";
const A = 0.25; // inclinação da vigia para baixo
export const SPHERE_C: Vec3 = [2.1, -0.15, 0];
export const PORT_INSIDE: Vec3 = [2.62, -1.05, 0];

const B: React.FC<{ p: Vec3; s: Vec3; c: string; r?: Vec3; m?: number; e?: string; ei?: number }> = ({ p, s, c, r, m = 0, e, ei = 0 }) => (
  <mesh position={p} rotation={r}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={0.55} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} transparent />
  </mesh>
);

const Thruster: React.FC<{ p: Vec3; f: number; axis?: "x" | "y" }> = ({ p, f, axis = "x" }) => (
  <group position={p} rotation={axis === "x" ? [0, Math.PI / 2, 0] : [Math.PI / 2, 0, 0]}>
    <mesh><torusGeometry args={[0.36, 0.07, 8, 24]} /><meshStandardMaterial color={DARK} roughness={0.5} transparent /></mesh>
    <mesh><cylinderGeometry args={[0.36, 0.36, 0.28, 24, 1, true]} /><meshStandardMaterial color={DARK} roughness={0.5} side={DoubleSide} transparent /></mesh>
    <group rotation={[0, 0, f * 0.9]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.3, 10]} /><meshStandardMaterial color="#c8c8c8" metalness={0.6} transparent /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0.4, (i * Math.PI * 2) / 3]} position={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.6, 0.02]} />
          <meshStandardMaterial color="#d8d4c8" transparent />
        </mesh>
      ))}
    </group>
  </group>
);

const Lamp: React.FC<{ p: Vec3; beams: number }> = ({ p, beams }) => (
  <group position={p}>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.13, 0.22, 12]} /><meshStandardMaterial color={DARK} metalness={0.4} transparent /></mesh>
    <mesh position={[0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.09, 12]} /><meshBasicMaterial color="#fffbe8" toneMapped={false} transparent /></mesh>
    {beams > 0.01
      ? [1, 0.7, 0.45].map((k, i) => (
          <mesh key={i} position={[3.0, -0.75, 0]} rotation={[0, 0, Math.PI / 2 + 0.25]}>
            <coneGeometry args={[1.5 * k, 6.2, 24, 1, true]} />
            <meshBasicMaterial color="#cfe6ff" transparent opacity={0.022 * beams * (i + 1)} depthWrite={false} side={DoubleSide} blending={AdditiveBlending} />
          </mesh>
        ))
      : null}
    <spotLight intensity={5} distance={18} angle={0.5} penumbra={0.7} color="#eaf4ff" target-position={[8, -2.5, 0]} />
  </group>
);

export const SubDSV: React.FC<{ f: number; beams?: number; inner?: number }> = ({ f, beams = 1, inner = 1 }) => (
  <group>
    {/* casco principal (espuma sintática branca) */}
    <RoundedBox args={[5.0, 2.0, 2.3]} radius={0.55} smoothness={4} position={[-0.9, 0.55, 0]}>
      <meshStandardMaterial color={WHITE} roughness={0.45} transparent />
    </RoundedBox>
    {/* faixa escura na linha de flutuação do casco */}
    <B p={[-0.9, -0.15, 0]} s={[4.6, 0.08, 2.32]} c={DARK} />
    {/* cauda afinando */}
    <mesh position={[-3.7, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.8, 0.45, 0.8, 16]} />
      <meshStandardMaterial color={WHITE} roughness={0.45} transparent />
    </mesh>
    {/* carenagem do nariz, por cima da esfera */}
    <mesh position={[1.85, 0.95, 0]} scale={[1.15, 0.7, 1.2]}>
      <sphereGeometry args={[1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={WHITE} roughness={0.45} side={DoubleSide} transparent />
    </mesh>
    {/* esfera de titânio dos tripulantes, com a vigia aberta */}
    <group position={SPHERE_C} rotation={[0, 0, -Math.PI / 2 - A]}>
      <mesh>
        <sphereGeometry args={[1, 32, 20, 0, Math.PI * 2, 0.36, Math.PI - 0.36]} />
        <meshStandardMaterial color={TITAN} roughness={0.4} metalness={0.15} side={DoubleSide} transparent />
      </mesh>
      <mesh position={[0, 0.936, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.355, 0.06, 10, 28]} />
        <meshStandardMaterial color="#4a4e56" metalness={0.6} roughness={0.3} transparent />
      </mesh>
      <mesh position={[0, 0.93, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 28]} />
        <meshStandardMaterial color="#bfe2f2" transparent opacity={0.16} roughness={0.05} depthWrite={false} />
      </mesh>
      {/* vigias laterais pequenas */}
      {[0.75, -0.75].map((yaw) => (
        <group key={yaw} rotation={[yaw, 0, 0]}>
          <mesh position={[0, 0.985, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.035, 8, 18]} />
            <meshStandardMaterial color="#4a4e56" metalness={0.6} transparent />
          </mesh>
          <mesh position={[0, 0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 18]} />
            <meshStandardMaterial color="#ffcf8a" emissive="#ffb060" emissiveIntensity={0.6 * inner} transparent />
          </mesh>
        </group>
      ))}
    </group>
    {/* interior: assento e luz quente */}
    <B p={[1.85, -0.95, 0]} s={[0.7, 0.14, 0.9]} c="#3a3c44" />
    <B p={[1.5, -0.6, 0]} s={[0.14, 0.6, 0.9]} c="#3a3c44" />
    <B p={[1.55, -0.2, 0.55]} s={[0.1, 0.3, 0.3]} c="#20242a" e="#55ff99" ei={0.5 * inner} />
    <pointLight position={[2.0, -0.3, 0]} intensity={3.5 * inner} distance={2.6} color="#ffcf90" />
    {/* torre (vela) laranja + mastro e luz de sinalização */}
    <RoundedBox args={[1.5, 1.1, 0.6]} radius={0.15} smoothness={3} position={[0.2, 2.05, 0]}>
      <meshStandardMaterial color={ORANGE} roughness={0.5} transparent />
    </RoundedBox>
    <B p={[0.55, 2.25, 0.31]} s={[0.4, 0.14, 0.02]} c="#1a2a36" />
    <B p={[0.55, 2.25, -0.31]} s={[0.4, 0.14, 0.02]} c="#1a2a36" />
    <Rod a={[-0.2, 2.6, 0]} b={[-0.2, 3.25, 0]} r={0.025} c="#c8c8c8" />
    <mesh position={[-0.2, 3.28, 0]}><sphereGeometry args={[0.06, 8, 6]} /><meshBasicMaterial color={Math.floor(f / 20) % 3 === 0 ? "#fff6c8" : "#7a7a66"} toneMapped={false} transparent /></mesh>
    {/* escotilha */}
    <mesh position={[1.25, 1.42, 0]}><cylinderGeometry args={[0.3, 0.3, 0.12, 16]} /><meshStandardMaterial color={TITAN} metalness={0.5} transparent /></mesh>
    {/* propulsores */}
    <Thruster p={[-3.3, 0.55, 1.4]} f={f} />
    <Thruster p={[-3.3, 0.55, -1.4]} f={f + 3} />
    <Thruster p={[-2.6, 1.85, 0]} f={f + 7} axis="y" />
    <Rod a={[-3.0, 0.55, 1.15]} b={[-3.3, 0.55, 1.05]} r={0.05} c={DARK} />
    <Rod a={[-3.0, 0.55, -1.15]} b={[-3.3, 0.55, -1.05]} r={0.05} c={DARK} />
    {/* baterias/lastro entre os trilhos */}
    <B p={[-1.2, -0.72, 0]} s={[3.4, 0.5, 1.4]} c="#4a4c52" />
    <B p={[-1.2, -0.72, 0.71]} s={[3.2, 0.06, 0.02]} c={ORANGE} />
    <B p={[-1.2, -0.72, -0.71]} s={[3.2, 0.06, 0.02]} c={ORANGE} />
    {/* trilhos (skids) e montantes */}
    {[0.9, -0.9].map((z) => (
      <group key={z}>
        <B p={[-0.6, -1.3, z]} s={[5.6, 0.1, 0.12]} c={DARK} m={0.3} />
        <Rod a={[2.1, -1.3, z]} b={[2.35, -1.15, z]} r={0.05} c={DARK} />
        {[-2.8, -1.0, 0.8].map((x) => (
          <Rod key={x} a={[x, -0.45, z * 0.9]} b={[x, -1.28, z]} r={0.05} c={DARK} />
        ))}
      </group>
    ))}
    {/* cesto de amostras na frente */}
    <group position={[3.55, -1.15, 0]}>
      <B p={[0, 0, 0]} s={[0.8, 0.05, 1.3]} c="#6a6e76" m={0.4} />
      {[[-0.4, -0.65], [0.4, -0.65], [-0.4, 0.65], [0.4, 0.65]].map(([x, z], i) => (
        <Rod key={i} a={[x, 0, z]} b={[x, 0.3, z]} r={0.025} c="#6a6e76" />
      ))}
      <Rod a={[0.4, 0.3, -0.65]} b={[0.4, 0.3, 0.65]} r={0.025} c="#6a6e76" />
      <Rod a={[-0.4, 0.3, -0.65]} b={[-0.4, 0.3, 0.65]} r={0.025} c="#6a6e76" />
      <mesh position={[0.05, 0.1, 0.3]}><cylinderGeometry args={[0.09, 0.09, 0.18, 10]} /><meshStandardMaterial color="#e8d070" transparent /></mesh>
      <mesh position={[-0.15, 0.08, -0.25]}><boxGeometry args={[0.2, 0.14, 0.2]} /><meshStandardMaterial color="#4a6a8a" transparent /></mesh>
    </group>
    {/* braço manipulador (lado direito) */}
    {(() => {
      const s: Vec3 = [2.75, -0.95, 0.85], e: Vec3 = [3.45, -0.62 + Math.sin(f * 0.05) * 0.04, 1.15], w: Vec3 = [4.0, -0.95, 0.95];
      return (
        <group>
          <Rod a={s} b={e} r={0.07} c="#c8c8c0" />
          <Rod a={e} b={w} r={0.06} c="#c8c8c0" />
          {[s, e, w].map((p, i) => (<mesh key={i} position={p}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color={DARK} metalness={0.4} transparent /></mesh>))}
          <B p={[w[0] + 0.15, w[1] - 0.05, w[2] + 0.06]} s={[0.25, 0.05, 0.04]} c="#9a9a96" m={0.5} r={[0, 0, -0.4]} />
          <B p={[w[0] + 0.15, w[1] - 0.05, w[2] - 0.06]} s={[0.25, 0.05, 0.04]} c="#9a9a96" m={0.5} r={[0, 0, -0.4]} />
        </group>
      );
    })()}
    {/* câmera em pan-tilt (lado esquerdo) */}
    <Rod a={[2.75, -0.9, -0.85]} b={[3.1, -0.75, -1.0]} r={0.04} c={DARK} />
    <B p={[3.2, -0.72, -1.0]} s={[0.3, 0.18, 0.18]} c="#d8d4c8" />
    <mesh position={[3.36, -0.72, -1.0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.05, 10]} /><meshStandardMaterial color="#111" transparent /></mesh>
    {/* faróis */}
    <Rod a={[2.4, 0.55, 0.75]} b={[2.95, 0.3, 0.8]} r={0.035} c={DARK} />
    <Rod a={[2.4, 0.55, -0.75]} b={[2.95, 0.3, -0.8]} r={0.035} c={DARK} />
    <Lamp p={[3.0, 0.3, 0.8]} beams={beams} />
    <Lamp p={[3.0, 0.3, -0.8]} beams={beams} />
    <Lamp p={[3.05, -1.05, 0.45]} beams={beams * 0.6} />
  </group>
);
