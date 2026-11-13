# Roteiro v1 — Acharam sangue de dinossauro no Brasil. Dá pra clonar?

**Quadro:** *Boato ou Verdade?* — EP. 02 (proposta; pode virar vídeo avulso, ver § 7)
**Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.

## 1. Briefing de produção

- **Tema:** a descoberta de vestígios químicos de sangue (heme) e de estruturas parecidas com hemácias num osso de *Aratasaurus museunacionali*, de 115 milhões de anos, do Ceará (PNAS, nov/2026), e a pergunta que todo mundo faz: dá pra clonar?
- **Recorte:** duas checagens em sequência.
  1. **"Acharam sangue de dinossauro"** → MEIA VERDADE: são sinais químicos do heme em microestruturas minerais. Não é sangue líquido, não há proteína intacta e a identificação das hemácias é discutida.
  2. **"Dá pra clonar"** → BOATO: clonar precisa de DNA, e o DNA se desfaz em milhares de anos, não em milhões.
- **Formato:** pergunta → revelação, como **episódio 02 do quadro Boato ou Verdade?**.
  - O medidor do veredito para no **amarelo (meia verdade)** na 1ª checagem e bate no **vermelho (boato)** na 2ª.
  - Duas checagens dão ritmo, e o medidor mostra que nem tudo é preto no branco.
- **Público e objetivo:** leigo. Sair sabendo:
  - quem é o Aratassauro e de onde veio;
  - o que exatamente foi achado e o que não foi;
  - por que não dá pra clonar;
  - por que a descoberta importa mesmo assim.
- **Duração:** ~1:52 planejado (112 s, 3360 frames). O orçamento estima 109 s; a voz real decide.
- **Formato técnico:** 1080 × 1920, 9:16, 30 fps, pt-BR. Timestamps em MM:SS:FF; intervalos [início, fim).
- **Tom:** curioso, de checagem, com orgulho do achado brasileiro, sem vender o que não foi achado.
- **TTS:** edge-tts `pt-BR-AntonioNeural`, rate +4% (cta +0%). Só no texto do TTS, ":" vira ",".
  - Grafia fonética se precisar: "Aratassauro" já está aportuguesado; "heme" pode virar "ême".
- **Paleta da trilha:** `natureza` (pré-história). A anterior foi `tecnologia`.
  - O tema da marca toca no gancho, no "Meia verdade" (s10) e no "Boato" (s14).
- **Direção de arte:**
  - **Diorama do Cretáceo:** margem de lagoa com samambaias, coníferas e água rasa; o **Aratassauro** caminhando.
  - **Mapa:** o mapa do Brasil (já aprovado no vídeo do apagão) com o Ceará em destaque e um corte até a **mina de gesso** em camadas.
  - **Museu:** um prédio neoclássico genérico com chamas estilizadas, para o "nascido do fogo".
  - **Osso:** um **pedaço de perna fossilizado** que se abre em corte. A câmera **mergulha num canal** e mostra as bolinhas minerais (hemácias) e a **molécula do heme** (anel com ferro no centro).
  - **DNA:** uma **hélice de DNA** que se desfaz em pedaços, com uma ampulheta da meia-vida, e um **mosquito no âmbar**.
  - **Fundo:** tinta `#1b2e33` (natureza). Esquenta para `#3a2410` no fogo e vai a vermelho-escuro `#3a1218` dentro do osso.
- **Mascote:**
  - visita o diorama na borda do pedestal, menor que o dinossauro, e se assusta quando ele passa;
  - aponta o Ceará no mapa;
  - espia pelo microscópio no osso;
  - comemora no veredito.
