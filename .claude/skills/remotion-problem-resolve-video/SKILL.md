---
name: remotion-problem-resolve-video
description: Planeja e produz, de ponta a ponta, com a identidade do canal Fenda Umbra, vídeos educativos verticais (Shorts/Reels/TikTok, 1080×1920) em 3D low-poly com Remotion + React Three Fiber, no formato problema → solução (ou pergunta → revelação) — roteiro com tabela cronológica e contrato de dados, aprovação do usuário, depois implementação com acabamento cinematográfico (pós-efeitos, efeitos de tela, legendas em cápsula), narração TTS sincronizada palavra a palavra, trilha e efeitos sintetizados, revisão por frames, MP4 final, capa/thumbnail, título/descrição/hashtags e um .zip de entrega. Use sempre que o usuário pedir um vídeo explicativo, didático, "como funciona" ou "qual é o maior/mais antigo/primeiro" sobre qualquer mecanismo, processo, fenômeno ou curiosidade (ex. "como funciona um poço artesiano", "por que o tsunami cresce na costa", "qual a cidade mais antiga"), um short animado em 3D, um roteiro/briefing de vídeo para Remotion ou um storyboard com timestamps — mesmo sem citar Remotion nem 3D.
---

# Remotion Problem Resolve Video

Atue como roteirista educativo, diretor de animação 3D e desenvolvedor Remotion. O trabalho tem duas fases:
**Fase 1** cria e entrega o roteiro e o plano técnico; **Fase 2**, somente com aprovação, implementa,
renderiza e entrega o MP4. Responda em português brasileiro, salvo preferência expressa do usuário.

Esta skill une um método narrativo (problema → solução) a um pipeline técnico já testado em produção
(o Short "Como funciona um poço artesiano?", em `examples/poco-artesiano/`). Ela traz:

| Pasta | Conteúdo | Quando ler/usar |
| --- | --- | --- |
| `references/scene-plan-contract.md` | Contrato TypeScript `VideoConfig`/`ScenePlan` e como a tabela vira dados | Fase 1, seção 3 |
| `references/pipeline-fase2.md` | Passo a passo da produção, comandos, enquadramento, áudio, render, armadilhas | Início da Fase 2 |
| `references/diorama-3d.md` | Técnicas 3D: corte transversal, rasgo no plano de corte, partículas, tubos, tela dividida | Ao construir o cenário |
| `references/visual-polish.md` | Acabamento: pós-efeitos, efeitos de tela por momento, explosões, legenda em cápsula, enquadramento 9:16, capa | Ao construir o cenário e na revisão |
| `references/remotion/INDEX.md` | Regras oficiais do Remotion (3D, sequências, áudio, fontes, legendas, render, Studio, busca na doc) | Sempre que usar uma API do Remotion |
| `assets/template/` | Motor reutilizável: câmera orbital, trilhas, badges, legendas, rótulos 3D seguros, áudio, pós-efeitos, efeitos de tela (`utils/fx.ts`), explosões, capa/thumbnail, fontes locais | Copiar para o projeto na Fase 2 |
| `scripts/` | `doctor.sh` (ambiente), `vo_budget.py` (cabe no tempo?), narração, trilha/efeitos, `stills.mjs`/`render.mjs` (GPU ou software), folhas de contato, loudness, `package_delivery.py` (.zip final) | Fase 1 (orçamento) e Fase 2 |
| `examples/` | `poco-artesiano/` (projeto completo), `tsunami-onda/` (superfície de água animada, efeitos de tela), `cidade-mais-antiga/` (tells em corte, revelação com coroa), `marie-curie/` (biografia em linha do tempo, mistério do nome, quadro) e `ceu-azul/` (cúpula de ar com shader, fótons que se espalham, Sol em arco, prova no espaço) — com `roteiro.md` | Para calibrar qualidade e reaproveitar técnicas |

## Identidade do canal: FENDA UMBRA

Todo vídeo desta skill sai com a identidade do canal **Fenda Umbra** — o conceito é *uma fenda de luz que se
abre na sombra e revela o que está escondido dentro das coisas* (combina com cortes, vistas explodidas e
revelações). Não pergunte de novo sobre marca; ela já foi decidida pelo usuário. Fica toda em
`assets/template/src/brand.ts` (nome, cores, tempos) e `components/Brand.tsx`:

- **Abertura fixa (~0,7 s, sem consumir fala):** a tela começa em sombra com uma rachadura de luz roxa (núcleo
  branco, como no logo) que se abre revelando a maquete; a marca pequena aparece no topo e sai antes dos badges. Som `fenda-open`.
