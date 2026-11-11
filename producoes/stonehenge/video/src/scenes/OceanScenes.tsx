import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Burst } from "../components/Burst";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { COL, POD_X, POD_Z, podY } from "../components/World";
import { depthY, scenes, track, XB } from "../data/scenes";
import { FONT } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Zonas do oceano": régua de profundidade, HUD (profundidade/pressão/temperatura), selo de escala e
// os cartões de cada cena.

const a01 = (v: number) => clamp(v, 0, 1);
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
const sceneIndex = (frame: number) => {
  let k = 0;
  scenes.forEach((s, i) => {
    if (frame >= s.startFrame) k = i;
  });
  return k;
};

const Chip: React.FC<{ x: number; y: number; text: string; color?: string; bg?: string; size?: number; o?: number }> = ({ x, y, text, color = "#fff", bg = "rgba(11,8,18,0.78)", size = 26, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: o, padding: "4px 12px", borderRadius: 10, background: bg, color, fontFamily: FONT, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }}>
    {text}
  </div>
);

/** Régua de profundidade ao lado da coluna em foco (A esticada ou B real). */
export const DepthRuler: React.FC<{ frame: number }> = ({ frame }) => {
  const pose = cameraPoseAt(frame);
  const onB = pose.target[0] > XB / 2;
  const zones = [track("zone.sun", frame), track("zone.twilight", frame), track("zone.midnight", frame), track("zone.abyss", frame), track("zone.hadal", frame)];
  const marks: [number, string, number][] = onB
    ? [0, 2000, 4000, 6000, 8000, 10000, 11000].map((m) => [-m / 1000, m === 0 ? "0" : `${m / 1000} km`, 1] as [number, string, number])
    : ([
        [0, "0 m", 1],
        [200, "200 m", zones[0]],
        [1000, "1.000 m", zones[1]],
        [4000, "4.000 m", zones[2]],
        [6000, "6.000 m", zones[3]],
        [11000, "11.000 m", zones[4]],
      ] as [number, string, number][]).map(([m, t, z]) => [depthY(m), t, z]);
  const x0 = (onB ? XB : 0) - COL.w / 2 - 0.12;
  return (
    <>
      {marks.map(([y, t, z], i) => {
        const p = projectPoint(pose, [x0, y, COL.d / 2]);
        if (!p.visible || p.y < 300 || p.y > 1330 || p.x < 60) return null;
        return <Chip key={i} x={Math.max(110, p.x - 70)} y={p.y} text={t} size={24} color={z > 0.5 ? "#ffd36b" : "#e9e4ff"} />;
      })}
    </>
  );
};

/** HUD: profundidade da batisfera, pressão (1 atm + 1 a cada 10 m) e temperatura quando dita. */
export const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const k = sceneIndex(frame);
  if (k < 1 || k > 12) return null;
  const d = track("pod.depth", frame, 0);
  const atm = 1 + d / 10;
  const temp = track("temp.show", frame);
  const seal = "ESQUEMA · FAIXAS FORA DE ESCALA";
  return (
    <>
      <div style={{ position: "absolute", left: 70, top: 1150, padding: "12px 18px", borderRadius: 18, background: "rgba(8,14,32,0.82)", border: "2px solid rgba(124,208,255,0.6)", fontFamily: FONT, color: "#fff", minWidth: 250 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#9fd0ff", letterSpacing: 1 }}>PROFUNDIDADE</div>
        <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.05 }}>{fmt(d)} m</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#ffd36b" }}>pressão ≈ {fmt(atm)} atm</div>
        {temp > 0.02 ? <div style={{ fontWeight: 800, fontSize: 22, color: "#c4b5fd", opacity: a01(temp) }}>água ≈ 4 °C</div> : null}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1528, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "5px 14px", borderRadius: 999, background: "rgba(11,8,18,0.62)", border: "2px solid rgba(196,181,253,0.45)", color: "#d9ccff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1.2 }}>{seal}</div>
      </div>
    </>
  );
};

const Card: React.FC<{ v: number; top: number; children: React.ReactNode; left?: number; right?: number }> = ({ v, top, children, left = 120, right = 120 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left, right, top, opacity: a01(v), scale: String(0.85 + 0.15 * Math.min(1, v)), padding: "18px 24px", borderRadius: 24, background: "rgba(10,14,30,0.88)", border: "3px solid rgba(124,208,255,0.7)", boxShadow: "0 16px 36px rgba(0,0,0,0.45)", fontFamily: FONT, color: "#fff" }}>
      {children}
    </div>
  );

