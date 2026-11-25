# Roteiro v1 — "A Voyager 1 chegou a 1 dia-luz da Terra" (Short, ~68 s)

## 1. Briefing de produção
- **Tema e gancho de notícia:** em 18/11/2026 a Voyager 1 se tornou o primeiro objeto humano a 1 dia-luz da Terra
  (~25,9 bilhões de km). Repercutiu na semana em NASA, Space.com, ABC, PopSci e outros.
- **Formato:** fatos / pergunta → revelação. A pergunta-gancho é concreta ("um oi leva 1 dia pra chegar"), e cada cena
  revela algo sobre a nave até o fecho com recompensa.
- **Público:** leigo. **Duração:** ~68 s (meta 60–75 s). **1080×1920, 30 fps.**
- **Voz:** edge-tts pt-BR-AntonioNeural (+6%, CTA +0%), grátis. **Trilha:** fenda_music paleta "espaco".
- **Abertura nova** (gancho escrito no frame 1 + selo no canto). **Encerramento** da marca com a chamada falada.
- **Visual:** espaço profundo com brilho 3D ligado (estrelas, sinal de rádio, luz da antena). Diorama "sistema solar
  em maquete" em escala esquemática (selo ESQUEMÁTICO). Mascote **flutuando** ao lado da nave, reagindo com expressões.
- **Sistema mostrado:** a viagem da nave e o "caminho do sinal" Terra → Voyager, que vira a régua de 1 dia-luz.

## 2. Tabela cronológica (estimada; os cortes passam a vir da voz real depois do TTS)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:07:00 | 0 - 210 | Se você mandar um oi pra essa nave agora, ele só chega amanhã. E a resposta, só depois de amanhã. | Close da Voyager no escuro, estrelas; câmera em deriva lenta girando 15° em volta da nave. Em "oi", corte para a Terra pequena: um pulso de luz sai dela. | Voyager (novo), Terra pequena, pulso de sinal (anel de luz roxo-claro), estrelas. Mascote flutuando ao lado da nave. | Gancho visível do frame 0 (`hookTracks(W("s1",6))`). Pulso `signal.t` 0→1 frames 40–200 (linear). Relógio 2D girando 24 h rápido em "amanhã". Mascote `face("surprise")` em "amanhã". | Gancho: "UM OI" / "1 DIA" (2ª linha amarela) / "PRA CHEGAR". Selo no canto. |
| 00:07:00 - 00:15:12 | 210 - 462 | Essa é a Voyager 1. Ela saiu da Terra em 1977 e viaja a sessenta e um mil quilômetros por hora, sem parar, há quase cinquenta anos. | Plano de apresentação: a nave inteira girando devagar; depois passagem rápida por Júpiter e Saturno (maquete) com rastro. | Voyager, Júpiter e Saturno (biblioteca Solar.tsx), rastro de trajetória. | Órbita de câmera 20°; rastro `trail.t` 0→1; punch-in em "1977"; contador de velocidade 0→61.000 km/h (count) em W("s2",9). Mascote acena em "Voyager". | Badge info "LANÇADA EM 1977"; contador "61.000 KM/H". |
| 00:15:12 - 00:25:18 | 462 - 768 | No dia 18 de novembro, ela chegou a um dia-luz da Terra: a distância que a luz percorre em vinte e quatro horas. Quase vinte e seis bilhões de quilômetros. | A régua: câmera recua MUITO (dolly-out) e mostra a linha Terra → Sol → … → Voyager; um raio de luz percorre a linha enquanto um relógio corre 24 h. | Linha-régua com marcas, Terra, Sol, Voyager no fim; raio de luz (brilho); relógio 2D 0→24 h. | Dolly-out spring; raio `beam.t` 0→1 frames 60–260; relógio sincronizado com o raio; flash + punch na palavra "dia-luz" (revelação). | Badge info "1 DIA-LUZ"; texto "≈ 25,9 BILHÕES DE KM"; selo ESQUEMÁTICO. |
| 00:25:18 - 00:33:00 | 768 - 990 | Nada feito por humanos foi tão longe. Desde 2012, ela já saiu da bolha do Sol e viaja no espaço entre as estrelas. | A bolha do Sol (heliosfera) vista de fora, translúcida; a nave atravessa a borda; câmera gira 25°. | Heliosfera (novo, casca translúcida com borda brilhante), Sol, Voyager atravessando. | Nave `x` atravessa a borda em W("s4",8); borda pisca (bloom). Mascote comemora em "tão longe" (`cheer` → olhos ^^). | Badge positivo "RECORDE HUMANO"; badge info "FORA DA BOLHA DO SOL · 2012". |
| 00:33:00 - 00:42:03 | 990 - 1263 | E leva um disco de ouro, com sons da Terra e saudações em cinquenta e cinco línguas. A de português diz: paz e felicidade a todos. | Close no disco de ouro preso na lateral da nave; ele se destaca e gira de frente para a câmera; ondas de som saem dele. | Disco de ouro (novo, gravações em relevo, desenho próprio), ondas sonoras 2D. "Curte e se inscreve" na lateral (~45% do vídeo). | Disco `record.out` 0→1 spring; rotação lenta; ondas em "sons"; texto da saudação entra palavra a palavra em "paz e felicidade a todos". `likeSubscribeTracks` em ~1000. Mascote `face("happy")`. | Badge info "DISCO DE OURO · 55 LÍNGUAS"; cartão "PAZ E FELICIDADE A TODOS" (português). |
| 00:42:03 - 00:51:00 | 1263 - 1530 | Só que a energia dela vem de plutônio, e enfraquece todo ano. A NASA já desligou vários instrumentos pra ela durar até a próxima década. | Corte na haste dos geradores (cilindros com aletas) brilhando laranja; o brilho cai; luzes de instrumentos da nave vão apagando uma a uma. | Geradores RTG (parte do modelo novo), luzes de status na nave, barra de energia 2D. | `rtg.glow` 1→0,35 (inOut); luzes `inst.n` 6→2 (apagam com "click"); barra de energia cai. Mascote `face("sad")`. | Badge negativo "ENERGIA CAINDO"; badge warning "INSTRUMENTOS DESLIGADOS". |
| 00:51:00 - 01:01:15 | 1530 - 1845 | Um dia ela vai ficar muda. Mas o disco foi feito pra durar mais de um bilhão de anos. Pronto: agora você sabe onde está o objeto humano mais distante. | A nave se afasta para as estrelas; a câmera vira para trás e mostra o Sol como um ponto; plano final aberto com a nave pequena e o rastro. | Voyager se afastando, Sol-ponto, estrelas, rastro. | Dolly-back lento; brilho do disco pulsa uma vez em "bilhão de anos"; mascote acena em "Pronto". | Badge positivo "DISCO: +1 BILHÃO DE ANOS". |
| 01:01:15 - 01:07:00 | 1845 - 2010 | (encerramento fixo da marca) Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha! | Encerramento padrão da marca. | Logo, marca, chamada. | Padrão (`BrandOutro`). | Chamada escrita padrão. |

