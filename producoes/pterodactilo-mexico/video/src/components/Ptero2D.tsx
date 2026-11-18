import { BRAND } from "../brand";
import { FONT } from "../theme";
import { clamp, rand } from "../utils/animation";

// 2D do "Pterodáctilo no México?": moldura de câmera de segurança e etiqueta do quadro no gancho.
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

/** Moldura de câmera de segurança: granulado, linhas, REC piscando, data/hora e cronômetro (secs). */
export const CctvFrame: React.FC<{ f: number; v: number; secs?: number; date?: string; w?: number; h?: number }> = ({ f, v, secs = 0, date = "29/10/2026", w = 1080, h = 1920 }) => {
  if (v < 0.01) return null;
  const grain = Array.from({ length: 160 }, (_, i) => ({ x: rand(`gx${i}-${f}`) * w, y: rand(`gy${i}-${f}`) * h, a: 0.08 + rand(`ga${i}-${f}`) * 0.22, s: 2 + rand(`gs${i}-${f}`) * 4 }));
  const t = Math.max(0, secs);
  const hh = `00:13:${String(41 + Math.floor(t)).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, opacity: clamp(v, 0, 1), pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(40,60,50,0.28)", mixBlendMode: "color" }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)" }} />
      {grain.map((g, i) => <div key={i} style={{ position: "absolute", left: g.x, top: g.y, width: g.s, height: g.s, background: `rgba(230,240,230,${g.a})` }} />)}
      {/* cantos */}
      {[[60, 300, "0 0"], [w - 60, 300, "1 0"], [60, h - 520, "0 1"], [w - 60, h - 520, "1 1"]].map(([x, y, o], i) => {
        const [ox, oy] = String(o).split(" ").map(Number);
        return <div key={i} style={{ position: "absolute", left: Number(x) - ox * 70, top: Number(y) - oy * 70, width: 70, height: 70, borderLeft: ox ? undefined : "5px solid #e8f0e8", borderRight: ox ? "5px solid #e8f0e8" : undefined, borderTop: oy ? undefined : "5px solid #e8f0e8", borderBottom: oy ? "5px solid #e8f0e8" : undefined, opacity: 0.85 }} />;
      })}
      <div style={{ position: "absolute", left: 90, top: 320, fontFamily: "monospace", fontWeight: 700, fontSize: 34, color: "#e8f0e8", textShadow: "0 0 6px #000" }}>
        <span style={{ color: Math.floor(f / 12) % 2 ? "#ff3a3a" : "rgba(255,58,58,0.25)" }}>●</span> REC · CAM 03
      </div>
      <div style={{ position: "absolute", right: 90, top: 320, fontFamily: "monospace", fontWeight: 700, fontSize: 32, color: "#e8f0e8", textShadow: "0 0 6px #000", textAlign: "right" }}>
        {date}
        <br />
        {hh}
      </div>
      {/* cronômetro do clipe */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h - 640, textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
        <span style={{ display: "inline-block", padding: "4px 26px", borderRadius: 18, background: "rgba(11,8,18,0.8)", border: "4px solid #ffd27a", fontSize: 72, color: "#ffd27a", fontVariantNumeric: "tabular-nums", ...stroke(5) }}>{t.toFixed(1).replace(".", ",")} s</span>
      </div>
    </div>
  );
};

/** Etiqueta roxa do quadro (no gancho do frame 1). */
export const SeriesTag: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "BOATO OU VERDADE? #5", top = 470 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: clamp(v, 0, 1) }}>
      <span style={{ display: "inline-block", padding: "8px 26px", borderRadius: 999, background: BRAND.colors.accent, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: 2, boxShadow: "0 8px 20px rgba(0,0,0,0.45)" }}>{text}</span>
    </div>
  );
