"""Trilha de UMA parte do documentário (fenda_music), com 'ducking' sob a narração.

Config em JSON (um objeto por parte), ex. scripts/doc_parts.json:
  {"slug": "titanic-doc", "palette": "historia",
   "parts": {"1": {"dur": 123.0,
                   "cuts":    [0.0, 8.5, 17.0, ...],              # início de cada trecho (s)
                   "intents": ["calm", "tense", "build", ...],     # calm|tense|build|reveal|curious|groove|resolve
                   "hits":    [21.9, 47.5],                        # impactos (s)
                   "vo":      [["bloco0", 1.0], ["bloco1", 54.0]]}}}  # narração (json de voz_doc.py) + offset (s)
Uso: python scripts/doc_music.py scripts/doc_parts.json 1  ->  public/audio/doc/musica-parte1.wav
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fenda_music as fm  # noqa: E402

cfg_path, part = Path(sys.argv[1]), sys.argv[2]
ROOT = cfg_path.resolve().parent.parent
cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
P = cfg["parts"][part]
mix = fm.render(P["cuts"], P["intents"], P["dur"], cfg.get("palette", "historia"), hits=P.get("hits", []), outro=0.0, theme=False, variant=f"{cfg.get('slug', 'doc')}-parte{part}")

sr = fm.SR
env = np.ones(len(mix))
t = np.arange(len(mix)) / sr
for name, off in P.get("vo", []):
    d = json.loads((ROOT / "public/audio/doc" / f"{name}.json").read_text(encoding="utf-8"))
    for ln in d["lines"]:
        a, b = off + ln["start"], off + ln["start"] + ln["speech"]
        k = np.clip(np.minimum((t - (a - 0.35)) / 0.35, ((b + 0.35) - t) / 0.35), 0, 1)
        env = np.minimum(env, 1 - 0.62 * k)
mix = mix * env[:, None] * 0.8
out = ROOT / f"public/audio/doc/musica-parte{part}.wav"
out.parent.mkdir(parents=True, exist_ok=True)
sf.write(out, mix, sr, subtype="PCM_16")
print(out, round(len(mix) / sr, 2), "s")
