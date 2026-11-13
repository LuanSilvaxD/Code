# Roteiro v1 — A espiral de Fibonacci: o segredo do girassol (e um mito)

**Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.
**Quadro:** nenhum (explicativo avulso). O fecho desmonta um mito, mas sem o quadro Boato ou Verdade (evita repetir o formato).

## 1. Briefing de produção

- **Tema:** por que o girassol (e pinhas, abacaxis) mostra números de Fibonacci em suas espirais; o que é a sequência, a proporção áurea e o ângulo áureo; e o mito do náutilo.
- **Recorte:** sequência (soma dos dois anteriores) → razão tende a 1,618 → quadrados e a espiral → o **porquê** real: cada semente nasce girada 137,5° (ângulo áureo), o que espalha as sementes sem raios nem vazios → espirais em números de Fibonacci → o náutilo NÃO é espiral áurea (medido ~1,33, não 1,618).
- **Formato:** pergunta → revelação. Fio condutor visível: **um girassol 3D** que é contado, "desmontado" em semente por semente e remontado com outros ângulos.
- **Público e objetivo:** leigo. Sair sabendo o que é a sequência, por que aparece no girassol e que "Fibonacci em tudo" é exagero.
- **Duração:** planejado ~1:15–1:18 (orçamento 79 s; a voz real costuma sair ~6% mais curta → ~74 s). Fica na faixa da regra de 60–75 s; se a voz passar de 75 s, corto pausas antes de mexer no texto. Justificativa: o "porquê" (ângulo áureo) é o coração do vídeo e não dá para cortar.
- **Formato técnico:** 1080 × 1920, 9:16, 30 fps, pt-BR. Timestamps MM:SS:FF; intervalos [início, fim).
- **Tom:** curioso, "olha que coisa", e honesto no fim (não é mágica).
- **TTS:** edge-tts `pt-BR-AntonioNeural`, rate +4% (cta +0%). ":" vira "," só no TTS. "1,618" vira "um vírgula seiscentos e dezoito" no texto do TTS (mesma contagem de palavras resolvida na Fase 2). "Fibonacci" a conferir.
- **Paleta da trilha:** `natureza` (variação automática por vídeo). Tema da marca no gancho, em "o ângulo áureo" e em "Não é mágica".
- **Direção de arte:** estúdio escuro com tinta esverdeada `#1b2e33`; luz quente de "campo".
  - **Girassol 3D** grande: miolo com centenas de sementes em espiral (filotaxia real, ângulo 137,5°), pétalas amarelas, caule e folhas. As duas famílias de espirais se acendem em cores (34 laranja, 55 azul) na contagem.
  - **Números 2D** da sequência pulando e se somando.
  - **Casal de coelhos** low-poly (problema de 1202), com contador de casais 1, 1, 2, 3, 5.
  - **Quadrados de Fibonacci** (1, 1, 2, 3, 5, 8, 13) montando-se em 3D com a espiral desenhada por cima.
  - **Sementes nascendo uma a uma** no centro do girassol, girando 137,5°; depois a mesma animação com 120° e 90° (raios e vazios).
  - **Pinha e abacaxi** low-poly com as espirais destacadas.
  - **Concha de náutilo** em corte (câmaras), com uma espiral áurea dourada sobreposta que NÃO encaixa.
- **Mascote:** visitante ao lado do girassol (pequeno, em escala de "maquete"); conta as espirais apontando; pula no ✖ do náutilo; comemora no fecho.
- **Designs novos (folha de design, 1º passo da Fase 2):**
  1. Girassol (com filotaxia real e destaque das duas famílias de espirais).
  2. Casal de coelhos.
  3. Quadrados de Fibonacci + espiral.
  4. Pinha.
  5. Abacaxi.
  6. Concha de náutilo em corte.
- **Já aprovados:** mascote.
- **Selo:** "ESQUEMA" nos quadrados/espiral e na comparação de ângulos.

