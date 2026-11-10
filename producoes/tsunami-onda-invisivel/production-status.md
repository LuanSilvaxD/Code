# Status de produção — Tsunami: a onda quase invisível que vira paredão

- **Fase atual:** 1 (planejamento) concluída.
- **Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.
- **Versão do roteiro:** v1 (2026-11-10).
- **Skill:** remotion-problem-resolve-video.

## Arquivos
- `producoes/tsunami-onda-invisivel/roteiro.md` — briefing, tabela, narração, direção, fontes, critérios.
- `producoes/tsunami-onda-invisivel/scene-plan.ts` — contrato de dados (14 cenas, 2700 frames). Vira `src/data/scenes.ts`.
- `producoes/tsunami-onda-invisivel/narration.json` — falas s1–s14 para `scripts/voiceover.py`.

## Preferências / premissas
- 90 s, 1080×1920, 30 fps, pt-BR, público leigo, tom didático e ágil.
- Gancho fixado pelo usuário: "No meio do oceano, um tsunami mal se percebe."
- TTS: edge-tts `pt-BR-AntonioNeural` (gratuito). ElevenLabs NÃO autorizado.
- Entrega: MP4 local, sem publicar.

## Pendências para a Fase 2
- Aprovação explícita do usuário para a v1 (ou pedido de revisão).
- Decidir o badge EMPOLAMENTO vs. "A ÁGUA SE EMPILHA" (termo não confirmado em fonte).
- Verificar se a rede deste ambiente alcança o serviço do edge-tts; se não, avisar antes (sem vídeo mudo como final).
- Ambiente: o container é descartável e o push para o GitHub falhou (403) → salvar/baixar o MP4 e o projeto ao fim.

## Histórico
- 2026-11-10 — v1 entregue, aguardando aprovação.
