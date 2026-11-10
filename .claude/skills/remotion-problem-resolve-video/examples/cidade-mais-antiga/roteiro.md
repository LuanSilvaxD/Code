# Roteiro v1 — Qual é a cidade mais antiga que ainda existe?

> Status: **AGUARDANDO APROVAÇÃO** — implementação e renderização não iniciadas.
> Convenção: timestamps MM:SS:FF a 30 fps (FF 00–29); frames em intervalo semiaberto [início, fim).
> Tempos são estimativas até existir a narração real; depois do TTS os cortes passam a ser derivados da voz.

## 1. Briefing de produção

- **Tema/recorte:** "cidade mais antiga que ainda existe" não tem resposta única — depende da regra. O vídeo
  constrói as regras uma a uma (problema → solução) e revela no fim a candidata mais citada pela regra mais
  dura: **Damasco** (habitada sem parar), deixando claro que **Jericó** é mais velha, mas teve intervalos.
- **Gancho (do usuário):** "Qual é a cidade mais antiga que ainda existe?"
- **Público/objetivo:** leigo; entender como se mede a idade de uma cidade (camadas de um *tell*), por que
  "mais antiga" depende do critério e qual é a resposta mais aceita.
- **Formato:** 90 s, 1080 × 1920, 9:16, 30 fps (2700 frames), pt-BR, narração didática, informal e ágil.
- **Sistema construído/revelado:** um único bloco de terreno em corte com quatro *tells* lado a lado — Roma,
  Çatalhöyük, Jericó e Damasco. A profundidade das camadas é a idade (régua do tempo na face de corte,
  1 u3d ≈ 2.500 anos, **esquemático**).
- **Problemas que conduzem a evolução:** "como medir a idade?" → cavar/camadas → "a mais funda vence?" →
  Çatalhöyük está abandonada (regra 1: habitada) → Jericó é a mais velha mas ficou vazia (regra 2: sem
  parar) → provar continuidade é difícil (a cidade atual cobre as provas) → a candidata que sobra: Damasco.
- **Direção de arte:** diorama low-poly fosco; terreno bege-areia, camadas em tons de terra (mais escuras
  quanto mais fundas), casas brancas/ocre, Roma com telhados terracota, Damasco com cúpulas e minarete
  estilizados (sem copiar monumentos reais), torre de Jericó em pedra cinza, faixas vazias em vermelho
  translúcido, céu de fim de tarde quente.
