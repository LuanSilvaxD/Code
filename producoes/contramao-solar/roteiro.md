# Roteiro v1 — "Tem algo andando NA CONTRAMÃO no Sistema Solar" (R631)

## 1. Briefing
- **Tema:** objeto além de Netuno com órbita retrógrada (R631, dados do Observatório Vera Rubin, divulgado 8–10/11/2026).
- **Formato:** pergunta → revelação (mistério com hipóteses). Não é Boato ou Verdade.
- **Público:** leigo. **Duração:** ~65 s (meta 60–75 s). 1080×1920, 30 fps.
- **Voz:** edge-tts pt-BR-AntonioNeural (+4%; chamada +0%). Gratuita.
- **Direção de arte:** Sistema Solar em maquete low-poly vista de cima/inclinada; fundo espaço `#1f1a4d`; trilha paleta "espaco".
- **Sistema revelado:** todos os planetas giram no mesmo sentido (herança do disco de gás); R631 gira ao contrário → duas hipóteses de origem.

## 2. Fatos e fontes (checados em 14/11/2026)
| Fato | Fonte | Observação |
|---|---|---|
| Designação provisória R631, inclinação 142° (>90° = retrógrado) | EarthSky, Gizmodo, TechTimes | Ainda **sem designação do Minor Planet Center** → narração diz "nome provisório" e "falta confirmação oficial" |
| Detecções de dez/2025 a mar/2026 ligadas numa órbita em 28/10/2026 por Guven Gurkan (Domino Observatory), amador, usando o fluxo público de alertas do Rubin | EarthSky | "astrônomo amador" |
| Distância atual ~32 UA; período ~548 anos; periélio em 31/10/2047 a ~24 UA (Netuno fica a ~30 UA) | Gizmodo, EarthSky | narração: "uns quinhentos e cinquenta anos"; "mais perto do Sol que Netuno" |
| Tamanho ~100 km (estimativa de Marshall Eubanks) | EarthSky | narração: "deve ter uns cem quilômetros" |
| Hipóteses: cinturão de Kuiper desestabilizado por Netuno (Sam Deen, mais provável) × captura de outra estrela | EarthSky, TechTimes | "a mais provável" / "a mais ousada" |
| Não é o único retrógrado: Drac (2008 KV42, ~103°), Niku (2011 KT19, ~110°); o cometa Halley também é retrógrado | arXiv 1608.01808; Batygin & Brown | **NÃO** dizer "recorde": o "recorde" do TechTimes é contraditório |
| Planetas giram no mesmo sentido por herança do disco protoplanetário | consenso | — |

