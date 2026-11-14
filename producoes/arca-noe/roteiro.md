# Roteiro v1 — "Acharam a ARCA DE NOÉ?" (Boato ou Verdade #3)

## 1. Briefing
- **Tema:** madeira carbonizada retirada do sítio de Durupinar (Turquia, perto do Monte Ararat), divulgada pela equipe Noah's Ark Scans em 28/10 e 10–13/11/2026.
- **Formato:** quadro **Boato ou Verdade** (EP03) — alegação → contexto → o que a ciência diz → o que falta → veredito.
- **Tom:** checagem respeitosa — não discute a fé, só a alegação de que "acharam a Arca".
- **Duração:** ~69 s. 1080×1920, 30 fps. Voz edge-tts pt-BR-AntonioNeural (+4%; chamada +0%).
- **Direção de arte:** planalto de montanha low-poly com o Ararat nevado; a formação em forma de barco; corte geológico; laboratório; vinheta e medidor do quadro (já aprovados no EP01).

## 2. Fatos e fontes (checados em 14/11/2026)
| Fato | Fonte | Observação |
|---|---|---|
| Equipe Noah's Ark Scans diz ter tirado madeira carbonizada a ~9 m (30 pés) de profundidade em Durupinar | Manila Times (GlobeNewswire), Fox News, Arkeonews | Release da própria equipe |
| Amostras enviadas a 4 laboratórios em 4 países; sem resultado ainda | Ancient Origins (checagem), Fox News | "Ainda não tem resultado" |
| Líder da equipe (Andrew Jones): "pode ser a Arca... mas também pode ser a fogueira de um pastor" | Ancient Origins / NewsNation | Citação usada no s7 |
| Formação com ~157 m de comprimento, perto do Ararat; promovida como Arca desde os anos 1950–60 | Wikipedia (Durupınar site), Above the Norm | Data da 1ª identificação varia (1948/1959) → não citamos ano |
| Bíblia: 300 côvados (~137–157 m, dependendo do côvado) | Gênesis 6:15 | "uns cento e cinquenta metros" |
| Geólogos: formação natural; Collins e Fasold (1996) — dobra sinclinal, "estrutura natural de rocha" | Wikipedia; artigo de 1996 | "dobra natural de rocha e lama" |
| Radar e perfuração da equipe sem revisão por pares | Greek City Times, The Debrief | Mencionado na descrição |
| Datação por carbono-14 mede quando o organismo morreu, não a função do objeto; madeira petrificada nem pode ser datada assim | Ancient Origins | s7 |