## 2. Tabela cronológica (estimativa até o TTS)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:18 | 0 - 258 | Conte as espirais de um girassol: trinta e quatro num sentido, cinquenta e cinco no outro. Não é coincidência. | Abertura da fenda sobre o girassol, câmera de frente para o miolo (el 70°, de cima). Em "trinta e quatro", as 34 espirais horárias acendem em laranja com contador; em "cinquenta e cinco", as 55 anti-horárias acendem em azul. Em "coincidência", punch-in. Mascote ao lado acena e aponta. | Girassol, espirais destacadas (2 famílias), contadores 2D, mascote. | `fx.flash(0)`; `spiralsA` 0→1 (W6–W8); `countA` 0→34 (W6–W9); `spiralsB` 0→1 (W11–W13); `countB` 0→55 (W11–W14); `fx.punch(W18)`; `mascot.point(W6)`. | 34 E 55 (info, W11) · NÃO É COINCIDÊNCIA (atenção, grande, W16). Legenda: espirais, girassol, trinta e quatro, cinquenta e cinco, coincidência. |
| 00:08:18 - 00:18:02 | 258 - 542 | São números de Fibonacci: cada um é a soma dos dois anteriores. Um, um, dois, três, cinco, oito, treze. | O girassol desfoca e números grandes 2D aparecem em fila; em "soma", dois números se juntam e geram o próximo (1+1=2, 1+2=3...). Cada número dito acende no ritmo da fala. | Números 2D, "+" e "=", girassol ao fundo. | `seq.show` (W0); `seq.step` 0→7 nos frames de W12…W18 (cada palavra acende um número); `sum.anim` em W8. | SEQUÊNCIA DE FIBONACCI (info, W3) · SOMA DOS DOIS ANTERIORES (info, W8). Legenda: Fibonacci, soma, um, dois, três, cinco, oito, treze. |
| 00:18:02 - 00:25:16 | 542 - 766 | A sequência ficou famosa em 1202, num problema sobre coelhos. Na Índia, já era conhecida séculos antes. | Corte para um gramado low-poly: um casal de coelhos vira 2, 3, 5 casais (contador de casais). Em "Na Índia", um selo 2D "ÍNDIA · SÉCULOS ANTES" aparece sobre um mapa-ícone. | Coelhos, gramado, contador, selo 2D. | `rabbits.n` 1→5 (W7–W9+20, degraus); `india.badge` spring (W11). | 1202 · O PROBLEMA DOS COELHOS (info, W5) · ÍNDIA: SÉCULOS ANTES (info, W11). Legenda: 1202, coelhos, Índia, séculos. |
| 00:25:16 - 00:31:12 | 766 - 942 | Divida um pelo anterior e o resultado se aproxima de 1,618: a proporção áurea. | Divisões 2D aparecem em sequência (2/1=2; 3/2=1,5; 5/3=1,667; 8/5=1,6; 13/8=1,625...), convergindo para 1,618 numa linha que estabiliza. | Divisões 2D, gráfico de convergência. | `ratio.step` 0→6 (W0–W9); `ratio.lock` spring (W10); `fx.flash(W12, 6)`. | → 1,618 (atenção, W10) · PROPORÇÃO ÁUREA (info, grande, W12). Legenda: divida, anterior, 1,618, proporção áurea. |
| 00:31:12 - 00:36:14 | 942 - 1094 | Com quadrados desses tamanhos, dá pra desenhar a famosa espiral. | Quadrados 3D (1, 1, 2, 3, 5, 8, 13) entram um a um em espiral; em "espiral", a linha dourada é desenhada por dentro deles. Câmera recua. | Quadrados de Fibonacci, espiral dourada, selo ESQUEMA. | `squares.n` 0→7 (W0–W5); `spiral.draw` 0→1 (W6–W9+15); câmera dolly-out. | A ESPIRAL DE FIBONACCI (info, W8). Legenda: quadrados, tamanhos, espiral. |
| 00:36:14 - 00:44:22 | 1094 - 1342 | Mas por que o girassol segue isso? Cada semente nova nasce girada cento e trinta e sete graus e meio: o ângulo áureo. | Volta ao girassol, miolo vazio. Em "Cada semente", sementes nascem no centro uma a uma e são empurradas para fora, cada nova girada 137,5° (um transferidor 2D mostra o ângulo nas primeiras). As espirais vão surgindo. | Girassol (miolo regenerando), transferidor 2D, contador de ângulo. | `seeds.grow` 0→1 (W7–fim, linear: n sementes = k·500); `protractor.show` (W12–W19); tema da marca (W20). | POR QUÊ? (atenção, W0) · 137,5°: O ÂNGULO ÁUREO (info, grande, W20). Legenda: girassol, semente, cento e trinta e sete, ângulo áureo. |
| 00:44:22 - 00:51:29 | 1342 - 1559 | Esse ângulo espalha as sementes sem formar raios nem deixar vazios. Com outro ângulo, sobra espaço. | Tela dividida em 3 miolos lado a lado: 137,5° (cheio, espirais), 120° (3 raios com vazios) e 90° (4 raios). Os vazios piscam em vermelho em "sobra espaço". | 3 miolos, rótulos de ângulo, selo ESQUEMA. | `compare.show` (W0); `gaps.flash` (W14); câmera parada com deriva. | 137,5° ✔ (solução, W2) · OUTRO ÂNGULO: ESPAÇO PERDIDO ✖ (problema, W11). Legenda: ângulo, raios, vazios, sobra espaço. |
| 00:51:29 - 00:58:17 | 1559 - 1757 | O resultado são espirais em números de Fibonacci. Nas pinhas e no abacaxi, também. | Girassol completo girando com as duas famílias acesas; em "pinhas", corte para pinha e abacaxi lado a lado, com espirais destacadas (8 e 13). | Girassol, pinha, abacaxi, destaque de espirais. | `spiralsA/B` (W0); corte em W8; `pine.spirals` (W9); `ananas.spirals` (W12). | ESPIRAIS DE FIBONACCI (solução, W3) · PINHA · ABACAXI (info, W9). Legenda: espirais, Fibonacci, pinhas, abacaxi. |
| 00:58:17 - 01:07:03 | 1757 - 2013 | Agora, o mito: a concha do náutilo não é uma espiral áurea. Medida, ela cresce num ritmo bem diferente. | Concha de náutilo em corte girando; uma espiral áurea dourada é sobreposta e não encaixa (escapa da concha); ✖ vermelho. Em "Medida", rótulos "NÁUTILO ~1,33" × "ÁUREA 1,618". O mascote pula. | Náutilo em corte, espiral áurea sobreposta, ✖, rótulos. | `nautilus.show` (W0); `goldenOverlay` 0→1 (W8–W11); `cross` spring (W11); `ratio.labels` (W12); `mascot.jump(W7)`. | O MITO DO NÁUTILO (atenção, W1) · NÃO É ESPIRAL ÁUREA ✖ (problema, W8) · ~1,33, NÃO 1,618 (info, W13). Legenda: mito, náutilo, espiral áurea, ritmo. |
| 01:07:03 - 01:18:00 | 2013 - 2340 | Pronto: agora você sabe. Não é mágica. É só um jeito eficiente de crescer. | Volta ao girassol, câmera orbitando de lado; sementes brilhando em espiral; o mascote comemora e acena. Resumo 2D: "SOMA DOS DOIS ANTERIORES · 137,5° · NÁUTILO: MITO". Encerramento fixo na sequência. | Girassol, mascote, 3 ícones de resumo. | câmera orbit (W0–fim); `summary` springs (W4, W7, W10); `mascot.cheer(W1)`; `mascot.wave(W10)`. | NÃO É MÁGICA: É EFICIÊNCIA (solução, W7). Legenda: pronto, mágica, eficiente, crescer. |

