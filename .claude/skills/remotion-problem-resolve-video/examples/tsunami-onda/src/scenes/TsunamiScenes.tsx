import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { track } from "../data/scenes";
import { FONT, PALETTE } from "../theme";
import { clamp, progress, type Vec3 } from "../utils/animation";
import { s, wordLocal as W } from "../utils/timing";
import { baseFloor } from "../world/ocean";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D por cena (useCurrentFrame() é LOCAL; some scene.startFrame para ler trilhas/câmera).

type L = { point: Vec3; text: string; at: number; offset: [number, number]; accent?: string; until?: number };

const Labels: React.FC<{ scene: SceneProps["scene"]; labels: L[] }> = ({ scene, labels }) => {
  const local = useCurrentFrame();
  const pose = cameraPoseAt(local + scene.startFrame);
  return (
    <AbsoluteFill>
      {labels.map((l, i) => {
        const inA = progress(local, l.at, l.at + 10);
        const out = l.until !== undefined ? 1 - progress(local, l.until, l.until + 8) : 1;
        return <WorldLabel key={i} pose={pose} point={l.point} text={l.text} appear={inA * out} offset={l.offset} accent={l.accent} size={30} />;
      })}
    </AbsoluteFill>
  );
};

const Card: React.FC<{ top: number; appear: number; children: React.ReactNode; width?: number }> = ({ top, appear, children, width = 760 }) => {
  if (appear <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - width) / 2,
        width,
        top,
        padding: "22px 30px",
        borderRadius: 30,
        background: "rgba(10,20,32,0.86)",
        border: `3px solid ${PALETTE.accent}`,
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

// ---------------------------------------------------------------- cenas
const S03: React.FC<SceneProps> = ({ scene }) => (
  <Labels
    scene={scene}
    labels={[
      { point: [-22.6, -5.7, 2.05], text: "PLACA\nOCEÂNICA", at: W("s3", 8), offset: [60, 190] },
      { point: [-17.2, -4.7, 2.05], text: "PLACA\nCONTINENTAL", at: W("s3", 8) + 4, offset: [-120, -170] },
    ]}
  />
);

const S05: React.FC<SceneProps> = ({ scene }) => (
  <Labels scene={scene} labels={[{ point: [-1.5, -2.1, 2.1], text: "4.000 m", at: s(0.3), offset: [-150, 0], until: W("s5", 8) }]} />
);

const S06: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const a = track("slopeGauge.show", local + scene.startFrame);
  return (
    <Card top={1090} appear={a} width={720}>
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 1, color: PALETTE.accent }}>INCLINAÇÃO DA SUBIDA</div>
      <svg width={660} height={90} viewBox="0 0 660 90" style={{ marginTop: 8 }}>
        <line x1={10} y1={70} x2={650} y2={70} stroke="#ffffff55" strokeWidth={4} strokeDasharray="10 10" />
        <path d="M10 70 C 200 70, 400 62, 650 58" stroke={PALETTE.positive} strokeWidth={9} fill="none" strokeLinecap="round" />
        <text x={650} y={30} fill="#fff" fontSize={26} fontWeight={800} fontFamily={FONT} textAnchor="end">
          quase plana
        </text>
      </svg>
    </Card>
  );
};

const SPEEDS: [string, string, number][] = [
  ["4.000 m", "≈ 710 km/h", 1],
  ["100 m", "≈ 110 km/h", 110 / 710],
  ["10 m", "≈ 36 km/h", 36 / 710],
];

const S07: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const a = track("depthSpeedChart.show", local + scene.startFrame);
  return (
    <Card top={1010} appear={a} width={800}>
      <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 1, color: PALETTE.accent, marginBottom: 10 }}>PROFUNDIDADE → VELOCIDADE</div>
      {SPEEDS.map(([d, v, k], i) => {
        const g = clamp(a * 3 - i, 0, 1);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, height: 52 }}>
            <div style={{ width: 150, fontWeight: 800, fontSize: 30 }}>{d}</div>
            <div style={{ flex: 1, height: 24, background: "#ffffff22", borderRadius: 12 }}>
              <div style={{ width: `${Math.max(3, k * 100 * g)}%`, height: "100%", borderRadius: 12, background: PALETTE.positive }} />
            </div>
            <div style={{ width: 190, textAlign: "right", fontWeight: 900, fontSize: 30 }}>{v}</div>
          </div>
        );
      })}
    </Card>
  );
};

