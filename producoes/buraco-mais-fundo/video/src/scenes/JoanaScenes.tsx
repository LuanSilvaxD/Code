import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { Burst } from "../components/Burst";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { SeriesCard } from "../components/Series";
import { WorldLabel } from "../components/WorldLabel";
import { herHead } from "../components/World";
import { loc } from "../data/places";
import { sceneAt, track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do EP. 02. Dentro do Overlay o frame é LOCAL: g = frame global (trilhas são globais).
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const RED = "#e2563f";
const GREEN = "#43c46e";
const YEL = "#f2c14e";

const Card: React.FC<{ v: number; top: number; children: React.ReactNode; left?: number | string; width?: number | string; border?: string }> = ({ v, top, children, left = 90, width = 900, border = BRAND.colors.accent }) => {
  if (v < 0.01) return null;
  const a = clamp(v, 0, 1);
  return (
    <div style={{ position: "absolute", top, left, width, opacity: a, scale: String(0.85 + 0.15 * a), padding: "22px 28px", borderRadius: 28, background: "rgba(11,8,18,0.84)", border: `4px solid ${border}`, boxShadow: "0 14px 34px rgba(0,0,0,0.5)", fontFamily: FONT, color: "#fff", textAlign: "center" }}>
      {children}
    </div>
  );
};
const Mark: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 64 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: 999, background: ok ? GREEN : RED, color: "#fff", fontWeight: 900, fontSize: size * 0.62, marginRight: 14, verticalAlign: "middle" }}>{ok ? "✓" : "✕"}</span>
);

/** Rótulo de cidade ancorado no mapa. */
const City: React.FC<{ g: number; name: string; at: Parameters<typeof loc>; v: number; offset?: [number, number] }> = ({ g, name, at, v, offset = [0, -80] }) => (
  <WorldLabel pose={cameraPoseAt(g)} point={loc(...at)} text={name} appear={v} offset={offset} size={34} />
);