**Soma:** 258 + 284 + 224 + 176 + 152 + 248 + 217 + 198 + 256 + 327 = 2340 frames (78 s) — planejado; a voz real decide e o alvo é ≤ 75 s.

## 3. State / Props

Ver `scene-plan.ts` (10 cenas). Mesmo motor dos vídeos anteriores; linha do tempo determinística.

## 4. Áudio e montagem

**Narração integral (165 palavras):**

Conte as espirais de um girassol: trinta e quatro num sentido, cinquenta e cinco no outro. Não é coincidência. São números de Fibonacci: cada um é a soma dos dois anteriores. Um, um, dois, três, cinco, oito, treze. A sequência ficou famosa em 1202, num problema sobre coelhos. Na Índia, já era conhecida séculos antes. Divida um pelo anterior e o resultado se aproxima de 1,618: a proporção áurea. Com quadrados desses tamanhos, dá pra desenhar a famosa espiral. Mas por que o girassol segue isso? Cada semente nova nasce girada cento e trinta e sete graus e meio: o ângulo áureo. Esse ângulo espalha as sementes sem formar raios nem deixar vazios. Com outro ângulo, sobra espaço. O resultado são espirais em números de Fibonacci. Nas pinhas e no abacaxi, também. Agora, o mito: a concha do náutilo não é uma espiral áurea. Medida, ela cresce num ritmo bem diferente. Pronto: agora você sabe. Não é mágica. É só um jeito eficiente de crescer.

**Encerramento fixo:** "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!"

**Efeitos:** pop (cada número/semente), tick, ding, shimmer, glow, buzz, thud, final; novos: `seed-pop` (estalinho suave em cascata), `bunny-hop` (pulinhos).

