#!/usr/bin/env bash
# Diagnóstico do ambiente antes da Fase 2. Rode na raiz do projeto Remotion (ou em qualquer pasta).
#   bash scripts/doctor.sh
# Não instala nada: só relata o que falta e o que fazer. Saída curta, uma linha por item.
ok() { printf '  ✔ %s\n' "$1"; }
no() { printf '  ✖ %s\n' "$1"; }
hm() { printf '  ! %s\n' "$1"; }

echo "Ferramentas"
command -v node >/dev/null && ok "node $(node -v)" || no "node ausente"
command -v python3 >/dev/null && ok "python $(python3 --version 2>&1 | cut -d' ' -f2)" || no "python3 ausente"
command -v ffmpeg >/dev/null && ok "ffmpeg" || no "ffmpeg ausente (necessário para áudio e verificação)"
for m in numpy scipy soundfile PIL; do
  python3 -c "import $m" 2>/dev/null && ok "python: $m" || no "python: $m ausente → pip install ${m/PIL/pillow}"
done
python3 -c "import edge_tts" 2>/dev/null && ok "python: edge_tts" || hm "python: edge_tts ausente → pip install edge-tts (TTS gratuito)"

echo "Render"
if command -v nvidia-smi >/dev/null && nvidia-smi -L >/dev/null 2>&1; then
  ok "GPU NVIDIA → --gl=angle"
elif [ "$(uname)" = "Linux" ]; then
  hm "sem GPU → render por software (--gl=swangle); ~20 min para 90 s com 4 núcleos — rode em segundo plano"
else
  ok "macOS/Windows → --gl=angle"
fi
SHELL_BIN=$(ls -d /opt/pw-browsers/*/chrome-headless-shell-linux64/chrome-headless-shell "$HOME"/.cache/ms-playwright/*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | tail -1)
if [ -n "$SHELL_BIN" ]; then ok "Chromium local: $SHELL_BIN (use em remotion.config.ts → Config.setBrowserExecutable)"; else hm "sem Chromium local: o Remotion vai baixar o dele (precisa de acesso a remotion.media)"; fi

echo "Rede"
probe() { # host  descrição
  if curl -sS -o /dev/null --max-time 8 "https://$1" 2>/dev/null; then ok "$2 ($1)"; else hm "$2 bloqueado ($1)"; fi
}
probe fonts.gstatic.com "Google Fonts via curl — o Chrome headless pode recusar o certificado do proxy mesmo assim; por isso o template usa fontes LOCAIS"
probe remotion.media "download do Chromium do Remotion"
probe speech.platform.bing.com "edge-tts"
if [ -n "${HTTPS_PROXY:-}" ]; then hm "HTTPS_PROXY definido: scripts/voiceover.py já repassa o proxy ao edge-tts (aiohttp não lê a variável sozinho)"; fi

echo "Projeto"
[ -f public/fonts/montserrat-latin.woff2 ] && ok "fontes locais em public/fonts" || hm "copie assets/template/public/fonts → public/fonts"
[ -f src/data/vo.json ] && python3 - <<'PY' 2>/dev/null || true
import json
d = json.load(open("src/data/vo.json", encoding="utf-8"))
print(f"  ✔ vo.json com {len(d)} falas") if d else print("  ! vo.json vazio (gere a narração antes de animar)")
PY
