// scene-plan.ts — "95% do universo é invisível" (Euclid) — Roteiro v1 (~1:10) — AGUARDANDO APROVAÇÃO
// Contrato de dados da Fase 1 (mesmo motor dos vídeos anteriores; vira src/data/scenes.ts na Fase 2).
// timing.ts: SECONDS = 70 · VO_KEYS s1..s9 · PLANNED_SECONDS = [8.7, 6.4, 4.8, 7.17, 5.83, 5.03, 10.43, 8.33, 13.3]
//            GAPS = [0.55, 0.55, 0.55, 0.8, 0.55, 0.55, 0.8, 0.8] · cortes: 0, 261, 453, 597, 812, 987, 1138, 1451, 1701 (fim 2100)
// MUNDOS (só o ativo é desenhado): COSMOS [0,0,0] (pizza, galáxias, expansão) · SOLAR [0,-300,0] (Sol, Terra, Euclid, céu)
//   · LENS [0,-400,0] (lente gravitacional) · WEB [0,-500,0] (teia cósmica) · ICE [0,-600,0] (iceberg). u3d esquemáticos.
// W("sN", i) = frame local da palavra i. Badges: problem/solution/neutral; highlights em CAIXA ALTA.

export const plan = [
  { id: "s1", frames: [0, 261], narration: "Tudo o que você enxerga no universo, estrelas, planetas e galáxias, é só cinco por cento dele. O resto é invisível.",
    world: "cosmos", camera: "galáxia+planeta → pizza (dolly-out)", animations: ["fx.flash(0)", "mascot.wave(W1)", "cosmos.shrink 0→1 W11–W15", "pie.k5 spring W13", "pie.outline W17", "fx.punch W20"],
    badges: [["SÓ 5% É VISÍVEL", "warning", "W13"], ["O RESTO? INVISÍVEL", "warning", "W18", "large"]], highlights: ["ENXERGA", "UNIVERSO", "CINCO", "INVISÍVEL"], sfx: ["fenda-open 0", "shimmer W13", "thud W20"] },
  { id: "s2", frames: [261, 453], narration: "Uns vinte e sete por cento são matéria escura. Ela não brilha, mas puxa tudo em volta.",
    world: "cosmos", camera: "pizza → galáxia", animations: ["pie.k27 spring W1", "halo.show 0→1 W7–W9", "pull.arrows spring W13"],
    badges: [["MATÉRIA ESCURA: 27%", "info", "W1"], ["NÃO BRILHA, MAS PUXA", "info", "W10"]], highlights: ["VINTE", "SETE", "MATÉRIA", "ESCURA", "PUXA"], sfx: ["glow W1", "rumble-soft W13"] },
  { id: "s3", frames: [453, 597], narration: "Sem ela, as galáxias giram tão rápido que deveriam se desmanchar.",
    world: "cosmos", camera: "split (2 galáxias)", animations: ["split.show 0", "galaxyB.scatter 0→1 W6–W10", "mascot.jump W8"],
    badges: [["SEM ELA, A GALÁXIA SE DESMANCHA", "negative", "W8"]], highlights: ["SEM", "GIRAM", "RÁPIDO", "DESMANCHAR"], sfx: ["whoosh-soft 0", "whoosh W8"] },
  { id: "s4", frames: [597, 812], narration: "E sessenta e oito por cento é energia escura: algo que faz o universo se expandir cada vez mais rápido.",
    world: "cosmos", camera: "pizza completa → galáxias se afastando", animations: ["pie.k68 spring W1", "fx.flash W3", "expand.t 0→1 W13–W19 (in)"],
    badges: [["ENERGIA ESCURA: 68%", "info", "W1", "large"], ["EXPANSÃO ACELERADA", "warning", "W15"]], highlights: ["SESSENTA", "OITO", "ENERGIA", "EXPANDIR", "RÁPIDO"], sfx: ["ding W1", "solar-whoosh W13"] },
  { id: "s5", frames: [812, 987], narration: "Ninguém sabe o que elas são. Por isso, em 2023, a Europa lançou o Euclid.",
    world: "cosmos → solar", camera: "pizza com ? → Terra + Euclid subindo", animations: ["pie.question spring W1", "fx.whipOut/whipIn W6", "euclid.launch 0→1 W12–W14+15"],
    badges: [["NINGUÉM SABE O QUE SÃO", "warning", "W1"], ["EUCLID · LANÇADO EM 2023", "info", "W12"]], highlights: ["NINGUÉM", "2023", "EUROPA", "EUCLID"], sfx: ["tick W1", "whoosh W6", "launch W12"] },
  { id: "s6", frames: [987, 1138], narration: "Ele fica a um milhão e meio de quilômetros da Terra e vai mapear um terço do céu.",
    world: "solar", camera: "Sol–Terra–Euclid aberto", animations: ["distance.line 0→1 W3–W8", "sky.third 0→1 W13–W17", "mascot.point W1"],
    badges: [["1,5 MILHÃO DE KM DA TERRA", "info", "W4"], ["MAPA DE 1/3 DO CÉU", "info", "W14"]], highlights: ["MILHÃO", "MEIO", "TERRA", "TERÇO", "CÉU"], sfx: ["pop W4", "shimmer W13"] },
  { id: "s7", frames: [1138, 1451], narration: "O truque: a matéria escura entorta a luz das galáxias que estão atrás, como uma lente. Medindo essa distorção, dá pra desenhar onde ela está.",
    world: "lens", camera: "close na lente", animations: ["lens.pass 0→1 W2–W7", "lens.arcs 0→1 W5–W9", "lens.field spring W16", "halo.trace 0→1 W19–W24"],
    badges: [["LENTE GRAVITACIONAL", "info", "W13"], ["A DISTORÇÃO REVELA A MATÉRIA ESCURA", "positive", "W19"]], highlights: ["TRUQUE", "ENTORTA", "LENTE", "DISTORÇÃO", "DESENHAR"], sfx: ["warp W5", "glow W19"] },
  { id: "s8", frames: [1451, 1701], narration: "E já saiu o primeiro grande pacote: mais de novecentos milhões de galáxias, pra montar o mapa 3D do universo invisível.",
    world: "web", camera: "órbita na teia cósmica", animations: ["web.light 0→1 W2–W12", "counter 0→900 W7–W12"],
    badges: [["1º PACOTE DE DADOS", "info", "W4"], ["+900 MILHÕES DE GALÁXIAS", "positive", "W9"]], highlights: ["PRIMEIRO", "PACOTE", "NOVECENTOS", "MILHÕES", "MAPA", "INVISÍVEL"], sfx: ["shimmer W2", "ding W9"] },
  { id: "s9", frames: [1701, 2100], narration: "Pronto: agora você sabe. O universo que a gente vê é só a pontinha do iceberg.",
    world: "ice", camera: "ponta do iceberg → desce para baixo d'água", animations: ["iceberg.show W0", "camera desce W4–W15", "label.5 W11", "label.95 W14", "mascot.cheer W1", "mascot.wave W13"],
    badges: [["SÓ A PONTINHA: 5%", "positive", "W11"]], highlights: ["PRONTO", "UNIVERSO", "VÊ", "PONTINHA", "ICEBERG"], sfx: ["ocean-amb 0", "final W11"] },
] as const;
