# Roteiro v1 — Tsunami: por que a onda quase invisível vira um paredão na costa

> Status: **AGUARDANDO APROVAÇÃO** — implementação e renderização não iniciadas.
> Convenção: timestamps MM:SS:FF a 30 fps (FF 00–29); frames em intervalo semiaberto [início, fim).
> Tempos são estimativas até existir a narração real; depois do TTS os cortes passam a ser derivados da voz.

## 1. Briefing de produção

- **Tema/recorte:** tsunami gerado por terremoto numa zona de subducção (o caso mais comum), atravessando
  mar aberto (~4.000 m) até uma costa com talude, plataforma continental rasa, praia, cidade baixa e um morro.
  Outras origens (deslizamentos, vulcões) ficam fora do recorte. A onda que parte para o lado oposto (mar
  aberto) é omitida por simplicidade.
- **Gancho (do usuário):** "No meio do oceano, um tsunami mal se percebe."
- **Público/objetivo:** leigo; entender por que a mesma onda é imperceptível em alto-mar e destrutiva na costa
  (velocidade depende da profundidade → frente freia → água se acumula → onda encurta e cresce).
- **Formato:** 90 s, 1080 × 1920, 9:16, 30 fps (2700 frames), pt-BR, narração didática, informal e ágil.
- **Sistema construído/revelado:** um único perfil do oceano em corte (fossa → planície abissal → talude →
  plataforma → praia → cidade → morro) por onde a mesma onda viaja do nascimento à chegada.
- **Problemas que conduzem a evolução:** "por que ninguém percebe?" → "de onde ela vem?" → "por que é tão
  rápida?" → "o que muda perto da costa?" → "por que cresce?" → "o que fazer quando chega?".
