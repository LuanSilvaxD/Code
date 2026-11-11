# Status de produção — Como construíram Stonehenge?

- **Fase atual:** 2 — passo 1 (folha de design).
- **Status:** roteiro v1 APROVADO; AGUARDANDO APROVAÇÃO DOS DESIGNS NOVOS antes de animar.
- **Versão do roteiro:** v1 (2026-11-11). Skill v2.0. Formato: problema → solução + pergunta → revelação.

## Arquivos
- `producoes/stonehenge/roteiro.md`, `scene-plan.ts`, `narration.json` (s1–s15 + "cta", 425 palavras).

## Premissas
- 2:55 (175 s, 5250 frames), 1080×1920, 30 fps, pt-BR. TTS edge-tts AntonioNeural +4% (cta +0%).
- Duração decidida pelo conteúdo (regra do usuário: explicar no tempo que precisar, teto de ~3 min).
- Régua única: 1 m = 0,1 u3d. Fato × hipótese marcados na tela.

## Pendências para a Fase 2
- Aprovação explícita da v1.
- 1º passo da Fase 2: folha de design dos 12 elementos novos (ver roteiro §1) → enviar e PARAR até a aprovação.

## Histórico
- 2026-11-11 — v1 entregue, aguardando aprovação.
- 2026-11-11 — v1 aprovada ("pode caprichar no terreno"; entrega final em .zip como antes).
- 2026-11-11 — folhas de design enviadas: video/src/StoneSheet.tsx (StoneSheet, StoneSheet2);
  componentes em video/src/components/{Stones,Monument,Terrain}.tsx; Person.tsx ganhou túnica (neolithicLooks).
