import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { sceneAt, track } from "../data/scenes";
import { FONT, PALETTE } from "../theme";
import { clamp, rand, smoothstep, type Vec3 } from "../utils/animation";
import { rulerTell, TELLS, TOP, Z_FRONT } from "../world/cities";

// Camada 2D global do vídeo da cidade mais antiga (lê trilhas e a cena ativa no frame global).

const idx = (id: string) => Number(id.slice(6, 8));

const Card: React.FC<{ top: number; appear: number; width?: number; children: React.ReactNode }> = ({ top, appear, width = 760, children }) => {
  if (appear <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - width) / 2,
        width,
        top,
        padding: "20px 28px",
        borderRadius: 28,
        background: "rgba(24,16,12,0.86)",
        border: `3px solid ${PALETTE.warning}`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
        fontFamily: FONT,
        color: "#fff",
        opacity: clamp(appear * 1.4, 0, 1),
        scale: String(0.85 + 0.15 * clamp(appear, 0, 1)),
      }}
    >
      {children}
    </div>
  );
};

const NameTags: React.FC<{ frame: number }> = ({ frame }) => {
  const id = sceneAt(frame).id;
  const n = idx(id);
  const pose = cameraPoseAt(frame);
  const tags: { p: Vec3; text: string; a: number; o: [number, number]; c?: string }[] = [];
  const top = (k: keyof typeof TELLS, dy = 1.4): Vec3 => [TELLS[k].x, TELLS[k].top + dy, 0];
  if (n === 1) tags.push({ p: top("rome", 1.3), text: "ROMA", a: track("rome.reveal", frame), o: [0, -110] });
  if (n >= 4 && n <= 8) tags.push({ p: top("catal", 0.6), text: n >= 5 ? "ÇATALHÖYÜK\nabandonada" : "ÇATALHÖYÜK", a: track("catal.nameTag", frame), o: [-20, -130], c: n >= 5 ? PALETTE.negative : undefined });
  if ((n >= 6 && n <= 8) || n === 13) tags.push({ p: top("jericho", 0.6), text: "JERICÓ", a: track("jericho.reveal", frame), o: [10, -120] });
  if (n === 13) tags.push({ p: top("damascus", 2.2), text: "DAMASCO", a: track("damascus.name", frame), o: [0, -90], c: PALETTE.positive });
  if (n === 14) {
    const r = track("finalLabels.reveal", frame);
    const st = (i: number) => clamp(r * 4 - i, 0, 1);
    tags.push({ p: top("rome", 1.0), text: "ROMA\n≈ 2.800 anos", a: st(0), o: [0, -120] });
    tags.push({ p: top("catal", 0.5), text: "ÇATALHÖYÜK\nabandonada", a: st(1), o: [0, -130], c: PALETTE.negative });
    tags.push({ p: top("jericho", 0.5), text: "JERICÓ\nmais velha", a: st(2), o: [0, -130], c: PALETTE.info });
    tags.push({ p: top("damascus", 1.9), text: "DAMASCO\nsem parar", a: st(3), o: [0, -120], c: PALETTE.positive });
  }
  return (
    <>
      {tags.map((t, i) => {
        // mantém a etiqueta abaixo da faixa dos badges e dentro da tela
        const p = projectPoint(pose, t.p);
        if (!p.visible || p.x < 40 || p.x > 1040 || p.y < 200 || p.y > 1500) return null;
        const oy = Math.max(t.o[1], 480 - p.y);
        const ox = Math.min(Math.max(t.o[0], 150 - p.x), 930 - p.x);
        return <WorldLabel key={i} pose={pose} point={t.p} text={t.text} appear={clamp(t.a, 0, 1)} offset={[ox, oy]} accent={t.c ?? PALETTE.warning} size={30} />;
      })}
    </>
  );
};

const Mystery: React.FC<{ frame: number }> = ({ frame }) => {
  const m = clamp(track("damascus.mystery", frame), 0, 1);
  const unk = clamp(track("damascus.unknown", frame), 0, 1);
  const n = idx(sceneAt(frame).id);
  const pose = cameraPoseAt(frame);
  const t = TELLS.damascus;
  const out: React.ReactNode[] = [];
  if (m > 0.01) {
    const p0 = projectPoint(pose, [t.x, t.top + 1.5, 0.6]);
    const p = { ...p0, y: Math.max(p0.y, 470) };
    const s = 1 + 0.08 * Math.sin(frame / 5);
    out.push(
      <div key="q" style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", scale: String(m * s), fontFamily: FONT, fontWeight: 900, fontSize: 210, color: PALETTE.warning, WebkitTextStroke: `14px ${PALETTE.outline}`, paintOrder: "stroke fill" }}>
        ?
      </div>,
    );
  }
  if (unk > 0.01 && n >= 9 && n <= 11) {
    [-1.1, 0, 1.1].forEach((dx, i) => {
      const p = projectPoint(pose, [t.x + dx, TOP - 2.9 + (i % 2) * 0.6, Z_FRONT + 0.05]);
      if (!p.visible) return;
      out.push(
        <div key={`u${i}`} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", opacity: unk, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#ffffffcc", WebkitTextStroke: `7px ${PALETTE.outline}`, paintOrder: "stroke fill" }}>
          ?
        </div>,
      );
    });
  }
  return <>{out}</>;
};

