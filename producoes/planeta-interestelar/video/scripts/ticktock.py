"""Tic-tac ORIGINAL do vídeo (sintetizado, sem samples nem trilha de filme).

Um tic a cada 3600/2557 ≈ 1,408 s (7 anos ≈ 2.557 dias por hora → cada tic ≈ 1 dia na Terra),
de TICK_T0 até o começo do encerramento. Saída: public/audio/ticktock.wav (o Soundtrack toca por cima da trilha).
    python scripts/ticktock.py
"""
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
T0 = 0.7
P = 3600 / 2557
timing = (ROOT / "src" / "utils" / "timing.ts").read_text(encoding="utf-8")
DUR = float(re.search(r"const SECONDS = ([0-9.]+)", timing).group(1))
vo = json.loads((ROOT / "src" / "data" / "vo.json").read_text(encoding="utf-8"))
OUTRO = max(2.6, 0.6 + vo["cta"]["seconds"] + 0.6)
END = DUR - OUTRO + 0.4
rng = np.random.default_rng(7)


def hit(freq, d=0.09, body=0.5):
    t = np.arange(int(d * SR)) / SR
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.010)
    y += np.sin(2 * np.pi * freq * 0.5 * t) * np.exp(-t / 0.02) * body
    y += rng.standard_normal(len(t)) * np.exp(-t / 0.002) * 0.35
    return y


tic, tac = hit(2400), hit(1650, body=0.7)
out = np.zeros(int(DUR * SR) + SR)
k = 0
t = T0
while t < END:
    s = hit(2400) if k % 2 == 0 else hit(1650, body=0.7)
    i = int(t * SR)
    out[i:i + len(s)] += s
    k += 1
    t = T0 + k * P
# leve eco de sala (dá corpo ao relógio)
d = int(0.045 * SR)
out[d:] += out[:-d] * 0.18
out = out[: int(DUR * SR)]
out = out / max(1e-9, np.abs(out).max()) * 0.8
(ROOT / "public" / "audio").mkdir(parents=True, exist_ok=True)
sf.write(ROOT / "public" / "audio" / "ticktock.wav", np.stack([out, out], 1), SR, subtype="PCM_16")
print(f"ticktock: {k} tics, período {P:.3f}s, de {T0}s a {END:.1f}s")
