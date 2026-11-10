"""MODELO de trilha — este arranjo é o do exemplo "poço artesiano"; adapte antes de usar:
  1. DUR = duração do vídeo; S = início (s) de cada cena = SCENE_FRAMES de src/utils/timing.ts / 30.
  2. Troque os momentos-chave (DRILL_START, JET, PUMP...) pelos do seu roteiro (frames/30).
  3. Reescreva a seção "arranjo" com uma intenção por cena (calma, tensão, crescendo, resolução).
Os instrumentos (marimba, pad, baixo, bumbo, sinos, riser) e a mixagem com sidechain são reutilizáveis.

Sintetiza a trilha instrumental (didática e curiosa, 100 BPM, Fá maior, 45 s).

Tudo é gerado por código (sem samples), então a trilha é livre de direitos.
As seções seguem os cortes de src/utils/timing.ts (derivados da narração):
  intro curiosa -> descoberta -> perfuração (groove) -> pressão (tensão) ->
  subida da água (crescendo até o jorro) -> comparação -> distribuição -> resolução.

Uso:
    python scripts/music.py          -> public/audio/music.wav
"""

from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "music.wav"

SR = 48000
DUR = 90.0
N = int(SR * DUR)
BPM = 84
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(12)

# Cortes e momentos derivados da narração (mesma lógica de src/utils/timing.ts)
import json
_VO = json.loads((ROOT / "src" / "data" / "vo.json").read_text(encoding="utf-8"))
_GAPS = [0.8, 1.3, 1.0, 1.2, 0.9, 1.2, 0.8, 0.9, 0.8, 0.9, 1.0, 1.3, 1.2]
VO_AT = {}
_t = 0.45
for _i in range(14):
    _k = f"s{_i + 1}"
    VO_AT[_k] = _t
    _t += _VO[_k]["seconds"] + (_GAPS[_i] if _i < 13 else 0)
S = [0.0] + [round((VO_AT[f"s{i + 1}"] - 0.25) * 30) / 30 for i in range(1, 14)]


def word(k, i):
    return VO_AT[k] + _VO[k]["words"][i]["start"]


PAREDAO = word("s2", 8)
QUAKE = word("s3", 12)
LIFT = word("s4", 1)
FAST = word("s8", 8)
FREIA = word("s9", 15)
EMPILHA = word("s10", 16)
SUBA = word("s12", 15)
ARRIVE = S[12] + 0.4
FINAL_HIT = word("s14", 14)

CH = {
    "F": [53, 57, 60, 65],
    "Dm": [50, 53, 57, 62],
    "Bb": [46, 50, 53, 58],
    "C": [48, 52, 55, 60],
    "Gm": [43, 50, 55, 58],
    "A": [45, 49, 52, 57],
    "Fadd9": [53, 57, 60, 67],
}
ROOT_NOTE = {"F": 41, "Dm": 38, "Bb": 34, "C": 36, "Gm": 31, "A": 33, "Fadd9": 41}
MAJOR = ["F", "Dm", "Bb", "C"]
TENSE = ["Dm", "Bb", "Gm", "A"]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def stereo(x, p=0.0):
    return np.stack([x * np.cos((p + 1) * np.pi / 4), x * np.sin((p + 1) * np.pi / 4)], axis=1)


def place(bus, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(bus):
        return
    if sig.ndim == 1:
        sig = stereo(sig)
    j = min(i + len(sig), len(bus))
    bus[i:j] += sig[: j - i] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def env(d, a, r):
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)


def saw(f, d):
    t = tt(d)
    p = (rng.random() + t * f) % 1.0
    return 2 * p - 1


def ir(length, decay, damp=6500):
    t = tt(length)
    h = rng.standard_normal((len(t), 2)) * np.exp(-t / decay)[:, None]
    h = lp(h, damp)
    h[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return h / np.sqrt(np.sum(h**2))


def verb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c])[: len(x)] for c in range(2)], axis=1)


# ---------------------------------------------------------------- instrumentos
def marimba(m, d=0.9, bright=1.0):
    t = tt(d)
    f = hz(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.35 * bright * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.06) + 0.12 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t / 0.02)
    return y * (1 - np.exp(-t / 0.0015)) * 0.4


def pluck(m, d=0.4):
    t = tt(d)
    f = hz(m)
    y = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (7 + 4 * k)) for k in range(1, 9))
    return y * (1 - np.exp(-t / 0.002)) * 0.32


def pad(chord, d, cutoff=1500, gain=1.0):
    out = np.zeros((int(d * SR), 2))
    for i, m in enumerate(chord):
        for v in (-0.08, 0.08):
            out += stereo(saw(hz(m + v), d), -0.6 + 1.2 * i / max(1, len(chord) - 1))
    return lp(out / (2 * len(chord)), cutoff) * env(d, 0.5, 0.8)[:, None] * gain


def bass(m, d):
    t = tt(d)
    f = hz(m)
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    return np.tanh(y * 1.3) * env(d, 0.01, 0.12) * 0.5


def kick(g=1.0):
    t = tt(0.4)
    f = 48 + 100 * np.exp(-t / 0.03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2)
    return np.tanh(y * 1.5) * 0.8 * g


