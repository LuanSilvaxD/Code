# Status de produção — Quem foi ela? (Marie Curie)

- **Fase atual:** 2 concluída.
- **Status:** ENTREGUE — v1 aprovada ("Aprovo") + pedido de encaixar no quadro "Gigantes da Humanidade" (EP. 01).
- **Versão do roteiro:** v1 (2026-11-11).
- **Skill:** remotion-problem-resolve-video (Fenda Umbra + mascote v3 + pessoas variadas).

## Arquivos
- `producoes/marie-curie/roteiro.md` — briefing, tabela, narração, verificação de fatos, fontes, critérios.
- `producoes/marie-curie/scene-plan.ts` — contrato de dados (16 cenas, 5100 frames).
- `producoes/marie-curie/narration.json` — falas s1–s16 + "cta".

## Preferências / premissas
- Pedido: ~2 min, "bem explicadinho", fatos pesquisados e confirmados, nome em mistério até perto do fim; pode alongar.
- Proposta: 2:50 (170 s), 1080×1920, 30 fps, pt-BR. TTS edge-tts AntonioNeural +4% (gratuito).
- Nome/sobrenome/apelido "Curie" proibidos antes da s15 (fala, badges, rótulos, capa e título da publicação).
- Régua 1 m = 0,3 u3d (worldScale(0.3)).

## Pendências para a Fase 2
- Aprovação explícita da v1 (ou revisão), incluindo a duração 2:50.
- Figurino "vestido longo" para a Person (ela e a irmã) e modo silhueta/revelação.
- Som de contador Geiger (novo em sfx.py).
- Pronúncia: Skłodowska, Curie, Sorbonne, pechblenda.

## Histórico
- 2026-11-11 — v1 entregue, aguardando aprovação.
- 2026-11-11 — v1 aprovada; usuário pediu o quadro "Gigantes da Humanidade" (visual + falado). Mudança na fala s1: "+ Este é o Gigantes da Humanidade." (depois do gancho).
  Voz real ficou ~9% mais longa que a estimativa: rate +10% (cta mantida em +0%) e duração 2:55 (175 s, 5250 quadros).
  MP4 1080×1920 30 fps, loudnorm (pico −1,4 dBFS); sem silêncio digital. Render por software ~2 h.