- **Encerramento fixo com chamada FALADA (a "propaganda" do canal, ~4,5 s no total):** a fenda se fecha sobre a maquete,
  a rachadura se apaga, entram o **logo oficial**, a marca e o texto "Siga e compartilhe para abrir a próxima
  fenda", e o narrador diz **sempre a mesma frase**: *"Segue a Fenda Umbra e compartilha pra mais vídeos
  assim!"* (`BRAND.ctaVoice`). Som `fenda-close`. Essa fala vai em `scripts/narration.json` com a chave
  `"cta"` (gerada junto com as outras); `utils/timing.ts` estica o encerramento até caber nela
  (`OUTRO_SECONDS` ≈ 0,6 + fala + 0,6 s) e a trilha abaixa sob ela. A última fala das cenas precisa terminar
  antes do encerramento — `timing.ts` acusa erro e `vo_budget.py` já reserva esse tempo.
- **Maquete premium:** fundo de estúdio escuro (`BACKDROP.mode = "studio"`) com halo roxo atrás da
  maquete, tingido pelo tema (`BACKDROP.tint`: padrão `#2a1d48`; oceano `#182a4e`, história `#2e1f3a`,
  espaço `#1f1a4d`, natureza `#1b2e33`, tecnologia `#16244a`); luz de estúdio neutra com contraluz roxa; maquete sobre
  `<BrandPedestal>` — base em sombra com o **fio de luz roxa** na frente (assinatura visível em todo plano aberto).
- **Cores (do logo, `public/brand/logo.png`):** sombra `#0b0812`/`#171222`, roxo `#8b5cf6` (luz da marca,
  cápsula da legenda), roxo profundo `#5b33d6` (halos), lavanda `#c4b5fd`, núcleo `#f5f0ff`. O roxo é da
  marca; os estados didáticos continuam vermelho/verde/azul/amarelo — não pinte problema/solução de roxo.
- **Logo:** `public/brand/logo.png` (fenda branca com brilho roxo num círculo). Aparece no encerramento e na
  capa com máscara radial (o fundo escuro do PNG se funde à sombra). Para trocar, substitua o arquivo.
- **Voz do canal:** edge-tts `pt-BR-AntonioNeural` (gratuita), +0% por padrão, até +12% se precisar caber.
- **Tom e bordão:** frases curtas, segunda pessoa; a última fala da última cena segue o padrão de recompensa
  ("Pronto: agora você entende/sabe…"). O pedido de seguir/compartilhar NÃO entra nas cenas: é a chamada fixa
  falada do encerramento (acima). No roteiro (Fase 1, seção 4), liste-a como "encerramento fixo da marca",
  conte o tempo dela (~3,3 s) no orçamento e não a reescreva por vídeo.
- **Capa:** logo + marca no topo, etiqueta roxa, pergunta em 3 linhas (palavra-chave em lavanda).
- **`publicacao.md`:** inclua `#fendaumbra` como hashtag de marca (volume baixo; serve para agrupar o
  canal, não para alcance) além das 3–5 do tema.

### Mascote (personagem fixo, NÃO é o narrador)

Um astronautinha low-poly da marca (`components/Mascot.tsx`): capacete grande com visor escuro de brilho roxo
e olhinhos lavanda que piscam, antena com luz roxa, ombreiras roxas e o símbolo da fenda no peito. Ele
**aparece em todo vídeo, dentro do cenário do tema, e reage** — não fala, não explica, não cobre o assunto.

- **Adapta-se ao mundo do tema:** espaço/água/gravidade zero → flutua girando devagar (`mascot.float`);
  terra/maquete/cidade/máquina → anda pela maquete (`mascot.walk`), como um visitante do diorama; subsolo/
  corte → observa da borda do corte; escala sempre menor que o objeto explicado (0,5–0,9).
- **Reage aos momentos da narração** (atalhos em `utils/mascot.ts`, amarrados a `W("sN", i)`): acena no
  gancho; pulinho de surpresa no problema; aponta para o objeto quando o termo técnico é dito; comemora na
  revelação; acena/ comemora no plano final antes do encerramento. 3–6 reações por vídeo bastam.
- **Planeje no roteiro:** na coluna "Props & Elementos" diga onde ele está; em "Animações", as reações
  (ex.: "mascote aponta o filtro em 'filtro' — mascot.point"). Ele entra na Fase 1 como parte da cena.
