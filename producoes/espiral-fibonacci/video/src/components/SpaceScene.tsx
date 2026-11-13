import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { rand, type Vec3 } from "../utils/animation";

// Cenário de espaço reutilizável (temas de astronomia, órbitas, foguetes, ou a "casa" do mascote):
// campo de estrelas determinístico + planetas low-poly facetados. Use dentro do ThreeCanvas.

export const Stars: React.FC<{ count?: number; radius?: number; frame: number }> = ({ count = 900, radius = 60, frame }) => {
  const geo = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < count; i++) {
      // esfera de estrelas ao redor da cena
      const u = rand(`st-u${i}`) * 2 - 1;
      const a = rand(`st-a${i}`) * Math.PI * 2;
      const r = radius * (0.7 + 0.3 * rand(`st-r${i}`));
      const s = Math.sqrt(1 - u * u);
      pos.push(r * s * Math.cos(a), r * u, r * s * Math.sin(a));
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);
  const tw = 0.85 + 0.15 * Math.sin(frame / 7);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.14} sizeAttenuation transparent opacity={0.9 * tw} />
    </points>
  );
};

/** Planeta facetado (icosaedro de baixa subdivisão + flatShading) com anel opcional. */
export const Planet: React.FC<{ position: Vec3; radius: number; color: string; frame: number; spin?: number; ring?: string; detail?: number }> = ({ position, radius, color, frame, spin = 0.004, ring, detail = 1 }) => (
  <group position={position} rotation={[0.3, frame * spin, 0.15]}>
    <mesh castShadow receiveShadow>
      <icosahedronGeometry args={[radius, detail]} />
      <meshStandardMaterial color={color} roughness={0.85} flatShading />
    </mesh>
    {ring ? (
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[radius * 1.55, radius * 0.08, 3, 28]} />
        <meshStandardMaterial color={ring} roughness={0.7} flatShading />
      </mesh>
    ) : null}
  </group>
);
