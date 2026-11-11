import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { linPos, upPos } from "../components/Monument";
import { heightAt } from "../components/Terrain";
import { crewAt } from "../components/World";
import { track } from "../data/scenes";
import britain from "../data/britain.json";
import { FONT } from "../theme";
import { clamp, lerp, type Vec3 } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D de "Como construíram Stonehenge?": mapa da Grã-Bretanha com as rotas das pedras, comparação de
// tamanho dos testes, "?" sobre a equipe, rótulos dos encaixes, cotas do anel, Pedra do Calcanhar, barra do dia e
// linha do tempo. Faixa útil: badges em cima (~250–520 px), legenda em ~1418 px.

const a01 = (v: number) => clamp(v, 0, 1);
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const U = 0.1;
const m2u = (p: Vec3): Vec3 => [p[0] * U, p[1] * U, p[2] * U];

const Chip: React.FC<{ x: number; y: number; text: string; color?: string; bg?: string; size?: number; o?: number }> = ({ x, y, text, color = "#fff", bg = "rgba(11,8,18,0.82)", size = 30, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: o, padding: "6px 16px", borderRadius: 12, background: bg, color, fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>
    {text}
  </div>
);

// ---------------------------------------------------------------- cena 1: pedra · madeira · corda
const Icon: React.FC<{ kind: "stone" | "wood" | "rope" }> = ({ kind }) => (
  <svg width={92} height={92} viewBox="0 0 100 100">
    {kind === "stone" ? <polygon points="28,90 22,40 34,14 66,10 78,36 74,90" fill="#a59c88" stroke="#0b0812" strokeWidth={5} /> : null}
    {kind === "wood" ? (
      <>
        <rect x={8} y={36} width={84} height={30} rx={14} fill="#8a6440" stroke="#0b0812" strokeWidth={5} />
        <ellipse cx={82} cy={51} rx={10} ry={15} fill="#c79a66" stroke="#0b0812" strokeWidth={4} />
      </>
    ) : null}
    {kind === "rope" ? <path d="M18,78 C10,40 60,20 50,50 C40,80 90,60 82,22" fill="none" stroke="#c8b48a" strokeWidth={11} strokeLinecap="round" /> : null}
  </svg>
);
const ToolsTrio: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const t = a01(track("toolsTrio.show", f));
  if (t <= 0.01) return null;
  const labels: ["stone" | "wood" | "rope", string][] = [["stone", "PEDRA"], ["wood", "MADEIRA"], ["rope", "CORDA"]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 1080, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34 }}>
        {labels.map(([k, l], i) => {
          const s = a01(t * 3 - i * 0.6);
          return (
            <div key={k} style={{ opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`, display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(11,8,18,0.78)", borderRadius: 22, padding: "10px 18px 8px", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
              <Icon kind={k} />
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#fff" }}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cenas 3–5: mapa
type Box = [number, number, number, number];
const Z1: Box = [430, 790, 400, 382];
const Z2: Box = [300, 700, 520, 497];
const Z3: Box = [-20, 70, 1050, 1003];
const mixBox = (a: Box, b: Box, t: number): Box => a.map((v, i) => lerp(v, b[i], t)) as Box;

const StoneCard: React.FC<{ kind: "sarsen" | "blue" | "altar"; t: number; label: string; sub: string }> = ({ kind, t, label, sub }) => {
  const px = 15; // px por metro
  const stone = kind === "sarsen" ? { w: 2.1, h: 5.6, c: "#a59c88" } : kind === "blue" ? { w: 0.7, h: 2.4, c: "#6c7c8c" } : { w: 4.9, h: 0.5, c: "#9a9a72" };
  const H = 6 * px + 10;
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * 30}px)`, background: "rgba(11,8,18,0.82)", borderRadius: 18, padding: "10px 16px", display: "flex", alignItems: "flex-end", gap: 12, boxShadow: "0 8px 20px rgba(0,0,0,0.45)" }}>
      <svg width={stone.w * px + 46} height={H}>
        <rect x={4} y={H - stone.h * px - 2} width={stone.w * px} height={stone.h * px} rx={3} fill={stone.c} stroke="#0b0812" strokeWidth={3} />
        {/* pessoa de 1,7 m */}
        <g transform={`translate(${stone.w * px + 22}, ${H - 2})`}>
          <rect x={-5} y={-1.7 * px} width={10} height={1.1 * px} rx={4} fill="#c4b5fd" />
          <circle cx={0} cy={-1.7 * px - 6} r={6} fill="#c4b5fd" />
          <rect x={-5} y={-0.6 * px} width={4} height={0.6 * px} fill="#c4b5fd" />
          <rect x={1} y={-0.6 * px} width={4} height={0.6 * px} fill="#c4b5fd" />
        </g>
      </svg>
      <div style={{ fontFamily: FONT, color: "#fff", paddingBottom: 4 }}>
        <div style={{ fontWeight: 900, fontSize: 26 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 19, color: "#d9d0ff" }}>{sub}</div>
      </div>
    </div>
  );
};

const MapOverlay: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const show = a01(track("map.show", f));
  const dim = a01(track("scene.dim", f));
  if (show <= 0.01 && dim <= 0.01) return null;
  const box = track("map.zoomOut2", f) > 0 ? mixBox(Z2, Z3, a01(track("map.zoomOut2", f))) : mixBox(Z1, Z2, a01(track("map.zoomOut", f)));
  const p = britain.points;
  const S = p.stonehenge;
  const routes: { k: "westWoods" | "preseli" | "altar"; c: string; prog: number; label: string; bend: number }[] = [
    { k: "westWoods", c: "#7ee0a1", prog: a01(track("route.sarsen", f)), label: "WEST WOODS", bend: 10 },
    { k: "preseli", c: "#8ec5ff", prog: a01(track("route.blue", f)), label: "PRESELI", bend: -40 },
    { k: "altar", c: "#ffd27a", prog: a01(track("route.altar", f)), label: "N. DA ESCÓCIA", bend: 60 },
  ];
  const sc = box[2] / 900; // textos com tamanho constante na tela
  const cards: { kind: "sarsen" | "blue" | "altar"; t: number; label: string; sub: string }[] = [
    { kind: "sarsen", t: a01(track("sarsenIcon.show", f)), label: "SARSEN", sub: "~25 t · ~25 km" },
    { kind: "blue", t: a01(track("blueIcon.show", f)), label: "PEDRA AZUL", sub: "2–5 t · +200 km" },
    { kind: "altar", t: a01(track("altarIcon.show", f)), label: "ALTAR", sub: "~6 t · ≥750 km" },
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#0b0812", opacity: dim }} />
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 860, opacity: show, borderRadius: 30, overflow: "hidden", background: "linear-gradient(180deg,#14223b 0%,#0e1830 100%)", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", transform: `scale(${0.94 + 0.06 * show})` }}>
        <svg viewBox={box.join(" ")} width={900} height={860} preserveAspectRatio="xMidYMid slice">
          <path d={britain.ie} fill="#2b3a52" stroke="#45597a" strokeWidth={2 * sc} />
          <path d={britain.uk} fill="#3f5a3f" stroke="#86a77a" strokeWidth={2.5 * sc} />
          {routes.map((r) => {
            if (r.prog <= 0) return null;
            const E = p[r.k];
            const cx = (S[0] + E[0]) / 2 + r.bend;
            const cy = (S[1] + E[1]) / 2;
            const d = `M${E[0]},${E[1]} Q${cx},${cy} ${S[0]},${S[1]}`;
            return (
              <g key={r.k}>
                <path d={d} fill="none" stroke="#0b0812" strokeWidth={11 * sc} strokeLinecap="round" pathLength={1} strokeDasharray={`${r.prog} 1`} opacity={0.6} />
                <path d={d} fill="none" stroke={r.c} strokeWidth={6.5 * sc} strokeLinecap="round" pathLength={1} strokeDasharray={`${r.prog} 1`} />
                <circle cx={E[0]} cy={E[1]} r={11 * sc} fill={r.c} stroke="#0b0812" strokeWidth={3 * sc} />
                <text x={E[0] + (r.k === "westWoods" ? 18 : -16) * sc} y={E[1] - 18 * sc} fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={30 * sc} textAnchor={r.k === "westWoods" ? "start" : "end"} stroke="#0b0812" strokeWidth={6 * sc} paintOrder="stroke">
                  {r.label}
                </text>
              </g>
            );
          })}
          <circle cx={S[0]} cy={S[1]} r={15 * sc * (1 + 0.12 * Math.sin(f / 6))} fill={BRAND.colors.accent} stroke="#f5f0ff" strokeWidth={4 * sc} />
          <text x={S[0] + 22 * sc} y={S[1] + 46 * sc} fill="#f5f0ff" fontFamily={FONT} fontWeight={900} fontSize={32 * sc} stroke="#0b0812" strokeWidth={6 * sc} paintOrder="stroke">STONEHENGE</text>
        </svg>
        <div style={{ position: "absolute", left: 18, bottom: 16, display: "flex", gap: 12, alignItems: "flex-end" }}>
          {cards.filter((c) => c.t > 0.01).map((c) => (
            <StoneCard key={c.kind} {...c} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena 7: testes menores × maiores; "?"
const CompareOverlay: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const t = a01(track("compare.show", f));
  const q = a01(track("crew.unknown", f));
  const pose = cameraPoseAt(f);
  const crew = crewAt(f);
  return (
    <AbsoluteFill>
      {t > 0.01 ? (
        <div style={{ position: "absolute", left: 140, right: 140, top: 560, opacity: t, transform: `scale(${0.9 + 0.1 * t})`, background: "rgba(11,8,18,0.84)", borderRadius: 24, padding: "20px 26px", display: "flex", justifyContent: "space-around", alignItems: "flex-end", boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>
          {[{ w: 70, h: 60, c: "#8f8a7c", l: "TESTES", s: "blocos menores" }, { w: 120, h: 300, c: "#a59c88", l: "AS MAIORES", s: "~30 t" }].map((b) => (
            <div key={b.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: b.w, height: b.h * a01(t * 1.4), background: b.c, borderRadius: 6, border: "4px solid #0b0812" }} />
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: "#fff" }}>{b.l}</div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 21, color: "#d9d0ff" }}>{b.s}</div>
            </div>
          ))}
        </div>
      ) : null}
      {q > 0.01
        ? crew.map((c, i) => {
            const pt = projectPoint(pose, m2u([c.x, heightAt(c.x, c.z) + 2.3, c.z]));
            if (!pt || pt.y < 300 || pt.y > 1340) return null;
            return <Chip key={i} x={pt.x} y={pt.y - 8 * Math.sin(f / 5 + i)} text="?" color="#0b0812" bg="#ffd166" size={30} o={a01(q * 3 - (i % 4) * 0.4)} />;
          })
        : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena 11: rótulos dos encaixes
const JointLabels: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const ex = a01(track("joint.explode", f));
  const l2 = a01(track("lintel2.slide", f));
  const pose = cameraPoseAt(f);
  const U7 = upPos(7);
  const L7 = linPos(7);
  const tenon = projectPoint(pose, m2u([U7.x - 0.53, 4.3, U7.z]));
  const mort = projectPoint(pose, m2u([L7.x + Math.sin(L7.a) * 1.04, 4.35 + ex * 1.2, L7.z - Math.cos(L7.a) * 1.04]));
  const tongue = projectPoint(pose, m2u([0, 4.75, 15]));
  return (
    <AbsoluteFill>
      {ex > 0.05 && tenon ? <Chip x={tenon.x + 120} y={tenon.y + 70} text="PINO" bg="#3b6fd8" o={ex} /> : null}
      {ex > 0.05 && mort ? <Chip x={mort.x - 90} y={mort.y - 80} text="BURACO" bg="#3b6fd8" o={ex} /> : null}
      {l2 > 0.3 && tongue ? <Chip x={tongue.x} y={tongue.y - 120} text="LINGUETA E RANHURA" bg="#3b6fd8" size={26} o={a01((l2 - 0.3) * 3)} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena 12: cotas do anel
const RingDims: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const d = a01(track("ringDims.diameter", f));
  const h = a01(track("ringDims.height", f));
  const pose = cameraPoseAt(f);
  const a = projectPoint(pose, m2u([-15, 4.9, 0]));
  const b = projectPoint(pose, m2u([15, 4.9, 0]));
  const U3 = upPos(3);
  const g = projectPoint(pose, m2u([U3.x * 1.12, 0, U3.z * 1.12]));
  const top = projectPoint(pose, m2u([U3.x * 1.12, 4.35, U3.z * 1.12]));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {d > 0.01 && a && b ? (
          <g opacity={d}>
            <line x1={a.x} y1={a.y} x2={lerp(a.x, b.x, d)} y2={lerp(a.y, b.y, d)} stroke="#0b0812" strokeWidth={13} strokeLinecap="round" />
            <line x1={a.x} y1={a.y} x2={lerp(a.x, b.x, d)} y2={lerp(a.y, b.y, d)} stroke="#7ee0a1" strokeWidth={7} strokeLinecap="round" />
          </g>
        ) : null}
        {h > 0.01 && g && top ? (
          <g opacity={h}>
            <line x1={g.x} y1={g.y} x2={g.x} y2={lerp(g.y, top.y, h)} stroke="#0b0812" strokeWidth={13} strokeLinecap="round" />
            <line x1={g.x} y1={g.y} x2={g.x} y2={lerp(g.y, top.y, h)} stroke="#ffd27a" strokeWidth={7} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
      {d > 0.5 && a && b ? <Chip x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 46} text="30 m" bg="#2f9a62" o={a01((d - 0.5) * 2)} /> : null}
      {h > 0.5 && g && top ? <Chip x={g.x + 86} y={(g.y + top.y) / 2} text="4 m" color="#0b0812" bg="#ffd27a" o={a01((h - 0.5) * 2)} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena 13: Pedra do Calcanhar
const HeelLabel: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const pose = cameraPoseAt(f);
  const pt = projectPoint(pose, m2u([78, heightAt(78, 0) + 5.2, 0]));
  const o = a01(track("sun.rise", f) * 2);
  if (!pt || o <= 0.01 || pt.x < 120 || pt.x > 960) return null;
  return <Chip x={pt.x} y={pt.y - 30} text="PEDRA DO CALCANHAR" size={24} o={o} />;
};

// ---------------------------------------------------------------- cena 14: duração do dia
const DayBar: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const t = a01(track("dayBar.show", f));
  const v = a01(track("dayBar.value", f));
  if (t <= 0.01) return null;
  // barras: dias encolhendo até o solstício, depois crescendo
  const N = 13;
  const shown = Math.round(lerp(7, N, v));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, right: 150, top: 560, opacity: t, transform: `scale(${0.9 + 0.1 * t})`, background: "rgba(11,8,18,0.84)", borderRadius: 24, padding: "18px 24px 14px", boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", textAlign: "center", marginBottom: 10 }}>DURAÇÃO DO DIA</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 170 }}>
          {Array.from({ length: N }, (_, i) => {
            const len = 0.35 + 0.65 * Math.abs(i - 6) / 6;
            const on = i < shown;
            return <div key={i} style={{ width: 40, height: 170 * len, borderRadius: 6, background: i === 6 ? "#ff9a52" : i > 6 ? "#7ee0a1" : "#8c84a8", opacity: on ? 1 : 0.15 }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 800, fontSize: 19, color: "#d9d0ff", marginTop: 8 }}>
          <span>outono</span>
          <span style={{ color: "#ffb37a" }}>solstício de inverno</span>
          <span>primavera</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena 15: linha do tempo
const Timeline: React.FC<SceneProps> = ({ scene }) => {
  const f = useG(scene);
  const t = a01(track("timeline.show", f));
  const p = a01(track("timeline.progress", f));
  if (t <= 0.01) return null;
  const marks: [number, string, string][] = [
    [0, "~3000 a.C.", "vala"],
    [0.33, "~2500 a.C.", "sarsens"],
    [0.7, "", "pedras azuis rearrumadas"],
    [1, "~1500 a.C.", "últimas mexidas"],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 580, opacity: t, background: "rgba(11,8,18,0.84)", borderRadius: 24, padding: "26px 40px 22px", boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>
        <div style={{ position: "relative", height: 150 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 46, height: 10, borderRadius: 5, background: "#3a3150" }} />
          <div style={{ position: "absolute", left: 0, width: `${p * 100}%`, top: 46, height: 10, borderRadius: 5, background: "#b794ff" }} />
          {marks.map(([x, d, l]) => (
            <div key={l} style={{ position: "absolute", left: `${x * 100}%`, top: 0, translate: "-50% 0", textAlign: "center", opacity: p >= x - 0.02 ? 1 : 0.25, width: 220 }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 22, color: "#fff", height: 30 }}>{d}</div>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: p >= x - 0.02 ? "#f5f0ff" : "#3a3150", margin: "6px auto 8px", border: "4px solid #0b0812" }} />
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, color: "#d9d0ff" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const STONE_MODULES: Record<string, SceneModule> = {
  "scene-01-gancho": { Overlay: ToolsTrio },
  "scene-03-sarsens": { Overlay: MapOverlay },
  "scene-04-pedras-azuis": { Overlay: MapOverlay },
  "scene-05-altar": { Overlay: MapOverlay },
  "scene-07-incerteza": { Overlay: CompareOverlay },
  "scene-11-encaixes": { Overlay: JointLabels },
  "scene-12-anel": { Overlay: RingDims },
  "scene-13-sol": { Overlay: HeelLabel },
  "scene-14-inverno": { Overlay: DayBar },
  "scene-15-final": { Overlay: Timeline },
};