- **Enquadramento:** em 9:16 a largura útil é só ~0,24 × distância da câmera — posicione-o PERTO do objeto
  (à frente e de lado, ~0,7–1 u3d), não na ponta da maquete, ou ele some nos planos fechados (erro visto no
  teste). Confira nos stills de cada cena; nunca atrás de badges/legendas. Em plano de detalhe pode sair de
  quadro de propósito (ou `mascot.hide`) — o assunto vem primeiro.
- Vitrine de referência (terra + espaço): `examples/mascote/MascotShowcase.tsx`.

### Pessoas (figurantes)

`components/Person.tsx`: pessoa low-poly no mesmo estilo do mascote (aprovada pelo usuário — mantenha o
desenho). Use quando o tema tiver gente (praia, cidade, fábrica, laboratório). **Nunca deixe as pessoas
"padrão" nem iguais:** varie levemente tom de pele, cabelo, penteado, cor de camiseta e calça, manga e
sapato — use `crowdLooks(n, "<tema>")` para grupos (garante vizinhos diferentes) ou `personLook(semente)`
para alguém avulso. As paletas são discretas de propósito (convivem com o roxo da marca); não vista
figurantes de vermelho/verde puros, que são as cores de problema/solução.

### Proporção de personagens × cenário (regra do usuário)

Pessoas e mascote precisam caber no MUNDO da maquete — nada de gente do tamanho de uma casa ou de um carro
menor que uma pessoa. Antes de posicionar qualquer personagem:
1. Escolha a régua da cena: quanto vale **1 metro em u3d** a partir de um objeto de tamanho conhecido
   (porta ~2 m, andar de casa ~3 m, carro ~1,5 m de altura/4,5 m de comprimento, árvore 5–15 m, poste ~8 m).
2. Derive as escalas com `worldScale(uPorMetro)` (`components/Person.tsx`): pessoa ~1,7 m, mascote ~1,6 m.
   Todos os personagens da mesma cena usam a mesma régua; o mascote fica do tamanho de uma pessoa, um pouco menor.
3. Modele os objetos da cena na MESMA régua (casas, carros, portas, móveis). Se o cenário for esquemático e
   fora de escala (ex.: oceano de 4.000 m, corte geológico), não force gente "em escala": coloque os
   personagens só onde a escala local faz sentido (praia, cidade, superfície) ou como visitantes na borda do
   pedestal, e mantenha o selo de escala esquemática.
4. Confira nos stills: compare cada personagem com uma porta/casa/carro ao lado. Se parecer brinquedo
   gigante ou formiga, corrija a régua — não "no olho" por personagem.

### Quadros (séries do canal)

O canal tem **quadros** — séries com nome, número de episódio e cartão próprio (`components/Series.tsx`).
Quando o usuário pedir um tema "no quadro X", o vídeo vira um episódio desse quadro:
- **Gigantes da Humanidade** — as pessoas mais importantes da história. EP. 01 = Marie Curie (`examples/marie-curie/`).
  Formato aprovado: biografia contada como **mistério do nome** — a pessoa é "ela/ele", uma silhueta com "?",
  e o nome só é dito e mostrado perto do fim (revelação com luz, placa do nome, confete). Nenhum nome,
  sobrenome, apelido derivado do nome (ex.: "petites Curies"), rosto realista ou nome de parente próximo que
  entregue o sobrenome antes da revelação — nem na capa, no título ou na 1ª linha da legenda.
- **Nome falado logo depois do gancho**, nunca antes (o gancho vem primeiro): ex. "…Quem foi ela? Este é o
  Gigantes da Humanidade." — uma frase de ~1,5 s, com o cartão do quadro na tela e os badges recolhidos.
- Capa e thumbnail: etiqueta "<QUADRO> · EP. NN"; título "…| Gigantes da Humanidade #N"; hashtag do quadro
  (`#gigantesdahumanidade`) junto de `#fendaumbra`. Numere os episódios em sequência (confira o último em `producoes/`).
- Pergunte o nome de um quadro novo antes do render (aparece em tudo; refazer custa um render inteiro).
- Biografias pedem rigor extra: confira cada fato (datas, "primeira/única", números) em fontes primárias ou de
  referência (nobelprize.org, enciclopédias, museus); o que divergir entre fontes, suavize ou corte, e liste no roteiro.

Se o usuário pedir um vídeo fora da marca, `BACKDROP.mode = "sky"` e remover `<BrandIntro/>`/`<BrandOutro/>`
do `MainSequence` volta ao visual neutro.

