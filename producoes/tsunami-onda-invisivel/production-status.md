# Status de produção — Tsunami: a onda quase invisível que vira paredão

- **Fase atual:** 2 concluída.
- **Status:** CONCLUÍDO — MP4 renderizado e verificado (roteiro v1 aprovado pelo usuário, "sim aprovo", 2026-11-10).
- **Extras pedidos na aprovação:** thumbnail + arquivo com título/descrição/hashtags (TikTok e YouTube).
- **Skill:** remotion-problem-resolve-video.

## Arquivos
- `roteiro.md` — roteiro aprovado v1 (referência de conteúdo; não alterado).
- `scene-plan.ts` — plano de dados aprovado (Fase 1). O vivo está em `video/src/data/scenes.ts`.
- `narration.json` — falas s1–s14 (idênticas ao roteiro).
- `publicacao.md` — título, legenda/descrição e hashtags (TikTok e YouTube).
- `video/` — projeto Remotion. Composições: `TsunamiShort` (vídeo), `CapaVertical`, `ThumbYouTube`.
- `video/out/` — MP4, capa e thumbnail (ignorados pelo git por tamanho; ver abaixo).

## Ajustes técnicos feitos na Fase 2 (sem mudar conteúdo aprovado)
- **Voz:** edge-tts `pt-BR-AntonioNeural`, rate +0% (a +6% a fala dava 69 s; a +0%, 73,5 s, ficou mais natural).
- **Cortes realinhados à voz real** (frames): 0–227, 227–416, 416–604, 604–720, 720–949, 949–1060, 1060–1262,
  1262–1460, 1460–1632, 1632–1804, 1804–2001, 2001–2252, 2252–2459, 2459–2700 (total 2700 = 90 s).
  Pausas entre falas 0,8–1,3 s nos momentos de ação visual (rebobinar, coluna subindo, chegada da onda).
- **Câmeras** reenquadradas após revisão por stills (a onda sumia nos planos laterais em 9:16): perseguições e
  plano final em diagonal "de trás da onda", com a costa no alto do quadro.
- **Amplitude visual** da onda aumentada (esquemática; selo "ESCALA VERTICAL EXAGERADA" na tela).
- **Legendas:** pontuação recuperada do texto aprovado (o edge-tts devolve palavras sem pontuação).
- Fonte Montserrat servida localmente; render por software (SwiftShader/`--gl=swangle`), sem GPU.
- Rede: criado o ambiente pessoal "Code" liberando só `speech.platform.bing.com` (edge-tts), com aprovação do usuário.

## Comando para renderizar de novo (na pasta video/)
```
npx remotion render TsunamiShort out/tsunami-raw.mp4 --gl=swangle --concurrency=4 --crf=17 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
python3 scripts/loudnorm.py out/tsunami-raw.mp4 out/tsunami.mp4
```

## Entrega e verificações
- `video/out/tsunami.mp4` — H.264 1080×1920, 30 fps, 2700 frames, 90,0 s, AAC 48 kHz estéreo (ffprobe).
- Loudness: −14,0 LUFS integrado, pico real −1,4 dBTP, LRA 2,4 LU (ffmpeg ebur128). Sem clipping no bruto (pico −0,67 dBFS).
- `video/out/capa-vertical.png` (1080×1920) e `video/out/thumb-youtube.png` (1280×720), quadro 395 (parede d'água).
- Verificado: tsc + eslint; stills de todas as cenas revisados (3 rodadas); quadros extraídos do MP4 final conferidos.
- Ajuste pós-render: rótulos da cena 14 se sobrepunham → cena 14 re-renderizada (frames 2459–2699) e emendada; áudio inalterado.
- NÃO verificado: audição real (o agente não ouve áudio) — só medições.

## Histórico
- 2026-11-10 — v1 entregue (Fase 1).
- 2026-11-10 — v1 aprovada; Fase 2 iniciada.
- 2026-11-10 — Fase 2 concluída: MP4, capa, thumbnail e publicacao.md entregues.