Timestamps em MM:SS:FF (FF = quadro 00–29); intervalos [início, fim).

## 3. Contrato de dados (resumo)
7 cenas `s1…s7` + encerramento; `voKey` = id da cena; trilhas novas: `signal.t`, `trail.t`, `beam.t`, `record.out`,
`rtg.glow`, `inst.n`, `speed`, `clock`; abertura `hookTracks`; `likeSubscribeTracks` na s5; mascote `float` o vídeo todo.

## 4. Áudio e montagem
- Voz pt-BR-AntonioNeural +6%; trilha "espaco" com impactos em "dia-luz" (s3), "tão longe" (s4), "paz e felicidade" (s5).
- Efeitos: `warp` (passagem pelos planetas), `glow` (raio de luz), `shimmer` (disco), `power-down` suave + `click`
  (instrumentos), `ui-click`/`sub-bell` (curte e se inscreve).
- Brilho 3D ligado (`POST.bloom` ≈ 1): estrelas, sinal, raio, borda da heliosfera, disco.

## 5. Designs novos (folha para aprovar antes do vídeo)
1. **Voyager 1** (desenho próprio, proporções reais): antena parabólica branca grande, corpo decagonal, haste longa do
   magnetômetro, haste dos 3 geradores de plutônio (cilindros com aletas), haste de instrumentos, disco de ouro na lateral.
2. **Disco de ouro** (desenho próprio inspirado no real, sem copiar a capa gravada).
3. **Heliosfera** (bolha translúcida com borda brilhante e "cauda").
Reaproveitados da biblioteca: planetas e Sol (Solar.tsx), estrelas, relógio 2D (Interstellar2D.tsx), mascote flutuando.

## 6. Fatos usados (com fonte)
- 1 dia-luz em 18/11/2026, ~25,9 bilhões de km, 1º objeto humano — NASA (science.nasa.gov/mission/voyager; svs.gsfc.nasa.gov/15120), Space.com, PopSci.
- Comando leva ~1 dia para chegar e a resposta mais 1 dia — NASA.
- Lançada em 1977; ~17 km/s ≈ 61.000 km/h — NASA (fato de missão).
- Entrou no espaço interestelar em 2012 — NASA.
- Disco de ouro: saudações em 55 línguas; português: "Paz e felicidade a todos" — NASA (Greetings in 55 Languages).
- Energia de plutônio-238, perde ~4 W/ano; instrumentos desligados para economizar; pode operar até os anos 2030 — NASA/JPL.
- Disco feito para durar mais de 1 bilhão de anos — NASA (Golden Record).
- Voyager 2 só chega ao dia-luz em nov/2035 (não entra na fala; reserva para comentário).