## 3. Tabela cronológica (estimativa; os cortes reais saem da voz)
Convenção MM:SS:FF, intervalos [início, fim).

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:00 | 0 - 240 | Todos os planetas giram em volta do Sol no mesmo sentido. Mas, depois de Netuno, acharam algo andando na contramão. | Fenda abre sobre o Sistema Solar visto de cima (el 60°). Planetas correm nas órbitas no sentido anti-horário com setinhas verdes. Em "depois de Netuno", câmera recua até a borda; em "contramão", um ponto vermelho surge correndo no sentido oposto, com seta vermelha. | Sol, 8 planetas e órbitas, setas de sentido, R631 (rocha), mascote flutuando perto de Netuno. | `fx.flash(0)`; `planets.spin` contínuo; câmera dolly-out W8–W12; `r631.show` spring W13; `r631.dir` -1; `fx.punch(W16)`; `mascot.wave(W1)`, `mascot.jump(W16)`. | MESMO SENTIDO ✔ (solução, W5) · NA CONTRAMÃO ✖ (problema, grande, W15). |
| 00:08:00 - 00:17:15 | 240 - 525 | O nome provisório é R631. Deve ter uns cem quilômetros, e sua órbita é inclinada cento e quarenta e dois graus: praticamente de ponta-cabeça. | Close na rocha R631 girando; depois câmera de lado (el 5°): o plano dos planetas vira uma linha e a órbita de R631 aparece inclinada 142°, com transferidor 2D. | R631 close, plano da eclíptica, órbita inclinada, transferidor 2D (0°→142°). | `incl.angle` 0→142 (W14–W19, count); `proto.k` spring W14; câmera corte em W8. | R631 · NOME PROVISÓRIO (info, W2) · ~100 KM (info, W6) · 142°: DE PONTA-CABEÇA (atenção, W20). |
| 00:17:15 - 00:24:00 | 525 - 720 | E quem ligou os pontos foi um astrônomo amador, usando dados públicos do novo observatório Vera Rubin. | Corte: observatório Rubin low-poly no topo de uma montanha (Chile) com céu estrelado; pontinhos de detecção aparecem no céu e uma linha os liga numa órbita. | Observatório Rubin (prédio + cúpula + telescópio), montanha, pontos 2D/3D, linha ligando. | `dots.k` 0→1 (W1–W5); `link.draw` 0→1 (W3–W7); `rubin.show` em W10 com dolly-in. | ASTRÔNOMO AMADOR (positivo, W5) · DADOS PÚBLICOS DO RUBIN (info, W10). |
| 00:24:00 - 00:31:00 | 720 - 930 | Mas por que todo mundo gira igual? O Sistema Solar nasceu de um disco de gás girando, e tudo herdou esse giro. | Rebobinar (dessatura): disco de gás e poeira girando em volta de um Sol jovem; aglomerados viram planetas que continuam girando no mesmo sentido. | Disco protoplanetário (partículas instanciadas), proto-Sol, planetas nascendo. | `fx.desaturate`; `disk.spin`; `disk.form` 0→1 (W12–fim). | POR QUÊ? (atenção, W0) · HERANÇA DO DISCO (info, W12). Selo ILUSTRAÇÃO. |
| 00:31:00 - 00:39:00 | 930 - 1170 | Pra andar ao contrário, precisa de uma história. A mais provável: ele passou perto demais de Netuno e foi arremessado. | Cinturão de Kuiper; uma rocha se aproxima de Netuno, faz uma curva fechada (estilingue) e sai num plano virado, com rastro vermelho. | Netuno, cinturão de Kuiper, R631 com rastro, seta de arremesso. | `fly.t` 0→1 (W9–fim, inOut); `fx.shake(W17)`; mascote aponta (W12). | HIPÓTESE 1: NETUNO (info, W5) · MAIS PROVÁVEL ✔ (positivo, W9). |
| 00:39:00 - 00:44:00 | 1170 - 1320 | A mais ousada: ele veio de outra estrela e foi capturado pelo Sol. | Câmera bem aberta: uma estrela distante; a rocha viaja do sistema dela até o nosso e "gruda" numa órbita invertida. | Estrela alienígena, rastro interestelar, Sol. | `inter.t` 0→1 (W2–fim); `fx.flash(W10)`. | HIPÓTESE 2: OUTRA ESTRELA (atenção, W2). |
| 00:44:00 - 00:51:00 | 1320 - 1530 | Uma volta dele leva uns quinhentos e cinquenta anos. Em 2047, ele chega mais perto do Sol que Netuno. | Maquete completa: órbita alongada de R631 cruzando por dentro da órbita de Netuno; contador de anos 0→550; marcador "2047" no periélio. | Órbitas, R631, Netuno, contador 2D, marcador 2047. | `years` 0→550 (W1–W6, count); `peri.k` spring W9; câmera orbit. | ~550 ANOS POR VOLTA (info, W3) · 2047: MAIS PERTO QUE NETUNO (atenção, W10). |
| 00:51:00 - 01:05:00 | 1530 - 1950 | Pronto: agora você sabe. Falta a confirmação oficial, mas tem gente andando na contramão no Sistema Solar. | Plano geral: planetas no sentido normal, R631 na contramão; mascote acena para a rocha; encerramento fixo da marca. | Sistema Solar completo, R631, mascote. | câmera orbit lenta; `mascot.cheer(W1)`, `mascot.wave(W10)`. | FALTA CONFIRMAÇÃO OFICIAL (atenção, W5). |
| (encerramento fixo) | — | Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha! | Fenda fecha + logo. | — | — | — |

## 4. Designs novos (folha antes de usar)
Rocha R631 (irregular, escura avermelhada), Observatório Vera Rubin low-poly (prédio retangular + cúpula + telescópio), disco protoplanetário, estrela alienígena e rastro, planetas low-poly com órbitas e setas. Reaproveita o Sol e o mascote.

## 5. Avisos de rigor
- Objeto **não confirmado** oficialmente (sem número do MPC); tamanho é estimativa → a narração já diz "provisório", "deve ter" e "falta confirmação".
- Não usar "recorde" (Halley, Drac e Niku também são retrógrados).
- Distâncias e tamanhos fora de escala → selo ESQUEMA.
