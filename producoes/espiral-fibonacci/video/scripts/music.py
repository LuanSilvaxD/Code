"""Trilha Fenda Umbra (v3): tema da marca + paleta pelo assunto, sintetizada por código (livre de direitos).

O motor está em scripts/fenda_music.py. Aqui você só escolhe, por vídeo:
  PALETTE  historia | natureza | tecnologia | espaco | misterio   (a mais próxima do tema — veja SKILL.md)
  VARIANT  o slug do vídeo: transpõe/muda o andamento para dois vídeos da mesma paleta não soarem iguais
  INTENTS  uma intenção por cena: calm | curious | groove | tense | build | reveal | resolve
  HITS     impactos amarrados a palavras da voz: word("s9", 31)
O TEMA (melodia de 8 notas da marca) toca curto no gancho, em cada "reveal" e inteiro no encerramento.
Os cortes vêm de src/utils/timing.ts + src/data/vo.json (sincronizado com a narração).

Uso:  python scripts/music.py   -> public/audio/music.wav
"""

import json
import re
import sys
from pathlib import Path

import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fenda_music as fm  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "music.wav"

# Cortes e momentos derivados da narração, lidos de src/utils/timing.ts + src/data/vo.json — a trilha
# fica sincronizada com o vídeo sem copiar números à mão (mesma conta de utils/timing.ts).
import json
import re

_TIMING = (ROOT / "src" / "utils" / "timing.ts").read_text(encoding="utf-8")
_num = lambda name: float(re.search(rf"const {name} = ([0-9.]+)", _TIMING).group(1))
_GAPS = [float(x) for x in re.search(r"const GAPS: number\[\] = \[([^\]]*)\]", _TIMING).group(1).split(",") if x.strip()]
_KEYS = re.findall(r'"(s\d+)"', re.search(r"VO_KEYS = \[([^\]]*)\]", _TIMING).group(1))
_VO = json.loads((ROOT / "src" / "data" / "vo.json").read_text(encoding="utf-8"))
DUR = _num("SECONDS")
FIRST_VO, LEAD = _num("FIRST_VO"), _num("LEAD")
VO_AT = {}
_t = FIRST_VO
for _i, _k in enumerate(_KEYS):
    VO_AT[_k] = _t
    _t += _VO[_k]["seconds"] + (_GAPS[_i] if _i < len(_GAPS) else 0)
S = [0.0] + [round((VO_AT[k] - LEAD) * 30) / 30 for k in _KEYS[1:]]


def word(k, i):
    """Segundo absoluto em que a palavra i da fala k começa (para amarrar impactos à voz)."""
    return VO_AT[k] + _VO[k]["words"][i]["start"]




def word(k, i):
    """Segundo absoluto em que a palavra i da fala k começa (para amarrar impactos à voz)."""
    return VO_AT[k] + _VO[k]["words"][i]["start"]


# mesma conta de OUTRO_SECONDS em timing.ts (encerramento estica até caber a chamada falada)
OUTRO = max(2.6, 0.6 + _VO["cta"]["seconds"] + 0.6) if "cta" in _VO else 2.6

# ------------------------------------------------------------------ edite por vídeo
PALETTE = "natureza"
VARIANT = ROOT.parent.name  # slug da produção
n_sc = len(S)
INTENTS = ["curious", "curious", "calm", "build", "reveal", "curious", "tense", "reveal", "tense", "resolve"]
HITS: list[float] = [word("s1", 18), word("s4", 12), word("s6", 21), word("s9", 11)]

mix = fm.render(S, INTENTS, DUR, PALETTE, hits=HITS, outro=OUTRO, variant=VARIANT)
OUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(OUT, mix, fm.SR, subtype="PCM_16")
print(f"music: {OUT} ({DUR:.1f}s, paleta {PALETTE}, variante {VARIANT})")