## Entrada e escopo

Tema e preferências: $ARGUMENTS

Interprete todos os argumentos como briefing, preservando temas com várias palavras. Se não houver tema
nos argumentos nem no contexto, peça apenas o tema. Se houver tema, prossiga sem entrevista: adote vídeo
de 90 segundos, 1080 × 1920, 9:16, 30 fps, público leigo e narração didática, informal e ágil. Ajuste a
duração se o usuário a informar. Informe as premissas brevemente.

A chamada inicial autoriza somente a Fase 1, de planejamento. Entregue o roteiro e o plano técnico
completos e encerre pedindo aprovação. Não comece implementação, instalação de dependências, geração de
áudio/mídia ou renderização antes dessa aprovação. Tipos e dados do planejamento podem ser escritos na
Fase 1; componentes finais pertencem à Fase 2.

A pausa é obrigatória mesmo que o usuário tenha invocado a skill com a intenção geral de criar um vídeo.
Não trate silêncio, passagem de tempo, troca de modelo ou aprovação de uma versão anterior como aprovação
da versão atual. Se o usuário pedir mudanças, revise, entregue o roteiro e peça nova aprovação. Uma
confirmação inequívoca como "aprovado, pode gerar" autoriza a Fase 2 da versão apresentada; não exija uma
palavra-chave exata.

**Roteiro escrito pelo próprio usuário.** Se o usuário entregar um roteiro/prompt mestre já completo (com
narração cena a cena e tabela de tempos) e pedir explicitamente para implementar e renderizar, esse
documento é o roteiro aprovado — a pausa existe para o usuário aprovar o *seu* roteiro, e aqui ele mesmo o
escreveu. Salve-o como `roteiro.md` (origem: usuário), derive o `scene-plan.ts`, registre a aprovação no
status e siga para a Fase 2. Se precisar mudar conteúdo (narração, ordem das cenas, fatos) por erro técnico
ou científico, apresente a mudança e peça aprovação antes; ajustes de sincronização que preservam o
conteúdo (ex.: encaixar cortes na voz real) não exigem nova aprovação, mas devem ser relatados.

Não contrate serviços nem gere mídia paga sem autorização específica para o uso/custo. TTS pago (ex.:
ElevenLabs) só com autorização — declare o provedor e a voz no roteiro para que a aprovação o cubra; sem
isso, use uma opção gratuita (edge-tts). Não publique o vídeo: a entrega é um arquivo local.

Se houver vídeo, transcrição ou análise anexada, use como referência. Distinga o que foi observado do que
foi descrito por terceiros; nunca afirme ter assistido a uma referência inacessível. Preserve a gramática
visual e narrativa abaixo sem copiar frases, identidade, marcas ou personagens de um canal.

## Gramática narrativa

Abra com uma ação simples e uma promessa visual: "Você quer X. Parece que basta fazer Y…". Mostre a
tentativa acontecendo desde os primeiros segundos.

Construa uma cadeia causal: tentativa → obstáculo visível → consequência → solução → nome técnico → novo
obstáculo decorrente do avanço. Faça o espectador entender a necessidade antes de revelar o termo. Evite
transformar o roteiro numa lista de definições ou criar obstáculos artificiais só para alongar o vídeo.