- **Câmera:** perspectiva, FOV ~24°; viagens laterais entre os *tells*; planos de detalhe mirando a face de corte.
- **TTS planejado:** edge-tts (gratuito), voz `pt-BR-AntonioNeural`, rate +0% (mesma do vídeo anterior).

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:07:00 | 0 – 210 | Qual é a cidade mais antiga que ainda existe? Roma tem quase três mil anos, e nem chega perto. | Plano alto da cidade de Roma no topo do terreno (orbit d=16, az 28°, el 26°) → desce para a face de corte (d=18, el 8°) em "Roma" → abre para a vista geral dos 4 morros (d=78, az −58°). | Terreno em corte, Roma (prédios + camadas rasas), régua do tempo; os outros 3 morros ainda sem nome, escurecidos. | `rome.city` spring 0→1 (−6→30); `rome.reveal` 0→1 ("Roma"→"anos", out); `timeRuler.show` 0→1; `others.dim` 1→0,4 ("nem"→fim). | ❓ QUAL É A MAIS ANTIGA? ("Qual"); ℹ ROMA ≈ 2.800 ANOS ("Roma"). Destaques: CIDADE, ANTIGA, EXISTE, ROMA, TRÊS, MIL, PERTO. |
| 00:07:00 – 00:13:15 | 210 – 405 | Pra descobrir, você precisa cavar. Cidades antigas crescem em cima das próprias ruínas, camada por camada. | Viagem até o 2º morro (ainda sem nome): topo (d=16, el 22°) → corte (d=26, el 10°). | Pá cavando; o morro cresce por empilhamento de 8 camadas de cidade (cada uma com casinhas que viram ruína e ganham outra por cima). | `shovel.dig` 0→1 ("você"→"Cidades"); `catal.reveal` 0→1; `catal.layers` 0→8 (linear, "crescem"→fim −6 f), uma camada a cada ~0,5 s com "tick". | ℹ CIDADE SOBRE CIDADE ("crescem"). Destaques: CAVAR, CRESCEM, RUÍNAS, CAMADA. |
| 00:13:15 – 00:20:00 | 405 – 600 | Esse morro de cidades empilhadas se chama tell. Quanto mais funda a camada, mais antiga ela é. | Do corte inteiro (d=26) desce acompanhando a seta até a camada do fundo (d=16, el 2°). | Contorno do morro destacado; seta vertical "mais antigo" descendo; camada do fundo brilha. | `catal.outline` 0→1 ("morro"→"tell"); `depthArrow.show` 0→1 ("Quanto"→"antiga"); `catal.bottomGlow` 0→1 ("antiga"→fim). | ✔ TELL — morro de cidades empilhadas ("tell"); ℹ MAIS FUNDO = MAIS ANTIGO ("antiga"). Destaques: MORRO, EMPILHADAS, TELL, FUNDA, ANTIGA. |
| 00:20:00 – 00:27:00 | 600 – 810 | Então é só achar a camada mais funda? Olha Çatalhöyük, na Turquia: mais de nove mil anos. | Da camada do fundo (d=16) sobe para o corte (d=22) e o topo do morro (d=16, el 22°). | Marcador da régua do tempo descendo até ~9.000 anos; plaquinha com o nome. | `timeRuler.mark` 0→3,6 u3d ("mais de nove mil"); `catal.nameTag` 0→1 ("Çatalhöyük"). | ❓ A MAIS FUNDA? ("achar"); ℹ ÇATALHÖYÜK — Turquia · mais de 9.000 anos. Destaques: FUNDA, ÇATALHÖYÜK, TURQUIA, NOVE, MIL. |
| 00:27:00 – 00:33:15 | 810 – 1005 | Só que ela foi abandonada. Hoje é só ruína. Primeira regra: a cidade tem que estar habitada. | Órbita leve no topo (az 24°→6°). | Casas do topo desmoronam e viram ruína com grama; o morro perde a cor; cartão 2D de regras com "1. HABITADA HOJE". | `catal.ruin` 0→1 ("foi"→"ruína"); `catal.desat` 0→1; `ruleCard.rule1` spring (damping 12) em "Primeira". | ✖ ABANDONADA ("abandonada"); ✔ REGRA 1: HABITADA HOJE ("Primeira"). Destaques: ABANDONADA, RUÍNA, REGRA, HABITADA. |
| 00:33:15 – 00:40:15 | 1005 – 1215 | Agora Jericó, na Cisjordânia. Lá tem uma torre de pedra com uns dez mil anos. Ninguém bate isso. | Viagem até o 3º morro (topo, d=17) → mergulho pela face de corte até a torre no fundo (d=14, el 3°) → abre para o corte inteiro (d=24). | Jericó: morro mais fundo, cidade pequena atual ao lado, torre de pedra redonda na camada profunda. | `jericho.reveal` 0→1 ("Jericó"→"tem"); `jericho.towerGlow` 0→1 ("torre"); `timeRuler.mark` →4,0 u3d ("dez mil anos"). | ℹ JERICÓ — Cisjordânia; ✔ TORRE ≈ 10.000 ANOS ("torre"). Destaques: JERICÓ, CISJORDÂNIA, TORRE, PEDRA, DEZ, MIL. |
| 00:40:15 – 00:46:00 | 1215 – 1380 | Mas olha as camadas: em alguns períodos, ficaram séculos vazias. Ninguém morava ali. | Órbita lateral sobre o corte de Jericó (az 6°→−8°). | Duas faixas de camada viram areia vazia, destacadas em vermelho translúcido. | `jericho.gaps` 0→1 ("camadas"→"vazias"); `jericho.towerGlow` →0,3. | ✖ SÉCULOS VAZIA — intervalos sem moradores ("séculos"). Destaques: CAMADAS, SÉCULOS, VAZIAS, NINGUÉM. |
| 00:46:00 – 00:52:00 | 1380 – 1560 | Por isso, muita gente usa uma regra mais dura: habitada sem parar, sem grandes intervalos. | Dolly-out até enquadrar Çatalhöyük e Jericó juntos (d=40). | Cartão de regras ganha "2. SEM PARAR"; bandeirinha vermelha sobre Jericó. | `ruleCard.rule2` spring em "habitada"; `jericho.flag` 0→1 ("sem grandes intervalos"). | ✔ REGRA 2: SEM PARAR — ocupação contínua ("habitada"). Destaques: REGRA, DURA, HABITADA, PARAR, INTERVALOS. |
| 00:52:00 – 00:58:00 | 1560 – 1740 | Só que provar isso é difícil: a cidade de hoje está construída em cima das provas. | Viagem até o 4º morro (sem nome): topo com cidade densa (d=18) → corte (d=20). | Cidade densa no topo; corte mostra camadas rasas conhecidas e, abaixo, zona hachurada com "?"; escavadeira barrada com ✖. | `damascus.reveal` 0→1 ("cidade"→"construída"); `excavator.blocked` spring em "está"; `damascus.unknown` 0→1 ("provas"). | ✖ PROVAS ENTERRADAS — sob a cidade atual ("construída"). Destaques: PROVAR, DIFÍCIL, HOJE, CONSTRUÍDA, PROVAS. |
| 00:58:00 – 01:02:15 | 1740 – 1875 | Mesmo assim, uma candidata aparece em quase todas as listas. | Dolly-in no 4º morro (d=20→14). | Silhueta com "?" pulsando sobre o morro; 3 cartões de lista 2D com a mesma linha borrada. | `damascus.mystery` 0→1 ("candidata"); `listCards.show` 0→1 ("aparece"→"listas"). | ❓ A FAVORITA... ("candidata"). Destaques: CANDIDATA, TODAS, LISTAS. |
| 01:02:15 – 01:09:00 | 1875 – 2070 | Registros mostram gente vivendo nela há pelo menos quatro mil anos. E, até onde se sabe, nunca ficou vazia. | Desce pela face de corte (d=17) acompanhando a faixa verde contínua. | Régua marca ≥4.000 anos; faixa verde contínua do topo até lá (sem buracos), a zona "?" continua abaixo. | `timeRuler.mark` →1,6 u3d ("quatro mil anos"); `damascus.continuous` 0→1 ("até"→"vazia"). | ℹ ≥ 4.000 ANOS — registros históricos; ✔ SEM ABANDONO CONHECIDO ("nunca"). Destaques: REGISTROS, QUATRO, MIL, NUNCA, VAZIA. |
| 01:09:00 – 01:16:00 | 2070 – 2280 | Ela é Damasco, na Síria. Muitos a consideram a cidade habitada sem parar mais antiga do mundo. | Revelação: plano heroico de baixo do 4º morro (d=15, az −20°) com órbita até az 8°. | O "?" estoura em confete; nome DAMASCO e coroa sobre o morro. | `damascus.mystery`→0; `damascus.name` spring (damping 10) em "Damasco"; `damascus.crown` spring (damping 9); `confetti` 0→1 (45 f). | ✔ DAMASCO (large) — Síria; ⚠ TÍTULO DISPUTADO ("Muitos"). Destaques: DAMASCO, SÍRIA, HABITADA, PARAR, ANTIGA, MUNDO. |
| 01:16:00 – 01:21:15 | 2280 – 2445 | Jericó é mais velha, mas teve intervalos. Ou seja: a resposta depende da regra. | Dolly-out para enquadrar Jericó e Damasco lado a lado (d=34, el 5°). | Barras de idade: Jericó mais longa com buracos vermelhos; Damasco mais curta, contínua verde. | `compare.bars` 0→1 (0→"intervalos"+6). | ℹ JERICÓ: MAIS VELHA — com intervalos; ✔ DAMASCO: SEM PARAR — a mais citada ("Ou"). Destaques: JERICÓ, VELHA, INTERVALOS, RESPOSTA, DEPENDE, REGRA. |
| 01:21:15 – 01:30:00 | 2445 – 2700 | Pronto: agora você sabe qual é a mais antiga, e por que até arqueólogos discutem isso. | Dolly-out até o diorama completo em diagonal (d=82, az −56°) e órbita lenta até az −46°; fade de 18 f. | Os 4 morros com rótulos: ROMA · ÇATALHÖYÜK (abandonada) · JERICÓ (intervalos) · DAMASCO (sem parar). | `others.dim`→1; `finalLabels.reveal` 0→1 escalonado; `fade` 0→1 (últimos 18 f). | ℹ CIDADE MAIS ANTIGA (large) — Jericó (mais velha) · Damasco (sem parar). Destaques: PRONTO, ANTIGA, ARQUEÓLOGOS, DISCUTEM. |