def shaker():
    t = tt(0.09)
    return hp(rng.standard_normal(len(t)), 6000, 4) * np.exp(-t / 0.025) * 0.35


def clap():
    t = tt(0.3)
    n = rng.standard_normal(len(t))
    e = sum(np.where(t >= o, np.exp(-(t - o) / 0.006), 0) for o in (0.0, 0.01, 0.02)) + np.where(t >= 0.02, np.exp(-(t - 0.02) / 0.1), 0) * 0.5
    return sosfilt(butter(2, [1000, 5000], "band", fs=SR, output="sos"), n * e) * 0.7


def bell(m, d=2.2):
    t = tt(d)
    f = hz(m)
    y = np.sin(2 * np.pi * f * t + 1.6 * np.exp(-t / 0.5) * np.sin(2 * np.pi * f * 3.5 * t))
    return y * np.exp(-t / 0.8) * (1 - np.exp(-t / 0.002)) * 0.28


def sweep_lp(x, cut, block=512):
    out = np.zeros_like(x)
    zi = None
    for b in range(0, len(x), block):
        sos = butter(2, float(np.clip(cut[min(b, len(cut) - 1)], 40, SR * 0.45)), "low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        out[b : b + block], zi = sosfilt(sos, x[b : b + block], axis=0, zi=zi)
    return out


def riser(d):
    t = tt(d)
    p = t / d
    n = hp(rng.standard_normal((len(t), 2)), 400)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (p * 2)) / SR) * 0.15
    return (sweep_lp(n, 600 + 8000 * p**2) * 0.5 + tone[:, None]) * (p**2)[:, None]


def soft_hit(size=1.0):
    t = tt(2.0)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 70 * np.exp(-t / 0.08)) / SR) * np.exp(-t / (0.5 * size))
    air = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.12) * 0.3
    return np.tanh((boom + air) * 1.2) * 0.7


# ---------------------------------------------------------------- arranjo
drums = np.zeros((N, 2))
low = np.zeros((N, 2))
pads = np.zeros((N, 2))
leads = np.zeros((N, 2))
fx = np.zeros((N, 2))
kicks = []