const Seal: React.FC<{ v: number; text: string; top?: number }> = ({ v, text, top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

// ------------------------------------------------------------------ por cena
const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <SeriesCard v={track("series.card", g)} />;
};
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("seal.map", g);
  return (
    <AbsoluteFill>
      <Seal v={v} text="MAPA ESQUEMÁTICO · FRONTEIRAS DE 1429 APROXIMADAS" top={1240} />
      <Legend v={track("territory.english", g)} top={1150} />
    </AbsoluteFill>
  );
};
const Legend: React.FC<{ v: number; top: number }> = ({ v, top }) =>
  v < 0.05 ? null : (
    <div style={{ position: "absolute", top, left: 90, opacity: clamp(v, 0, 1), display: "flex", gap: 22, fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#fff", textShadow: "0 2px 6px #000" }}>
      <span><span style={{ display: "inline-block", width: 26, height: 26, borderRadius: 6, background: "#b5523b", marginRight: 8, verticalAlign: "middle" }} />INGLESES E ALIADOS</span>
      <span><span style={{ display: "inline-block", width: 26, height: 26, borderRadius: 6, background: "#3f6db3", marginRight: 8, verticalAlign: "middle" }} />CARLOS</span>
    </div>
  );
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const on = track("crown.float", g) > 0.05;
  return (
    <AbsoluteFill>
      <City g={g} name="CHINON" at={["chinon", 0, 6]} v={on ? 1 : 0} offset={[0, 60]} />
      <City g={g} name="RUÃO" at={["rouen", 0, 0]} v={on ? 1 : 0} offset={[0, -70]} />
    </AbsoluteFill>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <AbsoluteFill>
      <City g={g} name="ORLÉANS" at={["orleans", 0, 0]} v={track("label.orleans", g)} offset={[0, 70]} />
      <City g={g} name="REIMS" at={["reims", 0, 0]} v={track("label.reims", g)} offset={[0, -70]} />
    </AbsoluteFill>
  );
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <City g={g} name="VAUCOULEURS" at={["vaucouleurs", 0, 0, 14]} v={track("label.vaucouleurs", g)} offset={[0, -60]} />;
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const x = track("riders.x", g);
  return <Seal v={x > 0.02 ? 1 : 0} text="DISTÂNCIAS FORA DE ESCALA" top={1250} />;
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const q = track("qmarks.show", g);
  const solve = track("qmarks.solve", g);
  if (q < 0.01) return null;
  const pose = cameraPoseAt(g);
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3].map((i) => {
        const a = -Math.PI / 2 + (i - 1.5) * 0.7;
        const p = projectPoint(pose, loc("chinon", Math.cos(a) * 2.6, 1.5 - Math.sin(a) * 2.6, 2.6));
        if (!p.visible) return null;
        const ok = solve > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-100%)", opacity: clamp(q, 0, 1), scale: String(0.7 + 0.3 * clamp(q, 0, 1)), fontFamily: FONT, fontWeight: 900, fontSize: 60, color: ok ? GREEN : YEL, textShadow: "0 3px 8px #000" }}>
            {ok ? "✓" : "?"}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <City g={g} name="ORLÉANS" at={["orleans", 0, -10, 12]} v={track("label.orleans", g)} offset={[0, -60]} />;
};
const S9: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const day = track("day", g);
  return (
    <AbsoluteFill>
      {track("day.show", g) > 0.5 ? (
        <Card v={1} top={560} left={330} width={420} border={GREEN}>
          <div style={{ fontWeight: 900, fontSize: 30, color: "#c4b5fd", letterSpacing: 2 }}>CERCO QUEBRADO</div>
          <div style={{ fontWeight: 900, fontSize: 96, lineHeight: 1 }}>DIA {Math.min(9, Math.floor(day))}</div>
        </Card>
      ) : null}
      <Burst id="free" point={loc("orleans", 0, 0, 12)} sceneStart={scene.startFrame} colors={["#3f6db3", "#f5f0ff", "#f2c14e"]} />
    </AbsoluteFill>
  );
};
const S10: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const a = track("compare.sword", g);
  const b = track("compare.banner", g);
  return (
    <AbsoluteFill>
      <Card v={a} top={1090} left={90} width={430} border={RED}>
        <div style={{ fontWeight: 900, fontSize: 40 }}><Mark ok={false} size={52} />ESPADA</div>
      </Card>
      <Card v={b} top={1090} left={560} width={430} border={GREEN}>
        <div style={{ fontWeight: 900, fontSize: 40 }}><Mark ok size={52} />ESTANDARTE</div>
      </Card>
    </AbsoluteFill>
  );
};
const S11: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <AbsoluteFill>
      <City g={g} name="REIMS" at={["reims", 0, 0, 20]} v={track("label.reims", g)} offset={[0, -60]} />
      <Burst id="crown" point={loc("reims", 0, 6.6, 3)} sceneStart={scene.startFrame} colors={["#f2c14e", "#f5f0ff", "#3f6db3"]} />
    </AbsoluteFill>
  );
};
const S12: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const cap = track("captive.draw", g);
  return (
    <AbsoluteFill>
      <City g={g} name="COMPIÈGNE" at={["compiegne", 0, 0, 14]} v={track("label.compiegne", g)} offset={[0, -60]} />
      <City g={g} name="COMPIÈGNE" at={["compiegne", 0, 12]} v={cap > 0.02 ? 1 : 0} offset={[0, 70]} />
      <City g={g} name="RUÃO" at={["rouen", 0, 0]} v={cap > 0.6 ? 1 : 0} offset={[0, -70]} />
    </AbsoluteFill>
  );
};
const Trap: React.FC<{ g: number }> = ({ g }) => {
  const q = track("question.show", g);
  const y = track("trap.yes", g);
  const n = track("trap.no", g);
  const t = track("trap.third", g);
  return (
    <AbsoluteFill>
      <Card v={q} top={540} border={YEL}>
        <div style={{ fontWeight: 900, fontSize: 44, color: YEL }}>"ESTÁ NA GRAÇA DE DEUS?"</div>
      </Card>
      <Card v={y} top={700} left={90} width={430} border={RED}>
        <div style={{ fontWeight: 900, fontSize: 42 }}><Mark ok={false} size={48} />SIM</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: "#ffb3a6" }}>= ARROGÂNCIA</div>
      </Card>
      <Card v={n} top={700} left={560} width={430} border={RED}>
        <div style={{ fontWeight: 900, fontSize: 42 }}><Mark ok={false} size={48} />NÃO</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: "#ffb3a6" }}>= CULPA</div>
      </Card>
      <Card v={t} top={880} left={240} width={600} border={GREEN}>
        <div style={{ fontWeight: 900, fontSize: 40 }}><Mark ok size={48} />3ª SAÍDA</div>
      </Card>
    </AbsoluteFill>
  );
};
const S13: React.FC<SceneProps> = ({ scene }) => <Trap g={useG(scene)} />;
const S14: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const l1 = track("quote.l1", g);
  const l2 = track("quote.l2", g);
  return (
    <AbsoluteFill>
      <Trap g={g} />
      {l1 > 0.01 ? (
        <div style={{ position: "absolute", top: 1060, left: 90, right: 90, fontFamily: FONT, fontWeight: 900, fontSize: 40, lineHeight: 1.18, color: "#fff", textAlign: "center", textShadow: "0 3px 10px #000" }}>
          <span style={{ opacity: clamp(l1, 0, 1) }}>"Se não estou, que Deus me coloque nela.</span>{" "}
          <span style={{ opacity: clamp(l2, 0, 1) }}>Se estou, que Deus me mantenha."</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#c4b5fd", marginTop: 6, opacity: clamp(l1, 0, 1) }}>registro do processo, 1431</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const Stamp: React.FC<{ v: number; ok: boolean; text: string; top?: number }> = ({ v, ok, text, top = 620 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: clamp(v, 0, 1), scale: String(1.6 - 0.6 * clamp(v, 0, 1)), rotate: "-8deg", padding: "16px 34px", border: `8px solid ${ok ? GREEN : RED}`, borderRadius: 16, color: ok ? GREEN : RED, fontFamily: FONT, fontWeight: 900, fontSize: 84, letterSpacing: 4, background: "rgba(11,8,18,0.55)" }}>{text}</div>
    </div>
  );
