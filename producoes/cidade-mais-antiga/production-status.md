# Status de produção — Qual é a cidade mais antiga que ainda existe?

- **Fase atual:** 2 concluída.
- **Status:** CONCLUÍDO — MP4 renderizado e verificado (v1 aprovada pelo usuário, "sim aprovo, pode gerar", 2026-11-10).
- **Versão do roteiro:** v1 (conteúdo inalterado).
- **Skill:** remotion-problem-resolve-video.

## Arquivos
- `roteiro.md` — roteiro aprovado v1 (referência de conteúdo).
- `scene-plan.ts` — plano de dados aprovado (Fase 1). O vivo está em `video/src/data/scenes.ts`.
- `narration.json` — falas s1–s14 (idênticas ao roteiro); `video/scripts/narration-tts.json` = texto enviado ao TTS.
- `publicacao.md` — título, legenda/descrição e hashtags (TikTok e YouTube), sem spoiler.
- `video/` — projeto Remotion. Composições: `CidadeMaisAntiga` (vídeo), `CapaVertical`, `ThumbYouTube` (quadro 1330).

## Ajustes técnicos feitos na Fase 2 (sem mudar o conteúdo aprovado)
- **Voz:** edge-tts `pt-BR-AntonioNeural` a **+12%** (a +0% a fala deu 89 s e não cabia em 90 s; +12% ainda é
  considerado natural). Só no texto enviado ao TTS: "Çatalhöyük" → "Tchatalrôiuk" (pronúncia) e ":" → ","
  (menos pausa). Legendas usam o texto aprovado.
- **Pausas** entre falas reduzidas para 0,5–0,6 s (1,0 s de suspense antes de "Ela é Damasco").
- **Cortes realinhados à voz** (frames): 0–202, 202–423, 423–604, 604–803, 803–1009, 1009–1237, 1237–1428,
  1428–1602, 1602–1752, 1752–1868, 1868–2113, 2113–2304, 2304–2487, 2487–2700 (2700 = 90 s).
- **Câmeras** reenquadradas após revisão por stills (morros batiam nos badges; plano final mais afastado).
- **Régua do tempo removida** (ficava espremida na borda, ilegível em 9:16); idades seguem nos badges e o selo
  "IDADES ESQUEMÁTICAS" continua na tela.
- Cartão de regras só nas cenas 5 e 8 (cobria a torre de Jericó).

## Comando para renderizar de novo (na pasta video/)
```
npx remotion render CidadeMaisAntiga out/cidade-raw.mp4 --gl=swangle --concurrency=4 --crf=17 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
python3 scripts/loudnorm.py out/cidade-raw.mp4 out/cidade-mais-antiga.mp4
```

## Entrega e verificações
- `cidade-mais-antiga.mp4` — H.264 1080×1920, 30 fps, 2700 frames, 90,0 s, AAC 48 kHz (ffprobe).
- Loudness: −14,0 LUFS, pico real −1,4 dBTP, LRA 2,0 LU. Bruto sem clipping (pico −0,79 dBFS).
- Capa `capa-vertical.png` (1080×1920) e `thumb-youtube.png` (1280×720), quadro 1330, sem spoiler.
- Verificado: tsc + eslint; stills revisados em 3 rodadas; 16 quadros extraídos do MP4 final conferidos.
- NÃO verificado: audição (o agente não ouve áudio), inclusive a pronúncia de "Çatalhöyük".

## Histórico
- 2026-11-10 — v1 entregue (Fase 1).
- 2026-11-10 — v1 aprovada; Fase 2 iniciada.
- 2026-11-10 — Fase 2 concluída; entregue cidade-mais-antiga-entrega.zip.
