# Exemplo — Qual é a cidade mais antiga que ainda existe? (90 s, entregue)

Vídeo de **revelação** com resposta disputada (Jericó × Damasco) — o critério vira o motor da história.
Arquivos-chave:
- `roteiro.md` — roteiro aprovado, com a justificativa de rigor ("título disputado", números da UNESCO).
- `src/world/cities.ts` — configuração dos *tells* (camadas = idade), foco por cena e escurecimento dos
  objetos fora de foco.
- `src/components/World.tsx` — terreno em corte, camadas empilhando (`catal.layers` 0→8), faixas vazias em
  vermelho, zona desconhecida hachurada, cidades low-poly no topo, torre, escavadeira barrada, coroa 3D.
- `src/scenes/CityOverlay.tsx` — rótulos com proteção de quadro, "?" misterioso, confete, cartão de regras,
  cartões de lista, barras de comparação.
- `src/Thumbnail.tsx` — capa SEM spoiler (pergunta + quadro do mistério).
- `src/data/scenes.ts` — 14 cenas; `publicacao.md` — textos sem spoiler.

Lições: a fala real deu 89 s (palavras longas + muitos ":") → voz +12% e pausas curtas; régua do tempo
na borda ficou ilegível em 9:16 (removida); cartão 2D cobria a torre (passou a aparecer só nas cenas de regras).