def chord_at(t, prog, start):
    return prog[int((t - start) // BAR) % len(prog)]


def section_pads(start, end, prog, cutoff, gain):
    t0 = start
    while t0 < end - 0.05:
        d = min(BAR, end - t0)
        name = chord_at(t0, prog, start)
        place(pads, pad(CH[name], d + 0.6, cutoff, gain), t0, 1.0)
        t0 += BAR


def arps(start, end, prog, step, pattern, gain, inst=marimba, octave=12):
    k = 0
    for t0 in np.arange(start, end - 0.02, step):
        name = chord_at(t0, prog, start)
        n = CH[name][pattern[k % len(pattern)] % 4] + octave
        place(leads, stereo(inst(n), (-0.35, 0.35)[k % 2]), t0, gain)
        k += 1


def basses(start, end, prog, pattern, gain):
    for t0 in np.arange(start, end - 0.02, BEAT / 2):
        k = int(round((t0 - start) / (BEAT / 2)))
        if not pattern[k % len(pattern)]:
            continue
        name = chord_at(t0, prog, start)
        place(low, stereo(bass(ROOT_NOTE[name], BEAT * 0.45)), t0, gain)


def groove(start, end, kick_g, hat_g, clap_g=0.0):
    for t0 in np.arange(start, end - 0.02, BEAT):
        k = int(round((t0 - start) / BEAT))
        if k % 2 == 0 and kick_g > 0:
            place(drums, kick(kick_g), t0, 1.0)
            kicks.append((t0, kick_g))
        if k % 2 == 1 and clap_g > 0:
            place(drums, clap(), t0, clap_g)
        for sub in (0.0, 0.5):
            place(drums, stereo(shaker(), 0.3 if sub else -0.2), t0 + sub * BEAT, hat_g * (1.0 if sub else 0.6))


CALM = ["Dm", "Bb", "F", "C"]
OPEN = ["F", "C", "Dm", "Bb"]

# 1) mar aberto (cenas 1-2): pad calmo, motivo de "pergunta" esparso; impacto no "paredão"
section_pads(S[0], S[2], CALM, 1000, 0.75)
arps(S[0] + BAR / 2, S[1], CALM, BEAT, [0, 2, 1, 3], 0.26)
place(fx, stereo(soft_hit(1.1)), PAREDAO, 0.55)
place(low, stereo(np.sin(2 * np.pi * hz(26) * tt(3.0)) * env(3.0, 0.02, 2.0) * 0.7), PAREDAO, 1.0)
place(fx, riser(1.4), S[2] - 1.4, 0.3)

# 2) terremoto (cena 3): drone grave e pulso contido, golpe no "solta"
section_pads(S[2], S[3], ["Dm", "A"], 700, 0.8)
for t0 in np.arange(S[2], QUAKE - 0.05, BEAT):
    place(low, stereo(bass(ROOT_NOTE["Dm"], BEAT * 0.3)), t0, 0.45)
place(fx, stereo(soft_hit(1.4)), QUAKE, 0.6)

# 3) descoberta (cenas 4-6): marimba curiosa e chocalho leve
section_pads(S[3], S[6], OPEN, 1500, 0.7)
arps(S[3], S[6], OPEN, BEAT / 2, [0, 2, 3, 1, 2, 3, 1, 2], 0.34)
groove(S[4], S[6], 0, 0.4)
basses(S[4], S[6], OPEN, [1, 0, 0, 1, 0, 0, 1, 0], 0.5)

# 4) velocidade (cenas 7-8): groove com bumbo, baixo ativo, riser até "setecentos"
section_pads(S[6], S[8], OPEN, 1900, 0.65)
arps(S[6], S[8], OPEN, BEAT / 4, [0, 1, 2, 3, 2, 1], 0.2, inst=pluck, octave=24)
groove(S[6], S[8] - 0.2, 0.7, 0.55, 0.3)
basses(S[6], S[8], OPEN, [1, 0, 1, 1, 0, 1, 1, 0], 0.58)
place(fx, riser(FAST - S[7] + 0.3), S[7], 0.28)

# 5) chegando à costa (cenas 9-11): progressão tensa, crescendo
section_pads(S[8], S[11], TENSE, 1100, 0.85)
arps(S[8], S[11], TENSE, BEAT / 2, [0, 2, 1, 3], 0.3, inst=pluck)
groove(S[9], S[11] - 0.3, 0.6, 0.45)
basses(S[8], S[11], TENSE, [1, 0, 1, 0, 1, 1, 1, 0], 0.6)
place(fx, stereo(soft_hit(0.8)), FREIA, 0.35)
place(fx, riser(S[11] - EMPILHA), EMPILHA, 0.35)

# 6) o mar recua (cena 12): tudo some, só um pulso grave e suspense
section_pads(S[11], S[12], ["Dm", "Gm"], 650, 0.9)
for t0 in np.arange(S[11], S[12] - 0.05, BEAT):
    place(low, stereo(bass(ROOT_NOTE["Dm"] - 12 + 12, BEAT * 0.25)), t0, 0.4)
place(fx, riser(S[12] - SUBA), SUBA, 0.32)

# 7) chegada (cena 13): impacto e massa grave, sempre sob a voz
place(fx, stereo(soft_hit(1.6)), ARRIVE, 0.65)
section_pads(S[12], S[13], ["Dm", "Bb", "Gm", "A"], 1300, 0.9)
groove(S[12] + 0.6, S[13] - 0.3, 0.55, 0.3, 0.2)
basses(S[12], S[13], ["Dm", "Bb", "Gm", "A"], [1, 0, 0, 1, 1, 0, 1, 0], 0.6)

# 8) resolução (cena 14): maior, aberto, sinos no fim
place(fx, stereo(soft_hit(1.0)), S[13], 0.4)
place(pads, pad(CH["Fadd9"], DUR - S[13], 2400, 1.0), S[13], 1.0)
place(low, stereo(np.sin(2 * np.pi * hz(29) * tt(5.0)) * env(5.0, 0.05, 2.5) * 0.6), S[13], 1.0)
arps(S[13], FINAL_HIT - 0.3, ["Fadd9"], BEAT / 2, [0, 1, 2, 3, 2, 1], 0.28)
for k, m in enumerate([77, 81, 84, 88, 91]):
    place(leads, stereo(bell(m, 2.6), -0.6 + 0.3 * k), FINAL_HIT + 0.05 * k, 0.24)
place(fx, stereo(soft_hit(1.0)), FINAL_HIT, 0.45)

# ---------------------------------------------------------------- mixagem
sc = np.ones(N)
tf = np.arange(N) / SR
for k, depth in kicks:
    i = int(k * SR)
    seg = tf[i : i + int(0.3 * SR)] - k
    sc[i : i + len(seg)] = np.minimum(sc[i : i + len(seg)], 1 - 0.45 * depth * np.exp(-seg / 0.09))
sc = lp(sc, 40)
pads *= sc[:, None]
low *= (sc**0.5)[:, None]

delay = int(BEAT * 0.75 * SR)
echo = np.zeros_like(leads)
echo[delay:, 0] = leads[:-delay, 1] * 0.28
echo[2 * delay :, 1] = leads[: -2 * delay, 0] * 0.18
leads = leads + lp(echo, 4000)

wet = verb(pads * 0.3 + leads * 0.45 + fx * 0.3, ir(2.6, 0.7)) * 0.8 + verb(drums * 0.08, ir(0.8, 0.18))
mix = drums * 0.7 + low * 0.9 + pads * 0.9 + leads * 0.85 + fx * 0.7 + wet
mix = hp(mix, 28)
mix *= (np.clip((DUR - tf) / 0.9, 0, 1) ** 1.5)[:, None]
mix = np.tanh(mix * 1.1)
mix *= 0.89 / np.max(np.abs(mix))
OUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(OUT, mix.astype(np.float32), SR, subtype="PCM_16")
print(f"music: {OUT} ({DUR:.1f}s)")