Soma: 210+195+195+210+195+210+165+180+180+135+195+210+165+255 = **2700 frames** (90 s), contíguos de 0 a 2699.

## 3. Estrutura de State / Props para Remotion

Contrato completo em `scene-plan.ts` (14 cenas, tipos do template): `VideoConfig` (1080×1920, 30 fps, 2700
frames, pt-BR) e `ScenePlan[]` com narração idêntica à tabela, câmera por chaves `orbit(...)`, objetos de id
estável (`terrain`, `timeRuler`, `tellRome`, `tellCatal`, `tellJericho`, `tellDamascus` + extras por cena),
trilhas `objeto.propriedade` com unidade, badges, highlights, legendas provisórias e audioCues `planned`.
Checado nesta fase: `tsc --strict` sem erros e integridade (contígua, soma 2700) com as utilidades do template.

- **Determinismo:** tudo é função do frame (`track`); partículas/confete com `random(seed)`; frames locais nas `Sequence`.
- **Camada 3D** (`@remotion/three` + R3F): terreno em corte, camadas dos *tells* (faixas extrudadas na face de
  corte), casas, torre, escavadeira, coroa. O empilhamento da cena 2 é `catal.layers` (0→8): a camada *n*
  aparece quando o valor passa de *n*. **Camada 2D:** badges, legendas, cartão de regras, cartões de lista,
  rótulos ancorados e barras de comparação.