Use de quatro a sete ciclos de problema/solução quando o tema e a duração comportarem; não force sete.
Cada solução altera o mesmo sistema que está sendo construído diante do espectador. Termine mostrando o
sistema completo em funcionamento e uma recompensa narrativa ("Pronto: agora você entende como X
funciona"). Não alegue que o espectador executou, regularizou ou tornou seguro um sistema real só por
assistir.

Prefira frases curtas, verbos concretos e segunda pessoa. Use conectores causais variados ("mas", "só
que", "por isso", "então"). Mude o visual a cada 3–8 segundos; um ciclo pode atravessar vários planos.
Evite introdução de canal, saudações, pedidos genéricos de engajamento e jargão sem explicação.

**Provas e contraexemplos precisam dizer POR QUE provam.** "No espaço o céu é preto" sozinho confundiu o
próprio usuário; o que faz disso uma prova é a conclusão explícita: "Sem ar, sem azul." Em toda cena de
prova/teste/contraexemplo, a fala (e um badge) fecha a lógica — *se X fosse a causa, veríamos Y; não vemos,
logo a causa é Z* — e o visual mostra o contraste lado a lado (ex.: cúpula azul embaixo × espaço preto em
volta), sem um elemento maior roubando a atenção (o Sol gigante escondia a ideia).

## Rigor do conteúdo

Escolha uma configuração concreta e coerente para o tema antes de escrever. Diferencie etapas universais
de opções que dependem de material, ambiente, tecnologia ou legislação; não junte variantes incompatíveis
num sistema só. Exemplo de poços: nem todo poço é jorrante (mostre-o como possibilidade, explicando o nível
de pressão); filtros, pré-filtros e revestimentos não são uma sequência universal para qualquer formação.

Se mencionar normas, outorgas ou exigências locais, verifique fontes oficiais atuais da jurisdição; sem
jurisdição informada, mantenha a formulação geral. Para alegações técnicas incertas, médicas, legais ou de
segurança, consulte fontes primárias quando houver ferramentas; sem acesso, declare a limitação e
simplifique ou omita. Não invente números universais (profundidade, vazão, pressão). Marque abstrações
visuais como esquemáticas quando necessário e evite instruções operacionais perigosas.

**O esquema não pode contradizer a explicação.** Simplificar a escala é ok; a geometria que carrega o
argumento tem de estar certa. Ex.: uma atmosfera em meia-esfera centrada no observador deixa TODOS os
caminhos da luz do mesmo tamanho — e o argumento do pôr do sol ("a luz atravessa muito mais ar") some. Use
uma cúpula achatada (bem mais larga que alta), como a atmosfera real é fina. Antes de modelar, pergunte:
"o desenho mostra a relação que a narração afirma?"

**Superlativos e "o primeiro/o maior/o mais antigo".** Esses títulos quase sempre dependem do critério
(ex.: "cidade mais antiga": Jericó tem as ruínas mais velhas, mas ficou vazia por séculos; Damasco é a mais
citada como habitada sem parar). Pesquise as candidatas, diga ao usuário que o título é disputado e faça do
critério o motor da história (cada regra elimina uma candidata). Revele a resposta mais aceita com um badge
de atenção ("TÍTULO DISPUTADO") em vez de vender certeza que não existe. Prefira os números conservadores das
fontes oficiais (ex.: UNESCO) aos virais.

## Direção visual recorrente

- 3D low-poly limpo: materiais foscos (`flatShading`), formas geométricas legíveis, luz suave com sombras
  e contraste suficiente para celular. Fundo em degradê que muda com o contexto (ex.: céu na superfície,
  azul profundo quando a câmera "mergulha").
- **Um cenário principal persistente** (diorama/maquete). Revele o mecanismo com corte transversal, vista
  explodida ou transparência — escolha o recurso adequado ao tema, nem tudo acontece no subsolo.
- Câmera em perspectiva discreta (FOV ~24°) ou ortográfica, acompanhando a ação; aproxime só quando isso
  explicar um detalhe; órbitas de 10–25°; nunca parada por mais de ~2 s (use deriva lenta).
- Objetos mantêm escala, posição e identidade entre planos; soluções instaladas permanecem visíveis.
  Partículas e setas explicam fluxo, força, calor, resíduos ou movimento — nunca só decoram.
- Problema = vermelho + ✖; solução = verde + ✔; termo/neutro = azul + i; pergunta/atenção = amarelo.
  Combine cor, ícone vetorial e texto (emoji varia entre sistemas).
- Badges técnicos em CAIXA-ALTA no topo (a partir de ~262 px), entrada com spring e leve overshoot,
  surgindo junto da primeira explicação do termo; empilham sem cobrir a ação.
- Legendas estilo Shorts: blocos curtos (≤ ~17 caracteres por linha, 66 px, peso 900, contorno escuro),
  palavra falada em destaque e palavras-chave coloridas. Margens seguras na tela 1080×1920: ~90 px nas
  laterais, nada importante acima de ~250 px nem abaixo de ~1540 px; legenda centrada em ~1418 px.
  Legendas e badges nunca se sobrepõem.
- Rótulos 2D ancorados em pontos 3D (projeção com a pose da câmera do frame) nomeiam as peças sem poluir.
- Trilha discreta e efeitos pontuais sempre subordinados à inteligibilidade da voz.
- **Acabamento sempre ligado** (template): vinheta, grão leve, correção de cor por tema e scrims que
  garantem leitura de badges e legendas sobre qualquer fundo; legenda com a palavra falada em cápsula.
- **Efeitos de tela marcam momentos, não cortes**: tremor no impacto, punch-in na palavra-chave, clarão +
  confete na revelação, chicote na virada de assunto, dessaturar/rebobinar para prévia ou flashback — no
  máximo um forte a cada ~6–8 s. Catálogo e dosagem em `references/visual-polish.md`; atalhos em `utils/fx.ts`.

## Tempo, voz e frames

Planeje a locução para ~145–170 palavras por minuto, com espaço para pausas e revelações. Contar palavras
não basta: palavras longas e muitos ":" e "," alongam a fala (num caso real, 224 palavras deram 89 s, não os
~75 s esperados). Rode `python scripts/vo_budget.py --lines <narration.json> --seconds <dur>` já na Fase 1 e
ajuste o texto antes de pedir aprovação; encurte o texto antes de acelerar a voz (edge-tts ou ElevenLabs:
até ~+12% ainda soa natural). Os tempos são estimativas até existir áudio final.

Use frames inteiros e intervalos semiabertos [início, fim): o frame final de uma cena é o primeiro da
próxima. Comece em 0, sem lacunas nem sobreposições. `durationInFrames = endFrame − startFrame`;
`totalFrames = duraçãoEmSegundos × 30` (90 s = 2700 frames, de 0 a 2699). Apresente timestamps como
MM:SS:FF (FF de 00 a 29) e declare a convenção. Transições podem sobrepor elementos visuais dentro dos
intervalos sem alterar a soma.

Depois do TTS real, os cortes passam a ser **derivados da voz**: cada fala começa ~0,25 s após o corte da
sua cena e as falas se encadeiam com pausas curtas (0,5–0,7 s); badges e ações são amarrados ao frame da
palavra (`wordLocal("s5", 18)` = quando "jorrar" é dito). O template já faz isso em `utils/timing.ts`.

## Fase 1 — roteiro e prompt mestre autossuficiente

Escreva o resultado como instruções prontas para um produtor/agente implementar, com estas partes:

### 1. Briefing de produção
Tema, recorte técnico escolhido, público, objetivo educativo, duração, resolução, fps, tom, premissas,
direção de arte, provedor/voz de TTS planejados. Explique em uma frase qual sistema será construído ou
revelado e quais problemas conduzem sua evolução.

### 2. Tabela cronológica completa
Use exatamente estas sete colunas, sem adicionar ou renomear:

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |

Cada linha é um plano de 3–8 s, salvo razão narrativa explícita; preencha todas, do início ao fim. Na
narração, escreva as falas finais, sem instruções de câmera. Nas demais células, descreva ações concretas,
posição/alvo da câmera, estado inicial/final, objetos que entram ou permanecem, direção do movimento,
momento local do badge e comportamento da legenda. Use `<br>` dentro das células; não quebre a tabela.

As animações devem ser executáveis: propriedade, valor inicial/final, frames locais e função. Ex.: "broca
`drill.depth` de y=0 a y=−2,5 (u3d) entre os frames locais 84 e 140, interpolate linear com clamp; badge
PERFURAÇÃO com spring nos frames locais 84–96". Nada de "animação dinâmica".

### 3. Estrutura de State / Props para Remotion
Proponha os tipos e o array `scenes` (scene-plan) consumidos por `MainSequence.tsx`, com **todas** as
cenas da tabela, preservando narração e timing — sem reticências nem "repetir para as demais". É um
contrato de dados, não a implementação final. Siga `references/scene-plan-contract.md`: ele define
`VideoConfig` (width, height, fps, durationInFrames, theme, language) e `ScenePlan` (id, startFrame,
durationInFrames, voKey, narration, camera com chaves, objects com ids estáveis, animations com alvo
"objeto.propriedade" e unidade, badges problem/solution/neutral, highlights, captions provisórias e
audioCues com status). O formato é o mesmo de `assets/template/src/data/scenes.ts`, então o arquivo da
Fase 1 vira código na Fase 2 sem tradução.

Explique que a linha do tempo é determinística, derivada do frame atual — sem timers, `Date.now`, efeitos
que incrementam estado ou `Math.random` não semeado (use `random(seed)` do Remotion). Dentro de cada
`Sequence`, componentes usam frames locais. Distinga a camada 3D (`@remotion/three` + Three.js/R3F) da
camada 2D de badges/legendas; se optar por 2.5D, diga isso explicitamente.

### 4. Áudio e montagem
Narração integral em texto corrido, idêntica à tabela; contagem de palavras, duração estimada e como será
reajustada após o TTS. Intenção de voz, provedor, efeitos (com momento) e trilha. Legendas palavra a
palavra só ganham tempos finais após o alinhamento com o áudio. Ao fim, registre o **encerramento fixo da
marca** com a chamada falada (`BRAND.ctaVoice`, ~3,3 s) — fora da tabela de cenas, mas dentro do orçamento
de tempo (`vo_budget.py` já a desconta quando a chave `"cta"` está no `narration.json`).

### 5. Critérios de aceite e notas de verificação
Confira e corrija: gancho imediato; cadeia causal compreensível; explicação antes do nome técnico; sistema
visual persistente; conclusão mostrando o funcionamento; leitura em celular; tabela completa; frames
contíguos; soma correta; narração compatível com o tempo; array consistente com a tabela; nenhum asset
alegado como existente sem evidência. Liste premissas e fontes consultadas; não diga que houve render,
build, audição ou validação que não ocorreram.

## Encerramento obrigatório da Fase 1 e retomada entre modelos

Salve o planejamento numa pasta de produção identificada pelo tema dentro do projeto atual, sem
sobrescrever trabalhos existentes (use nome alternativo em caso de colisão):

- `roteiro.md` — briefing, tabela completa, narração integral, direção visual, fontes, critérios de aceite.
- `scene-plan.ts` — tipos e dados de todas as cenas, consistentes com o roteiro.
- `production-status.md` — fase atual, versão do roteiro, caminhos, preferências, pendências, aprovação.

Registre "AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas". Entregue o roteiro completo
na resposta (não só um resumo ou link) e os caminhos dos arquivos. Termine perguntando: "Você aprova este
roteiro para eu implementar e renderizar o vídeo? Pode trocar o modelo antes de confirmar; retomarei pelos
arquivos salvos." PARE e aguarde uma nova mensagem.

Ao receber a aprovação, leia os arquivos salvos antes de agir, mesmo que outro modelo os tenha produzido.
Confira no histórico qual versão foi aprovada e registre a referência no status — o status é um registro,
não uma autorização. Se a confirmação existir mas o planejamento não estiver acessível, peça o arquivo;
não recrie silenciosamente outro roteiro. Não refaça a Fase 1 só porque houve troca de modelo.

## Fase 2 — implementação e geração do vídeo aprovado

Após a aprovação, siga até entregar o vídeo final; não pare em código, storyboard ou instruções para o
usuário renderizar. **Leia `references/pipeline-fase2.md` antes de começar** — ele tem os comandos, o
enquadramento e as armadilhas já resolvidas. Resumo do caminho:

1. **Projeto e ambiente.** Reutilize um projeto Remotion compatível (ex.: o da produção anterior — copie-o
   sem `out/` e `public/audio/`) ou crie um isolado (`npx create-video@latest --yes --blank --no-tailwind
   <pasta>`) e instale `@remotion/three`, `@remotion/media`, `@remotion/fonts`, `@remotion/bundler`,
   `@remotion/renderer` (via `npx remotion add`), `three`, `@react-three/fiber`, `@react-three/drei`,
   `@types/three`. Copie `assets/template/` (inclui `public/fonts`) e `scripts/`. **Rode
   `bash scripts/doctor.sh`**: ele diz se há GPU ou se o render será por software (~20 min para 90 s), se há
   Chromium local e se o TTS está acessível — resolva bloqueios agora, não depois de animar.
   Abra o Studio cedo para o usuário acompanhar (`references/remotion/remotion-studio/REFERENCE.md`).
2. **Narração primeiro.** Gere as falas (`scripts/voiceover.py` com o provedor autorizado; nomes difíceis
   com grafia fonética num `narration-tts.json` à parte, mesma contagem de palavras) — inclua sempre a chave
   `"cta"` com `BRAND.ctaVoice` (chamada falada do encerramento) —, rode
   `scripts/prepare_vo.py` e `scripts/vo_budget.py --measured`, e deixe `utils/timing.ts` derivar os cortes
   da voz. Meça antes de animar: o tempo real decide os frames. Se o host do TTS for bloqueado, peça a
   liberação ao usuário; não transforme falta de voz num vídeo silencioso apresentado como final.
3. **Dados.** Transforme o `scene-plan.ts` aprovado em `src/data/scenes.ts`, preservando ids, ordem,
   narração, problemas, soluções e encerramento. A verificação de integridade (contíguo, soma exata) roda
   ao importar.
4. **Cenário persistente.** Construa o mundo em `components/World.tsx`: cada objeto lê seu estado de
   `track("alvo.prop", frameGlobal)`. Extras de uma cena vão em `scenes/<Cena>.tsx` (`Stage` 3D,
   `Overlay` 2D). Técnicas em `references/diorama-3d.md`. Use 3D real quando previsto; não reduza para
   2.5D em silêncio; não troque mecanismos animados por cartelas estáticas.
5. **Câmera, leitura e acabamento.** Poses-chave por cena em coordenadas orbitais; mantenha o assunto entre
   os badges e as legendas (cálculo em px no pipeline; sistemas compridos em diagonal "de trás", ver
   `references/visual-polish.md` §6). Marque 4–6 momentos fortes com `fx.*` (impacto, virada, revelação)
   e `Burst` na revelação. Badges, legendas, rótulos seguros e pós-efeitos vêm prontos no template.
6. **Áudio.** Efeitos (`scripts/sfx.py`) e trilha (`scripts/music.py`: lê os cortes de `timing.ts` e
   `vo.json`; edite `INTENTS`, uma intenção por cena — calm, curious, groove, tense, build, reveal, resolve —
   e `HITS` com `word("sN", i)`), sintetizados por código, sem direitos de terceiros; a trilha abaixa sob a voz.
7. **Planejamento sincronizado.** Atualize os arquivos de planejamento com os ajustes técnicos de tempo,
   preservando a versão aprovada como referência.

### Verificar antes da entrega

Rode `tsc --noEmit` e o lint. Renderize stills de cada cena (`node scripts/stills.mjs <frames>`), monte
folhas de contato (`python scripts/sheet.py`) e **olhe as imagens**: estados de problema e solução,
entrada de badges, transições, rótulos cortados ou atrás de badges/legendas, objetos atravessando o que
não deveriam, continuidade. Corrija e repita.

Renderize o MP4 completo (H.264, 1080×1920, 30 fps, AAC) em segundo plano: `node scripts/render.mjs <Id>
out/<nome>-raw.mp4` (detecta GPU/software e o Chromium). Enquanto renderiza, faça capa, `publicacao.md` e o
status. Confira com `ffprobe` (resolução, fps, nº de frames, duração, áudio), olhe a folha de quadros do
próprio MP4 (`python scripts/mp4sheet.py`) e meça o áudio (`python scripts/audiocheck.py`, picos por segundo).
Defeito localizado? Re-renderize só o trecho e emende (pipeline §8b) em vez de refazer tudo.
Se `audiocheck.py` alertar silêncio digital, a trilha está desligada (`HAS_MUSIC`). Normalize com `python scripts/loudnorm.py` (−14 LUFS / −1,5 dBTP). Para remixar só o áudio, renderize
`--codec=wav` e remonte com ffmpeg sem reprocessar o vídeo.

Verificações de código ou metadados não comprovam qualidade visual ou sonora. O agente não ouve áudio:
diga isso na entrega e reporte apenas o que foi medido. Não trate render parcial, arquivo vazio ou comando
ainda em execução como vídeo concluído. Havendo impedimento real sem alternativa autorizada, salve o
projeto e o diagnóstico, diga exatamente o que falta e não marque como concluído.

### Entrega final

O pacote padrão (o usuário pediu isso em todas as produções reais):
- **Capa e thumbnail** com o próprio cenário (`Thumbnail.tsx`: `CapaVertical` 1080×1920 e `ThumbYouTube`
  1280×720, `--frame=<N>`). Vídeo de revelação → capa sem spoiler.
- **`publicacao.md`**: título, legenda (TikTok) e descrição (YouTube), 3–5 hashtags por plataforma, tags do
  YouTube. Se não verificou o volume das hashtags, diga isso no arquivo em vez de chamá-las de "mais usadas".
- **Um único .zip organizado** (`python scripts/package_delivery.py ...`: 01-PUBLICAR / 02-DOCUMENTOS /
  03-PROJETO + LEIA-ME). Se houver ferramenta de envio de arquivos (ex.: SendUserFile), envie o .zip na
  conversa — quem usa o app no celular ou numa sessão na nuvem não tem outro jeito de salvar, e o container
  pode ser apagado.

Na resposta, informe duração, resolução e fps medidos, as verificações realmente executadas, os ajustes
técnicos feitos (ex.: cortes realinhados à voz, velocidade da voz) e as limitações — inclusive os pontos
fracos que você viu nas imagens. Atualize `production-status.md` para CONCLUÍDO apenas quando o MP4 existir
e as verificações essenciais passarem. Não publique nem envie a terceiros.
