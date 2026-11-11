import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { Burst } from "../components/Burst";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { HER_Z } from "../components/World";
import { WorldLabel } from "../components/WorldLabel";
import { track, X } from "../data/scenes";
import { FONT } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do episódio "Quem foi ela?" (Gigantes da Humanidade · EP. 01).

export const SERIES = { name: "GIGANTES DA HUMANIDADE", ep: "EP. 01" };

const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const a01 = (v: number) => clamp(v, 0, 1);

/** Cartão do quadro (aparece quando o narrador diz o nome do quadro). */
export const SeriesCard: React.FC<{ v: number; top?: number }> = ({ v, top = 640 }) => {
  if (v < 0.01) return null;
  const a = a01(v);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, scale: String(0.9 + 0.1 * a), fontFamily: FONT }}>
      <div style={{ padding: "10px 26px", borderRadius: 999, background: BRAND.colors.accent, color: "#fff", fontWeight: 900, fontSize: 34, letterSpacing: 3, boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>{SERIES.ep}</div>
      <div style={{ marginTop: 18, padding: "26px 40px", borderRadius: 30, background: "rgba(11,8,18,0.82)", border: "3px solid #f2c14e", boxShadow: "0 0 40px rgba(242,193,78,0.35)", textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.98, color: "#ffd36b", letterSpacing: 1, WebkitTextStroke: "4px #1a1206", paintOrder: "stroke fill" }}>GIGANTES</div>
        <div style={{ fontWeight: 900, fontSize: 44, lineHeight: 1.1, color: "#ece6ff", letterSpacing: 6 }}>DA HUMANIDADE</div>
      </div>
    </div>
  );
};

/** "?" flutuando sobre a silhueta dela enquanto o nome é mistério. */
export const HerMark: React.FC<{ frame: number }> = ({ frame }) => {
  const m = track("her.mystery", frame);
  if (m < 0.01) return null;
  const pose = cameraPoseAt(frame);
  const p = projectPoint(pose, [track("her.x", frame, X.vault + 0.75), 0.72, HER_Z]);
  if (!p.visible || p.y < 330 || p.y > 1500 || p.x < 40 || p.x > 1040) return null;
  const bob = 8 * Math.sin(frame / 12);
  const size = Math.min(110, Math.max(44, 9000 / Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]) / 18));
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y - size + bob, translate: "-50% -50%", opacity: a01(m), fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#ffd36b", WebkitTextStroke: `${Math.round(size * 0.08)}px #1a1206`, paintOrder: "stroke fill", textShadow: "0 0 24px rgba(255,211,107,0.6)" }}>
      ?
    </div>
  );
};

const YEARS: [string, number][] = [
  ["1867", X.warsaw + 1.2],
  ["1891", X.paris],
  ["1896", X.lab - 1.0],
  ["1898", X.lab + 0.4],
  ["1903", X.stage - 0.8],
  ["1906", X.stage + 0.3],
  ["1911", X.stage + 1.2],
  ["1914", X.war],
  ["1934", X.vault - 0.6],
];
/** Placas de ano na borda frontal da maquete (acendem quando o ano é dito e ficam). */
export const YearChips: React.FC<{ frame: number }> = ({ frame }) => {
  const pose = cameraPoseAt(frame);
  const all = track("timeline.lightUp", frame);
  return (
    <>
      {YEARS.map(([y, x], i) => {
        const v = Math.max(track(`year.${y}`, frame), all > i / YEARS.length ? 1 : 0);
        if (v < 0.01) return null;
        const p = projectPoint(pose, [x, 0.02, 1.62]);
        if (!p.visible || p.y < 480 || p.y > 1320 || p.x < 70 || p.x > 1010) return null;
        return (
          <div key={y} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", scale: String(0.6 + 0.4 * a01(v)), opacity: a01(v), padding: "6px 14px", borderRadius: 10, background: "#f2c14e", color: "#1a1206", fontFamily: FONT, fontWeight: 900, fontSize: 30, boxShadow: "0 6px 14px rgba(0,0,0,0.4)" }}>
            {y}
          </div>
        );
      })}
    </>
  );
};

// ---- cena 1: cartão do quadro
const Ep1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <AbsoluteFill>
      <SeriesCard v={track("series.card", g)} />
    </AbsoluteFill>
  );
};