- **Designs novos, que precisam de aprovação na folha de design (Fase 2, 1º passo):**
  1. **Aratassauro** (*Aratasaurus museunacionali*), o modelo caprichado deste vídeo:
     - terópode coelurossauro jovem, ~3,1 m de comprimento, de perfil e em 3/4, com uma pessoa de 1,7 m ao lado;
     - **duas versões para você escolher:** escamas, ou escamas com penugem leve;
     - ver § 5 sobre as penas, que são incerteza científica.
  2. **Diorama do Cretáceo do Araripe:** lagoa rasa, samambaias, coníferas e cavalinhas.
  3. **Fóssil da perna:** fêmur e tíbia parciais, articulados como no fóssil real. Inclui a versão em corte, com canais vasculares.
  4. **Microscopia:** canal vascular com hemácias minerais (elipses côncavas) e uma comparação lado a lado com uma hemácia abaulada com núcleo, para a objeção do s9.
  5. **Molécula do heme:** anel de porfirina com o átomo de ferro, em estilo de modelo de bolinhas.
  6. **Mina de gesso em Santana do Cariri:** cava em degraus brancos (esquemática).
  7. **Museu Nacional estilizado:** fachada neoclássica genérica, sem logo, com chamas estilizadas.
  8. **Hélice de DNA** que se parte, **ampulheta** e **mosquito no âmbar**.
- **Já aprovados:** mascote, mapa do Brasil, medidor do veredito, cartão do quadro e pessoa de referência.
- **Selo "ESQUEMA":**
  - no corte do osso (ampliação fora de escala);
  - na molécula;
  - na mina;
  - selo "RECONSTRUÇÃO ARTÍSTICA" no dinossauro.

**O que se constrói:** a história começa no Cretáceo, com o Aratassauro vivo, e chega ao osso fossilizado.
- O osso se abre e a câmera desce até o canal onde estavam as "hemácias".
- O medidor marca **meia verdade**.
- A pergunta do clone leva à hélice de DNA se desfazendo e ao mosquito no âmbar.
- Veredito **boato**, e o fecho volta ao dinossauro vivo no diorama.

