# Status de produção — Qual é a cidade mais antiga que ainda existe?

- **Fase atual:** 1 (planejamento) concluída.
- **Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.
- **Versão do roteiro:** v1 (2026-11-10).
- **Skill:** remotion-problem-resolve-video.

## Arquivos
- `producoes/cidade-mais-antiga/roteiro.md` — briefing, tabela, narração, direção, fontes, critérios.
- `producoes/cidade-mais-antiga/scene-plan.ts` — contrato de dados (14 cenas, 2700 frames).
- `producoes/cidade-mais-antiga/narration.json` — falas s1–s14 para `scripts/voiceover.py`.

## Preferências / premissas
- 90 s, 1080×1920, 30 fps, pt-BR, público leigo, tom didático e ágil.
- Gancho do usuário: "Qual é a cidade mais antiga que ainda existe?" — revelar a cidade no final.
- TTS: edge-tts `pt-BR-AntonioNeural`, rate +0% (gratuito). ElevenLabs NÃO autorizado.
- Entrega pedida: **arquivo compactado único** (como `tsunami-entrega.zip`), enviado na conversa — o usuário
  não tem onde baixar fora dela. Incluir também capa/thumbnail e `publicacao.md` no mesmo padrão do tsunami
  (não pedido explicitamente desta vez — confirmar).

## Pendências para a Fase 2
- Aprovação explícita da v1 (ou revisão).
- Pronúncia de "Çatalhöyük" e "tell" no TTS (grafia fonética só para o áudio, se preciso).
- Reaproveitar o pipeline do vídeo do tsunami (Chromium local, `--gl=swangle`, fontes locais, proxy no edge-tts).

## Histórico
- 2026-11-10 — v1 entregue, aguardando aprovação.
