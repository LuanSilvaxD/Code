import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { BrazilMap, CME, Itaipu, LivingRoom, MagField, MiniRotor, NightGlobe, onGlobe, Satellite, Sun, WorldCable } from "./components/Apagao";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Mascot } from "./components/Mascot";
import { SeriesCard } from "./components/Series";
import { VerdictMeter } from "./components/Verdict";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folhas de design do "apagão mundial". Sala em METROS (mascote ~1,6 m); globo, Sol, Itaipu e mapa em u3d esquemáticos.
const SPACE = "radial-gradient(circle at 50% 45%,#1c2a55 0%,#070b18 80%)";
const STUDIO = "radial-gradient(circle at 50% 40%,#22345e 0%,#0c1226 78%)";
const MS = 1.6 / 1.8;

type Tile = { name: string; size: string; target: Vec3; fit: number; az?: number; el?: number; bg: string; scene: (f: number) => React.ReactNode; over?: React.ReactNode; light?: boolean };

const TW = 360;
const TH = 430;
const FOV = 14;

const TileView: React.FC<{ t: Tile; w?: number; h?: number }> = ({ t, w = TW, h = TH }) => {
  const f = useCurrentFrame();
  const d = t.fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * Math.min(1, w / h));
  const pose = orbit(t.target, d, t.az ?? 0, t.el ?? 5);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: t.bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov: FOV, near: d * 0.02, far: d * 8, position: [0, 0, d] }}>
        <Cam />
        <Lighting shadowExtent={Math.max(1.5, t.fit * 0.8)} />
        {t.scene(f)}
      </ThreeCanvas>
      {t.over}
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.5 }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f0ebff" }}>{t.size}</div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 44, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 23, color: "#c4b5fd" }}>{sub}</div>
  </div>
);

const SA = onGlobe(-52, -12, 3.02);
const SPACE_TILES: Tile[] = [
  { name: "GLOBO À NOITE", size: "luzes das cidades (população real)", target: [0, 0, 0], fit: 7.4, az: 200, el: 15, bg: SPACE, scene: () => <NightGlobe /> },
  { name: "APAGANDO (BOATO)", size: "varredura leste → oeste · luzes = 50%", target: [0, 0, 0], fit: 7.4, az: 95, el: 15, bg: SPACE, scene: () => <NightGlobe on={0.5} /> },
  { name: "REDES ELÉTRICAS", size: "uma cor por rede · ESQUEMA · Brasil azul, Paraguai laranja", target: [0, 0, 0], fit: 7.4, az: 55, el: 8, bg: SPACE, scene: () => <NightGlobe grids={1} /> },
  { name: "\"TOMADA DO PLANETA\"", size: "cabo único + plugue (para ser partido ✖)", target: [0, 0.2, 0], fit: 8.6, az: 200, el: 15, bg: SPACE, scene: () => (<><NightGlobe /><WorldCable on={1} /></>) },
  {
    name: "SOL + EJEÇÃO + CAMPO", size: "ESQUEMA: distância e tamanho fora de escala", target: [-11, 0.8, -2], fit: 27, az: -18, el: 10, bg: SPACE,
    scene: (f) => (<><group position={[-24, 2, -6]}><Sun f={f} flare={0.6} /></group><CME from={[-20, 2, -5]} to={[-3, 0, -0.6]} t={0.55} /><NightGlobe quebec={1} /><MagField f={f} shake={0.6} /></>),
  },
  { name: "SATÉLITE", size: "genérico, sem marca · vigia o Sol", target: [0, 0, 0], fit: 5.5, az: 30, el: 15, bg: SPACE, scene: (f) => <Satellite f={f} /> },
];

const ROOM_TILES: Tile[] = [
  {
    name: "SALA", size: "TV 1,5 m · sofá 2 m · mascote sentado (pose nova)", target: [0, 0.8, -0.4], fit: 5.6, az: 20, el: 18, bg: STUDIO,
    scene: (f) => (<><LivingRoom f={f} cal={1} /><Mascot frame={f} position={[0.3, 0.5, 0.85]} rotY={Math.PI} scale={MS} sit={1} /></>),
  },
  { name: "TELA: CIDADE (GENÉRICA)", size: "desenho próprio · sem personagens", target: [0, 1.15, -2.2], fit: 1.9, az: 0, el: 2, bg: STUDIO, scene: (f) => <LivingRoom f={f} /> },
  { name: "TELA: CIDADE APAGADA + 17 NOV", size: "janelas apagam · calendário vira", target: [0, 1.15, -2.2], fit: 1.9, az: 0, el: 2, bg: STUDIO, scene: (f) => <LivingRoom f={f} dark={1} cal={1} /> },
  { name: "TELA: ALERTA DE TESTE", size: "barras + faixa · rádio emite ondas", target: [0.3, 1.0, -2.1], fit: 2.4, az: 12, el: 4, bg: STUDIO, scene: (f) => <LivingRoom f={f} alert={1} radio={1} /> },
  { name: "TELA: ✖ NAS DUAS PISTAS", size: "✖ sobre o calendário e sobre o alerta", target: [0, 1.15, -2.2], fit: 1.9, az: 0, el: 2, bg: STUDIO, scene: (f) => (<group><LivingRoom f={f} dark={1} cal={1} x1={1} /></group>) },
  { name: "ROTORES NO MESMO RITMO", size: "mini-geradores sobre o Brasil (s7)", target: [SA[0], SA[1], SA[2]], fit: 3.4, az: 32, el: -8, bg: SPACE, scene: (f) => (<><NightGlobe grids={1} />{[[-50, -8], [-45, -20], [-55, -15], [-40, -12]].map(([lo, la], i) => { const p = onGlobe(lo, la, 3.05); return <group key={i} position={p}><MiniRotor angle={f * 0.3} s={0.1} /></group>; })}</>) },
];