## 2. Tabela cronológica (estimativa até o TTS; a voz real decide os cortes)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:15 | 0 - 255 | Acharam sangue de dinossauro aqui no Brasil, num osso de cento e quinze milhões de anos. Então dá pra clonar um dinossauro? | Abertura da fenda sobre o **osso fossilizado** no estúdio, em close (az 25°, el 15°). Em "sangue", uma gota vermelha brilha dentro do osso. Em "Brasil", chicote para o mapa do Brasil com o Ceará pulsando. Em "clonar", corte para o diorama: o Aratassauro surge numa luz de "laboratório" (silhueta que acende), e a câmera faz punch-in. | Osso em close, brilho vermelho interno, mapa do Brasil (Ceará), Aratassauro (silhueta → cor), mascote. | `fx.flash(0)`; `bone.glow` 0→1 (W1, spring); `fx.whipOut/whipIn` em W5; `brazil.ce` pulso (W6); `dino.reveal` 0→1 (W19, 18 f); `fx.punch(W20)`; `mascot.jump(W19)`. | SANGUE DE DINOSSAURO? (atenção, W1–W6) · 115 MILHÕES DE ANOS (info, W10–W16) · DÁ PRA CLONAR? (atenção, grande, W17). Legenda: sangue, dinossauro, Brasil, 115 milhões, clonar. |
| 00:08:15 - 00:11:07 | 255 - 337 | Este é o Boato ou Verdade. | Cartão do quadro "BOATO OU VERDADE? · EP. 02" sobre o diorama desfocado; o medidor aparece balançando. | Cartão do quadro, medidor do veredito. | `series.card` (0–10); `verdict.show` (W2); balanço do ponteiro (W3–fim); `fx.whipOut(end)`. | Cartão (sem badges). Legenda: Boato, Verdade. |
| 00:11:07 - 00:18:10 | 337 - 550 | O dono do osso é o Aratassauro: um jovem caçador de uns três metros, que viveu onde hoje fica o Ceará. | Diorama do Cretáceo: o Aratassauro caminha da esquerda para a direita na margem da lagoa (câmera acompanha, az 15°→35°, el 10°). Em "três metros", aparece uma régua 2D de 3 m com uma pessoa de 1,7 m em silhueta ao lado. O mascote, na borda do pedestal, recua quando o dino passa. | Diorama, Aratassauro andando (ciclo de passos), régua 3 m + silhueta humana, selo RECONSTRUÇÃO ARTÍSTICA, mascote. | `dino.walk` 0→1 (0–fim, linear; x −3→+3 u3d); `ruler.show` spring (W12); `mascot.place` + `mascot.walk` (recua 0,4 u3d em W9); `mascot.jump(W9)`. | ARATASSAURO (info, W6) · ~3 METROS · JOVEM CAÇADOR (info, W12). Legenda: Aratassauro, caçador, três metros, Ceará. |
| 00:18:10 - 00:24:13 | 550 - 733 | O nome quer dizer nascido do fogo, uma homenagem ao Museu Nacional, que pegou fogo em 2018. | Em "nascido do fogo", o nome ARATA·SAURUS aparece dividido em 2D (ARA = nascido, ATÁ = fogo, tupi). Corte para o Museu Nacional estilizado (fachada neoclássica genérica) com chamas laranja subindo em "pegou fogo". Câmera recua devagar. | Texto 2D da etimologia, fachada do museu, chamas estilizadas, fumaça. | `name.split` spring (W4); `museum.show` corte em W8; `fire.level` 0→1 (W12–W16); `fx.shake(W13, 8)`. | "ARA" + "ATÁ" = NASCIDO DO FOGO (info, W4) · MUSEU NACIONAL · INCÊNDIO DE 2018 (atenção, W10). Legenda: nascido, fogo, Museu Nacional, 2018. |
| 00:24:13 - 00:29:29 | 733 - 899 | O fóssil é um pedaço da perna, achado numa mina de gesso em Santana do Cariri. | Chicote para a mina de gesso (degraus brancos, ESQUEMA) vista de cima em diagonal. Em "pedaço da perna", o fóssil emerge da camada cinza da rocha com brilho. Em "Santana do Cariri", um pino desce no mapa do Ceará (mini-mapa 2D no canto). | Mina de gesso em degraus, camada fossilífera, fóssil da perna aparecendo, pino e mini-mapa do Ceará 2D. | `fx.whipIn()`; `fossil.rise` 0→1 (W4–W7); `pin.cariri` spring (W13); câmera dolly-in 18→11 u3d. | PEDAÇO DA PERNA (info, W4) · SANTANA DO CARIRI · CE (info, W13). Legenda: perna, mina de gesso, Santana do Cariri. |
| 00:29:29 - 00:37:08 | 899 - 1118 | Dentro do osso, há canais finíssimos por onde o sangue passava. Foi ali que os cientistas procuraram. | Estúdio: o fóssil da perna se abre em corte (fatia transversal, `bone.cut` 0→1). Os canais vasculares aparecem como furinhos escuros. Em "sangue passava", um fluxo vermelho translúcido percorre os canais (o que existia em vida). Em "procuraram", o mascote aparece com um microscópio e a câmera aproxima de um canal. | Osso em corte com canais, fluxo vermelho de "vida" (fantasma), microscópio, mascote, selo ESQUEMA. | `bone.cut` 0→1 (W0–W3); `canals.flow` 0→1 (W8–W10); `canals.flow` 1→0 (W11+10); `mascot.place` (W11) + `mascot.point(W13)`; câmera dolly-in 6→2,5 u3d (W11–fim). | CANAIS DO SANGUE (info, W4) · AQUI DENTRO (info, W12). Legenda: canais finíssimos, sangue, cientistas. |
| 00:37:08 - 00:46:17 | 1118 - 1397 | E acharam bolinhas de mineral do tamanho de glóbulos vermelhos. Nelas, sinais químicos do heme, a parte do sangue que segura o oxigênio. | A câmera **mergulha no canal** (zoom de microscópio com vinheta circular): bolinhas minerais avermelhadas (elipses) presas ao canal. Em "heme", uma bolinha se abre e revela a **molécula do heme** girando (anel + ferro dourado no centro). Em "oxigênio", uma esfera O₂ azul encaixa no ferro. | Canal em zoom, hemácias minerais, vinheta de microscópio, molécula do heme, O₂. | `micro.zoom` 0→1 (W0–W2, in); `rbc.show` spring (W2); `heme.show` spring (W14); `heme.spin` contínuo; `o2.dock` 0→1 (W20–W22); `fx.punch(W14)`. | "HEMÁCIAS" MINERAIS (info, W2) · HEME: SEGURA O OXIGÊNIO (info, W14). Legenda: bolinhas, glóbulos vermelhos, heme, oxigênio. |
| 00:46:17 - 00:53:24 | 1397 - 1614 | Só que não é sangue líquido. É uma marca química, uma sombra do sangue que virou pedra junto com o osso. | Em "não é sangue líquido", uma gota vermelha 3D aparece e ganha um ✖ (se desfaz em pó). Em "sombra do sangue", as hemácias do canal ficam cinza-pedra e o heme fica translúcido, como um "fantasma" sobre a pedra. Câmera recua do canal para o osso inteiro. | Gota de sangue + ✖, hemácias petrificando (cor → pedra), heme fantasma. | `drop.show` spring (W2) → `drop.break` 0→1 (W5–W6); `rbc.stone` 0→1 (W10–W16); `heme.ghost` 0→1 (W10); câmera dolly-out 2,5→6 u3d. | NÃO É SANGUE LÍQUIDO (problema, W2) · SÓ UMA MARCA QUÍMICA (info, W8). Legenda: sangue líquido, marca química, sombra, pedra. |
| 00:53:24 - 01:02:23 | 1614 - 1883 | E nem todo mundo está convencido: uma paleontóloga lembra que hemácias de dinossauro deviam ser abauladas, e essas parecem côncavas. | Tela dividida em 3D: à esquerda, a hemácia esperada (oval abaulada, com núcleo, como em aves e répteis); à direita, a do fóssil (côncava). Em "abauladas", a da esquerda gira e mostra o calombo do núcleo; em "côncavas", a da direita gira e mostra o afundado. O medidor desce do topo com o ponteiro tremendo no meio. | Duas hemácias grandes lado a lado, rótulos ESPERADA / ACHADA, medidor 2D. | `split.show` (W0); `rbcA.spin` (W14); `rbcB.spin` (W18); `verdict.show` (W1); `verdict.needle` oscila em 0 ± 15° (W1–fim). | NEM TODOS CONCORDAM (atenção, W1) · ESPERADA: ABAULADA · ACHADA: CÔNCAVA (atenção, W15). Legenda: convencido, paleontóloga, abauladas, côncavas. |
| 01:02:23 - 01:08:18 | 1883 - 2058 | Primeira parte: achar sangue de dinossauro? Meia verdade. | O medidor cresce no centro; em "Meia verdade", o ponteiro para no **amarelo** com um baque suave. Ao fundo, o osso girando devagar. | Medidor grande, osso. | `verdict.big` spring (W0); `verdict.needle` → 0° (W6, spring); `fx.flash(W6, 6)`; tema da marca (W6). | 1ª CHECAGEM (info, W0) · MEIA VERDADE (atenção, grande, W6). Legenda: sangue de dinossauro, meia verdade. |
| 01:08:18 - 01:18:07 | 2058 - 2347 | Agora, o clone. Pra isso, precisaria de DNA. E no osso o DNA se desfaz rápido: metade some a cada uns quinhentos anos. | Chicote para o "laboratório do DNA": uma hélice de DNA girando. Em "metade some", a hélice perde metade dos degraus (pedaços caem); ao lado, uma ampulheta vira e mostra "~500 ANOS". | Hélice de DNA, degraus que caem, ampulheta 2D/3D. | `fx.whipIn()`; `dna.show` spring (W2); `dna.decay` 0→0,5 (W16–W22); `hourglass.flip` (W16). | PRECISARIA DE DNA (info, W7) · METADE SOME A CADA ~500 ANOS (problema, W16). Legenda: clone, DNA, desfaz, metade, quinhentos anos. |
| 01:18:07 - 01:26:13 | 2347 - 2593 | Mesmo no frio ideal, depois de um milhão e meio de anos ele vira picadinho ilegível. Esse osso tem cento e quinze milhões. | Uma barra de tempo 2D cresce da esquerda: marca 1,5 milhão de anos (DNA ilegível) quase no começo; em "cento e quinze milhões", a barra dispara até o fim da tela (proporção real: 1,5 cabe 77× em 115). A hélice vira pó. | Barra do tempo 2D com as duas marcas, hélice virando pó, cristais de gelo leves ("frio ideal"). | `frost.show` (W2); `timeline.k` 0→0,013 (W6–W11); `dna.decay` 0,5→1 (W13–W15); `timeline.k` → 1 (W19–W22, in); `fx.shake(W21, 8)`. | ATÉ NO FRIO: ~1,5 MILHÃO DE ANOS (info, W6) · ESTE OSSO: 115 MILHÕES (problema, W19). Legenda: frio ideal, milhão e meio, ilegível, 115 milhões. |
| 01:26:13 - 01:32:16 | 2593 - 2776 | E o mosquito no âmbar, do filme? Nunca acharam DNA de dinossauro em âmbar. | Um bloco de âmbar dourado gira com um mosquito dentro (luz atravessando). Em "Nunca acharam", um ✖ vermelho carimba o âmbar. | Âmbar com mosquito, luz dourada, ✖. | `amber.show` spring (W2); `amber.spin` contínuo; `amber.cross` spring (W7). | E O MOSQUITO? (atenção, W2) · NENHUM DNA DE DINOSSAURO EM ÂMBAR (problema, W8). Legenda: mosquito, âmbar, filme, nunca. |
| 01:32:16 - 01:52:00 | 2776 - 3360 | Veredito: clonar o Aratassauro? Boato. Pronto: agora você sabe. Acharam a sombra do sangue, não um dinossauro pronto pra voltar. | O medidor grande desce; em "Boato", o ponteiro bate no **vermelho** com tremor e clarão. Em "Pronto", volta o diorama: o Aratassauro caminha na lagoa, como "fantasma" do passado (leve transparência); o mascote acena. Resumo 2D com 2 ícones: gota amarela ("sombra do sangue: meia verdade") e hélice vermelha ("clone: boato"). Encerramento fixo da marca na sequência. | Medidor grande, diorama, Aratassauro, mascote, 2 ícones de resumo. | `verdict.big` (W0); `verdict.needle` → −82° (W4, spring com overshoot); `fx.shake(W4, 12)`; `fx.flash(W4)`; `verdict.big` 1→0 (W5+10); `dino.ghost` 0→0,35 (W9–W19); `summary.a/b` spring (W9, W14); `mascot.cheer(W5)`; `mascot.wave(W16)`. | VEREDITO: BOATO (problema, grande, W4) · ACHARAM A SOMBRA DO SANGUE (solução, W11). Legenda: veredito, boato, pronto, sombra, voltar. |