const Confetti: React.FC<{ frame: number }> = ({ frame }) => {
  if (sceneAt(frame).id !== "scene-12-damasco") return null;
  const c = track("confetti", frame);
  if (c <= 0.001 || c >= 0.999) return null;
  const pose = cameraPoseAt(frame);
  const o = projectPoint(pose, [TELLS.damascus.x, TELLS.damascus.top + 2.3, 0.6]);
  const colors = [PALETTE.warning, PALETTE.positive, PALETTE.info, "#ffffff", PALETTE.negative];
  return (
    <>
      {Array.from({ length: 46 }, (_, i) => {
        const a = rand(`ca${i}`) * Math.PI * 2;
        const v = 260 + 420 * rand(`cv${i}`);
        const x = o.x + Math.cos(a) * v * c;
        const y = o.y + Math.sin(a) * v * c * 0.8 + 700 * c * c;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 10, background: colors[i % 5], rotate: `${(a + c * 9) * 57}deg`, opacity: 1 - smoothstep(c) * 0.9 }} />;
      })}
    </>
  );
};

const Rules: React.FC<{ frame: number }> = ({ frame }) => {
  const n = idx(sceneAt(frame).id);
  if (n !== 5 && n !== 8) return null;
  const r1 = clamp(track("ruleCard.rule1", frame), 0, 1.2);
  const r2 = clamp(track("ruleCard.rule2", frame), 0, 1.2);
  const row = (txt: string, a: number) =>
    a > 0.01 ? (
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: 34, opacity: clamp(a, 0, 1), translate: `${(1 - clamp(a, 0, 1)) * -40}px 0px` }}>
        <span style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 22, background: PALETTE.positive, alignItems: "center", justifyContent: "center", fontSize: 28 }}>✓</span>
        {txt}
      </div>
    ) : null;
  return (
    <Card top={1130} appear={Math.max(r1, r2)} width={680}>
      <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: 2, color: PALETTE.warning, marginBottom: 8 }}>REGRAS</div>
      {row("1. HABITADA HOJE", r1)}
      {row("2. SEM PARAR", r2)}
    </Card>
  );
};

const Lists: React.FC<{ frame: number }> = ({ frame }) => {
  if (sceneAt(frame).id !== "scene-10-candidata") return null;
  const a = clamp(track("listCards.show", frame), 0, 1);
  if (a <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1010, height: 300 }}>
      {[0, 1, 2].map((i) => {
        const k = clamp(a * 3 - i, 0, 1);
        return (
          <div key={i} style={{ position: "absolute", left: 150 + i * 250, top: 30 + (i % 2) * 30, width: 230, padding: "16px 18px", borderRadius: 18, background: "#fbf3e2", boxShadow: "0 10px 22px rgba(0,0,0,0.35)", rotate: `${(i - 1) * 6}deg`, opacity: k, scale: String(0.7 + 0.3 * k), fontFamily: FONT }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#5a3e2b", marginBottom: 8 }}>MAIS ANTIGAS</div>
            {[0, 1, 2].map((r) => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: "#5a3e2b" }}>{r + 1}.</span>
                <span style={{ flex: 1, height: 14, borderRadius: 7, background: r === 0 ? PALETTE.warning : "#d9c9ad", filter: r === 0 ? "blur(1.5px)" : "none" }} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const Compare: React.FC<{ frame: number }> = ({ frame }) => {
  if (sceneAt(frame).id !== "scene-13-depende") return null;
  const a = clamp(track("compare.bars", frame), 0, 1);
  const bar = (label: string, frac: number, gaps: boolean, color: string, sub: string) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 30 }}>
        <span>{label}</span>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffffcc" }}>{sub}</span>
      </div>
      <div style={{ position: "relative", height: 30, marginTop: 6, background: "#ffffff1f", borderRadius: 15, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${frac * 100 * a}%`, background: color, borderRadius: 15 }} />
        {gaps
          ? [0.38, 0.62].map((g, i) => (
              <div key={i} style={{ position: "absolute", left: `${g * 100 * a}%`, top: 0, bottom: 0, width: 26, background: PALETTE.negative, opacity: a }} />
            ))
          : null}
        {!gaps ? <div style={{ position: "absolute", left: `${frac * 100 * a}%`, top: 12, width: `${(1 - frac) * 50 * a}%`, height: 6, borderTop: "6px dashed #ffffff66" }} /> : null}
      </div>
    </div>
  );
  return (
    <Card top={1020} appear={a} width={820}>
      {bar("JERICÓ", 1, true, PALETTE.info, "≈ 11.000 anos · com intervalos")}
      {bar("DAMASCO", 4000 / 11000, false, PALETTE.positive, "≥ 4.000 anos · sem parar")}
    </Card>
  );
};

const SchemaTag: React.FC<{ frame: number }> = ({ frame }) => {
  const show = clamp(track("timeRuler.show", frame), 0, 1);
  if (show <= 0.01 || !rulerTell(frame)) return null;
  return (
    <div style={{ position: "absolute", right: 90, top: 1262, padding: "8px 18px", borderRadius: 16, background: "rgba(24,16,12,0.72)", border: "2px solid #ffffff66", color: "#ffffffdd", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1.5, opacity: show }}>
      IDADES ESQUEMÁTICAS
    </div>
  );
};

export const CityOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <NameTags frame={frame} />
      <Mystery frame={frame} />
      <Confetti frame={frame} />
      <Rules frame={frame} />
      <Lists frame={frame} />
      <Compare frame={frame} />
      <SchemaTag frame={frame} />
    </AbsoluteFill>
  );
};