export const ApagaoSheet1: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="APAGÃO · ESPAÇO" sub="para aprovar · globo noturno, redes, Sol e satélite (esquemáticos)" />
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>{SPACE_TILES.map((t) => <TileView key={t.name} t={t} />)}</div>
    <div style={{ position: "relative", height: 860 }}>
      <TileView t={{ ...SPACE_TILES[4], name: "SOL × TERRA (PLANO DO VÍDEO)", size: "a ejeção sai do Sol e achata o campo magnético · Quebec apaga" }} w={1080} h={860} />
    </div>
  </AbsoluteFill>
);

export const ApagaoSheet2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
      <Header title="APAGÃO · SALA E QUADRO" sub="para aprovar · sala em metros · medidor e cartão do quadro" />
      <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>{ROOM_TILES.map((t) => <TileView key={t.name} t={t} />)}</div>
      <div style={{ position: "relative", height: 860, background: STUDIO }}>
        <div style={{ position: "absolute", left: 20, top: 14, fontFamily: FONT, color: "#fff", fontWeight: 900, fontSize: 22 }}>QUADRO: CARTÃO + MEDIDOR DO VEREDITO</div>
        <div style={{ position: "absolute", left: 20, top: 44, fontFamily: FONT, color: "#f0ebff", fontWeight: 700, fontSize: 15 }}>ponteiro se mexe a cada pista e bate no veredito final</div>
        <div style={{ position: "absolute", left: -270, top: -560, transform: "scale(0.62)", transformOrigin: "50% 50%", width: 1080, height: 1920 }}>
          <SeriesCard v={1} top={700} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 860 }}>
          <div style={{ position: "absolute", left: 270, top: -760, width: 1080, height: 1920, transform: "scale(0.7)", transformOrigin: "0 0" }}>
            <VerdictMeter show={1} needle={-35 + 6 * Math.sin(f / 8)} size={420} top={1250} />
          </div>
          <div style={{ position: "absolute", left: 540, top: -360, width: 1080, height: 1920, transform: "scale(0.45)", transformOrigin: "0 0" }}>
            <VerdictMeter show={1} needle={-80} size={420} top={1700} verdict={0.4} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ApagaoSheet3: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="APAGÃO · ITAIPU E BRASIL" sub="para aprovar · esquemáticos" />
    <TileView t={{ name: "ITAIPU (ESQUEMA)", size: "20 geradores · 10 azuis 60 Hz (Brasil) giram mais rápido · 10 laranja 50 Hz (Paraguai)", target: [-1.6, -0.4, 0.6], fit: 6.2, az: 22, el: 20, bg: STUDIO, scene: (f) => <Itaipu a60={f * 0.2} a50={f * 0.1667} /> }} w={1080} h={560} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "BRASIL ACESO", size: "placas por estado · luzinhas · linha no Ceará", target: [0.3, 0, -1], fit: 11.5, az: 10, el: 55, bg: STUDIO, scene: (f) => <BrazilMap f={f} /> }} w={540} h={580} />
      <TileView t={{ name: "DOMINÓ (60%)", size: "apaga a partir do Ceará · faísca na linha", target: [0.3, 0, -1], fit: 11.5, az: 10, el: 55, bg: STUDIO, scene: (f) => <BrazilMap f={f} domino={0.6} spark={0.5} /> }} w={540} h={580} />
      <TileView t={{ name: "SÓ RORAIMA ACESA", size: "usina térmica própria · vão sem fios (vermelho)", target: [-1.6, 0, -3.4], fit: 6, az: 10, el: 45, bg: STUDIO, scene: (f) => <BrazilMap f={f} domino={1} rrGlow={1} gap={1} /> }} w={540} h={580} />
      <TileView t={{ name: "A FALHA SÓ CORRE PELOS FIOS", size: "rede nacional acende · para no vão", target: [0.3, 0, -1], fit: 11.5, az: 0, el: 60, bg: STUDIO, scene: (f) => <BrazilMap f={f} domino={1} rrGlow={1} gap={1} trace={1} /> }} w={540} h={580} />
    </div>
  </AbsoluteFill>
);
