import { AbsoluteFill, Img, staticFile } from "remotion";
import { Stars } from "../components/SpaceScene";
import { Iceberg, TitanicHero } from "../components/Doc3D";
import { NightSea } from "../components/Titanic";
import { FONT } from "../theme";
import { Cine, NIGHT } from "./kit";

/** Thumbnails 16:9 do documentário. A: navio afundando + "NÃO FOI SÓ O ICEBERG". B: o raspão no iceberg + "TITANIC". */
export const DocThumb: React.FC<{ v: "A" | "B" }> = ({ v }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {v === "A" ? (
      <Cine bg={NIGHT} fov={34} keys={[[0, [1, 2.2, 36], [0, 2.4, 0]]]}>
        {(f) => (
          <>
            <Stars count={900} radius={140} frame={f} />
            <NightSea f={60} size={200} seg={150} moonX={-40} calm={0.4} />
            <group position={[2, -2.0, 0]} rotation={[0, -0.3, -0.3]}><TitanicHero f={60} lights={1} smoke={0} /></group>
            <group position={[22, 0.5, -24]} scale={2.2}><Iceberg f={60} under={false} foam={0} /></group>
            <pointLight position={[-4, 8, 16]} intensity={24} distance={30} color="#cfe4ff" />
          </>
        )}
      </Cine>
    ) : (
      <Cine bg={NIGHT} fov={30} keys={[[0, [10, 6, 60], [5, 2.2, 2]]]}>
        {(f) => (
          <>
            <Stars count={900} radius={140} frame={f} />
            <NightSea f={60} size={200} seg={150} moonX={-40} calm={0.4} />
            <group rotation={[0, 0.12, 0]}><TitanicHero f={60} lights={1} smoke={0.5} /></group>
            <group position={[15.5, 0.55, 5.6]} scale={1.5}><Iceberg f={60} under={false} foam={0.8} /></group>
            <pointLight position={[18, 10, 12]} intensity={40} distance={34} color="#cfe4ff" />
          </>
        )}
      </Cine>
    )}
    {/* vinheta para leitura do texto */}
    <AbsoluteFill style={{ background: v === "A" ? "linear-gradient(90deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.35) 45%,rgba(0,0,0,0) 70%)" : "linear-gradient(90deg,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.2) 50%,rgba(0,0,0,0) 70%)" }} />
    <div style={{ position: "absolute", left: 64, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: FONT, color: "#f6f1e6", textShadow: "0 4px 24px rgba(0,0,0,0.9)" }}>
      {v === "A" ? (
        <>
          <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 0.98, letterSpacing: 1 }}>NÃO FOI SÓ</div>
          <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 0.98, letterSpacing: 1 }}>O <span style={{ color: "#9fd8ff" }}>ICEBERG</span></div>
          <div style={{ marginTop: 22, fontSize: 34, fontWeight: 800, letterSpacing: 8, color: "#ffd27a" }}>TITANIC · 1912</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 0.95, letterSpacing: 4 }}>TITANIC</div>
          <div style={{ marginTop: 14, fontSize: 40, fontWeight: 800, letterSpacing: 4, color: "#ffd27a" }}>O QUE REALMENTE</div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 4, color: "#ffd27a" }}>ACONTECEU</div>
        </>
      )}
    </div>
    <Img src={staticFile("brand/logo.png")} style={{ position: "absolute", right: 34, top: 28, width: 74, height: 74, borderRadius: 37, opacity: 0.95 }} />
  </AbsoluteFill>
);
