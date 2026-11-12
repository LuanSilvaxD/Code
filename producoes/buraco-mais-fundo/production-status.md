# Status de produção — O buraco mais fundo do mundo (Poço de Kola)

- **Fase atual:** 2 — folha de design.
- **Status:** roteiro v1 APROVADO ("Aprovado"); folhas de design enviadas — AGUARDANDO APROVAÇÃO DOS DESIGNS.
- **Versão do roteiro:** v1 (2026-11-12). Skill v2.1 (trilha v3 com paletas; CTA pedindo tema).
- **Formato:** pergunta → revelação com fio condutor de fatos (a descida pelo furo).

## Arquivos
- `producoes/buraco-mais-fundo/roteiro.md` — briefing, tabela (13 cenas), narração, fatos, fontes, pontos fracos.
- `producoes/buraco-mais-fundo/scene-plan.ts` — contrato de dados (13 cenas, 3450 frames).
- `producoes/buraco-mais-fundo/narration.json` — s1–s13 + "cta" (270 palavras nas cenas).

## Premissas
- 1:55 (115 s, 3450 frames), 1080×1920, 30 fps, pt-BR. TTS edge-tts AntonioNeural +4% (cta +0%); ":"→"," só no TTS.
- Trilha: paleta `misterio`, VARIANT = slug.
- Réguas: superfície 1 m = 0,03 u3d; coluna esquemática 1 km = 2 u3d; régua de escala 1 km = 0,25 u3d; globo R = 3.
- Entrega: zip organizado + MP4 comprimido + zip leve via SendUserFile.

## Pendências para a Fase 2
- Aprovação explícita da v1.
- 1º passo: folha de design dos 10 elementos novos (roteiro §1) → enviar e PARAR até aprovação.
- Pronúncia: Kola, 12.262.
- Push GitHub bloqueado (403) — lembrar o usuário no fim.

## Histórico
- 2026-11-12 — tema escolhido pelo usuário ("vamos fazer do buraco mais fundo"); v1 entregue, aguardando aprovação.
- 2026-11-12 — v1 aprovada ("Aprovado"). Projeto em video/ (copiado da Joana; trilha v3 + Soundtrack novos da skill).
- 2026-11-12 — TTS real (edge AntonioNeural +4%, cta +0%; ":"→"," só no TTS): fala 105,5 s; GAPS 0,55 (0,8 nas viradas);
  vídeo passa de 1:55 para 1:59 (3570 frames) — ajuste de sincronização, conteúdo igual.
- 2026-11-12 — folhas de design: video/src/KolaSheet.tsx (KolaSheet1–3) → video/out/KolaSheet{1,2,3}.png; componentes em
  video/src/components/Kola.tsx; textura do globo public/globe.png (Natural Earth 110m, world-atlas). Person ganhou helmetColor.
