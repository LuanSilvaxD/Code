# Status de produção — Por que o céu é azul?

- **Fase atual:** 2 concluída.
- **Status:** ENTREGUE — roteiro v1 aprovado pelo usuário ("Sim") e vídeo renderizado.
- **Versão do roteiro:** v1 (2026-11-10).
- **Skill:** remotion-problem-resolve-video (identidade Fenda Umbra + mascote v3 + pessoas variadas).

## Arquivos
- `producoes/ceu-azul/roteiro.md` — briefing, tabela, narração, direção, fontes, critérios.
- `producoes/ceu-azul/scene-plan.ts` — contrato de dados (11 cenas, 2700 frames).
- `producoes/ceu-azul/narration.json` — falas s1–s11 + "cta" (chamada falada da marca).

## Preferências / premissas
- 90 s, 1080×1920, 30 fps, pt-BR, público leigo, tom didático e ágil.
- Gancho do usuário: "A resposta é a mesma que faz o pôr do sol ficar laranja."
- TTS: edge-tts `pt-BR-AntonioNeural`, +0% (gratuito). ElevenLabs NÃO autorizado.
- Entrega: .zip único na conversa (vídeo, capa, thumbnail, publicacao.md, roteiro, projeto).
- Régua dos personagens: 1 m = 0,3 u3d (worldScale(0.3)).

## Pendências para a Fase 2
- Aprovação explícita da v1 (ou revisão).
- Pronúncia de "Rayleigh" no TTS.
- Conferir enquadramento do mascote/pessoa em todas as cenas (regra de proporção e de quadro).

## Histórico
- 2026-11-10 — v1 entregue, aguardando aprovação.
- 2026-11-11 — v1 aprovada; Fase 2: narração edge-tts Antonio (74,6 s), render por software, MP4 90 s 1080×1920 30 fps (2700 quadros), loudnorm (−15,7 LUFS integrados medidos antes; pico −1,2 dBFS).
  Ajustes de implementação sem mudar conteúdo: cúpula de ar ACHATADA (mais larga que alta) para o caminho do Sol baixo ficar mais longo no ar; "Sol do meio-dia" de comparação espelhado à direita; mascote sobe a 4 u3d (não 5,6) porque a cúpula ficou mais baixa; trilha reativada após o 1º render (áudio remontado sem refazer o vídeo).