// ---- cena 1: colchete "≈ 2 km de água" acima do pico (coluna B)
const EverestOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const b = track("bracket.water", g);
  if (b < 0.01) return null;
  const top = projectPoint(pose, [XB + COL.trenchW / 2 + 0.2, 0, COL.d / 2]);
  const bot = projectPoint(pose, [XB + COL.trenchW / 2 + 0.2, -2.086, COL.d / 2]);
  const h = (bot.y - top.y) * a01(b);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: top.x, top: top.y, width: 18, height: h, borderTop: "5px solid #ffd36b", borderRight: "5px solid #ffd36b", borderBottom: "5px solid #ffd36b" }} />
      <Chip x={top.x + 120} y={top.y + h / 2} text="≈ 2 km de água" color="#1a1206" bg="#ffd36b" size={28} o={a01(b * 2 - 1)} />
    </AbsoluteFill>
  );
};

// ---- cena 3: lupa na alga + pizza do oxigênio
const OxygenOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const mag = track("magnifier.show", g);
  const card = track("o2Card.show", g);
  return (
    <AbsoluteFill>
      {mag > 0.01 ? (
        <div style={{ position: "absolute", right: 90, top: 520, width: 230, height: 230, borderRadius: 115, border: "8px solid #e9e4ff", background: "radial-gradient(circle,#2f7d4a 0%,#123a2a 100%)", scale: String(Math.min(1.1, mag)), opacity: a01(mag), boxShadow: "0 10px 30px rgba(0,0,0,0.5)", overflow: "hidden" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: "absolute", left: 40 + (i % 3) * 55, top: 50 + Math.floor(i / 3) * 70, width: 46, height: 46, borderRadius: 23, background: "#7fe07a", border: "4px solid #b8f5a8", rotate: `${i * 30}deg` }} />
          ))}
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 18, color: "#e9e4ff" }}>FITOPLÂNCTON</div>
        </div>
      ) : null}
      <Card v={card} top={960} left={200} right={200}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: "conic-gradient(#3d9be0 0 50%, #6fa35c 50% 100%)", border: "4px solid #fff", flex: "0 0 auto" }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 30, color: "#7cd0ff" }}>~METADE</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>do oxigênio produzido no planeta vem do oceano</div>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// ---- cena 4: barra das cores sumindo (vermelho primeiro)
const ColorsOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const show = track("colorBar.show", g);
  const fade = track("colorBar.fadeRed", g);
  if (show < 0.01) return null;
  const cols = ["#e5383b", "#ff8a1f", "#ffd52a", "#39d353", "#2f8bff", "#8b5cff"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", right: 80, top: 520, padding: 14, borderRadius: 18, background: "rgba(10,14,30,0.85)", opacity: a01(show), fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>CORES QUE CHEGAM</div>
        {cols.map((c, i) => {
          const gone = a01(fade * 6 - i); // vermelho some primeiro, depois as outras
          return <div key={c} style={{ width: 150, height: 34, marginTop: 6, borderRadius: 8, background: c, opacity: i >= 4 ? 1 : 1 - 0.9 * gone, outline: gone > 0.9 && i < 4 ? "2px dashed rgba(255,255,255,0.35)" : undefined }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- cena 7: sol/lua no topo da coluna
const MigrationOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const n = track("dayNight.night", g);
  const p = projectPoint(pose, [1.2, 0.6, 0]);
  if (!p.visible) return null;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: Math.min(980, p.x + 40), top: Math.max(480, p.y), translate: "-50% -50%", width: 90, height: 90, borderRadius: 45, background: n > 0.5 ? "#e9e4ff" : "#ffd36b", boxShadow: n > 0.5 ? "inset -22px -6px 0 0 #1b2a55, 0 0 30px rgba(233,228,255,0.6)" : "0 0 40px rgba(255,211,107,0.8)" }} />
      <Chip x={Math.min(980, p.x + 40)} y={Math.max(480, p.y) + 70} text={n > 0.5 ? "NOITE" : "DIA"} size={22} />
    </AbsoluteFill>
  );
};

// ---- cena 11: relógio da neve marinha
const SnowOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const t = track("snow.trace", g);
  if (t < 0.01) return null;
  return (
    <AbsoluteFill>
      <Chip x={820} y={560} text={`⏱ dias… semanas`} size={30} bg="rgba(10,14,30,0.85)" color="#e9e4ff" o={a01(t * 3)} />
    </AbsoluteFill>
  );
};