## 4. Áudio e montagem

**Narração integral (224 palavras):**

Qual é a cidade mais antiga que ainda existe? Roma tem quase três mil anos, e nem chega perto. Pra descobrir,
você precisa cavar. Cidades antigas crescem em cima das próprias ruínas, camada por camada. Esse morro de cidades
empilhadas se chama tell. Quanto mais funda a camada, mais antiga ela é. Então é só achar a camada mais funda? Olha
Çatalhöyük, na Turquia: mais de nove mil anos. Só que ela foi abandonada. Hoje é só ruína. Primeira regra: a cidade
tem que estar habitada. Agora Jericó, na Cisjordânia. Lá tem uma torre de pedra com uns dez mil anos. Ninguém bate
isso. Mas olha as camadas: em alguns períodos, ficaram séculos vazias. Ninguém morava ali. Por isso, muita gente
usa uma regra mais dura: habitada sem parar, sem grandes intervalos. Só que provar isso é difícil: a cidade de hoje
está construída em cima das provas. Mesmo assim, uma candidata aparece em quase todas as listas. Registros mostram
gente vivendo nela há pelo menos quatro mil anos. E, até onde se sabe, nunca ficou vazia. Ela é Damasco, na Síria.
Muitos a consideram a cidade habitada sem parar mais antiga do mundo. Jericó é mais velha, mas teve intervalos. Ou
seja: a resposta depende da regra. Pronto: agora você sabe qual é a mais antiga, e por que até arqueólogos discutem isso.