**Soma:** 255 + 82 + 213 + 183 + 166 + 219 + 279 + 217 + 269 + 175 + 289 + 246 + 183 + 584 = 3360 frames (112 s). A última linha inclui ~5,5 s do encerramento fixo da marca. Frames contíguos de 0 a 3360.

## 3. State / Props

Ver `scene-plan.ts`: tipos, poses de câmera, 14 cenas e 3360 frames. A linha do tempo é determinística, derivada do frame, com 3D (R3F) e camada 2D separados, como nos vídeos anteriores.

## 4. Áudio e montagem

**Narração integral (251 palavras nas cenas):**

Acharam sangue de dinossauro aqui no Brasil, num osso de cento e quinze milhões de anos. Então dá pra clonar um dinossauro? Este é o Boato ou Verdade. O dono do osso é o Aratassauro: um jovem caçador de uns três metros, que viveu onde hoje fica o Ceará. O nome quer dizer nascido do fogo, uma homenagem ao Museu Nacional, que pegou fogo em 2018. O fóssil é um pedaço da perna, achado numa mina de gesso em Santana do Cariri. Dentro do osso, há canais finíssimos por onde o sangue passava. Foi ali que os cientistas procuraram. E acharam bolinhas de mineral do tamanho de glóbulos vermelhos. Nelas, sinais químicos do heme, a parte do sangue que segura o oxigênio. Só que não é sangue líquido. É uma marca química, uma sombra do sangue que virou pedra junto com o osso. E nem todo mundo está convencido: uma paleontóloga lembra que hemácias de dinossauro deviam ser abauladas, e essas parecem côncavas. Primeira parte: achar sangue de dinossauro? Meia verdade. Agora, o clone. Pra isso, precisaria de DNA. E no osso o DNA se desfaz rápido: metade some a cada uns quinhentos anos. Mesmo no frio ideal, depois de um milhão e meio de anos ele vira picadinho ilegível. Esse osso tem cento e quinze milhões. E o mosquito no âmbar, do filme? Nunca acharam DNA de dinossauro em âmbar. Veredito: clonar o Aratassauro? Boato. Pronto: agora você sabe. Acharam a sombra do sangue, não um dinossauro pronto pra voltar.

