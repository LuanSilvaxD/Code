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
PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
CFG = {
    1: dict(DUR=123.0, S=[0.0, 8.5, 17.0, 28.0, 36.3, 47.4, 52.4, 68.5, 82.15, 103.77, 115.2],
            INT=["calm", "tense", "build", "tense", "calm", "reveal", "curious", "calm", "build", "calm", "tense"],
            HITS=[21.9, 47.5, 118.6], VO=[("bloco0", 1.0), ("bloco1", 54.0)]),
    2: dict(DUR=146.0, S=[0.0, 8.0, 27.2, 39.6, 54.8, 63.2, 76.4, 92.4, 111.3, 123.8, 138.0],
            INT=["curious", "tense", "tense", "calm", "build", "tense", "reveal", "build", "tense", "calm", "tense"],
            HITS=[31.1, 76.4, 132.6, 141.6], VO=[("bloco2", 2.6), ("bloco3", 66.17)]),
    3: dict(DUR=139.0, S=[0.0, 11.4, 28.0, 43.9, 56.3, 64.9, 77.4, 101.6, 113.9, 122.8, 132.2],
            INT=["tense", "curious", "calm", "tense", "calm", "build", "tense", "build", "reveal", "calm", "resolve"],
            HITS=[19.7, 74.0, 113.9, 118.8], VO=[("bloco4", 2.6), ("bloco5", 81.39)]),
}[PART]
DUR, S, INTENTS, HITS = CFG["DUR"], CFG["S"], CFG["INT"], CFG["HITS"]
mix = fm.render(S, INTENTS, DUR, "historia", hits=HITS, outro=0.0, theme=False, variant=f"titanic-doc-parte{PART}")

# ducking: abaixa a trilha onde a voz fala (rampas de 0,35 s)
env = np.ones(len(mix))
sr = fm.SR
for name, off in CFG["VO"]:
    d = json.loads((ROOT / "public/audio/doc" / f"{name}.json").read_text(encoding="utf-8"))
    for ln in d["lines"]:
        a, b = off + ln["start"], off + ln["start"] + ln["speech"]
        i0, i1 = int((a - 0.35) * sr), int((b + 0.35) * sr)
        for i in range(max(0, i0), min(len(env), i1)):
            t = i / sr
            k = min(1, (t - (a - 0.35)) / 0.35, ((b + 0.35) - t) / 0.35)
            env[i] = min(env[i], 1 - 0.62 * max(0, k))
mix = mix * env[:, None] * 0.8
out = ROOT / f"public/audio/doc/musica-parte{PART}.wav"
sf.write(out, mix, sr, subtype="PCM_16")
print(out, len(mix) / sr)