## 3. Tabela cronológica (estimativa; cortes reais saem da voz)
Convenção MM:SS:FF, intervalos [início, fim).

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:27 | 0 - 267 | Acharam a Arca de Noé? Essa semana, uma equipe mostrou pedaços de madeira queimada tirados de uma montanha na Turquia. Será verdade? | Fenda abre sobre o planalto com o Ararat nevado ao fundo; close nos fragmentos de madeira carbonizada sobre uma lona; mascote olha curioso. | Montanha, Ararat, fragmentos de madeira, lona, mascote. | `wood.k` spring (W8); câmera dolly-in; `fx.punch(W20)`. | ACHARAM A ARCA? (atenção, grande, W1) · MADEIRA QUEIMADA (info, W8). |
| 00:08:27 - 00:11:00 | 267 - 330 | Este é o Boato ou Verdade. | Vinheta fixa do quadro (EP03). | `SeriesCard` (aprovado no EP01). | — | BOATO OU VERDADE · EP 03. |
| 00:11:00 - 00:18:15 | 330 - 555 | O lugar se chama Durupinar. Visto de cima, parece um barco gigante de 157 metros, perto do Monte Ararat. | Drone sobe e mostra de cima a formação em forma de casco no meio do planalto; régua de 157 m. | Formação de Durupinar, régua 2D, Ararat. | câmera sobe (crane); `ruler.k` (W12). | DURUPINAR (info, W3) · 157 METROS (info, W12). |
| 00:18:15 - 00:27:00 | 555 - 810 | E o tamanho bate com a Bíblia: trezentos côvados, uns cento e cinquenta metros. Por isso tem gente que jura que é a Arca. | Contorno dourado de uma arca (300 côvados) aparece por cima da formação e encaixa; pergaminho 2D com "300 côvados". | Silhueta da arca (wireframe dourado), formação. | `ark.outline` 0→1 (W5–W10). | 300 CÔVADOS ≈ 150 M (info, W5) · O TAMANHO BATE (atenção, W12). |
| 00:27:00 - 00:33:15 | 810 - 1005 | Só que, para os geólogos, é uma dobra natural de rocha e lama, que a erosão deixou com cara de casco. | Corte geológico do morro: camadas de rocha dobradas em "U" (sinclinal); a erosão vai raspando o topo e sobra a forma de casco. | Bloco de camadas em corte, setas de erosão. | `fold.k` (W6); `erode.t` 0→1 (W13–fim). | GEÓLOGOS: FORMAÇÃO NATURAL (positivo, W3) · DOBRA DE ROCHA (info, W7). Selo ESQUEMA. |
| 00:33:15 - 00:41:00 | 1005 - 1230 | E a madeira? Saiu de uns nove metros de profundidade e foi para quatro laboratórios. Ainda não tem resultado. | Sonda perfurando; o testemunho sobe com a madeira a 9 m; a madeira vira 4 frascos que vão para 4 laboratórios (ícones); relógio de "aguardando". | Sonda, testemunho, 4 frascos, 4 laboratórios, ampulheta. | `drill.t` (W4–W9); `labs.k` (W11); `wait.k` (W16). | 9 M DE PROFUNDIDADE (info, W5) · RESULTADO: AINDA NÃO (atenção, W16). |
| 00:41:00 - 00:51:00 | 1230 - 1530 | Mesmo se for antiga, a datação mostra a idade da madeira, não que ela era de um barco. O próprio líder da equipe admite: pode ser a fogueira de um pastor. | Anéis de uma árvore mostram a idade ✔ / um barco com "?" ✖; corta para uma fogueira low-poly com um pastor e ovelhas no mesmo planalto. | Tronco com anéis, ícone de barco, fogueira, pastor (Person), ovelhas. | `rings.k` (W5); `boatq.k` (W11); corte para fogueira (W20). | DATA ≠ FUNÇÃO (info, W11) · OU UMA FOGUEIRA? (atenção, W22). |
| 00:51:00 - 01:05:00 | 1530 - 1950 | Veredito: acharam a Arca? Sem prova. Pronto: agora você sabe o que falta pra essa história virar verdade. | Medidor Boato ou Verdade: ponteiro vai para "BOATO / SEM PROVA"; resumo 2D do que falta (datação, revisão por pares, prova de que é estrutura feita por gente). Mascote dá de ombros e acena. | VerdictMeter (aprovado), checklist 2D, mascote. | `verdict.needle` → −60 (W3); `check1..3` springs. | VEREDITO: SEM PROVA (negativo, grande, W3). |
| (encerramento fixo) | — | Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha! | Fenda fecha + logo. | — | — | — |

## 4. Designs novos (folha antes do vídeo, no padrão novo)
Planalto + Monte Ararat nevado; formação de Durupinar (casco de terra e rocha); contorno da arca (300 côvados); fragmentos de madeira carbonizada; corte geológico com dobra sinclinal; sonda de perfuração + testemunho; fogueira; **ovelhas** (bicho novo → padrão de qualidade). Reaproveita: vinheta e medidor do quadro, pastor (Person), mascote.

## 5. Avisos de rigor e de tom
- Não afirmamos que a madeira "não é antiga": os resultados não saíram. O veredito é **"sem prova"**, não "mentira".
- Não falamos de fé; só da alegação científica.
- Não usar logotipos de veículos nem imitar manchetes reais.
