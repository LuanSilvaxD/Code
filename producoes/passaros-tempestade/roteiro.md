# Roteiro v1 — "Os pássaros que OUVIRAM a tempestade chegando"

## 1. Briefing
- **Tema:** pássaros canoros (Vermivora chrysoptera, ~9–10 g) que fugiram de tempestades com tornados 1–2 dias antes (Tennessee, EUA, abril de 2014). Estudo de Streby et al., *Current Biology* (2015).
- **Formato:** pergunta → revelação (mistério → pista → mecanismo → ressalva honesta).
- **Duração:** ~63 s. 1080×1920, 30 fps. Voz edge-tts pt-BR-AntonioNeural (+4%; chamada +0%).
- **Direção de arte:** vale/floresta low-poly com céu azul que escurece; supercélula com tornado; mapa esquemático com a rota; ondas de som grave visíveis; trilha paleta "natureza" → "tense".
- **Sistema revelado:** a tempestade emite infrassom, que viaja muito longe; o ouvido humano não capta, algumas aves sim (hipótese no caso das mariquitas).

## 2. Fatos e fontes (checados em 14/11/2026)
| Fato | Fonte | Observação |
|---|---|---|
| Abril de 2014, Tennessee: as aves saíram 1–2 dias antes das tempestades, com o tempo local ainda normal | USGS (Streby et al. 2015), UC Berkeley | "O céu ainda estava limpo" = tempo local normal |
| Aves com geolocalizadores leves; viagem de >1.500 km em 5 dias, ida e volta | USGS (resumo do artigo) | Ida de ~700 km (algumas fontes); usamos o total ">1.500 km em cinco dias" |
| Peso ~9–10 g | conhecimento da espécie | "uns dez gramas" |
| Pista provável: infrassom, que se espalha >1.000 km a partir de tempestades com tornados | USGS (autores) | Narração: "centenas de quilômetros" (conservador) |
| A equipe NÃO mediu o infrassom daquela tempestade → hipótese | Bird Observer / críticas | Narração: "ninguém mediu... ainda é hipótese" |
| Humanos: limite grave ~20 Hz | Chrisler & Quine | "umas vinte vibrações por segundo" |
| Pombos percebem até ~0,05 Hz em laboratório (Kreithen & Quine 1979); nem todas as espécies testadas mostram isso | Kreithen & Quine; Beason | Narração: "algumas aves" (não afirma que as mariquitas foram testadas) |