// ---- cena 5: diplomas
const ParisOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <AbsoluteFill>
      <WorldLabel pose={pose} point={[X.paris + 0.15, 0.82, -0.2]} text="FÍSICA" appear={track("diploma.physics", g)} offset={[-150, -120]} accent="#f2c14e" />
      <WorldLabel pose={pose} point={[X.paris + 0.5, 0.82, -0.2]} text="MATEMÁTICA" appear={track("diploma.math", g)} offset={[150, -130]} accent="#f2c14e" />
    </AbsoluteFill>
  );
};

// ---- cena 7: rótulos das doses e da hipótese química
const MeasureOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const bars = track("samples.bars", g);
  const swap = track("samples.mixSwap", g);
  const top = 0.27;
  return (
    <AbsoluteFill>
      {[0, 1, 2].map((i) => {
        const p = projectPoint(pose, [X.lab - 0.7 + i * 0.22, top - 0.02, 0.1]);
        if (!p.visible || bars < 0.05) return null;
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y + 40, translate: "-50% 0", opacity: a01(bars), fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff", WebkitTextStroke: "7px #0a1420", paintOrder: "stroke fill" }}>
            {i + 1}×
          </div>
        );
      })}
      {swap > 0.05 && swap < 0.95 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#ffd36b", WebkitTextStroke: "7px #1a1206", paintOrder: "stroke fill" }}>
          TROCANDO AS MISTURAS…
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---- cena 9: cartões de tabela periódica
const Tile: React.FC<{ pose: ReturnType<typeof cameraPoseAt>; point: Vec3; v: number; sym: string; num: number; name: string; color: string }> = ({ pose, point, v, sym, num, name, color }) => {
  if (v < 0.01) return null;
  const p = projectPoint(pose, point);
  if (!p.visible) return null;
  const a = a01(v);
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", scale: String(0.4 + 0.6 * Math.min(1.15, v)), opacity: a, width: 230, height: 250, borderRadius: 22, background: "rgba(15,11,28,0.9)", border: `5px solid ${color}`, boxShadow: `0 0 34px ${color}88`, fontFamily: FONT, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ alignSelf: "flex-start", marginLeft: 18, fontWeight: 800, fontSize: 30, color }}>{num}</div>
      <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1 }}>{sym}</div>
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 1 }}>{name}</div>
    </div>
  );
};

const ElementsOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const flag = track("flag.pl", g);
  return (
    <AbsoluteFill>
      <Tile pose={pose} point={[X.lab - 0.42, 1.45, 0.4]} v={track("card.po", g)} sym="Po" num={84} name="POLÔNIO" color="#b6ff6a" />
      <Tile pose={pose} point={[X.lab + 0.42, 1.45, 0.4]} v={track("card.ra", g)} sym="Ra" num={88} name="RÁDIO" color="#8fd3ff" />
      {flag > 0.01
        ? (() => {
            const p = projectPoint(pose, [X.lab - 0.42, 1.08, 0.4]);
            return (
              <div style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% 0", scale: String(a01(flag)), width: 120, height: 76, borderRadius: 8, overflow: "hidden", border: "3px solid #fff", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>
                <div style={{ height: "50%", background: "#ffffff" }} />
                <div style={{ height: "50%", background: "#dc143c" }} />
              </div>
            );
          })()
        : null}
      <Burst id="elements" point={[X.lab + 0.42, 1.45, 0.4]} kind="sparkle" sceneStart={scene.startFrame} colors={["#8fd3ff", "#b6ff6a", "#ffffff"]} />
    </AbsoluteFill>
  );
};

// ---- cena 10: contador de anos + "?" dos químicos
const ShedOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const years = track("years.counter", g);
  const doubt = track("doubt.show", g);
  return (
    <AbsoluteFill>
      {doubt > 0.01
        ? [0, 1].map((i) => {
            const p = projectPoint(pose, [X.shed - 1.6 + i * 0.4, 0.75, 1.15]);
            if (!p.visible) return null;
            return (
              <div key={i} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", opacity: a01(doubt), fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#ffd36b", WebkitTextStroke: "6px #1a1206", paintOrder: "stroke fill" }}>
                ?
              </div>
            );
          })
        : null}
      {years > 0.05 && years < 4.4 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "10px 26px", borderRadius: 16, background: "rgba(11,8,18,0.85)", border: "3px solid #f2c14e", fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#ffd36b" }}>ANO {Math.min(4, Math.max(1, Math.ceil(years)))}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---- cena 11: cartão de indicação (nomes como borrões; a linha dela falta e é acrescentada)
const NominationOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const show = track("nomination.show", g);
  const add = track("nomination.add", g);
  if (show < 0.01) return null;
  const line = (w: number, ok: boolean, k = 1) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: k }}>
      <div style={{ width: 34, height: 34, borderRadius: 17, background: ok ? "#20b85a" : "#e5383b", color: "#fff", fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "?"}</div>
      <div style={{ width: w * k, height: 22, borderRadius: 11, background: "#3a3346" }} />
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, right: 170, top: 980, opacity: a01(show), padding: "22px 30px", borderRadius: 24, background: "#f4efe4", boxShadow: "0 18px 40px rgba(0,0,0,0.45)", fontFamily: FONT, color: "#1a1420" }}>
        <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 1 }}>INDICAÇÃO · NOBEL 1903</div>
        {line(420, true)}
        {line(360, true)}
        {add > 0.01 ? line(400, true, a01(add)) : line(400, false, 0.35)}
      </div>
    </AbsoluteFill>
  );
};

