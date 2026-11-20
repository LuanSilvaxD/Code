"""Trilha da PARTE 1 do documentário (fenda_music, paleta história), já com 'ducking' sob a narração.
Uso: python scripts/doc_music.py  -> public/audio/doc/musica-parte1.wav"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fenda_music as fm  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DUR = 123.0
S = [0.0, 8.5, 17.0, 28.0, 36.3, 47.4, 52.4, 68.5, 82.15, 103.77, 115.2]
INTENTS = ["calm", "tense", "build", "tense", "calm", "reveal", "curious", "calm", "build", "calm", "tense"]
HITS = [21.9, 47.5, 118.6]
mix = fm.render(S, INTENTS, DUR, "historia", hits=HITS, outro=0.0, theme=False, variant="titanic-doc-parte1")

# ducking: abaixa a trilha onde a voz fala (rampas de 0,35 s)
env = np.ones(len(mix))
sr = fm.SR
for name, off in [("bloco0", 1.0), ("bloco1", 54.0)]:
    d = json.loads((ROOT / "public/audio/doc" / f"{name}.json").read_text(encoding="utf-8"))
    for ln in d["lines"]:
        a, b = off + ln["start"], off + ln["start"] + ln["speech"]
        i0, i1 = int((a - 0.35) * sr), int((b + 0.35) * sr)
        for i in range(max(0, i0), min(len(env), i1)):
            t = i / sr
            k = min(1, (t - (a - 0.35)) / 0.35, ((b + 0.35) - t) / 0.35)
            env[i] = min(env[i], 1 - 0.62 * max(0, k))
mix = mix * env[:, None] * 0.8
out = ROOT / "public/audio/doc/musica-parte1.wav"
sf.write(out, mix, sr, subtype="PCM_16")
print(out, len(mix) / sr)