- **Ritmo:** na mesma voz do vídeo do tsunami (221 palavras = 73,5 s), estimo ~75 s de fala + ~12 s de
  pausas + respiro final ≈ 90 s. Se passar, corto texto antes de acelerar.
- **Pronúncia:** o TTS pode errar "Çatalhöyük" (pronúncia aproximada: tcha-tal-RÔ-iuk) e "tell". Se errar,
  mando ao TTS uma grafia fonética só para o áudio; a legenda mantém a grafia correta.
- **Efeitos (sintetizados):** whoosh, pá cavando, "tick" a cada camada empilhada, desmoronamento (Çatalhöyük),
  "ding" da torre, buzz de alerta (vazios/provas), hidráulico da escavadeira, whoosh grande + acorde de revelação
  (Damasco), toques de badge, acorde final.
- **Trilha:** misteriosa e curiosa (modo menor, percussão leve) até a cena 11, suspense com riser na pausa de
  1,2 s antes de "Ela é Damasco", resolução em maior na revelação e no final. Abaixa sob a voz.
- **Legendas:** blocos provisórios; palavra a palavra só após o alinhamento com o áudio real.

## 5. Critérios de aceite e notas de verificação

- [x] Gancho imediato (pergunta do usuário + Roma "nem chega perto").
- [x] Cadeia causal: medir idade → camadas (*tell*) → a mais funda está abandonada (regra 1) → a mais velha
  teve intervalos (regra 2) → provar continuidade é difícil → candidata que sobra → revelação → "depende da regra".
- [x] Termo depois da explicação (TELL, OCUPAÇÃO CONTÍNUA); revelação guardada até 01:09.
- [x] Sistema persistente (mesmo terreno e mesmos 4 morros do começo ao fim); final mostra o sistema completo.
- [x] Tabela completa, 14 planos de 4,5–8,5 s, frames contíguos, soma 2700 (checado em `scene-plan.ts`).
- [ ] Leitura no celular, sincronização, pronúncia e áudio: só verificáveis na Fase 2. Nada foi gerado ainda.

**Rigor e premissas:**
- **Não existe resposta única.** Jericó tem os vestígios mais antigos de assentamento permanente
  (~10.000–9.000 a.C.) e muralha/torre de ~8.000 a.C. (alguns datam a torre em ~8.300 a.C.), mas tem
  **intervalos documentados** (p.ex. desocupada do fim do séc. XV ao séc. X–IX a.C.). Damasco é a resposta
  mais comum para "habitada sem parar", mas a continuidade não está provada camada por camada — por isso
  "muitos a consideram" e o badge TÍTULO DISPUTADO.
- **Damasco "há pelo menos quatro mil anos":** a UNESCO cita origens no 3º milênio a.C. A alegação popular de
  "10.000 anos" vem de Tell Ramad, sítio nos **arredores**, e tem datação contestada — por isso fica fora da narração.
- **Çatalhöyük:** ocupada de ~7.100 a.C. a ~5.600 a.C. (UNESCO 2012) → "mais de nove mil anos" e abandonada.
- **Roma:** fundação tradicional em 753 a.C. → "quase três mil anos".
- Outras candidatas existem (Biblos, Alepo, Argos, Atenas, Plovdiv, Luxor/Faiyum, Varanasi…) e ficam de fora
  por tempo; nenhuma muda a lógica do vídeo.
- Modelos de cidade são estilizados (sem reproduzir monumentos reais); profundidade/idade é esquemática.

**Fontes consultadas:**
- UNESCO — Ancient Damascus: https://whc.unesco.org/en/list/20
- UNESCO — Neolithic Site of Çatalhöyük: https://whc.unesco.org/en/list/1405
- Tell es-Sultan (Jericó), visão geral e intervalos: https://en.wikipedia.org/wiki/Tell_es-Sultan
- World History Encyclopedia — Early Jericho: https://www.worldhistory.org/article/951/
- Old city of Damascus (Tell Ramad e datações): https://en.wikipedia.org/wiki/Old_city_of_Damascus
- Panorama das listas populares: https://history.howstuffworks.com/world-history/oldest-city-in-world.htm