**Encerramento fixo da marca:** "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!"

**Tempo:** estimado em 95 s de fala, 7,8 s de pausas e 6,2 s de abertura e respiro: ~109 s. Após o TTS, os cortes vêm da voz e `SECONDS` se ajusta (provável 1:50–1:53).

**Efeitos:**
- Reaproveitados: fenda-open/close, whoosh, thud, pop, tick, ding, badge, buzz, glow, final, shimmer, fire, crumble, rewind.
- Novos:
  - `dino-step`: passos pesados, abafados;
  - `dino-call`: chamado curto e grave, sintetizado, sem imitar som de filme;
  - `microscope`: clique de foco + zumbido baixo;
  - `drip`: gota;
  - `dust`: pó caindo;
  - `hourglass`: areia escorrendo;
  - `amber-ring`: brilho vítreo.

**Trilha:** paleta `natureza`.
- INTENTS: tense, curious, calm, curious, curious, build, reveal, tense, tense, reveal, build, tense, curious, resolve.
- HITS em "clonar" (s1), "heme" (s7), "verdade" (s10) e "Boato" (s14).

## 5. Verificação de fatos

| Afirmação | Situação | Fonte |
| --- | --- | --- |
| Estudo na PNAS (nov/2026): sinais de heme B (e derivado 3,8-dietil heme B) em microestruturas minerais dentro de canais vasculares de um osso de *Aratasaurus museunacionali*, 115 milhões de anos | confirmado (DOI 10.1073/pnas.2614248123) | PNAS; ScienceDaily; Phys.org |
| Não é sangue líquido nem hemoglobina intacta | confirmado (os próprios autores ressaltam) | ScienceDaily; La Brújula Verde |
| A identificação das "hemácias" é uma interpretação; Mary Schweitzer aponta que hemácias de dinossauro teriam núcleo e formato abaulado, e as estruturas do fóssil são côncavas | confirmado (ABC News) | ABC News (Austrália) |
| *Aratasaurus*: coelurossauro basal, jovem, ~3,12 m, ~4 anos; holótipo é uma perna direita parcial (fêmur distal, tíbia proximal, pé incompleto) | confirmado (artigo original) | Sayão et al. 2020, *Scientific Reports* (PMC7351750) |
| Nome: tupi "ara" (nascido) + "atá" (fogo); espécie homenageia o Museu Nacional (incêndio de 2018) | confirmado | Sayão et al. 2020 |
| Achado numa mina de gesso (Mina Pedra Branca, entre Nova Olinda e Santana do Cariri), em 2008 | confirmado em fontes jornalísticas (O Povo). O artigo de 2020 também coloca o fóssil na base da Formação Romualdo; dizemos "Santana do Cariri" e "mina de gesso", sem a data de 2008 | O Povo; Techno-Science |
| Meia-vida média do DNA em osso: ~521 anos (fósseis de moa) | confirmado (Allentoft et al. 2012, *Proc R Soc B*). Arredondado para "uns quinhentos anos". O valor varia com a temperatura | PubMed 23055061 |
| Mesmo a −5 °C, o DNA fica ilegível em ~1,5 milhão de anos (ligações todas quebradas em ~6,8 milhões) | confirmado (mesma equipe/estudo). Dizemos "um milhão e meio" e "picadinho ilegível" | Scientific American; The Scientist |
| Nunca se recuperou DNA de dinossauro de âmbar | conhecimento de referência (não há DNA de dinossauro confirmado de nenhuma fonte; testes em insetos em resina não acharam DNA antigo) | — |
| Penas no *Aratasaurus* | **incerto**: não há penas preservadas no fóssil. Coelurossauros próximos tinham penugem, mas é inferência. Por isso proponho as duas versões do modelo e o selo RECONSTRUÇÃO ARTÍSTICA | — |