// ---- cena 13: tela do raio X
const XrayOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("xray.screen", g);
  const bullet = track("bullet.mark", g);
  if (v < 0.01) return null;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 300, top: 900, width: 480, height: 330, scale: String(0.6 + 0.4 * a01(v)), opacity: a01(v), borderRadius: 22, background: "#0d1b2a", border: "5px solid #8fd3ff", boxShadow: "0 0 30px rgba(143,211,255,0.4)", overflow: "hidden" }}>
        <svg width={480} height={330}>
          {/* osso da perna (esquemático) */}
          <rect x={60} y={150} width={360} height={34} rx={17} fill="#dbe9f5" opacity={0.9} />
          <circle cx={60} cy={167} r={30} fill="#dbe9f5" opacity={0.9} />
          <circle cx={420} cy={167} r={30} fill="#dbe9f5" opacity={0.9} />
          {/* a bala */}
          <ellipse cx={262} cy={120} rx={20} ry={11} fill="#ffd36b" />
          <circle cx={262} cy={120} r={20 + 30 * (1 - bullet)} fill="none" stroke="#e5383b" strokeWidth={6} opacity={bullet} />
        </svg>
        <div style={{ position: "absolute", left: 18, top: 12, fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#8fd3ff" }}>RAIO X</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- cena 15: placa do nome (nascimento → como o mundo a conhece) + confete
const RevealOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const birth = track("name.birth", g);
  const known = track("name.known", g);
  return (
    <AbsoluteFill>
      {birth > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", opacity: a01(birth) }}>
          <div style={{ padding: "16px 32px", borderRadius: 20, background: "rgba(11,8,18,0.85)", border: "3px solid #c4b5fd", fontFamily: FONT, fontWeight: 900, fontSize: 52, color: "#ece6ff", letterSpacing: 1 }}>MARIA SKŁODOWSKA</div>
        </div>
      ) : null}
      {known > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", flexDirection: "column", alignItems: "center", scale: String(0.6 + 0.4 * Math.min(1.1, known)), opacity: a01(known), fontFamily: FONT }}>
          <div style={{ fontWeight: 900, fontSize: 110, lineHeight: 1, color: "#ffd36b", WebkitTextStroke: "8px #1a1206", paintOrder: "stroke fill", textShadow: "0 0 40px rgba(255,211,107,0.5)" }}>MARIE CURIE</div>
          <div style={{ marginTop: 10, fontWeight: 800, fontSize: 40, color: "#ece6ff" }}>1867 – 1934</div>
        </div>
      ) : null}
      <Burst id="reveal" point={[X.vault + 0.75, 0.5, HER_Z]} sceneStart={scene.startFrame} colors={["#ffd36b", "#c4b5fd", "#ffffff", "#8b5cf6"]} />
    </AbsoluteFill>
  );
};

export const CURIE_MODULES: Record<string, SceneModule> = {
  "scene-01-gancho-cadernos": { Overlay: Ep1 },
  "scene-05-paris": { Overlay: ParisOverlay },
  "scene-07-dentro-do-atomo": { Overlay: MeasureOverlay },
  "scene-09-polonio-radio": { Overlay: ElementsOverlay },
  "scene-10-galpao": { Overlay: ShedOverlay },
  "scene-11-nobel-1903": { Overlay: NominationOverlay },
  "scene-13-recorde-guerra": { Overlay: XrayOverlay },
  "scene-15-revelacao": { Overlay: RevealOverlay },
};
