# Acabamento visual — o que separa "correto" de "bonito"

Leia ao construir o cenário (Fase 2, passo 4) e de novo na revisão por stills. Tudo aqui já existe no
template; o trabalho é **escolher** e **dosar**. Efeito sem motivo narrativo vira ruído — e em Shorts o
espectador sente o ruído antes de entender o conteúdo.

## Sumário
1. Camadas de acabamento (sempre ligadas)
2. Efeitos de tela por momento (dirigidos por trilhas)
3. Explosões, brilhos e ênfase
4. Legendas e rótulos
5. Cor, luz e profundidade do diorama
6. Enquadramento vertical (9:16) — o que deu errado e como resolver
7. Capa e thumbnail
8. Checklist visual da revisão

---

## 0. Identidade Fenda Umbra (sempre)

Abertura com a fenda abrindo, encerramento com a fenda fechando + marca, fundo de estúdio com halo tingido
pelo tema, pedestal com fio de luz roxa, cápsula de legenda roxa, logo no encerramento e na capa. Detalhes e cores no `SKILL.md` ("Identidade do
canal") e em `brand.ts`. Ao revisar: a marca pequena da abertura não pode coincidir com o 1º badge; nada da
cena importante nos últimos 2,6 s (o encerramento cobre a tela).

## 1. Camadas de acabamento (sempre ligadas)

`components/PostFx.tsx`, parâmetros em `theme.ts → POST`:

| Camada | Para quê | Padrão |
| --- | --- | --- |
| `Scrims` (topo/base) | badges e legendas leem sobre céu claro ou areia | 0,22 / 0,30 |
| `grade` (soft-light) | unifica as cores num "tom" (quente = história/deserto; frio = oceano/tecnologia) | `#ffb36b` 0,07 |
| `vignette` | puxa o olho para o centro; esconde as bordas do diorama | 0,32 |
| `grain` | tira o aspecto "plástico" do low-poly; textura de filme | 0,05 |
| `ProgressBar` | retenção (opcional; desligada) | `false` |

Troque `grade.color` por tema: oceano `#7fd0ff`, deserto/arqueologia `#ffb36b`, noite/espaço `#9b8cff`,
saúde/limpo `#bff3e0`. Mantenha opacidade ≤ 0,1 — acima disso a paleta didática (vermelho/verde/azul) perde força.

## 2. Efeitos de tela por momento

`components/ScreenFx.tsx` + atalhos em `utils/fx.ts` (frames LOCAIS da cena):

| Momento da história | Efeito | Atalho |
| --- | --- | --- |
| Impacto físico (terremoto, queda, explosão, onda batendo) | tremor | `fx.shake(W("s3", 12))` |
| Palavra forte, número, nome técnico revelado | punch-in 7% | `fx.punch(W("s4", 4))` |
| Revelação / "pronto!" / resposta | clarão + punch + confete | `fx.flash(at)`, `fx.punch(at)`, `fx.burst("id", at)` |
| Virada de assunto ("Agora...", "Mas...") ou salto de lugar | chicote | `fx.whipOut(end(i))` + `fx.whipIn()` na cena seguinte |
| Prévia do futuro / flashback | dessaturar + rebobinar | `fx.desaturate(a, b)`, trilha `rewind` 0→1 nos últimos 14 f |

**Dosagem:** no máximo um efeito forte a cada ~6–8 s; nunca dois tipos no mesmo corte (chicote + clarão
cansa). Num vídeo de 90 s, ~4–6 momentos fortes bastam: gancho, 1–2 viradas, revelação, final.

**Armadilha do motor de trilhas:** antes da 1ª entrada de um alvo vale o `from` dela. Por isso `fx.shake`
e `fx.whipIn` trazem um "pré-zero" no passado distante. Se escrever trilhas de efeito à mão começando
"ligadas" (from 1), faça o mesmo, ou a tela treme desde o frame 0.

## 3. Explosões, brilhos e ênfase

- `components/Burst.tsx`: `kind="confetti"` (revelação/vitória, cai com gravidade) ou `"sparkle"`
  (descoberta, "isso!", sai rápido e desacelera). Ancore no ponto 3D do objeto; dentro do Overlay de uma
  cena passe `sceneStart={scene.startFrame}`.
- Brilho do objeto que "resolve": `emissive` + `pulse()` por ~1 s quando o termo é dito, não o tempo todo.
- Coroa/medalha/selo 3D sobre o vencedor numa revelação (exemplo em `examples/cidade-mais-antiga/`).
- Setas e partículas explicam (fluxo, força, convergência) — nunca decoram. Uma seta que não aponta para a
  causa de algo deve sair.

## 4. Legendas e rótulos

- `CAPTION_STYLE.active = "pill"`: a palavra falada vira uma cápsula (amarela, ou da cor da palavra-chave).
  É o estilo que o público de Shorts reconhece; `"color"` é mais sóbrio.
- Pontuação: alguns TTS devolvem palavras sem pontuação; `AnimatedCaptions` recupera do texto aprovado
  quando a contagem bate. Se mudar o texto do TTS (grafia fonética), **mantenha a mesma contagem de palavras**.
- `WorldLabel` com `safe` (padrão): some quando o ponto sai da tela e empurra a etiqueta para baixo dos
  badges/para cima das legendas. Rótulos de objetos fora de quadro "puxados para dentro" foram um erro real.
- Rótulo de duas linhas (`"NOME\nestado"`) diz o *estado* do objeto ("ÇATALHÖYÜK\nabandonada"), não só o nome.

## 5. Cor, luz e profundidade do diorama

- Um degradê de fundo por "mundo" (céu, oceano, subsolo, pôr do sol) e o `Background` muda com a altura da
  câmera; o brilho de horizonte dá profundidade atrás do diorama.
- Camadas/estratos: cor mais escura quanto mais fundo; separe faixas com uma fresta de 0,03 u3d (a linha
  escura entre elas faz o corte ler como "camadas" de longe).
- Estados por cor + ícone: vazio/perigo em vermelho translúcido sobreposto à face de corte; contínuo/ok em
  verde translúcido; desconhecido em cinza hachurado com "?" 2D por cima.
- Objetos não focados: escureça (mistura para marrom-escuro ~40%), não esconda — o espectador mantém o mapa
  mental do sistema inteiro.
- Água/superfícies animadas: malha cujos vértices seguem uma função pura do frame (exemplo da onda em
  `examples/tsunami-onda/`). Face de corte translúcida + topo mais opaco.

## 6. Enquadramento vertical (9:16)

Com FOV 24° a largura visível é só **0,24 × distância**. Sistemas compridos (perfil do oceano, linha do
tempo, fileira de cidades) não cabem de lado. O que funcionou:

- **Vista diagonal "de trás"**: azimute −50° a −65°, elevação 20–25°, alvo no meio do sistema. O que está
  longe sobe no quadro → o sistema vira uma diagonal que ocupa a altura da tela. Ótimo para perseguições e
  para o plano final "sistema completo" (distância 100–110 para ~60 u3d de comprimento).
- Plano de detalhe na face de corte: mire o **próprio plano de corte** (z da face) e suba o alvo ~1 u3d
  acima do assunto para ele descer no quadro e sair de baixo dos badges.
- Antes de renderizar o vídeo, faça stills de 2 quadros por cena e confira: assunto entre ~470 px e
  ~1300 px; nada atrás dos badges; nenhum cartão 2D cobrindo o objeto que a narração cita naquele instante.

## 7. Capa e thumbnail

`Thumbnail.tsx` (composições `CapaVertical` 1080×1920 e `ThumbYouTube` 1280×720), renderizadas com
`npx remotion still CapaVertical out/capa-vertical.png --frame=<N>`:
- Escolha o quadro mais dramático **que não entregue a resposta** em vídeos de revelação.
- Texto no terço superior (a base da capa fica sob a interface do TikTok/Shorts), 3–4 linhas, uma palavra
  em amarelo grande, e uma etiqueta curta ("NÃO É ROMA").
- Não use `<Freeze>`: ele não alcança o `ThreeCanvas` e a capa sai com a câmera do frame 0.
- A thumbnail horizontal costuma sair fraca com o enquadramento vertical do vídeo; se o quadro escolhido
  ficar pequeno/escuro em 16:9, crie uma pose de câmera própria para ela (aproxime ~30%).

## 8. Checklist visual da revisão (stills e quadros do MP4)

- [ ] Gancho: o primeiro quadro já mostra algo (spring começando em frame negativo).
- [ ] Cada revelação tem um efeito forte e só um; cortes comuns são secos ou com deriva de câmera.
- [ ] Badges, rótulos e cartões nunca se sobrepõem nem cobrem o objeto citado.
- [ ] Legenda legível sobre qualquer fundo (scrim de base presente).
- [ ] Cores de estado consistentes do começo ao fim (vermelho problema, verde solução).
- [ ] Plano final mostra o sistema inteiro com rótulos de estado; fade nos últimos ~18 frames.
- [ ] Capa sem spoiler (se for revelação) e com texto fora da área de interface.