## 6. Critérios de aceite

- Gancho imediato: "sangue de dinossauro" e "dá pra clonar?" nos primeiros 8 s.
- As duas checagens têm veredito próprio no medidor: amarelo (meia verdade) e vermelho (boato).
- A prova do s9 mostra o contraste lado a lado (abaulada × côncava) e fecha a lógica com "nem todo mundo está convencido".
- A barra do tempo do s12 respeita a proporção: 1,5 milhão é ~1,3% de 115 milhões.
- Selo RECONSTRUÇÃO ARTÍSTICA no dinossauro; ESQUEMA no corte, na molécula e na mina.
- Nenhuma marca, logo ou imagem de filmes; o "filme" só é citado na fala.
- Mascote menor que o dinossauro e posto na borda do pedestal (regra de escala).
- Tabela com 14 linhas, soma exata de 3360 frames. `scene-plan.ts` consistente com a tabela.
- Nada foi renderizado, ouvido ou validado nesta fase.

## 7. Pontos fracos (honestos)

- **Quadro ou avulso?** Encaixar no Boato ou Verdade reforça a série, mas a manchete "acharam sangue de dinossauro" não é exatamente um boato: é uma notícia real exagerada. Por isso o veredito duplo (meia verdade e boato). Se preferir vídeo avulso, corto o s2 e os medidores, e o vídeo encurta ~4 s.
- **Mais designs novos que o normal (8),** com o dinossauro como peça principal. É o que vai consumir mais tempo e passar pela sua aprovação.
- **Penas:** não há evidência direta, e qualquer escolha é reconstrução. Proponho as duas versões na folha para você decidir.
- **Densidade técnica:** heme, hemácias, meia-vida e âmbar em 1:52. O s9 (a objeção da paleontóloga) é o trecho mais "científico" e o candidato a corte se quiser encurtar. Mas é ele que deixa o vídeo honesto.
- **A notícia já tem uma semana.** Não é tão urgente quanto o apagão, mas também não vai durar meses no pico de buscas.
- **Não ouvi nada:** pronúncia de "Aratassauro", "heme" e "Cariri" a conferir no TTS.