const S08: React.FC<SceneProps> = ({ scene }) => (
  <Labels scene={scene} labels={[{ point: [-1.5, -2.1, 2.1], text: "4.000 m", at: W("s8", 3), offset: [-170, 40], accent: PALETTE.warning, until: W("s8", 12) }]} />
);

const S09: React.FC<SceneProps> = ({ scene }) => (
  <Labels scene={scene} labels={[{ point: [16, baseFloor(16) / 2, 2.1], text: "RASO", at: W("s9", 9), offset: [-120, 150], accent: PALETTE.warning }]} />
);

const S12: React.FC<SceneProps> = ({ scene }) => (
  <Labels
    scene={scene}
    labels={[
      { point: [20.5, -0.2, 1.6], text: "FUNDO\nEXPOSTO", at: W("s12", 6), offset: [-150, 150], accent: PALETTE.negative, until: W("s12", 15) },
      { point: [33.2, 2.25, 0.2], text: "LUGAR ALTO", at: W("s12", 17), offset: [-60, -150], accent: PALETTE.positive },
    ]}
  />
);

const S13: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const a = clamp(track("surfGhost.show", frame), 0, 1.2);
  const strike = clamp(track("surfGhost.strike", frame), 0, 1);
  if (a <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 540 - 170, top: 560, width: 340, height: 260, opacity: clamp(a, 0, 1), scale: String(0.8 + 0.2 * clamp(a, 0, 1.1)) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "rgba(10,20,32,0.8)", border: `4px solid ${PALETTE.negative}` }} />
      <svg width={340} height={260} viewBox="0 0 340 260" style={{ position: "absolute", inset: 0 }}>
        <path d="M30 200 C 90 200, 120 70, 210 60 C 280 54, 310 110, 270 135 C 245 150, 225 120, 240 105" fill="none" stroke="#7fd8ff" strokeWidth={16} strokeLinecap="round" />
        <path d="M30 215 L 310 215" stroke="#7fd8ff" strokeWidth={10} strokeLinecap="round" />
        <line x1={40} y1={40} x2={40 + 260 * strike} y2={40 + 180 * strike} stroke={PALETTE.negative} strokeWidth={18} strokeLinecap="round" />
      </svg>
    </div>
  );
};

const S14: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const r = track("finalLabels.reveal", local + scene.startFrame);
  const step = (i: number) => clamp(r * 4 - i, 0, 1);
  const pose = cameraPoseAt(local + scene.startFrame);
  const items: [Vec3, string, [number, number], string][] = [
    [[-21, -4.3, 2.05], "ORIGEM", [230, -230], PALETTE.warning],
    [[-10, 0.25, 1.2], "RÁPIDA\nE BAIXA", [-90, -130], PALETTE.accent],
    [[10, 0.6, 1.2], "FREIA\nE CRESCE", [-170, -60], PALETTE.accent],
    [[22.2, 1.4, 1.0], "PAREDÃO", [-60, 190], PALETTE.negative],
  ];
  return (
    <AbsoluteFill>
      {items.map(([p, t, o, c], i) => (
        <WorldLabel key={i} pose={pose} point={p} text={t} appear={step(i)} offset={o} accent={c} size={30} />
      ))}
    </AbsoluteFill>
  );
};

export const TSUNAMI_MODULES: Record<string, SceneModule> = {
  "scene-03-terremoto": { Overlay: S03 },
  "scene-05-baixa-e-larga": { Overlay: S05 },
  "scene-06-navio-nem-sente": { Overlay: S06 },
  "scene-07-oceano-inteiro": { Overlay: S07 },
  "scene-08-velocidade-aviao": { Overlay: S08 },
  "scene-09-frente-freia": { Overlay: S09 },
  "scene-12-mar-recua": { Overlay: S12 },
  "scene-13-chegada": { Overlay: S13 },
  "scene-14-final": { Overlay: S14 },
};
