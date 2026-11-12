import { Color } from "three";
import { clamp, type Vec3 } from "../utils/animation";
import { Person, type PersonLook } from "./Person";

// "ELA": Person em silhueta escura (k = 0) que se acende na revelação (k = 1). Três figurinos aprovados.
const SIL = new Color("#211a2c");
export const sil = (hex: string, k: number) => new Color(hex).lerp(SIL, 1 - clamp(k, 0, 1)).getStyle();

export type HerLook = "peasant" | "male" | "armor";
export const HER_LOOKS: Record<HerLook, PersonLook & { banner?: string; sword?: boolean }> = {
  peasant: { skin: "#eac3a2", hair: "#5a3b26", hairStyle: "long", tunic: "#a5473b", belt: "#4a3322", sleeves: "long", pants: "#5b4636", shoes: "#4a3322" },
  male: { skin: "#eac3a2", hair: "#5a3b26", hairStyle: "short", shirt: "#6b5a43", sleeves: "long", pants: "#3f3a52", shoes: "#3a2a1e" },
  armor: { skin: "#eac3a2", hair: "#5a3b26", hairStyle: "short", shirt: "#e9e2d0", sleeves: "long", pants: "#3a3f4a", armor: "#c3c6cc", shoes: "#3a2a1e", banner: "#f2ede0", sword: true },
};

export const herProps = (look: HerLook, k: number) => {
  const L = HER_LOOKS[look];
  const c = (h?: string) => (h ? sil(h, k) : undefined);
  return {
    hairStyle: L.hairStyle, sleeves: L.sleeves, skin: c(L.skin), hair: c(L.hair), tunic: c(L.tunic), belt: c(L.belt), shirt: c(L.shirt),
    pants: c(L.pants), shoes: c(L.shoes), armor: c(L.armor), banner: L.banner ? sil(L.banner, Math.max(k, 0.55)) : undefined, sword: L.sword,
  };
};

export const Her: React.FC<{ f: number; look: HerLook; k?: number; p?: Vec3; r?: number; scale?: number; banner?: boolean; walk?: number; rim?: number; u?: number }> = ({ f, look, k = 0, p = [0, 0, 0], r = 0, scale = 1, banner = true, walk = 0, rim = 0, u = 1 }) => {
  const props = herProps(look, k);
  return (
    <group>
      <Person frame={f} position={p} rotY={r} scale={scale} seed={1} walk={walk} {...props} banner={banner ? props.banner : undefined} />
      {rim > 0.01 && k < 0.6 ? <pointLight position={[p[0] - 0.4 * scale, p[1] + 2.4 * scale, p[2] - 0.8 * scale]} intensity={0.9 * rim} distance={3 * scale * u} decay={0} color="#a78bfa" /> : null}
    </group>
  );
};