## Fontes

- PNAS (2026) — Heme signatures in mineralized red blood cells within vascular canals of a 115-million-year-old dinosaur bone: https://www.pnas.org/doi/abs/10.1073/pnas.2614248123
- ScienceDaily: https://www.sciencedaily.com/releases/2026/11/261105224542.htm
- Phys.org: https://phys.org/news/2026-10-dinosaur-blood-oldest-discovery-rewrites.html
- ABC News (Austrália), com a objeção de Mary Schweitzer: https://www.abc.net.au/news/science/2026-11-03/signs-of-mineralised-molecules-from-dinosaurs-red-blood-cell/107335770
- La Brújula Verde: https://www.labrujulaverde.com/en/2026/11/scientists-find-chemical-traces-of-blood-in-a-115-million-year-old-dinosaur-but-not-blood-itself/
- Sayão et al. 2020, *Scientific Reports* (descrição do Aratasaurus): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7351750/
- O Povo (achado na mina de gesso): https://mais.opovo.com.br/jornal/cidades/2026/11/05/fossil-de-dinossauro-de-115-milhoes-de-anos-encontrado-no-ceara-tem-vestigios-de-sangue.html
- Allentoft et al. 2012 — The half-life of DNA in bone: https://pubmed.ncbi.nlm.nih.gov/23055061/
- Scientific American — meia-vida do DNA: https://www.scientificamerican.com/article/dinos-dna-demise-genetic-material-512-year-half-life/
