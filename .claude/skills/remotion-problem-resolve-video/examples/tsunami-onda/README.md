# Exemplo — Tsunami: quase invisível no mar, paredão na costa (90 s, entregue)

Arquivos-chave (não é o projeto inteiro; o motor comum está em `assets/template/`):
- `roteiro.md` — roteiro aprovado (14 cenas), fontes e notas de rigor ("paredão" ≠ onda de surfe).
- `src/world/ocean.ts` — **superfície de água como função pura do frame**: perfil do fundo, onda sech² com
  largura ∝ √h e altura crescente no raso (lei de Green exagerada, com teto), vale à frente da crista
  (recuo do mar), inundação terra adentro. Reaproveite para qualquer fluido/superfície animada.
- `src/components/World.tsx` — malhas reconstruídas por frame (fundo em corte com faixas, água com face de
  corte translúcida), navio que boia lendo a superfície, partículas da coluna d'água, setas de velocidade,
  avião emparelhado com a crista, prévia de "parede d'água", instantâneos finais.
- `src/components/GlobalFx.tsx` — versão original dos efeitos de tela (tremor, prévia dessaturada,
  rebobinar) que virou `components/ScreenFx.tsx` + `utils/fx.ts` no template.
- `src/scenes/TsunamiScenes.tsx` — rótulos, cartão profundidade×velocidade, ícone de surfe riscado.
- `src/data/scenes.ts` — as 14 cenas com câmeras finais (vista diagonal "de trás da onda").
- `publicacao.md` — título, legenda, descrição e hashtags.

Lições: a onda sumia em planos laterais 9:16 → amplitude visual maior + câmera diagonal; selo "escala
vertical exagerada" mantém a honestidade.
