# Roteiro v1 — "Existe um PLANETA X escondido no Sistema Solar?" (pedido do 1º inscrito)

## 1. Briefing
- **Tema:** Planeta X → Nibiru (boato) → Planeta Nove (hipótese científica de Batygin e Brown, 2016) → busca do Observatório Vera Rubin (LSST desde meados de 2026).
- **Formato:** pergunta → revelação (separa o mito da hipótese séria). Não é Boato ou Verdade (o último foi a Arca).
- **Duração:** ~72 s (estimativa 75 s; voz real costuma sair 5–8% menor). Voz edge-tts pt-BR-AntonioNeural (+4%).
- **Ligação com o canal:** reaproveita o Sistema Solar e o observatório do vídeo da contramão.
- **Inscrito:** citado como "um inscrito do canal", sem nome (privacidade).

## 2. Fatos e fontes (checados em 17/11/2026)
| Fato | Fonte | Observação |
|---|---|---|
| Percival Lowell procurou um "Planeta X" além de Netuno (início do séc. XX); Plutão achado em 1930 por Clyde Tombaugh, no observatório Lowell; pequeno demais para explicar as perturbações | Physics Today; história da astronomia | "Há mais de cem anos" |
| Nibiru: previsões de colisão em 2003, 2012 e 2017; nunca observado | NASA (desmentidos), checagens | "Nunca apareceu" |
| Planeta Nove: Batygin e Brown (Caltech), 2016; órbitas de objetos extremos além de Netuno agrupadas | Physics Today, Science | — |
| Massa ~5–10 Terras; período ~10.000 anos ou mais; centenas de UA (Brown: "500 a 600 UA") | Space Daily, WorldAtlas | "dez mil anos ou mais" |
| Rubin começou o levantamento LSST em meados de 2026; Batygin: teste direto de todas as evidências — ou detecta, ou a hipótese cai | Space Daily (jun/2026) | Hipótese **não confirmada** |
| Um candidato recente com órbita desalinhada enfraquece parte da evidência | Science (2026) | Mencionado na descrição |

## 3. Tabela cronológica (estimativa; cortes reais saem da voz)
| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:00 | 0 - 240 | Existe um Planeta X escondido no Sistema Solar? Essa foi a primeira pergunta de um inscrito do canal. Bora abrir essa fenda. | Fenda abre no escuro além de Netuno; silhueta de um planeta com "?" aparece e some; balão 2D de comentário ("pergunta de inscrito"). Mascote acena. | Espaço, Sol pequeno ao longe, silhueta "?", balão 2D. | `ghost.k` (W3); `comment.k` spring (W9); mascote acena (W12). | PLANETA X? (atenção, grande, W2) · PEDIDO DE INSCRITO (positivo, W9). |
| 00:08:00 - 00:18:15 | 240 - 555 | A busca é antiga. Há mais de cem anos, Percival Lowell procurou um Planeta X depois de Netuno. Em 1930, acharam Plutão, pequeno demais pra ser ele. | Observatório antigo com telescópio (estilo 1900, sépia); corta para Plutão minúsculo ao lado de Netuno (comparação de tamanho). | Observatório antigo, telescópio, Plutão, Netuno. | `sepia` (desaturate); `pluto.k` (W14); escala Netuno×Plutão. | 1930: PLUTÃO (info, W14) · PEQUENO DEMAIS (problema, W18). |
| 00:18:15 - 00:26:15 | 555 - 795 | Na internet, o Planeta X virou Nibiru, que ia bater na Terra em 2003, depois em 2012, depois em 2017. Nunca apareceu. | Planeta vermelho "apocalíptico" vindo em direção à Terra; contador de datas 2003 → 2012 → 2017 riscadas; carimbo BOATO. | Nibiru (cartunesco), Terra, datas 2D riscadas. | `nibiru.t`; `dates` (W9, W12, W15); carimbo (W17). | NIBIRU: BOATO (problema, grande, W17). |
| 00:26:15 - 00:36:15 | 795 - 1095 | Mas existe uma versão séria: o Planeta Nove. Em 2016, dois astrônomos notaram que objetos depois de Netuno têm órbitas alinhadas, como se algo puxasse. | Sistema Solar visto de cima, câmera recua muito; aparecem 6 órbitas alongadas de objetos distantes, todas apontando para o mesmo lado; seta de "puxão". | Sistema Solar (aprovado), órbitas alinhadas, seta. | `orbits.k` (W12–W16); `pull.k` (W20). | PLANETA NOVE (info, W5) · ÓRBITAS ALINHADAS (atenção, W15). Selo ESQUEMA. |
| 00:36:15 - 00:43:15 | 1095 - 1305 | A conta sugere um planeta de cinco a dez vezes a massa da Terra, tão longe que uma volta no Sol levaria dez mil anos ou mais. | O Planeta Nove "fantasma" (translúcido) surge na órbita gigante; comparação com a Terra (5–10×); contador de anos. | Planeta Nove (ilustração), Terra, órbita gigante, contador. | `p9.k` (W2); `years` 0→10.000 (W14–W19). | 5 A 10 TERRAS (info, W6) · 10.000+ ANOS POR VOLTA (info, W15). Selo ILUSTRAÇÃO. |
| 00:43:15 - 00:50:15 | 1305 - 1515 | E por que ninguém viu? Lá fora, a luz do Sol é fraquíssima, e o planeta seria escuro e lento no céu. | Luz do Sol (raios) enfraquecendo com a distância até quase sumir no planeta; ele se move devagarzinho contra as estrelas. | Raios de luz, Planeta Nove escuro, estrelas. | `light.fade`; `drift`. | POR QUE NINGUÉM VIU? (atenção, W1) · ESCURO E LENTO (info, W14). |
| 00:50:15 - 00:58:15 | 1515 - 1755 | Agora, o observatório Vera Rubin está varrendo o céu. Os próprios autores dizem: ou ele aparece, ou a hipótese cai. | Observatório Rubin (aprovado) com feixe varrendo o céu; balança 2D "APARECE ✔ / CAI ✖". | Observatório Rubin, feixe, balança 2D. | `scan.t`; `scale.k` (W12). | RUBIN: VARREDURA DO CÉU (info, W3) · OU APARECE, OU CAI (atenção, W12). |
| 00:58:15 - 01:12:00 | 1755 - 2160 | Pronto: agora você sabe. Nibiru é boato. O Planeta Nove ainda é uma pergunta aberta, e a resposta pode estar perto. | Plano geral do Sistema Solar com a órbita do Planeta Nove pontilhada e "?"; mascote flutua e aponta; resumo 2D (NIBIRU ✖ · PLANETA NOVE ?). | Sistema Solar, órbita pontilhada, mascote, resumo. | `sum1`, `sum2` springs; `mascot.point`. | PERGUNTA ABERTA (atenção, W10). |
| (encerramento fixo) | — | Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha! | Fenda fecha + logo. | — | — | — |
+ **Animação curtir + inscrever** (regra nova) perto da metade (~36 s), na lateral, ~2 s.

## 4. Designs novos (folha antes do vídeo)
Planeta Nove (gigante de gelo, ilustração), Plutão, Nibiru (vermelho "apocalíptico", claramente cartunesco), observatório antigo (estilo Lowell, ~1900), órbitas alinhadas, animação curtir + inscrever com cursor. Reaproveita: Sistema Solar, Observatório Rubin, mascote.

## 5. Avisos
- Planeta Nove = **hipótese não confirmada**; Nibiru = **boato**. A narração separa os dois.
