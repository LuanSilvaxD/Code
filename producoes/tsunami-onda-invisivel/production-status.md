# Status de produção — Tsunami: a onda quase invisível que vira paredão

- **Fase atual:** 2 (implementação e render).
- **Status:** APROVADO pelo usuário (roteiro v1, mensagem "sim aprovo", 2026-11-10). Render em andamento.
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

## Histórico
- 2026-11-10 — v1 entregue (Fase 1).
- 2026-11-10 — v1 aprovada; Fase 2 iniciada.