## 3. Tabela cronológica (estimativa; cortes reais saem da voz)
Convenção MM:SS:FF, intervalos [início, fim).

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:07:15 | 0 - 225 | Em 2014, uns passarinhos nos Estados Unidos fugiram de uma tempestade um dia antes de ela chegar. O céu ainda estava limpo. | Fenda abre num galho de floresta ao sol; o passarinho canta e de repente decola com outros. Câmera sobe acompanhando o voo; céu azul e calmo. | Floresta low-poly, galho, 4–6 pássaros, céu azul, mascote no chão acenando. | `flock.fly` 0→1 (W6–W10); câmera tilt-up; `fx.punch(W9)`; mascote acena (W1) e olha para cima (W8). | FUGIRAM 1 DIA ANTES (atenção, W9) · CÉU LIMPO (info, W18). |
| 00:07:15 - 00:13:15 | 225 - 405 | Eles pesam uns dez gramas, e cientistas tinham colado neles minúsculos rastreadores. | Close no pássaro no galho; uma "mochilinha" rastreadora aparece nas costas com brilho; balança mostra 10 g. | Pássaro caprichado, rastreador, balancinha 2D. | `tracker.k` spring (W8); `scale.k` (W2). | ~10 GRAMAS (info, W2) · RASTREADOR (info, W8). |
| 00:13:15 - 00:22:15 | 405 - 675 | Os dados mostraram: eles voaram mais de mil e quinhentos quilômetros em cinco dias, saíram do caminho dos tornados e depois voltaram. | Mapa esquemático do sudeste dos EUA: rota desenhada saindo, contornando a faixa vermelha da tempestade e voltando; contador de km e de dias. | Mapa, rota (linha), faixa de tempestade, contadores 2D. | `route.draw` 0→1 (W3–W17); `km` 0→1500 (W4–W9, count); `days` 0→5; `storm.band` (W13). | +1.500 KM EM 5 DIAS (info, W5) · E VOLTARAM ✔ (positivo, W19). Selo ESQUEMA. |
| 00:22:15 - 00:30:00 | 675 - 900 | Mas como eles sabiam? A pista mais provável é o infrassom: um som tão grave que a gente não escuta. | Volta à floresta: o céu ainda calmo, mas ao longe uma supercélula no horizonte; ondas de som (anéis translúcidos) saem dela e passam pelo pássaro. | Supercélula, ondas de infrassom, pássaro. | `waves.k` (W8–fim); `storm.show` (W4). | COMO SABIAM? (atenção, W1) · INFRASSOM (info, grande, W9). |
| 00:30:00 - 00:36:00 | 900 - 1080 | Tempestades fortes fazem o ar vibrar bem devagar, e esse som grave viaja centenas de quilômetros. | Close na tempestade com tornado; ondas longas e lentas saindo; régua de distância mostrando as ondas chegando longe. | Tempestade + tornado, ondas grandes, régua 2D. | `tornado.spin`; `waves.slow`; `dist.k` (W12); `fx.shake(W4)`. | VIBRAÇÃO LENTA DO AR (info, W5) · CENTENAS DE KM (atenção, W12). |
| 00:36:00 - 00:42:15 | 1080 - 1275 | A gente não ouve abaixo de umas vinte vibrações por segundo. Algumas aves percebem sons bem mais graves. | Comparativo: barra de frequências; faixa que o ouvido humano capta acende; abaixo de 20 Hz fica cinza ✖ para humano e acende para a ave ✔. Mascote coloca a mão no ouvido. | Barra de frequências 2D, ícones de ouvido humano/ave, mascote. | `band.human` (W2); `band.bird` (W12); mascote "mão no ouvido" (point) W3. | HUMANOS: ACIMA DE ~20 HZ (info, W6) · AVES: MAIS GRAVE ✔ (positivo, W13). |
| 00:42:15 - 00:49:15 | 1275 - 1485 | Ninguém mediu o som daquela tempestade, então ainda é hipótese. Mas os pássaros fugiram antes de tudo. | Selo de "HIPÓTESE"; corta para a floresta sendo atingida pela tempestade, galho vazio — os pássaros já não estão lá. | Floresta escura com chuva, tornado ao fundo, galho vazio. | `rain.k` (W10); `storm.hit`; `fx.flash` (relâmpago W12). | AINDA É HIPÓTESE (atenção, W6) · FUGIRAM ANTES ✔ (positivo, W12). |
| 00:49:15 - 01:03:00 | 1485 - 1890 | Pronto: agora você sabe. Enquanto o céu parece calmo, a tempestade já está fazendo barulho. | Céu limpo de novo; os pássaros voltam ao galho; ondas suaves ainda passando ao fundo; mascote acena. | Floresta ensolarada, pássaros voltando, ondas sutis. | `flock.return` 0→1; `mascot.cheer(W1)`, `mascot.wave(W9)`. | O CÉU CALMO PODE ENGANAR (info, W8). |
| (encerramento fixo) | — | Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha! | Fenda fecha + logo. | — | — | — |

## 4. Designs novos (folha ANTES do vídeo — pedido do usuário)
Pássaro canoro caprichado no padrão novo (loft com volume, olho com brilho, bico, asas com penas, pés articulados; cinza com coroa e mancha amarela na asa e máscara preta, inspirado na espécie); rastreador; árvore/floresta; supercélula com tornado; ondas de infrassom; mapa da rota.

## 5. Avisos de rigor
- O infrassom é a **explicação mais provável, mas não foi medido** naquela tempestade → dito na narração.
- Não afirmamos que essa espécie foi testada para infrassom (o teste clássico é com pombos) → "algumas aves".
