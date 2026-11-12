# Status de produção — Quem foi ela? | Gigantes da Humanidade #2 (Joana d'Arc)

- **Fase atual:** 2 — passo 1 (folha de design).
- **Status:** roteiro v1 APROVADO ("Aprovado"); AGUARDANDO APROVAÇÃO DOS DESIGNS NOVOS antes de animar.
- **Versão do roteiro:** v1 (2026-11-12). Skill v2.0 + chamada final nova (comentar tema).
- **Formato:** história/biografia com mistério do nome (formato do quadro).

## Arquivos
- `producoes/joana-darc/roteiro.md` — briefing, tabela (18 cenas), narração, verificação de fatos, fontes, pontos fracos.
- `producoes/joana-darc/scene-plan.ts` — contrato de dados (18 cenas, 5250 frames).
- `producoes/joana-darc/narration.json` — s1–s18 + "cta" (412 palavras nas cenas).

## Premissas
- 2:55 (175 s, 5250 frames), 1080×1920, 30 fps, pt-BR. TTS edge-tts AntonioNeural +4% (cta +0%).
- EP. 02 do quadro (EP. 01 = Marie Curie).
- Nome proibido antes da s17: Joana, Jeanne, d'Arc, Donzela/Pucelle, "Donzela de Orléans", Domrémy, rosto.
- Mapa esquemático; régua das estações 1 m = 0,06 u3d.
- Entrega: zip organizado + MP4 comprimido + zip leve via SendUserFile.

## Pendências para a Fase 2
- Aprovação explícita da v1.
- 1º passo: folha de design dos 10 elementos novos (roteiro §1) → enviar e PARAR até aprovação.
- Render deve passar de 2 h: renderizar em trechos desacoplados (setsid) e emendar com re-encode.
- Pronúncia: Reims, Jeanne, d'Arc, Orléans.

## Histórico
- 2026-11-12 — v1 entregue, aguardando aprovação.
- 2026-11-12 — v1 aprovada ("Aprovado"). Projeto em video/ (copiado do Stonehenge). Folhas de design: video/src/JoanaSheet.tsx (JoanaSheet1–3); componentes novos em video/src/components/{Medieval,FranceMap}.tsx; Person.tsx ganhou armadura, elmo, batina, mitra, coroa, capa, sobreveste, estandarte, espada e lança; mapa em src/data/france.json (Natural Earth, gerado por script).
