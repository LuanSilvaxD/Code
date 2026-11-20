import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Animação "CURTE E SE INSCREVE" (regra do usuário, 16/11/2026; mais lenta + sons em 17/11/2026): pílula compacta na
// lateral, cursor entra devagar, clica no polegar (fica roxo) e no INSCREVER-SE (vira INSCRITO cinza, com sininho) e sai.
// t = frames locais desde o início. Duração LS_LEN (~4,3 s). Sons: "ui-click" em LS_CLICK1 e LS_CLICK2, "sub-bell" em
// LS_CLICK2 + 2 — use likeSubscribeSfx(inicio) nos audioCues da cena.
export const LS_LEN = 130;
export const LS_CLICK1 = 34;
export const LS_CLICK2 = 72;
export const likeSubscribeSfx = (at: number) => [
  { name: "ui-click", at: at + LS_CLICK1, volume: 0.75 },
  { name: "ui-click", at: at + LS_CLICK2, volume: 0.75 },
  { name: "sub-bell", at: at + LS_CLICK2 + 2, volume: 0.6 },
];
export const LikeSubscribe: React.FC<{ t: number; top?: number; side?: "left" | "right" }> = ({ t, top = 1040, side = "right" }) => {
  if (t < 0 || t > LS_LEN) return null;
  const inK = clamp(t / 12, 0, 1);
  const outK = clamp((LS_LEN - t) / 12, 0, 1);
  const a = Math.min(inK, outK);
  // cursor: entra (0–26), clica no polegar (34), vai ao botão (46–64), clica (72), espera, sai (96–124)
  const lerp = (x: number, y: number, k: number) => x + (y - x) * k;
  const ease = (k: number) => k * k * (3 - 2 * k);
  const p1 = { x: 110, y: 90 }, p0 = { x: 220, y: 170 }, p2 = { x: 270, y: 44 }, p3 = { x: 420, y: 160 };
  let cx = p0.x, cy = p0.y;
  if (t < 26) { const k = ease(t / 26); cx = lerp(p0.x, p1.x, k); cy = lerp(p0.y, p1.y, k); }
  else if (t < 46) { cx = p1.x; cy = p1.y; }
  else if (t < 64) { const k = ease((t - 46) / 18); cx = lerp(p1.x, p2.x, k); cy = lerp(p1.y, p2.y, k); }
  else if (t < 96) { cx = p2.x; cy = p2.y; }
  else { const k = ease(clamp((t - 96) / 28, 0, 1)); cx = lerp(p2.x, p3.x, k); cy = lerp(p2.y, p3.y, k); }
  const press1 = t >= LS_CLICK1 && t < LS_CLICK1 + 6;
  const press2 = t >= LS_CLICK2 && t < LS_CLICK2 + 6;
  const liked = t >= LS_CLICK1 + 1;
  const subbed = t >= LS_CLICK2 + 1;
  const ring = (t0: number) => (t >= t0 && t < t0 + 18 ? (t - t0) / 18 : -1);
  const r1 = ring(LS_CLICK1), r2 = ring(LS_CLICK2);
  // sininho balançando ao se inscrever
  const bell = t >= LS_CLICK2 + 1 && t < LS_CLICK2 + 40 ? (t - LS_CLICK2 - 1) / 39 : -1;
  const W = 380;
  return (
    <div style={{ position: "absolute", top, [side]: 60, width: W, height: 130, opacity: a, transform: `translateX(${(1 - inK) * (side === "right" ? 60 : -60)}px)`, fontFamily: FONT, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 20, width: W, height: 92, borderRadius: 46, background: "rgba(11,8,18,0.82)", border: "3px solid rgba(196,181,253,0.7)", boxShadow: "0 10px 26px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 16, padding: "0 16px", boxSizing: "border-box" }}>
        {/* polegar */}
        <div style={{ width: 66, height: 66, borderRadius: 33, display: "flex", alignItems: "center", justifyContent: "center", background: liked ? "#8b5cf6" : "rgba(255,255,255,0.12)", transform: `scale(${press1 ? 0.86 : 1})`, transition: "none", position: "relative" }}>
          <svg width="38" height="38" viewBox="0 0 24 24"><path d="M2 10h4v11H2zM8 21h9.3a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 18.8 10H14V5.5A2.5 2.5 0 0 0 11.5 3L8 10z" fill="#fff" /></svg>
          {r1 >= 0 ? <div style={{ position: "absolute", inset: -6 - r1 * 18, borderRadius: 999, border: `4px solid rgba(196,181,253,${1 - r1})` }} /> : null}
        </div>
        {/* botão inscrever */}
        <div style={{ flex: 1, height: 62, borderRadius: 31, background: subbed ? "#4a4a52" : "#e52d27", color: "#fff", fontWeight: 900, fontSize: subbed ? 30 : 28, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 1, transform: `scale(${press2 ? 0.92 : 1})`, position: "relative" }}>
          {subbed ? "✔ INSCRITO" : "INSCREVER-SE"}
          {bell >= 0 ? (
            <svg width="54" height="54" viewBox="0 0 24 24" style={{ position: "absolute", right: -8, top: -44, transform: `rotate(${Math.sin(bell * Math.PI * 6) * 24 * (1 - bell)}deg)`, transformOrigin: "50% 10%", opacity: Math.min(1, (1 - bell) * 3) }}>
              <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v.6A6 6 0 0 1 18 10v4.5l2 2.5H4l2-2.5V10a6 6 0 0 1 4.5-5.9v-.6A1.5 1.5 0 0 1 12 2zm-2.5 17h5a2.5 2.5 0 0 1-5 0z" fill="#ffcf3a" stroke="#0b0812" strokeWidth="1.2" />
            </svg>
          ) : null}
          {r2 >= 0 ? <div style={{ position: "absolute", inset: -6 - r2 * 18, borderRadius: 999, border: `4px solid rgba(255,255,255,${1 - r2})` }} /> : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: -14, width: W, textAlign: "center", fontWeight: 900, fontSize: 24, color: "#fff", WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" }}>CURTE E SE INSCREVE</div>
      {/* cursor */}
      <svg width="46" height="46" viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy, transform: `scale(${press1 || press2 ? 0.85 : 1})`, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }}>
        <path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 18z" fill="#fff" stroke="#0b0812" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
