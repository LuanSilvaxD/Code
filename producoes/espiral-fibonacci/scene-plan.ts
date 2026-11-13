// scene-plan.ts — "A espiral de Fibonacci" — Roteiro v1 (~1:15) — AGUARDANDO APROVAÇÃO
// Contrato de dados da Fase 1 (vira src/data/scenes.ts na Fase 2, mesmo motor).
// timing.ts: SECONDS ≈ 75 (ajusta pela voz real) · VO_KEYS s1..s10
//   PLANNED_SECONDS = [8.6, 9.47, 7.47, 5.87, 5.07, 8.27, 7.23, 6.6, 8.53, 10.9] · GAPS = [0.55,0.55,0.55,0.55,0.8,0.55,0.55,0.8,0.8]
// MUNDOS: FLOWER [0,0,0] (girassol, sementes, comparação de ângulos) · RABBITS [0,-200,0] · SQUARES [0,-300,0]
//   · PLANTS [0,-400,0] (pinha, abacaxi) · NAUTILUS [0,-500,0]. Filotaxia real: semente k em raio c·√k, ângulo k·137,508°.
export const plan = [
  { id: "s1", narration: "Conte as espirais de um girassol: trinta e quatro num sentido, cinquenta e cinco no outro. Não é coincidência.", world: "flower",
    animations: ["fx.flash 0", "spiralsA 0→1 W6–W8", "countA 0→34 W6–W9", "spiralsB 0→1 W11–W13", "countB 0→55 W11–W14", "fx.punch W18", "mascot.point W6"],
    badges: [["34 E 55", "info", "W11"], ["NÃO É COINCIDÊNCIA", "warning", "W16", "large"]] },
  { id: "s2", narration: "São números de Fibonacci: cada um é a soma dos dois anteriores. Um, um, dois, três, cinco, oito, treze.", world: "flower (desfocado) + 2D",
    animations: ["seq.show W0", "sum.anim W8", "seq.step 0→7 em W12..W18"], badges: [["SEQUÊNCIA DE FIBONACCI", "info", "W3"], ["SOMA DOS DOIS ANTERIORES", "info", "W8"]] },
  { id: "s3", narration: "A sequência ficou famosa em 1202, num problema sobre coelhos. Na Índia, já era conhecida séculos antes.", world: "rabbits",
    animations: ["rabbits.n 1→5 W7–W9+20", "india.badge W11"], badges: [["1202 · O PROBLEMA DOS COELHOS", "info", "W5"], ["ÍNDIA: SÉCULOS ANTES", "info", "W11"]] },
  { id: "s4", narration: "Divida um pelo anterior e o resultado se aproxima de 1,618: a proporção áurea.", world: "2D",
    animations: ["ratio.step 0→6 W0–W9", "ratio.lock W10", "fx.flash W12"], badges: [["→ 1,618", "warning", "W10"], ["PROPORÇÃO ÁUREA", "info", "W12", "large"]] },
  { id: "s5", narration: "Com quadrados desses tamanhos, dá pra desenhar a famosa espiral.", world: "squares",
    animations: ["squares.n 0→7 W0–W5", "spiral.draw 0→1 W6–W9+15"], badges: [["A ESPIRAL DE FIBONACCI", "info", "W8"]] },
  { id: "s6", narration: "Mas por que o girassol segue isso? Cada semente nova nasce girada cento e trinta e sete graus e meio: o ângulo áureo.", world: "flower",
    animations: ["seeds.grow 0→1 W7–fim", "protractor W12–W19"], badges: [["POR QUÊ?", "warning", "W0"], ["137,5°: O ÂNGULO ÁUREO", "info", "W20", "large"]] },
  { id: "s7", narration: "Esse ângulo espalha as sementes sem formar raios nem deixar vazios. Com outro ângulo, sobra espaço.", world: "flower (3 miolos)",
    animations: ["compare.show W0", "gaps.flash W14"], badges: [["137,5° ✔", "positive", "W2"], ["OUTRO ÂNGULO: ESPAÇO PERDIDO", "negative", "W11"]] },
  { id: "s8", narration: "O resultado são espirais em números de Fibonacci. Nas pinhas e no abacaxi, também.", world: "flower → plants",
    animations: ["spiralsA/B W0", "corte W8", "pine.spirals W9", "ananas.spirals W12"], badges: [["ESPIRAIS DE FIBONACCI", "positive", "W3"], ["PINHA · ABACAXI", "info", "W9"]] },
  { id: "s9", narration: "Agora, o mito: a concha do náutilo não é uma espiral áurea. Medida, ela cresce num ritmo bem diferente.", world: "nautilus",
    animations: ["goldenOverlay 0→1 W8–W11", "cross W11", "ratio.labels W12", "mascot.jump W7"], badges: [["O MITO DO NÁUTILO", "warning", "W1"], ["NÃO É ESPIRAL ÁUREA", "negative", "W8"], ["~1,33, NÃO 1,618", "info", "W13"]] },
  { id: "s10", narration: "Pronto: agora você sabe. Não é mágica. É só um jeito eficiente de crescer.", world: "flower",
    animations: ["camera orbit", "summary W4/W7/W10", "mascot.cheer W1", "mascot.wave W10"], badges: [["NÃO É MÁGICA: É EFICIÊNCIA", "positive", "W7"]] },
] as const;
