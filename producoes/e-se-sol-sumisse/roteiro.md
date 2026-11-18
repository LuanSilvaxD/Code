# Roteiro v1 (VÍDEO-TESTE): "E se o Sol sumisse agora?"

## 1. Briefing
- **Por que este tema:** o formato "E se…?" é o campeão do canal (Lua, formigas e Terra parada ficaram entre os 5 melhores no YouTube e com ~500 views no TikTok). Testar a abertura nova num formato já conhecido isola melhor o efeito das mudanças.
- **Duração-alvo:** ~48–50 s (antes: 60–75 s).
- **Voz:** AntonioNeural ~+6%. **Trilha:** espaço/tensão; silêncio quase total depois que o Sol some (contraste).

## 2. Ajustes do teste (o que muda em relação aos vídeos anteriores)

| # | Ajuste | Por quê |
| --- | --- | --- |
| 1 | **Sem a fenda de abertura.** O frame 1 já mostra o Sol e a Terra, com a pergunta gigante **"E SE O SOL SUMISSE?"** na tela | 46% deslizam no começo; os 0,7 s de logo antes da ação podem custar deslizadas |
| 2 | **Selo pequeno da marca no canto** o vídeo todo, no lugar da animação inicial | Mantém a identidade sem atrasar o gancho |
| 3 | **Contador "8:20" na tela desde o 1º segundo**, regressivo e acelerado | Cria um "o que acontece no zero?" que segura até o meio |
| 4 | **~50 s** | A média assistida hoje é ~33 s, e um vídeo mais curto deve ter % concluído maior |
| 5 | **Corte ou mudança visual a cada ~2–3 s** | Ritmo de Short; antes eram 3–8 s |
| 6 | **Momento de silêncio e escuro** quando o Sol some (0,8 s) | Quebra de padrão que prende a atenção |
| 7 | Curtir + inscrever (versão lenta) a ~45% | Mantido |
| 8 | Encerramento da marca mantido (fenda fecha + chamada falada) | Mantido |

## 3. Tabela cronológica (estimada)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:05:15 | 0 - 165 | E se o Sol sumisse agora? Durante oito minutos, você nem ia perceber. | **Frame 1:** o Sol enorme à esquerda e a Terra em órbita à direita, já em movimento. Gancho gigante "E SE O SOL SUMISSE?" no centro (0–1,6 s). Em "oito minutos" aparece o contador **8:20** e começa a descer. O mascote flutua perto da Terra, despreocupado. | Sun (já existe), Earth (já existe), HookText2D, Countdown2D, selo da marca no canto. | Gancho entra no frame 0, sem fade, e sai em 1,6 s; contador com pop; câmera em leve dolly. | E SE O SOL SUMISSE? → 8:20 |
| 00:05:15 - 00:13:15 | 165 - 405 | É o tempo que a luz dele leva pra chegar aqui. Depois disso, escuridão total, e a Terra sai da órbita em linha reta. | Um "trem" de luz amarela viaja do Sol até a Terra, com o contador acelerado chegando a 0:00. **O Sol some** (0,8 s de escuro e silêncio), depois a luz que já estava no caminho se apaga na Terra. Em "linha reta", a órbita tracejada vira uma linha reta e a Terra segue reto para o escuro. | LightTrain (pulsos amarelos), Countdown2D, órbita tracejada → reta. | Contador acelerado; flash invertido (apagão) no 0:00; trilha corta; tremor leve na saída da órbita. | A LUZ LEVA 8 MIN 20 S → TERRA SAI EM LINHA RETA |
| 00:13:15 - 00:19:15 | 405 - 585 | As plantas param a fotossíntese. Em uma semana, o planeta inteiro fica abaixo de zero. | Close numa árvore pequena na Terra escurecida: as folhas murcham e ficam marrons, e cai geada. Corte para a Terra inteira, com o gelo se espalhando dos polos. Termômetro descendo. | WiltingTree (novo), FrostEarth (novo: camada de gelo crescendo), Thermometer3D (já existe). | `wilt` 0→1; `frost` 0→0,4; termômetro de 15 para 0. | FOTOSSÍNTESE PARA → 1 SEMANA: ABAIXO DE ZERO |
| 00:19:15 - 00:25:15 | 585 - 765 | Em um ano, a média chega a setenta e três graus negativos, e os oceanos congelam por cima. | A Terra quase toda branca. Contador de dias "DIA 365" e termômetro em −73 °C. Corte para o oceano em corte: uma camada de gelo por cima e água escura embaixo. **Curtir + inscrever** na lateral (~45%). | FrostEarth (frost 1), Thermometer3D, IceOceanSlice (novo). | `frost` 0,4→1; contador de dias (count); a camada de gelo engrossa. | 1 ANO: −73 °C (ESTIMATIVA) → OCEANO CONGELA POR CIMA |
| 00:25:15 - 00:31:15 | 765 - 945 | Mas lá no fundo, perto das fontes quentes do fundo do mar, a vida ainda pode resistir. | A câmera mergulha no corte do oceano até o fundo: uma chaminé hidrotermal soltando fumaça quente, vermes-tubo vermelhos e brilho laranja. Único ponto de cor e calor na tela. O mascote acena lá embaixo. | HydrothermalVent (novo: chaminé + "fumaça" + vermes-tubo). | Mergulho da câmera (lin); a fumaça sobe em loop; os vermes balançam; brilho pulsando. | FONTES HIDROTERMAIS → A VIDA RESISTE |
| 00:31:15 - 00:39:00 | 945 - 1170 | Pronto: agora você sabe. Sem o Sol, a gente teria oito minutos. Depois, só o escuro. | Plano final: a Terra congelada vagando no escuro, só com estrelas. O contador "8:20" reaparece e apaga. Termina em quase escuro antes da fenda fechar. | FrostEarth, estrelas, Countdown2D. | Câmera se afastando devagar; o contador pisca e some; fade para escuro. | SEM O SOL: 8 MINUTOS… DEPOIS, ESCURO |
| 00:39:00 - 00:44:15 | 1170 - 1335 | (encerramento fixo da marca) | Fenda fecha. | BrandOutro. | Padrão. | — |

## 4. Fatos e fontes
- A luz do Sol leva ~8 min 20 s até a Terra. A gravidade também "avisa" na velocidade da luz, então a Terra só sai da órbita nesse momento, e segue em linha reta ([How It Works](https://www.howitworksdaily.com/what-would-happen-if-the-sun-disappeared/); [I'm a Scientist](https://energyj14.imascientist.org.uk/question/if-the-sun-disappeared-then-how-long-would-the-planet-and-people-last-or-would-they-just-freeze/index.html)).
- A fotossíntese para na hora. Em ~1 semana a média global fica abaixo de 0 °C (as fontes divergem entre 0 e −18 °C, por isso o vídeo diz só "abaixo de zero"). Em ~1 ano, cerca de −73 °C ([How It Works](https://www.howitworksdaily.com/?p=34315); [Wonderopolis](https://wonderopolis.org/wonder/what-would-earth-be-like-without-the-sun)).
- Os oceanos congelam por cima, o gelo isola e o fundo continua líquido por muito tempo. A vida perto das fontes hidrotermais não depende do Sol (mesmas fontes).
- O oxigênio não acaba rápido (dura milhares de anos), mas isso ficou fora para caber em 50 s.
