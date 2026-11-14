# Roteiro v1 — "O único anfíbio que vivia no MAR" (Gerrothorax maritimus)

## 1. Briefing
- **Tema:** *Gerrothorax maritimus*, anfíbio blindado do Triássico (~237 milhões de anos), primeiro anfíbio conhecido a viver só no mar. Estudo de Diao, Motani, Jiang et al., *Nature Ecology & Evolution*, 26/10/2026.
- **Formato:** pergunta → revelação (paradoxo + investigação: "como sabem?"). Não é Boato ou Verdade.
- **Duração:** ~65 s (meta 60–75 s). 1080×1920, 30 fps. Voz edge-tts pt-BR-AntonioNeural (+4%; chamada +0%).
- **Direção de arte:** fundo do mar triássico low-poly (azul profundo `#182a4e`), bicho achatado com placas de osso; trilha paleta "natureza"/"misterio".
- **Sistema revelado:** por que anfíbios não aguentam o mar (pele permeável + sal) → como esse resolvia (armadura, hipótese) → como os cientistas provaram (rocha marinha, ictiossauros, estrôncio).

## 2. Fatos e fontes (checados em 14/11/2026)
| Fato | Fonte | Observação |
|---|---|---|
| Mais de 8.000 anfíbios vivos; nenhum vive só em água salgada | Phys.org, Smithsonian | Algumas rãs aguentam água salobra (ex.: rã-comedora-de-caranguejo), por isso "nenhum vive **só** no mar" |
| Dois esqueletos quase completos, Guizhou (China), Triássico Superior ~237 Ma; achados em 2004 por coletores locais | Sci.News, Discover Wildlife | Algumas matérias falam em "agricultores" — evitamos |
| ~0,74–0,9 m, corpo achatado e largo, armadura de ossos | Smithsonian, Sci.News | narração: "quase um metro" |
| Rocha formada a dezenas de km de qualquer terra; ictiossauros no mesmo leito | Sci.News | — |
| Isótopos de estrôncio dos ossos = água do mar do Triássico | Phys.org, ScienceDaily | "a prova química" |
| Armadura pode ter impedido a perda/absorção de água pela pele; vivia no fundo, caçava por sucção | ScienceDaily, Sci.News | **hipóteses** → narração: "a hipótese é" |
| Linhagem sem descendentes vivos ("dead-end lineage", Motani) | Sci.News | — |
| No mar, o sal "puxa" a água do corpo de pele permeável (osmose) | fisiologia básica | — |

