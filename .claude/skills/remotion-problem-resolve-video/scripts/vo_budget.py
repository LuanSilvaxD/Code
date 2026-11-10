"""Orçamento de tempo da narração: cabe na duração? Rode ANTES de aprovar o roteiro e depois do TTS.

Antes do TTS (estimativa a partir do texto):
    python scripts/vo_budget.py --lines scripts/narration.json --seconds 90
Depois do TTS (mede src/data/vo.json, gerado por prepare_vo.py):
    python scripts/vo_budget.py --measured --seconds 90 --gaps 0.55

Por que existe: a contagem de palavras sozinha engana. Em duas produções reais com a mesma voz
(edge-tts pt-BR-AntonioNeural, +0%), 221 palavras deram 73,5 s, mas 224 palavras (mais longas e com muitos
":" e ",") deram 89 s. Contar LETRAS + pausas de pontuação acerta ambas (erro ≤ 4 s, sempre para mais).
Calibração (edge-tts Antonio +0%): 16,8 letras/s + 0,75 s por "." "?" "!" ":" + 0,36 s por ",".
Outra voz/provedor: recalibre com uma fala medida (prepare_vo.py) e ajuste LPS/P_STOP/P_COMMA.
"""

import argparse
import json
import re
import sys
from pathlib import Path

LPS = 16.8
P_STOP = 0.75
P_COMMA = 0.36
FIRST_VO = 0.45
TAIL = 2.8  # encerramento fixo da marca (OUTRO_SECONDS 2,6 s) + respiro


def estimate(text: str) -> float:
    letters = len(re.sub(r"[^A-Za-zÀ-ÿ]", "", text))
    stops = len(re.findall(r"[.?!:]", text))
    commas = text.count(",")
    return letters / LPS + stops * P_STOP + commas * P_COMMA


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--lines", default="scripts/narration.json")
    ap.add_argument("--measured", action="store_true", help="usa src/data/vo.json (duração real)")
    ap.add_argument("--seconds", type=float, required=True, help="duração-alvo do vídeo")
    ap.add_argument("--gaps", type=float, default=0.6, help="pausa média entre falas (s)")
    ap.add_argument("--rate", type=float, default=0.0, help="edge-tts rate atual em %% (só p/ a sugestão)")
    a = ap.parse_args()

    if a.measured:
        vo = json.loads(Path("src/data/vo.json").read_text(encoding="utf-8"))
        durs = {k: v["seconds"] for k, v in vo.items()}
        label = "medido"
    else:
        lines = json.loads(Path(a.lines).read_text(encoding="utf-8-sig"))
        durs = {k: estimate(v) for k, v in lines.items()}
        label = "estimado"
    speech = sum(durs.values())
    gaps = a.gaps * (len(durs) - 1)
    total = FIRST_VO + speech + gaps + TAIL
    print(f"fala ({label}): {speech:.1f} s | pausas: {gaps:.1f} s | abertura+respiro: {FIRST_VO + TAIL:.1f} s | total: {total:.1f} s / alvo {a.seconds:.0f} s")
    for k, d in durs.items():
        print(f"  {k:>4}: {d:5.2f} s")
    slack = a.seconds - total
    if slack >= 0:
        print(f"✔ cabe, com {slack:.1f} s de folga (pode alongar pausas nas viradas/revelação).")
        return
    need = speech / (speech + slack)  # fator de aceleração necessário
    rate = (1 + a.rate / 100) * need - 1
    print(f"✖ estoura {-slack:.1f} s.")
    print(f"  Opções, nesta ordem: (1) encurtar o texto (~{-slack * LPS / 5.2:.0f} palavras; exige aprovação);")
    print(f"  (2) só no texto enviado ao TTS, trocar ':' por ',' (menos pausa, legenda inalterada);")
    print(f"  (3) acelerar a voz para ≈ {rate * 100:+.0f}% (natural até ~+12%); (4) reduzir pausas; (5) alongar o vídeo.")


main()