// ---- cena 13: pessoas no fundo × no espaço
const PeopleOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("peopleCard.show", g);
  const sp = track("peopleCard.space", g);
  const dot = (c: string, i: number) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: c, margin: 2 }} />;
  return (
    <AbsoluteFill>
      <Card v={v} top={900} left={100} right={100}>
        <div style={{ display: "flex", gap: 22 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 24, color: "#7cd0ff" }}>NO PONTO MAIS FUNDO</div>
            <div style={{ fontWeight: 900, fontSize: 40 }}>~30</div>
            <div style={{ display: "flex", flexWrap: "wrap", width: 200 }}>{Array.from({ length: 6 }, (_, i) => dot("#7cd0ff", i))}</div>
          </div>
          <div style={{ flex: 1, opacity: a01(sp * 1.5) }}>
            <div style={{ fontWeight: 900, fontSize: 24, color: "#c4b5fd" }}>NO ESPAÇO</div>
            <div style={{ fontWeight: 900, fontSize: 40 }}>600+</div>
            <div style={{ display: "flex", flexWrap: "wrap", width: 220 }}>{Array.from({ length: Math.round(120 * a01(sp)) }, (_, i) => dot("#c4b5fd", i))}</div>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#9aa3b8", marginTop: 6 }}>cada ponto ≈ 5 pessoas · contagens aproximadas</div>
      </Card>
    </AbsoluteFill>
  );
};

// ---- cena 14: mapa do fundo do mar
const MapOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("mapCard.show", g);
  return (
    <AbsoluteFill>
      <Card v={v} top={1000} left={150} right={150}>
        <div style={{ fontWeight: 900, fontSize: 26 }}>FUNDO DO MAR MAPEADO EM DETALHE</div>
        <div style={{ marginTop: 10, height: 34, borderRadius: 17, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${29 * a01(v)}%`, height: "100%", background: "#7cd0ff" }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#7cd0ff", marginTop: 6 }}>~29% (Seabed 2030, 2025)</div>
      </Card>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1528, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "5px 14px", borderRadius: 999, background: "rgba(11,8,18,0.62)", border: "2px solid rgba(124,208,255,0.6)", color: "#bfe6ff", fontFamily: FONT, fontWeight: 800, fontSize: 22 }}>ESCALA REAL · 1 bloco = 1 km</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- cena 15: rótulos das 5 zonas + confete
const FinalOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const r = track("zoneLabels.reveal", g);
  const names: [string, number][] = [
    ["SOL", 100],
    ["CREPÚSCULO", 600],
    ["MEIA-NOITE", 2500],
    ["ABISMO", 5000],
    ["HADAL", 8500],
  ];
  const pod: Vec3 = [POD_X, podY(g), POD_Z];
  return (
    <AbsoluteFill>
      {names.map(([n, m], i) => {
        const v = a01(r * 5 - i);
        if (v < 0.01) return null;
        const p = projectPoint(pose, [COL.w / 2 + 0.2, depthY(m), 0]);
        return <Chip key={n} x={Math.min(900, p.x + 110)} y={p.y} text={n} size={26} color="#1a1206" bg="#ffd36b" o={v} />;
      })}
      <Burst id="final" point={pod} sceneStart={scene.startFrame} />
    </AbsoluteFill>
  );
};

export const OCEAN_MODULES: Record<string, SceneModule> = {
  "scene-01-gancho-everest": { Overlay: EverestOverlay },
  "scene-03-oxigenio": { Overlay: OxygenOverlay },
  "scene-04-cores": { Overlay: ColorsOverlay },
  "scene-07-migracao": { Overlay: MigrationOverlay },
  "scene-11-abismo": { Overlay: SnowOverlay },
  "scene-13-vida-hadal": { Overlay: PeopleOverlay },
  "scene-14-escala-real": { Overlay: MapOverlay },
  "scene-15-final": { Overlay: FinalOverlay },
};