const S15: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Stamp v={track("verdict.stamp", g)} ok={false} text="CONDENADA" />;
};
const S16: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const flip = track("stamp.flip", g);
  return <Stamp v={track("stamp.show", g)} ok={flip > 0.5} text={flip > 0.5 ? "INOCENTE" : "CONDENADA"} />;
};
const S17: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const p1 = track("plate1.show", g);
  const p2 = track("plate2.show", g);
  return (
    <AbsoluteFill>
      <Card v={p1} top={540} left={190} width={700} border={YEL}>
        <div style={{ fontWeight: 900, fontSize: 52, color: "#ffd36b", letterSpacing: 2 }}>JEHANNE · "A DONZELA"</div>
        <div style={{ fontWeight: 700, fontSize: 24, color: "#e3dcff" }}>como ela assinava e se apresentava</div>
      </Card>
      <PlateBig v={p2} />
      <Burst id="name" point={loc("paris", 0, 4.2, 2)} sceneStart={scene.startFrame} colors={["#8b5cf6", "#f2c14e", "#f5f0ff"]} />
    </AbsoluteFill>
  );
};
const PlateBig: React.FC<{ v: number }> = ({ v }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: clamp(v, 0, 1), scale: String(0.8 + 0.2 * clamp(v, 0, 1)), padding: "22px 46px", borderRadius: 30, background: "rgba(11,8,18,0.84)", border: "5px solid #f2c14e", boxShadow: "0 0 50px rgba(242,193,78,0.45)", fontFamily: FONT, textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1, color: "#ffd36b", WebkitTextStroke: "4px #1a1206", paintOrder: "stroke fill" }}>JOANA D'ARC</div>
        <div style={{ fontWeight: 800, fontSize: 30, color: "#ece6ff", letterSpacing: 3, marginTop: 6 }}>c. 1412 – 1431</div>
      </div>
    </div>
  );
const S18: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <AbsoluteFill>
      <PlateBig v={track("plate2.show", g)} />
      <SeriesCard v={track("series.card", g)} top={600} />
    </AbsoluteFill>
  );
};

/** Camada global: o "?" sobre a cabeça dela (até a revelação). */
export const HerMark: React.FC = () => {
  const g = useCurrentFrame();
  const q = track("her.qmark", g, 1);
  const rev = track("her.reveal", g);
  const head = herHead(g);
  if (!head || rev > 0.5 || q < 0.01) return null;
  const sc = sceneAt(g);
  if (sc.id === "s6" && track("riders.x", g) > 0) return null;
  const p = projectPoint(cameraPoseAt(g), head);
  if (!p.visible || p.y < 280 || p.y > 1500) return null;
  const pulse = 1 + 0.06 * Math.sin(g / 6);
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-100%)", scale: String(pulse * clamp(q, 0, 1) * (1 - rev * 2)), fontFamily: FONT, fontWeight: 900, fontSize: 76, color: "#c4b5fd", textShadow: "0 0 20px #8b5cf6, 0 3px 6px #000" }}>?</div>
  );
};

export const JOANA_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 },
  s7: { Overlay: S7 }, s8: { Overlay: S8 }, s9: { Overlay: S9 }, s10: { Overlay: S10 }, s11: { Overlay: S11 }, s12: { Overlay: S12 },
  s13: { Overlay: S13 }, s14: { Overlay: S14 }, s15: { Overlay: S15 }, s16: { Overlay: S16 }, s17: { Overlay: S17 }, s18: { Overlay: S18 },
};