## 3. Tabela cronológica (estimativa; cortes reais saem da voz)
Convenção MM:SS:FF, intervalos [início, fim).

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:07:12 | 0 - 222 | Dos mais de oito mil anfíbios que existem hoje, nenhum vive só no mar. Mas, há 237 milhões de anos, um vivia. | Fenda abre sobre uma beira de lagoa com sapo, salamandra e perereca; contador 0→8.000. Em "no mar", a câmera vira para o mar e um ✖ aparece. Em "237 milhões", chicote/rebobinar e a silhueta do bicho surge no fundo do mar. | Sapo, salamandra, perereca, lagoa, mar, contador 2D, silhueta do Gerrothorax. | `count` 0→8000 (W1–W4); `fx.punch(W9)`; `fx.desaturate` + `whipMid` em W12; `gerro.silhouette` spring W18; mascote acena (W1). | +8.000 ANFÍBIOS HOJE (info, W2) · NENHUM SÓ NO MAR ✖ (problema, W8) · 237 MILHÕES DE ANOS (atenção, W12). |
| 00:07:12 - 00:15:21 | 222 - 471 | O problema é a pele: fina, ela deixa a água passar. No mar, o sal puxa a água do corpo, e o bicho desidrata. | Close na pele em corte (bloco esquemático): bolinhas de água atravessando a pele; ao entrar no mar, setas azuis saindo do corpo e partículas de sal; o sapo murcha um pouco. | Bloco de pele em corte, moléculas de água (azul), sal (branco), setas. | `skin.flow` 0→1 (W3–W7); `salt.k` (W10); `water.out` 0→1 (W12–W20); sapo `shrink` 1→0.85. | PELE QUE DEIXA A ÁGUA PASSAR (info, W3) · O SAL PUXA A ÁGUA ✖ (problema, W12). Selo ESQUEMA. |
| 00:15:21 - 00:24:18 | 471 - 738 | Na China, cientistas estudaram dois esqueletos quase completos. O bicho tinha quase um metro, era achatado e coberto de placas de osso. | Mesa de laboratório com dois esqueletos fósseis em placas de rocha; régua de 1 m; em "placas de osso", o modelo vivo se monta por cima do esqueleto (placas acendem). | 2 fósseis em laje, régua 1 m, mascote (escala), modelo do bicho. | `fossil.k` (W0); `ruler.k` (W9); `armor.k` 0→1 (W17–fim); mascote aponta (W9). | CHINA · 2 ESQUELETOS (info, W2) · ~1 METRO (info, W9) · ARMADURA DE OSSO (positivo, W17). |
| 00:24:18 - 00:31:27 | 738 - 957 | O nome dele é Gerrothorax maritimus. Mas como saber que vivia no mar, e não foi só arrastado pra lá depois de morto? | Bicho completo girando no fundo do mar (apresentação); em "arrastado", flashback dessaturado: um corpo levado por uma correnteza de rio até o mar, com "?" grande. | Gerrothorax, fundo do mar, rio/correnteza, "?" 2D. | `gerro.spin`; `fx.desaturate(W15→fim)`; `drift.t` 0→1 (W15–fim); `q.k` spring (W17). | GERROTHORAX MARITIMUS (info, grande, W3) · OU FOI ARRASTADO? (atenção, W15). |
| 00:31:27 - 00:38:15 | 957 - 1155 | As rochas onde ele estava se formaram longe de qualquer terra, junto com ictiossauros, répteis marinhos. | Mapa esquemático do mar triássico: a costa recua e o ponto do fóssil fica longe da terra (régua "dezenas de km"); um ictiossauro passa nadando. | Mapa/maquete do mar, costa, marcador do fóssil, ictiossauro low-poly. | `coast.k` 0→1 (W3–W8); `ichthy.swim` (W10–fim); `fx.flash(W10)`. | PISTA 1: LONGE DA TERRA (positivo, W2) · VIZINHOS: ICTIOSSAUROS (info, W10). |
| 00:38:15 - 00:44:06 | 1155 - 1326 | E a prova química: o estrôncio dos ossos tem a assinatura da água do mar daquela época. | Osso em corte com átomos de estrôncio brilhando; ao lado, uma "assinatura" (barras/código) do osso e da água do mar que se encaixam ✔. | Osso em corte, átomos, duas barras de assinatura 2D que coincidem. | `sr.glow` (W5); `match.k` 0→1 (W9–W14); `fx.flash(W14)`. | PISTA 2: ESTRÔNCIO (info, W5) · = ÁGUA DO MAR ✔ (positivo, W13). |
| 00:44:06 - 00:51:00 | 1326 - 1530 | A hipótese é que a armadura segurava a água dentro do corpo, e que ele vivia no fundo, sugando as presas. | Volta ao fundo do mar: o bicho meio enterrado na areia; setas de água presas no corpo (escudo); um peixinho passa e é sugado. | Gerrothorax enterrado, peixinho, escudo/setas, areia. | `shield.k` (W3); `bury` 0→1; `prey.t` 0→1 (W15–fim); `fx.punch(W18)`. | HIPÓTESE: ARMADURA = ESCUDO (atenção, W3) · CAÇAVA POR SUCÇÃO (info, W15). |
| 00:51:00 - 01:05:00 | 1530 - 1950 | Pronto: agora você sabe. O único anfíbio marinho conhecido não deixou descendentes. | Câmera se afasta do bicho no fundo do mar até ele virar silhueta; mascote flutua e acena; encerramento fixo. | Fundo do mar, Gerrothorax, mascote. | dolly-out; `mascot.cheer(W1)`, `mascot.wave(W8)`. | LINHAGEM SEM DESCENDENTES (info, W6). |
| (encerramento fixo) | — | Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha! | Fenda fecha + logo. | — | — | — |

## 4. Designs novos (folha antes de usar — combinado para bichos pré-históricos)
Gerrothorax maritimus (cabeça larga e achatada tipo pá, olhos no topo, corpo achatado com placas de osso, patas curtas, cauda curta achatada); ictiossauro; sapo/salamandra/perereca de hoje; bloco de pele em corte; fósseis em laje; fundo do mar triássico.

## 5. Avisos de rigor
- "Primeiro anfíbio totalmente marinho conhecido" é a conclusão do estudo; a forma de lidar com o sal é **hipótese** → narração diz "a hipótese é".
- Reconstrução do bicho é **ilustração** (partes moles não preservadas) → selo ILUSTRAÇÃO.
