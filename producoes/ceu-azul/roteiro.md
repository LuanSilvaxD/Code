# Roteiro v1 — Por que o céu é azul?

> Status: **AGUARDANDO APROVAÇÃO** — implementação e renderização não iniciadas.
> Convenção: timestamps MM:SS:FF a 30 fps (FF 00–29); frames em intervalo semiaberto [início, fim).
> Tempos são estimativas até existir a narração real; depois do TTS os cortes passam a ser derivados da voz.

## 1. Briefing de produção

- **Tema/recorte:** espalhamento de Rayleigh pelas moléculas do ar (N₂, O₂): explica o céu azul de dia e o
  pôr do sol laranja com a MESMA causa. Inclui o mito do "reflexo do mar", a pergunta "por que não roxo?" e a
  prova do céu preto no espaço. Fora do recorte: nuvens brancas (espalhamento de Mie), poluição/poeira.
- **Gancho (do usuário):** "A resposta é a mesma que faz o pôr do sol ficar laranja." — aberto pela pergunta
  "Por que o céu é azul?" para o gancho fazer sentido logo na 1ª fala.
- **Público/objetivo:** leigo; sair sabendo explicar céu azul + pôr do sol com uma única ideia.
- **Formato:** 90 s, 1080 × 1920, 9:16, 30 fps (2700 frames), pt-BR, narração didática, informal e ágil.
- **Identidade Fenda Umbra:** abertura com a fenda, encerramento falado ("Segue a Fenda Umbra e compartilha pra
  mais vídeos assim!"), estúdio escuro com halo, pedestal com fio roxo, legenda em cápsula roxa.
- **Sistema construído:** uma maquete com mar, morro e deserto sob uma **meia-cúpula de ar** (esquemática), um
  Sol que percorre um arco (meio-dia → fim de tarde) e um feixe de "fótons" coloridos que atravessa o ar até os
  observadores no morro. O azul ricocheteia nas moléculas e tinge a cúpula; no fim de tarde, ao longo do caminho
  longo, o azul sai do feixe e sobram laranja e vermelho.
- **Personagens (régua: 1 m = 0,3 u3d; árvore de 5 m = 1,5 u3d):** uma pessoa (figurante variado) e o
  **mascote** no topo do morro, olhando o céu. O mascote reage: acena (gancho), pulinho (mito do deserto), aponta
  o prisma, pula no "roxo", **sobe flutuando para o espaço** (prova do céu preto), aponta o Sol poente, comemora.
- **Fundo dinâmico:** estúdio com tom de dia (azul-escuro) → preto com estrelas no espaço → quente no pôr do sol.
- **TTS:** edge-tts `pt-BR-AntonioNeural`, +0% (gratuito).

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:06:15 | 0 – 195 | Por que o céu é azul? A resposta é a mesma que faz o pôr do sol ficar laranja. | Abertura da fenda; câmera baixa atrás dos observadores olhando o céu (el −4°) → sobe para eles → abre para a maquete inteira (d=26). | Maquete (mar · morro · deserto), cúpula de ar azul, Sol alto, pessoa e mascote no morro. | `sky.sunset` 0→0,85 e `sun.angle` 0,12→0,9 em "pôr do sol" (prévia laranja) e voltam nos últimos 12 f; mascote acena (`mascot.wave`) e olha o céu. | ❓ POR QUE AZUL?; ❓ E O PÔR DO SOL? |
| 00:06:15 – 00:13:00 | 195 – 390 | Muita gente acha que o céu reflete o mar. Só que ele é azul até no meio do deserto. | Viagem lateral: mar (az −22°) → deserto (az 22°). | Setas "mar → céu" que são riscadas; deserto com o céu azul por cima. | `myth.arrows` 0→1 ("reflete"), `myth.strike` 0→1 ("Só"); `desert.skyGlow` 0→1 ("azul"); mascote dá pulinho em "deserto". | ✖ REFLEXO DO MAR? — mito; ℹ AZUL NO DESERTO TAMBÉM |
| 00:13:00 – 00:20:00 | 390 – 600 | O segredo começa na luz do Sol. Ela parece branca, mas é uma mistura de todas as cores. | Sobe até o Sol (d=8,5); feixe branco; prisma surge e abre o leque. | Feixe branco, prisma low-poly, leque do espectro (7 cores). | `ray.white` 0→1 ("luz"); `prism.show` spring ("branca"); `spectrum.fan` 0→1 ("mistura"→fim); mascote aponta o prisma. | ℹ LUZ BRANCA; ✔ TODAS AS CORES — o espectro da luz |
| 00:20:00 – 00:28:00 | 600 – 840 | No caminho até você, essa luz atravessa o ar: trilhões de moléculas minúsculas de nitrogênio e oxigênio. | Mergulho na cúpula (d=7 → 4,6): as moléculas crescem em zoom. | Fótons coloridos fluindo; pares N₂ (esferas cinza-azuladas) e O₂ (esferas coral) com rótulos. | `photons.flow` 0→1; `molecules.zoom` 0→1 ("trilhões"); `molecules.labels` 0→1 ("nitrogênio"). | ℹ MOLÉCULAS DO AR — nitrogênio (N₂) e oxigênio (O₂) |
| 00:28:00 – 00:35:00 | 840 – 1050 | E essas moléculas desviam muito mais as cores de onda curta, como o azul, do que o vermelho. | Órbita lenta entre as moléculas. | Fótons azuis batendo e mudando de direção; vermelhos seguindo reto; cartão 2D onda azul curta × onda vermelha longa. | `photons.scatter` 0→0,6 ("desviam"); `waveCard.show` 0→1 ("onda"); `waveCard.compare` 0→1 ("azul"→"vermelho"). | ✔ ONDA CURTA = MAIS DESVIO |
| 00:35:00 – 00:43:15 | 1050 – 1305 | Isso se chama espalhamento de Rayleigh. O azul ricocheteia pelo céu inteiro e chega aos seus olhos de todas as direções. | Dolly-out até a cúpula inteira (d=17) → câmera baixa junto dos observadores. | Cúpula toda ganha brilho azul; setas finas de luz azul chegando aos olhos de várias direções. | `fx.punch` em "espalhamento"; `photons.scatter` →1; `sky.glowBlue` 0→1; `eyeRays.show` 0→1; mascote olha para cima. | ✔ ESPALHAMENTO DE RAYLEIGH; ℹ AZUL DE TODAS AS DIREÇÕES |
| 00:43:15 – 00:53:00 | 1305 – 1590 | Mas o violeta se espalha ainda mais. Então por que o céu não é roxo? O Sol manda menos violeta, e seus olhos são menos sensíveis a ele. | Observadores → céu (d=17). | Fótons violeta (poucos); a cúpula "testa" ficar roxa e volta ao azul; cartão 2D "quanto o Sol manda" × "quanto o olho vê" por cor. | `photons.violet` 0→1; `sky.violetTint` 0→1 ("roxo?") e →0; `violetCard.show`/`violetCard.eye`; mascote pula em "roxo". | ❓ E O VIOLETA?; ℹ MENOS VIOLETA DO SOL — e o olho vê pouco violeta |
| 00:53:00 – 01:02:00 | 1590 – 1860 | Quer uma prova? No espaço não tem ar para espalhar a luz. Por isso lá o céu é preto, mesmo com o Sol brilhando. | Câmera sobe acima da cúpula (d=24, el 28°) → aproxima do mascote no espaço (d=9). Chicote no fim. | Fundo vira preto com estrelas; a cúpula vista de fora é só uma borda azul fina; **mascote sobe flutuando** e acena. | `space.view` 0→1; `stars.show` 0→1; `mascot.float` + `mascot.y` 0,6→5,6 u3d; `mascot.wave`; `fx.whipOut`. | ✔ SEM AR = SEM AZUL; ℹ CÉU PRETO NO ESPAÇO |
| 01:02:00 – 01:09:15 | 1860 – 2085 | E no fim da tarde, o Sol fica baixo. A luz atravessa muito mais ar até chegar em você. | Volta ao morro (chicote) → plano largo do pôr do sol (d=19) → caminho da luz (d=14). | Sol desce ao horizonte; dois caminhos tracejados: meio-dia (curto, por cima) × fim de tarde (longo, rasante). | `fx.whipIn`; `space.view`→0; mascote de volta no morro; `sun.angle` 0,12→0,92; `path.noon` e `path.sunset` 0→1. | ℹ SOL BAIXO; ⚠ CAMINHO MUITO MAIS LONGO |
| 01:09:15 – 01:17:00 | 2085 – 2310 | No caminho, quase todo o azul se espalha e fica para trás. Sobram o laranja e o vermelho. | Acompanha o feixe ao longo do caminho longo → observadores de baixo, contra o céu laranja. | Fótons azuis saindo do feixe ao longo do caminho; chegam só laranja/vermelho; cúpula fica laranja perto do horizonte. | `photons.sunsetStrip` 0→1; `sky.sunset` 0→1; mascote aponta o Sol; pessoa vira a cabeça. | ✖ O AZUL SE PERDE — espalhado pelo caminho; ✔ SOBRA LARANJA E VERMELHO |
| 01:17:00 – 01:30:00 | 2310 – 2700 | Pronto: agora você sabe por que o céu é azul e o pôr do sol, laranja. | Plano final (d=22) com órbita lenta; **encerramento fixo da marca** nos últimos ~4,7 s (fenda fecha + logo + chamada falada). | Céu dividido: metade azul (Sol alto, caminho curto) × metade laranja (Sol baixo, caminho longo); rótulos. | `finalSplit` 0→1; `finalLabels.reveal`; mascote comemora (`mascot.cheer`) + confete (`fx.burst`). | ℹ CÉU AZUL · PÔR DO SOL LARANJA (large) — o mesmo espalhamento |

Soma: 195+195+210+240+210+255+285+270+225+225+390 = **2700 frames** (90 s), contíguos de 0 a 2699.

## 3. Estrutura de State / Props para Remotion

Contrato completo em `scene-plan.ts` (11 cenas, tipos e helpers do template — `fx.*` para efeitos de tela,
`mascot.*` para o mascote). Objetos de id estável: `backdrop`, `land`, `atmosphere`, `molecules`, `sun`,
`photons`, `person`, `mascot` + extras por cena (`prism`, `waveCard`, `violetCard`, `stars`, `pathGuides`,
`finalLabels`). Checado: `tsc --strict` sem erros; linha do tempo contígua somando 2700.

- **Determinismo:** tudo é função do frame; fótons e estrelas com `random(seed)`; frames locais nas `Sequence`.
- **3D** (`@remotion/three`): maquete, cúpula translúcida, moléculas, Sol, feixe de fótons (partículas com
  trajetória pura por idade: reto para vermelho/laranja, desvio aleatório semeado para azul/violeta), prisma,
  mascote, pessoa, estrelas. **2D:** badges, legendas, cartões (onda curta × longa; Sol × olho por cor), rótulos.

## 4. Áudio e montagem

**Narração (217 palavras + encerramento da marca):**

Por que o céu é azul? A resposta é a mesma que faz o pôr do sol ficar laranja. Muita gente acha que o céu
reflete o mar. Só que ele é azul até no meio do deserto. O segredo começa na luz do Sol. Ela parece branca, mas é
uma mistura de todas as cores. No caminho até você, essa luz atravessa o ar: trilhões de moléculas minúsculas de
nitrogênio e oxigênio. E essas moléculas desviam muito mais as cores de onda curta, como o azul, do que o
vermelho. Isso se chama espalhamento de Rayleigh. O azul ricocheteia pelo céu inteiro e chega aos seus olhos de
todas as direções. Mas o violeta se espalha ainda mais. Então por que o céu não é roxo? O Sol manda menos
violeta, e seus olhos são menos sensíveis a ele. Quer uma prova? No espaço não tem ar para espalhar a luz. Por
isso lá o céu é preto, mesmo com o Sol brilhando. E no fim da tarde, o Sol fica baixo. A luz atravessa muito
mais ar até chegar em você. No caminho, quase todo o azul se espalha e fica para trás. Sobram o laranja e o
vermelho. Pronto: agora você sabe por que o céu é azul e o pôr do sol, laranja.

**Encerramento fixo da marca (fora da tabela, dentro do tempo):** "Segue a Fenda Umbra e compartilha pra mais
vídeos assim!" (~3,3 s; encerramento ~4,7 s).

- **Orçamento (`vo_budget.py`, conservador):** ~69 s de fala + pausas + abertura + encerramento ≈ 80 s → **sobra
  ~10 s**, usada em pausas maiores antes do espaço e do pôr do sol (momentos visuais). Reajusto com a voz real.
- **Pronúncia:** "Rayleigh" (rêi-li) — se o TTS errar, grafia fonética só no áudio ("Rêili").
- **Efeitos:** abertura/encerramento da fenda, brilhos no prisma/espectro, "tick" nos desvios, swoosh grande na
  subida ao espaço + ambiente grave, chicote na volta, brilho quente no pôr do sol, acorde final.
- **Trilha (`INTENTS`):** calm (1–2) → curious (3–6) → tense curto (7) → build (8, subida) → calm quente (9–10)
  → resolve (11). Abaixa sob a voz e sob a chamada final.

## 5. Critérios de aceite e notas de verificação

- [x] Gancho imediato (pergunta + promessa de ligar com o pôr do sol); prévia laranja já no 1º plano.
- [x] Cadeia causal: mito derrubado → luz branca = cores → ar com moléculas → onda curta desvia mais (termo
  depois da explicação) → céu azul de todas as direções → objeção do violeta → prova no espaço → caminho longo
  no fim da tarde → sobra laranja.
- [x] Sistema persistente (mesma maquete, cúpula, Sol e feixe); final mostra os dois estados juntos.
- [x] Mascote reage em 6 momentos e tem um papel de "astronauta" coerente (sobe ao espaço na prova).
- [x] Tabela completa, 11 planos (6,5–13 s; o último inclui o encerramento), frames contíguos, soma 2700.
- [ ] Leitura no celular, enquadramento dos personagens na régua, pronúncia e áudio: só na Fase 2.

**Rigor e premissas:**
- Espalhamento de Rayleigh por moléculas do ar, intensidade ∝ 1/λ⁴ (mais forte para onda curta). Não cito um
  "X vezes mais" porque as fontes variam (≈3–6×, conforme as cores comparadas).
- Céu não violeta: o Sol emite menos violeta que azul e o olho é menos sensível ao violeta (parte do violeta/UV
  também é absorvida na alta atmosfera — omitido por simplicidade).
- Pôr do sol: caminho muito mais longo pelo ar com o Sol baixo; o azul é espalhado para fora do feixe direto.
  Poeira/nuvens podem intensificar ou apagar as cores — fora do recorte.
- Mito do reflexo do mar: o céu é azul sobre desertos e continentes; o mar é que é azulado em parte por
  refletir o céu (não o contrário).
- Cúpula, moléculas e caminhos são **esquemáticos** (selo na tela); a régua de 1 m = 0,3 u3d vale só para o chão
  e os personagens.

**Fontes consultadas:**
- Met Office — Why is the sunset red?: https://metoffice.gov.uk/learning/optics/why-is-the-sunset-red
- NOAA SPC (Corfidi) — The Colors of Sunset and Twilight: https://www.spc.noaa.gov/publications/corfidi/sunset
- Royal Museums Greenwich — Why is the sky blue?: https://www.rmg.co.uk/stories/space-astronomy/why-sky-blue
- Big Think (Starts With a Bang) — Why the sky is blue: https://bigthink.com/starts-with-a-bang/why-the-sky-is-blue-according-to-science/