- **Direção de arte:** diorama low-poly fosco (`flatShading`); água em azul-petróleo translúcido com face de
  corte, fundo em areia/cinza, placas em marrom-ferrugem; céu claro na superfície e azul profundo quando a câmera
  desce. **Escala esquemática: horizontal comprimida, vertical exagerada** — dito em tela (selo "ESCALA
  VERTICAL EXAGERADA") na cena 5, quando o vídeo mostra primeiro a escala quase real (plana) e depois a exagerada.
- **Câmera:** perspectiva, FOV ~24°. Como o perfil é longo e a tela é vertical, os planos abertos olham o perfil
  em diagonal (azimute 55–72°), com a costa ao fundo.
- **TTS planejado:** edge-tts (gratuito), voz `pt-BR-AntonioNeural`, rate +6%. ElevenLabs só com sua
  autorização expressa (voz e custo a declarar).

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:07:00 | 0 – 210 | No meio do oceano, um tsunami mal se percebe. O navio sobe e desce, e ninguém nota. | Plano baixo ao lado do navio (orbit d=11, az 30°, el 4°) → sobe para d=15 (az 22°, el 13°) em "O navio" → abre para d=30 mostrando o corte do oceano sob o navio. Deriva contínua. | Céu, oceano em corte, fundo abissal, navio cargueiro, marolas normais (`ocean.chop`), onda do tsunami como lombada sutil. | `tsunami.x` −14→−2 u3d (local 6→210, linear); `view.exaggeration`=0,3; `ship.rockAmp` 0→1 (0→15); navio lê y=η(x) e sobe/desce suavemente; `ship.wake` 0→1. | ℹ TSUNAMI EM MAR ABERTO ("tsunami"→"O"); ❓ NINGUÉM NOTA? ("ninguém"→fim). Destaques: OCEANO, TSUNAMI, NAVIO, NINGUÉM. |
| 00:07:00 – 00:12:00 | 210 – 360 | Mas, na praia, essa mesma onda vira um paredão de água. Como? | Corte seco para a costa (prévia, levemente dessaturada): orbit d=17, az −28°, el 9° → dolly-in d=11 em "paredão". Ao fim, efeito de rebobinar (14 frames). | Praia, cidade baixa, morro, parede d'água prévia (`previewWall`). Navio e tsunami ocultos. | `previewWall.rise` spring 0→1 (damping 14) em "vira"; `screen.shake` 1→0 em 12 f em "paredão"; `rewind` 0→1 nos últimos 14 f (desatura, borra, inverte). | ❓ COMO? — "de quase nada a um paredão" (warning, em "Como?"). Destaques: PRAIA, MESMA, PAREDÃO, COMO. |
| 00:12:00 – 00:18:15 | 360 – 555 | Tudo começa num terremoto no fundo do mar: uma placa travada se solta e ergue o assoalho. | Rebobinar se desfaz (8 f); câmera desce na fossa (d=19, el 5°), vê as duas placas em corte; após o salto, volta a d=25 (el 11°). | Placas (oceânica mergulhando sob a continental), falha, régua de profundidade, fundo. | `tsunami.on` 1→0 (0→4); `plates.strain` 0→1 (curvatura elástica, "uma"→"se"); `plates.slip` spring 0→1 (damping 9) em "solta"; `seafloor.uplift` 0→0,35 u3d ("solta"→"ergue"+6, out); `screen.shake` 24 f. | ℹ TERREMOTO SUBMARINO — "zona de subducção" ("terremoto"→"solta"); ℹ O FUNDO SOBE ("ergue"→fim). Destaques: TERREMOTO, FUNDO, PLACA, TRAVADA, SOLTA, ASSOALHO. |
| 00:18:15 – 00:23:00 | 555 – 690 | E empurra para cima toda a água acima dela. | Câmera sobe junto com a água (vertical), d=24 → alvo na superfície (el 12°). | Partículas na coluna d'água (do fundo à superfície), setas verdes para cima, superfície. | `columnParticles.show` 0→1 (0→10); `columnParticles.lift` 0→1 ("empurra"→"água"+6); `tsunami.on` spring 0→1 (damping 12) em "cima"; `liftArrows.show` 0→1; `tsunami.x`=−20; `view.exaggeration`=1. | ✔ DESLOCAMENTO DO FUNDO — "a coluna d'água sobe junto" (positive, em "toda"). Destaques: EMPURRA, CIMA, TODA, ÁGUA. |
| 00:23:00 – 00:30:15 | 690 – 915 | Na superfície, vira um calombo baixo, em geral com menos de um metro, mas com centenas de quilômetros de largura. | Plano lateral rasante (d=20, az 4°, el 2°): a lombada encolhe até quase sumir (escala quase real) em "menos de um metro"; depois dolly-out (d=28) e o exagero volta, revelando a largura. | Onda (pulso largo), cota horizontal "centenas de km", selo "ESCALA VERTICAL EXAGERADA". | `view.exaggeration` 1→0 ("em"→"menos", inOut) e 0→1 ("com"→"centenas"); `tsunami.x` −20→−14 (linear); `widthSpan.grow` 0→1 ("centenas"→fim); `scaleTag.show` 0→1. | ℹ MENOS DE 1 m — "em mar aberto, em geral"; ℹ CENTENAS DE km — "de uma ponta à outra". Destaques: CALOMBO, BAIXO, METRO, CENTENAS, QUILÔMETROS, LARGURA. |
| 00:30:15 – 00:35:00 | 915 – 1050 | A subida é tão suave que o navio nem sente. | Volta ao navio (d=15) com órbita leve 22°→34°; a crista passa por baixo. | Navio, onda, medidor 2D de inclinação (rampa praticamente plana). | `tsunami.x` −12,5→−7,5 (linear, a crista chega ao navio em x=−8); `view.exaggeration` 1→0,3 (0→10); `slopeGauge.show` 0→1 ("subida"→"tão"). | ✔ COMPRIMENTO DE ONDA — "tão longo que a subida é suave" (positive, em "suave"). Destaques: SUAVE, NAVIO, NEM, SENTE. |
| 00:35:00 – 00:41:15 | 1050 – 1245 | Só que ela mexe o oceano inteiro. E, quanto mais fundo o mar, mais rápido ela corre. | Câmera desce pela face de corte (d=24, el 2°) mostrando a coluna inteira oscilando; depois sobe e gira para a diagonal de perseguição (d=34, az 56°). | Partículas da coluna balançando na horizontal com a mesma amplitude do fundo ao topo; mini-gráfico 2D profundidade × velocidade; costa ao longe. | `columnParticles.show` 0→1 em "mexe"; `columnParticles.sway` 0→1; `tsunami.x` −7,5→1 (linear); `view.exaggeration` 0,3→1; `depthSpeedChart.show` 0→1 ("quanto"→"rápido"+6). | ⚠ MOVE O OCEANO INTEIRO — "do fundo à superfície"; ✔ MAIS FUNDO = MAIS RÁPIDO (em "rápido"). Destaques: MEXE, OCEANO, INTEIRO, FUNDO, RÁPIDO, CORRE. |
| 00:41:15 – 00:47:15 | 1245 – 1425 | Num mar de quatro mil metros, passa de setecentos quilômetros por hora: velocidade de avião. | Perseguição em diagonal (d=34→32, az 56°→62°, linear) acompanhando a crista; um avião low-poly entra por cima e emparelha. | Onda, régua de profundidade destacada ("4.000 m"), linhas de velocidade, avião. | `tsunami.x` 1→6,5 (linear); `depthGuide.highlight` 0→1 em "quatro mil metros"; `speedLines.show` 0→1 a partir de "passa"; `airplane.enter` 0→1 (em "velocidade" −10 f → +8 f; avião segue `tsunami.x`). | ℹ 4.000 m DE PROFUNDIDADE; ✔ ≈ 700 km/h — "velocidade de avião a jato" (em "setecentos"). Destaques: QUATRO, MIL, SETECENTOS, QUILÔMETROS, HORA, AVIÃO. |
| 00:47:15 – 00:54:00 | 1425 – 1620 | Perto da costa, o fundo sobe, o mar fica raso, e a frente da onda freia. | Câmera desacelera com a onda: talude (d=22, el 7°) → plataforma (d=17). O avião sai pelo alto. | Fundo com talude e plataforma destacados; régua muda para "raso"; setas: frente curta vermelha, trás longa verde. | `airplane.enter`→0 e `speedLines.show`→0 (0→12); `tsunami.x` 6,5→14 (easing out = desaceleração visível); `seafloor.slopeGlow` 0→1 em "fundo sobe"; `depthGuide.shallow` 0→1 em "raso"; `speedArrows.show` spring (damping 12) em "frente". | ℹ ÁGUA RASA = ONDA LENTA (em "raso"); ✖ A FRENTE FREIA (em "freia"). Destaques: COSTA, FUNDO, SOBE, RASO, FRENTE, FREIA. |
| 00:54:00 – 01:00:15 | 1620 – 1815 | Mas a parte de trás ainda vem rápida, alcança a da frente, e a água se empilha. | Órbita lenta sobre a plataforma (d=17→15, az 14°→4°, el 6°→5°), de lado, para ver o pulso comprimir. | Onda (pulso encurtando e subindo), setas convergindo, partículas se juntando na crista. | `tsunami.x` 14→18 (linear); `speedArrows.converge` 0→1 ("parte"→"frente"); `pileUp.show` 0→1 ("alcança"→fim); `speedArrows.show`→0 nos últimos 10 f. Altura e largura vêm da profundidade local (lei de Green, com teto visual). | ✔ EMPOLAMENTO — "a onda cresce ao chegar no raso" (em "se empilha"). Destaques: TRÁS, RÁPIDA, ALCANÇA, FRENTE, EMPILHA. |
| 01:00:15 – 01:07:00 | 1815 – 2010 | A onda encurta e cresce: a mesma energia, espremida em menos profundidade, vira altura. | Dolly-in lateral: d=15 → 18 (abre para caber a comparação) → d=13 perto da crista alta. | Onda alta e curta; silhueta-fantasma da onda de mar aberto ao lado (comparação); faixa de energia que se estreita e sobe. | `tsunami.x` 18→21; `ghostDeep.show` 0→1 em "encurta" e →0 nos últimos 10 f; `energyBand.squeeze` 0→1 ("energia"→"altura"+6, inOut). | ✔ ENCURTA E CRESCE; ✔ ENERGIA VIRA ALTURA — "esquema, fora de escala". Destaques: ENCURTA, CRESCE, ENERGIA, ESPREMIDA, ALTURA. |
| 01:07:00 – 01:15:00 | 2010 – 2250 | Às vezes o mar recua antes, expondo o fundo. Se vir isso, não vá olhar: suba para um lugar alto. | Praia (d=14, az −18°) → plano alto da costa (d=20, el 22°) que mostra praia, cidade e morro juntos. | Vale da onda à frente da crista; areia/fundo exposto; seta verde praia→morro; bonecos low-poly subindo o morro. | `tsunami.trough` 0→1 (0→24, o vale chega primeiro); `tsunami.x` 21→22,6; `coast.drawdown` 0→1 ("recua"→"fundo"+8, inOut); `evacRoute.show` spring (damping 12) em "suba"; `evacRoute.people` 0→1 (linear). | ✖ MAR RECUANDO — "nem sempre acontece"; ✔ SUBA PARA O ALTO — "não vá ver o mar". Destaques: RECUA, FUNDO, NÃO, OLHAR, SUBA, ALTO. |
| 01:15:00 – 01:22:15 | 2250 – 2475 | E ela não quebra e acaba como onda de surfe: é tão comprida que a água segue avançando por minutos. | A crista chega (frente íngreme, tipo muralha/bore); câmera recua da cidade (d=15 → 22, el 10°→15°). O morro, com os bonecos, fica seco. | Onda de surfe estilizada ao lado (riscada em vermelho); inundação da cidade baixa; setas de correnteza terra adentro. | `coast.drawdown`→0 (0→36); `tsunami.x` 22,6→24,5 (0→48, in); `surfGhost.show` spring em "quebra", `surfGhost.strike` 0→1 ("acaba"→"surfe"), some em "é"; `coast.inundation` 0→1 (36→fim, soft); `flowArrows.show` em "segue avançando". | ✖ NÃO É ONDA DE SURFE; ℹ AVANÇA POR MINUTOS — "e costuma vir mais de uma onda". Destaques: QUEBRA, SURFE, COMPRIDA, ÁGUA, AVANÇANDO, MINUTOS. |
| 01:22:15 – 01:30:00 | 2475 – 2700 | Pronto: agora você sabe por que a onda quase invisível no mar vira um paredão na costa. | Dolly-out até o perfil inteiro em diagonal (d=72, az 60°) e órbita lenta até az 72°; fade nos últimos 18 f. | Perfil completo com placas, régua e costa; três instantâneos da onda (abissal baixa e longa → talude média → costa alta e curta); rótulos 3D ancorados. | `coast.inundation`→0 (0→42); `finalGhosts.reveal` 0→1 (36→"paredão"+6, inOut); `finalLabels.reveal` escalonado: ORIGEM · RÁPIDA E BAIXA · FREIA E CRESCE · PAREDÃO; `fade` 0→1 (últimos 18 f). | ℹ TSUNAMI (large) — "quase invisível no mar, paredão na costa". Destaques: PRONTO, INVISÍVEL, MAR, PAREDÃO, COSTA. |

Soma: 210+150+195+135+225+135+195+180+195+195+195+240+225+225 = **2700 frames** (90 s), contíguos de 0 a 2699.

## 3. Estrutura de State / Props para Remotion

Contrato completo em `scene-plan.ts` (14 cenas, mesmos tipos do template `assets/template/src/data/scenes.ts`):
`VideoConfig` (1080×1920, 30 fps, 2700 frames, pt-BR) e `ScenePlan[]` com id, startFrame, durationInFrames,
voKey s1–s14, narração idêntica à tabela, câmera por chaves `orbit(alvo, d, az, el)`, objetos com ids estáveis
(`ocean`, `seafloor`, `plates`, `tsunami`, `ship`, `coast`, `columnParticles`, `depthGuide`, `sky` + extras por
cena), trilhas `objeto.propriedade` com unidade, badges, highlights, legendas provisórias e audioCues `planned`.
Checado nesta fase: `tsc --strict` sem erros e verificação de integridade (contígua, soma 2700) passando, com as
utilidades do template e um stub de tipos do `remotion`.

- **Determinismo:** tudo é função do frame (`track(alvo, frame)`); sem timers, `Date.now`, estado incremental ou
  `Math.random` (partículas usam `random(seed)` do Remotion). Dentro de cada `Sequence`, frames locais.
- **Camada 3D** (`@remotion/three` + R3F): perfil do fundo, água em corte, superfície da onda como malha cujos
  vértices seguem η(x) = G·A(h)·[sech²((x−xf)/L(h)) − trough·sech²((x−xf−1,1L)/L)], com L ∝ √h (encurta no raso) e
  A ∝ h^(−1/4) (lei de Green), teto visual e G = `view.exaggeration`. O navio, o avião e as partículas leem a mesma
  função. **Camada 2D:** badges, legendas, selo de escala, mini-gráfico e medidor de inclinação.
- **Prévia da cena 2:** objeto próprio (`previewWall`) para não quebrar a trilha contínua de `tsunami.x`.

## 4. Áudio e montagem

**Narração integral (221 palavras):**

No meio do oceano, um tsunami mal se percebe. O navio sobe e desce, e ninguém nota. Mas, na praia, essa mesma
onda vira um paredão de água. Como? Tudo começa num terremoto no fundo do mar: uma placa travada se solta e ergue
o assoalho. E empurra para cima toda a água acima dela. Na superfície, vira um calombo baixo, em geral com menos de
um metro, mas com centenas de quilômetros de largura. A subida é tão suave que o navio nem sente. Só que ela mexe o
oceano inteiro. E, quanto mais fundo o mar, mais rápido ela corre. Num mar de quatro mil metros, passa de setecentos
quilômetros por hora: velocidade de avião. Perto da costa, o fundo sobe, o mar fica raso, e a frente da onda freia.
Mas a parte de trás ainda vem rápida, alcança a da frente, e a água se empilha. A onda encurta e cresce: a mesma
energia, espremida em menos profundidade, vira altura. Às vezes o mar recua antes, expondo o fundo. Se vir isso, não
vá olhar: suba para um lugar alto. E ela não quebra e acaba como onda de surfe: é tão comprida que a água segue
avançando por minutos. Pronto: agora você sabe por que a onda quase invisível no mar vira um paredão na costa.

- **Ritmo:** 221 palavras em 90 s. Com ~0,45 s de entrada, 13 pausas (~7,5 s) e respiro final, sobram ~81 s de
  fala → **~164 palavras/min**, no limite de cima da faixa (145–170). Se o TTS real passar de ~82 s, eu corto texto
  (candidatos: "do fundo à superfície" sai da cena 3, "de largura" sai da cena 5) antes de acelerar a voz.
- **Voz:** edge-tts `pt-BR-AntonioNeural`, curiosa, ritmo de conversa, ênfase nos números e no "Como?".
- **Efeitos (sintetizados por código):** ambiente oceânico (1, 6), marola (1), whoosh (2, 14), rush d'água (2, 13),
  rebobinar (2), ambiente grave submarino (3), rangido de tensão (3), estrondo grave do terremoto (3), swell
  subindo (4, 10, 11), alongamento (5), passagem de jato (8), "freada" da onda (9), escoamento do recuo (12),
  inundação em loop (13), toques de badge (+/−/?), sino final (14).
- **Trilha:** pad ambiente grave e calmo (cenas 1–8), tensão crescente com pulso (9–13), resolução maior na 14.
  Abaixa sob a voz e fica sempre subordinada a ela.
- **Legendas:** blocos provisórios por cena; tempos palavra a palavra só depois do alinhamento com o áudio real.

## 5. Critérios de aceite e notas de verificação

- [x] Gancho imediato (frase do usuário + navio que nem percebe, desde o frame 0).
- [x] Cadeia causal: origem → deslocamento da coluna → baixa e longa (invisível) → move tudo → velocidade
  depende da profundidade → frente freia → traseira alcança → encurta e cresce → recuo (às vezes) → chegada que não para.
- [x] Explicação antes do termo (DESLOCAMENTO DO FUNDO, COMPRIMENTO DE ONDA, EMPOLAMENTO aparecem depois do fenômeno).
- [x] Sistema persistente (o mesmo perfil e a mesma onda do começo ao fim); conclusão com o sistema completo.
- [x] Tabela completa, 14 planos de 4,5–8 s, frames contíguos e soma 2700 (checado em `scene-plan.ts`).
- [x] Array consistente com a tabela (mesma narração, ordem e badges).
- [ ] Leitura no celular, enquadramento, sincronização e áudio: **só verificáveis na Fase 2** (stills, folha de
  contato, ffprobe, medição de loudness). Nada foi renderizado nem gerado.
- Nenhum asset existe ainda; todo `audioCue` está `planned`.

**Rigor e premissas:**
- Altura < 1 m em mar aberto "em geral" e comprimento de "centenas de km": NOAA. Velocidade √(g·h): a 4.000 m,
  √(9,81 × 4000) ≈ 198 m/s ≈ 713 km/h → "passa de setecentos". A onda é longa o bastante para se comportar como
  "onda de água rasa" mesmo no oceano profundo; por isso move a coluna inteira e a velocidade depende só da profundidade.
- Encurtamento + crescimento no raso: lei de Green (A ∝ h^(−1/4); período constante, comprimento encurta). Não cito
  fator numérico de crescimento porque ele depende da costa.
- Recuo do mar: **nem sempre acontece** (acontece quando o vale chega primeiro) — dito na narração e no badge.
- "Paredão": na costa, o tsunami muitas vezes chega como uma maré que sobe muito rápido ou uma frente íngreme
  (bore), não como um tubo de surfe. A cena 13 corrige essa ideia em vez de reforçá-la.
- **Termo "empolamento":** é como eu conheço a tradução de *shoaling* na engenharia costeira brasileira, mas não achei
  uma fonte que confirmasse o termo nas buscas feitas. Alternativa pronta se você preferir não arriscar:
  badge "A ÁGUA SE EMPILHA" (sem termo técnico).
- Escala esquemática declarada em tela; nenhuma profundidade da costa ou altura de chegada é afirmada.

**Fontes consultadas:**
- NOAA JetStream, propagação de tsunamis: https://noaa.gov/jetstream/tsunamis/tsunami-propagation
- Lei de Green / shoaling (George, LeVeque et al., 2019): https://faculty.washington.edu/rjl/pubs/Shoaling2019/index.html
- Propagação das ondas marítimas e dos tsunami (UFRGS): https://lume.ufrgs.br/handle/10183/85066
- Sinais de alerta e recuo do mar (Unibo, "What is a tsunami?"): https://scienzagiovane.unibo.it/English/tsunami/2-look-like.html
- Cal OES, alertas de tsunami: https://www.caloes.ca.gov/office-of-the-director/operations/planning-preparedness-prevention/seismic-hazards/tsunami-program/tsunami-alerts/
