# Status de produção — Como construíram Stonehenge?

- **Fase atual:** 2 — concluída.
- **Status:** ENTREGUE — video/out/stonehenge.mp4 (2:55, 5250 quadros, 1080×1920, 30 fps, loudnorm −14 LUFS); capa no quadro 90, thumbnail no 4570 (pôr do sol).
- **Versão do roteiro:** v1 (2026-11-11). Skill v2.0. Formato: problema → solução + pergunta → revelação.

## Arquivos
- `producoes/stonehenge/roteiro.md`, `scene-plan.ts`, `narration.json` (s1–s15 + "cta", 425 palavras).

## Premissas
- 2:55 (175 s, 5250 frames), 1080×1920, 30 fps, pt-BR. TTS edge-tts AntonioNeural +4% (cta +0%).
- Duração decidida pelo conteúdo (regra do usuário: explicar no tempo que precisar, teto de ~3 min).
- Régua única: 1 m = 0,1 u3d. Fato × hipótese marcados na tela.

## Pendências
- Push ao GitHub bloqueado (403, app do Claude sem acesso ao repo) — commits locais; usuário pediu para deixar pro final.
- Pronúncia de "Stonehenge"/"Preseli" não verificada (o agente não ouve o áudio).

## Histórico
- 2026-11-11 — v1 entregue, aguardando aprovação.
- 2026-11-11 — v1 aprovada ("pode caprichar no terreno"; entrega final em .zip como antes).
- 2026-11-11 — folhas de design enviadas: video/src/StoneSheet.tsx (StoneSheet, StoneSheet2);
  componentes em video/src/components/{Stones,Monument,Terrain}.tsx; Person.tsx ganhou túnica (neolithicLooks).
- 2026-11-11 — designs aprovados ("Gostei pode fazer"); render em 3 trechos (limite de 2 h do ambiente), emendados
  com re-encode (5250 quadros exatos) e áudio contínuo montado dos trechos (emendas checadas: sem estalo).
- 2026-11-11 — ENTREGUE: zip completo + MP4 comprimido + zip leve.