**Trilha:** paleta `natureza`. INTENTS: curious, curious, calm, build, reveal, curious, tense, reveal, tense, resolve.

## 5. Verificação de fatos

| Afirmação | Situação | Fonte |
| --- | --- | --- |
| Espirais do girassol vêm em pares de Fibonacci consecutivos (34/55 é comum; também 21/34, 55/89) | confirmado ("quase sempre") — dizemos "trinta e quatro num sentido, cinquenta e cinco no outro" como exemplo real | Maths is Fun; GeoGebra; groupoids.org.uk |
| Cada termo é a soma dos dois anteriores | definição | — |
| Liber Abaci (1202), problema dos coelhos | confirmado | Wikipedia (Fibonacci); Brown Univ. |
| Na Índia, a sequência já aparecia séculos antes (Pingala/Virahanka/Hemachandra) | confirmado em fontes de referência; dizemos só "séculos antes", sem datas exatas (variam) | Wikipedia (Fibonacci sequence) |
| A razão entre termos consecutivos tende a 1,618… (proporção áurea) | matemática | — |
| Ângulo áureo ≈ 137,5° = 360°·(1 − 1/φ) | matemática; confirmado | Avondo; vectree |
| Esse ângulo espalha as sementes sem raios e com boa ocupação | confirmado como explicação padrão; ressalva: um modelo de 1982 achou um ângulo racional próximo que empacota um pouco melhor, então NÃO dizemos "o melhor possível", só "sem raios nem vazios" e "sobra espaço" com outros ângulos (120°, 90°) | GeoGebra; ci47 (Ridley 1982) |
| Pinhas e abacaxis também mostram contagens de Fibonacci | confirmado em fontes de divulgação | Maths is Fun; JW (Intriguing Patterns) |
| Náutilo não é espiral áurea: medido ~1,33 (Falbo 1999, faixa 1,24–1,43); Bartlett achou 1,31 | confirmado | Science News; Springer (Bartlett 2018); God Plays Dice |

**Cortado de propósito:** "Mona Lisa / Partenon na proporção áurea" (mito também, mas alongaria) e "galáxias e furacões são Fibonacci" (falso; fica para outro vídeo).

## 6. Critérios de aceite

- Gancho em 3 s com o girassol sendo contado.
- A filotaxia é REAL no modelo (ângulo 137,5°, contagens 34/55 visíveis no destaque).
- Comparação de ângulos mostra o contraste lado a lado (regra da prova).
- O mito do náutilo é mostrado com a espiral áurea NÃO encaixando.
- Duração ≤ 75 s depois do TTS (corto pausas se precisar).
- Nada foi renderizado, ouvido ou validado nesta fase.

## 7. Pontos fracos (honestos)

- **Duração no limite:** o orçamento estimou 79 s; a voz real costuma vir uns 6% mais curta (~74 s). Se passar, corto pausas.
- **Muita informação:** sequência, razão, espiral, ângulo, pinha e mito em ~75 s. As cenas 4 e 5 (razão e quadrados) são as mais "aula"; se a retenção pedir mais corte, elas viram uma cena só.
- **Contar 34 e 55 espirais no modelo** exige filotaxia real — faço por código, mas o destaque das famílias precisa ficar legível no celular.
- **6 designs novos** (girassol, coelhos, quadrados, pinha, abacaxi, náutilo).
- **Não ouvi nada:** pronúncia de "Fibonacci" e de "1,618" a conferir.

## Fontes

- Maths is Fun — Nature, The Golden Ratio and Fibonacci: https://mathsisfun.com/numbers/nature-golden-ratio-fibonacci.html
- GeoGebra — Sunflowers and Special Numbers: https://mat.geogebra.org/m/ZhbTtnb9
- groupoids.org.uk — Flower Patterns and Fibonacci Numbers: https://groupoids.org.uk/popmath/cpm/rpamaths/rpampages/sunflower.html
- Wikipedia — Fibonacci sequence: https://en.wikipedia.org/wiki/Fibonacci_sequence
- Wikipedia — Fibonacci: https://en.wikipedia.org/wiki/Fibonacci
- Science News — nautilus e proporção áurea: https://www.sciencenews.org/?p=26206
- Bartlett (2018), Nexus Network Journal: https://link.springer.com/10.1007/s00004-018-0419-3
- God Plays Dice — Nautilus shells aren't golden spirals: https://godplaysdice.blogspot.com/2008/09/nautilus-shells-arent-golden-spirals.html
