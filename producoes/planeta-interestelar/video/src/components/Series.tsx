import { BRAND } from "../brand";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// QUADROS (séries) do canal Fenda Umbra. Cada episódio de um quadro mostra o cartão do quadro quando o narrador
// diz o nome dele (logo DEPOIS do gancho, nunca antes), e leva o selo "<QUADRO> · EP. NN" na capa e no título.
// Trilha do cartão: lin("series.card", W("s1", i), W("s1", i) + 10, 0, 1, "out") e saída antes do corte.
// Use num Overlay: <SeriesCard v={track("series.card", frameGlobal)} />.

export const SERIES_LIST = {
  gigantes: { title: "GIGANTES", subtitle: "DA HUMANIDADE", spoken: "Este é o Gigantes da Humanidade.", tag: "#gigantesdahumanidade" },
  boato: { title: "BOATO", subtitle: "OU VERDADE?", spoken: "Este é o Boato ou Verdade.", tag: "#boatoouverdade" },
  filme: { title: "FILME", subtitle: "× REALIDADE", spoken: "Este é o Filme × Realidade.", tag: "#filmexrealidade" },
} as const;

/** Troque por episódio: qual quadro (ou null) e o número do episódio. */
export type SeriesId = keyof typeof SERIES_LIST;
/** Ex.: { id: "gigantes", ep: 2 } para o 2º episódio de Gigantes da Humanidade; null = vídeo avulso. */
export const SERIES = { id: "filme", ep: 1 } as { id: SeriesId; ep: number } | null;

export const seriesTag = () => (SERIES ? `${SERIES_LIST[SERIES.id].title} ${SERIES_LIST[SERIES.id].subtitle} · EP. ${String(SERIES.ep).padStart(2, "0")}` : "");

export const SeriesCard: React.FC<{ v: number; top?: number }> = ({ v, top = 640 }) => {
  if (!SERIES || v < 0.01) return null;
  const s = SERIES_LIST[SERIES.id];
  const a = clamp(v, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, scale: String(0.9 + 0.1 * a), fontFamily: FONT }}>
      <div style={{ padding: "10px 26px", borderRadius: 999, background: BRAND.colors.accent, color: "#fff", fontWeight: 900, fontSize: 34, letterSpacing: 3, boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>EP. {String(SERIES.ep).padStart(2, "0")}</div>
      <div style={{ marginTop: 18, padding: "26px 40px", borderRadius: 30, background: "rgba(11,8,18,0.82)", border: SERIES.id === "filme" ? "3px solid #7fe0ff" : SERIES.id === "boato" ? "3px solid #c4b5fd" : "3px solid #f2c14e", boxShadow: SERIES.id === "filme" ? "0 0 40px rgba(127,224,255,0.35)" : SERIES.id === "boato" ? "0 0 40px rgba(139,92,246,0.4)" : "0 0 40px rgba(242,193,78,0.35)", textAlign: "center" }}>
        {SERIES.id === "filme" ? (
          <>
            {/* faixa de filme (claquete) */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 10 }}>
              {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ width: 26, height: 16, borderRadius: 4, background: "#ffd36b", transform: "skewX(-20deg)" }} />)}
            </div>
            <div style={{ fontWeight: 900, fontSize: 96, lineHeight: 0.98, color: "#ffd36b", letterSpacing: 4, WebkitTextStroke: "4px #1a1206", paintOrder: "stroke fill" }}>FILME</div>
            <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1.0, color: "#c4b5fd", WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" }}>×</div>
            <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 0.98, color: "#7fe0ff", letterSpacing: 2, WebkitTextStroke: "4px #06141a", paintOrder: "stroke fill" }}>REALIDADE</div>
          </>
        ) : SERIES.id === "boato" ? (
          <>
            <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: "#ff5a4a", letterSpacing: 2, WebkitTextStroke: "4px #1a0606", paintOrder: "stroke fill" }}>BOATO</div>
            <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.1, color: "#ece6ff", letterSpacing: 6 }}>OU</div>
            <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: "#4ade80", letterSpacing: 2, WebkitTextStroke: "4px #061a0c", paintOrder: "stroke fill" }}>VERDADE?</div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.98, color: "#ffd36b", letterSpacing: 1, WebkitTextStroke: "4px #1a1206", paintOrder: "stroke fill" }}>{s.title}</div>
            <div style={{ fontWeight: 900, fontSize: 44, lineHeight: 1.1, color: "#ece6ff", letterSpacing: 6 }}>{s.subtitle}</div>
          </>
        )}
      </div>
    </div>
  );
};
