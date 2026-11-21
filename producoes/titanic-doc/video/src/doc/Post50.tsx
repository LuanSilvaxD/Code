import { AbsoluteFill, Img, staticFile } from "remotion";
import { Mascot } from "../components/Mascot";
import { FONT } from "../theme";
import { rand } from "../utils/animation";
import { Cine } from "./kit";

/** Post de agradecimento pelos 50 inscritos (YouTube Posts, 1080×1080). */
const BG = "radial-gradient(circle at 50% 46%, #3a2470 0%, #1b1233 42%, #0b0812 78%)";

const Confetti: React.FC = () => (
  <AbsoluteFill>
    {Array.from({ length: 70 }, (_, i) => {
      const x = rand(`cx${i}`) * 1080, y = rand(`cy${i}`) * 1080;
      if (x > 260 && x < 820 && y > 220 && y < 860) return null; // deixa o centro limpo
      const c = ["#8b5cf6", "#c4b5fd", "#f5f0ff", "#ffd27a", "#5b33d6"][i % 5];
      const w = 10 + rand(`cw${i}`) * 14;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: w * 0.45, background: c, borderRadius: 3, transform: `rotate(${rand(`cr${i}`) * 180}deg)`, opacity: 0.9 }} />;
    })}
  </AbsoluteFill>
);

export const Post50: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0812" }}>
    <AbsoluteFill style={{ background: BG }} />
    {/* o 50 gigante atrás do mascote */}
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 500, lineHeight: 1, background: "linear-gradient(180deg,#c4b5fd 0%,#8b5cf6 55%,#5b33d6 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 40px rgba(139,92,246,0.6))", letterSpacing: -10 }}>50</div>
    <Cine bg="transparent" fov={30} light="day" w={1080} h={1080} keys={[[0, [0, 1.6, 8.4], [0, 1.05, 0]]]}>
      {(f) => (
        <>
          <Mascot frame={40} position={[0, 0, 0]} scale={1.05} cheer={1} rotY={0} />
          <mesh position={[0, -0.06, 0]}><cylinderGeometry args={[0.85, 0.95, 0.12, 40]} /><meshStandardMaterial color="#171222" roughness={0.6} /></mesh>
          <mesh position={[0, 0.0, 0.0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.86, 0.018, 8, 60]} /><meshBasicMaterial color="#a78bfa" toneMapped={false} /></mesh>
          {f < 0 ? null : null}
        </>
      )}
    </Cine>
    <Confetti />
    <div style={{ position: "absolute", top: 58, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: FONT, color: "#f5f0ff" }}>
      <Img src={staticFile("brand/logo.png")} style={{ width: 64, height: 64, borderRadius: 32 }} />
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 8 }}>FENDA UMBRA</div>
    </div>
    <div style={{ position: "absolute", bottom: 56, left: 0, right: 0, textAlign: "center", fontFamily: FONT, color: "#f5f0ff", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
      <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: 2, lineHeight: 1 }}>OBRIGADO!</div>
      <div style={{ marginTop: 4, fontSize: 32, fontWeight: 800, letterSpacing: 5, color: "#c4b5fd", lineHeight: 1.35 }}>50 INSCRITOS ABRINDO<br />FENDAS COM A GENTE</div>
    </div>
  </AbsoluteFill>
);
