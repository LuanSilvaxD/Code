import { BRAND } from "../brand";
import { MATTE } from "../theme";

// Pedestal da maquete com a assinatura da marca: base em sombra arroxeada e um fio de luz roxa na face
// frontal (a luz roxa da "fenda"). Use em todo World.tsx: <BrandPedestal width={...} depth={...} y={...} />.
// width/depth = medidas da maquete; y = altura do TOPO do pedestal (logo abaixo da maquete).
export const BrandPedestal: React.FC<{ width: number; depth: number; y: number; height?: number }> = ({ width, depth, y, height = 0.5 }) => {
  const { umbra2, accent, core } = BRAND.colors;
  const w = width + 0.6;
  const d = depth + 0.6;
  return (
    <group position={[0, y - height / 2, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[w, height, d]} />
        <meshStandardMaterial {...MATTE} color={umbra2} />
      </mesh>
      {/* chanfro superior levemente mais claro: separa a maquete do pedestal */}
      <mesh position={[0, height / 2 - 0.02, 0]}>
        <boxGeometry args={[w + 0.04, 0.04, d + 0.04]} />
        <meshStandardMaterial {...MATTE} color="#251d36" />
      </mesh>
      {/* fio de luz roxa (núcleo claro) na face frontal */}
      <mesh position={[0, -height * 0.1, d / 2 + 0.005]}>
        <boxGeometry args={[w * 0.92, 0.035, 0.01]} />
        <meshBasicMaterial color={core} />
      </mesh>
      <mesh position={[0, -height * 0.1, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.94, 0.12, 0.01]} />
        <meshBasicMaterial color={accent} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};
