# Exemplo: "Por que o céu é azul?" (Fenda Umbra, 90 s)

Pergunta → revelação com um único mundo: maquete (mar · morro · deserto) sob uma **meia-cúpula de ar
achatada**, Sol num arco (meio-dia → pôr do sol) e um feixe de **fótons** coloridos que se espalham.

Técnicas reaproveitáveis:
- `components/World.tsx`
  - **Cúpula com ShaderMaterial** (fresnel + cor por altura/lado): dia azul, tom violeta, pôr do sol quente
    perto do horizonte, céu dividido (`uSplit`), vista do espaço (só a borda brilha).
  - **Fótons como função pura do frame**: cada partícula percorre Sol→olhos; com probabilidade por cor
    (Rayleigh: azul ≫ vermelho), desvia num ponto semeado dentro da cúpula e some.
  - Sol com halos aditivos; caminhos tracejados que destacam o trecho DENTRO do ar; raios "de todas as direções".
- `components/Background.tsx`: o fundo de estúdio segue trilhas (dia → pôr do sol → espaço preto).
- `data/sky.ts`: geometria compartilhada (olhos, cúpula, arco do Sol, prisma, moléculas) para 3D e rótulos 2D.
- `scenes/CeuScenes.tsx`: cartões 2D (onda curta × longa; Sol × olho por cor), rótulos N₂/O₂, selo "esquema".

Lições (estão no SKILL.md):
1. A cúpula em meia-esfera deixava todos os caminhos do mesmo tamanho e contradizia o pôr do sol. Achatar resolveu.
2. A cena de "prova" só ficou clara quando a fala fechou a lógica ("Sem ar, sem azul") e o visual pôs a
   cúpula azul contra o espaço preto, com o Sol menor.
3. `HAS_MUSIC` esquecido em `false` gerou silêncio total nas pausas; `audiocheck.py` agora alerta.
