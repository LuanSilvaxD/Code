"""Sintetiza os efeitos sonoros do vídeo (tudo gerado por código, sem samples).

Uso:
    python scripts/sfx.py          -> public/audio/sfx/*.wav
"""

from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "sfx"
SR = 48000
rng = np.random.default_rng(31)


def tt(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def sweep_bp(x, centers, q=1.6, block=256):
    out = np.zeros_like(x)
    zi = None
    for b in range(0, len(x), block):
        c = float(np.clip(centers[min(b, len(centers) - 1)], 60, 16000))
        sos = butter(2, [c / q, min(c * q, SR * 0.45)], "band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        out[b : b + block], zi = sosfilt(sos, x[b : b + block], axis=0, zi=zi)
    return out


def pan(x, p):
    return np.stack([x * np.cos((p + 1) * np.pi / 4), x * np.sin((p + 1) * np.pi / 4)], axis=1)


def env(d, a, r):
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)


def save(name, x, peak=0.89):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    sf.write(OUT / f"{name}.wav", x.astype(np.float32), SR, subtype="PCM_16")


# ---------------------------------------------------------------- movimento de câmera
def whoosh(d=0.7, f0=400, ratio=14, spread=0.6):
    t = tt(d)
    p = t / d
    shape = np.sin(np.pi * p) ** 2
    n = rng.standard_normal((len(t), 2))
    y = sweep_bp(n, f0 * ratio ** np.sin(np.pi * p * 0.5)) * shape[:, None]
    pn = np.linspace(-spread, spread, len(t))
    y[:, 0] *= np.cos((pn + 1) * np.pi / 4) * 1.4
    y[:, 1] *= np.sin((pn + 1) * np.pi / 4) * 1.4
    return y


def dive(d=2.2):
    # câmera atravessando o chão: ar + terra passando, filtro descendo
    t = tt(d)
    p = t / d
    n = rng.standard_normal((len(t), 2))
    y = sweep_bp(n, 3500 * 0.08 ** (p**0.8), q=2.0)
    rumble = lp(rng.standard_normal(len(t)), 110) * 2.5 * np.sin(np.pi * p) ** 2
    amp = np.sin(np.pi * np.clip(p * 1.1, 0, 1)) ** 1.3
    return (y + rumble[:, None]) * amp[:, None]


# ---------------------------------------------------------------- interface
def pop(f0=760, f1=380):
    t = tt(0.09)
    f = f1 + (f0 - f1) * np.exp(-t / 0.015)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025) * (1 - np.exp(-t / 0.001))


def badge():
    # "plim" suave de entrada de badge: pop + dois parciais
    t = tt(0.5)
    y = np.zeros(len(t))
    for f, dl, g in [(1046.5, 0.0, 1.0), (1568, 0.045, 0.6)]:
        u = np.clip(t - dl, 0, None)
        y += np.where(t >= dl, np.sin(2 * np.pi * f * u) * np.exp(-u / 0.12), 0) * g
    y[: int(0.09 * SR)] += pop(900, 450)[: int(0.09 * SR)] * 0.6
    return y * 0.6


def tick():
    t = tt(0.06)
    return np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.008) * 0.6 + hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.002) * 0.3


def click():
    t = tt(0.07)
    y = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.015) * 0.7
    return y + hp(rng.standard_normal(len(t)), 3500) * np.exp(-t / 0.003) * 0.5


def buzz():
    # alerta negativo discreto (duas notas descendentes)
    t = tt(0.42)
    y = np.zeros(len(t))
    for f, dl in [(392, 0.0), (311, 0.16)]:
        u = np.clip(t - dl, 0, None)
        tone = np.sign(np.sin(2 * np.pi * f * u)) * 0.35 + np.sin(2 * np.pi * f * u)
        y += np.where(t >= dl, lp(tone, 2200) * np.exp(-u / 0.11), 0)
    return y * 0.6


def ding(f1=1318.5, f2=1975.5, d=1.1):
    t = tt(d)
    y = np.zeros(len(t))
    for f, dl, g in [(f1, 0.0, 1.0), (f2, 0.07, 0.7)]:
        u = np.clip(t - dl, 0, None)
        tone = np.sin(2 * np.pi * f * u + 0.9 * np.exp(-u / 0.2) * np.sin(2 * np.pi * f * 2 * u))
        y += np.where(t >= dl, tone * np.exp(-u / 0.35), 0) * g
    return y


def shimmer(d=1.6):
    # descoberta: notas agudas subindo + brilho
    t = tt(d)
    y = np.zeros((len(t), 2))
    notes = [1396.9, 1760, 2093, 2637, 3136]
    for k, f in enumerate(notes):
        dl = k * 0.07
        u = np.clip(t - dl, 0, None)
        y += pan(np.sin(2 * np.pi * f * u) * np.exp(-u / 0.5) * np.where(t >= dl, 1, 0), -0.6 + 1.2 * k / (len(notes) - 1))
    return y + hp(rng.standard_normal((len(t), 2)), 7000) * (np.exp(-t / 0.5) * (1 - np.exp(-t / 0.1)))[:, None] * 0.12


def glow():
    t = tt(1.2)
    f = 520 * 2 ** (0.5 * np.minimum(1, t / 0.6))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.minimum(1, t / 1.2)) * 0.5
    return y + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * np.sin(np.pi * np.minimum(1, t / 1.2)) * 0.2


def final():
    t = tt(2.4)
    y = np.zeros((len(t), 2))
    for k, f in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.5]):
        dl = k * 0.05
        u = np.clip(t - dl, 0, None)
        y += pan(np.sin(2 * np.pi * f * u) * np.exp(-u / 0.9) * np.where(t >= dl, 1, 0), -0.5 + 0.25 * k) * (0.9 - 0.1 * k)
    boom = np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.4)
    return y + boom[:, None] * 0.7


# ---------------------------------------------------------------- máquina e terra
def thud():
    # caminhão aterrissando + suspensão
    t = tt(0.9)
    f = 38 + 90 * np.exp(-t / 0.05)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    dirt = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t / 0.12) * 0.5
    rattle = bp(rng.standard_normal(len(t)), 900, 3500) * np.exp(-t / 0.05) * 0.3
    return np.tanh((boom + dirt + rattle) * 1.4)


def hydraulic(d=0.75):
    t = tt(d)
    p = t / d
    hiss = bp(rng.standard_normal(len(t)), 2500, 9000) * np.sin(np.pi * p) ** 0.7 * 0.5
    motor = np.sin(2 * np.pi * np.cumsum(110 + 60 * p) / SR) * 0.4 * np.sin(np.pi * p)
    return hiss + lp(np.sign(motor), 600) * 0.3


def drill(d=3.0):
    # motor da perfuratriz + broca triturando rocha (com variação conforme a camada)
    t = tt(d)
    motor = np.zeros(len(t))
    base = 72 + 6 * np.sin(2 * np.pi * 0.6 * t)
    for h in range(1, 7):
        motor += np.sin(2 * np.pi * np.cumsum(base * h) / SR) / h
    motor = lp(motor, 900) * 0.6
    grind = bp(rng.standard_normal(len(t)), 300, 2400) * (0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 9 * t)))
    crunch = np.zeros(len(t))
    for t0 in np.sort(rng.uniform(0, d - 0.05, 70)):
        i = int(t0 * SR)
        k = tt(0.03)
        seg = bp(rng.standard_normal(len(k)), 1200, 6000) * np.exp(-k / 0.006) * rng.uniform(0.3, 1.0)
        crunch[i : i + len(k)] += seg[: len(crunch) - i]
    return (motor + grind * 0.5 + crunch * 0.45) * env(d, 0.12, 0.35)


def crumble():
    t = tt(0.7)
    y = np.zeros(len(t))
    for t0 in np.sort(rng.uniform(0, 0.45, 26)):
        i = int(t0 * SR)
        k = tt(0.05)
        seg = lp(rng.standard_normal(len(k)), rng.uniform(1500, 4000)) * np.exp(-k / 0.012) * rng.uniform(0.3, 1.0)
        y[i : i + len(k)] += seg[: len(y) - i]
    return y + lp(rng.standard_normal(len(t)), 200) * np.exp(-t / 0.2) * 0.6


def clunk():
    t = tt(0.6)
    y = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.08) + np.sin(2 * np.pi * 523 * t) * np.exp(-t / 0.15) * 0.5 + np.sin(2 * np.pi * 1290 * t) * np.exp(-t / 0.1) * 0.25
    return y + lp(rng.standard_normal(len(t)), 1200) * np.exp(-t / 0.02) * 0.5


def rumble_soft(d=1.4):
    t = tt(d)
    return lp(rng.standard_normal(len(t)), 140) * env(d, 0.3, 0.7) * 1.2 + np.sin(2 * np.pi * 52 * t) * env(d, 0.3, 0.7) * 0.4


def pressure(d=2.6):
    # pressão: grave pulsante e discreto
    t = tt(d)
    sub = np.sin(2 * np.pi * 46 * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.2 * t))
    body = lp(np.sign(np.sin(2 * np.pi * 92 * t)), 300) * 0.25
    creak = bp(rng.standard_normal(len(t)), 180, 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * t)) * 0.3
    return (sub + body + creak) * env(d, 0.35, 0.9)


# ---------------------------------------------------------------- água
def bubbles(d=1.6, n=30, lo=500, hi=1400):
    t = tt(d)
    y = np.zeros(len(t))
    for t0 in np.sort(rng.uniform(0, d - 0.1, n)):
        i = int(t0 * SR)
        k = tt(0.08)
        f0 = rng.uniform(lo, hi)
        f = f0 * (1 + 0.8 * k / 0.08)
        seg = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k / 0.02) * rng.uniform(0.3, 1.0)
        y[i : i + len(k)] += seg[: len(y) - i]
    return y * env(d, 0.1, 0.4)


def water_rise(d=2.3):
    t = tt(d)
    p = t / d
    n = rng.standard_normal((len(t), 2))
    rush = sweep_bp(n, 300 * 6 ** p, q=1.4) * (0.3 + 0.7 * p)[:, None] * env(d, 0.15, 0.25)[:, None]
    gl = bubbles(d, 55, 400, 1100)
    gl2 = bubbles(d, 40, 900, 2000)
    return rush * 0.8 + pan(gl, -0.3) * 0.6 + pan(gl2, 0.3) * 0.4


def gush(d=2.8):
    # água saindo com força e caindo em volta
    t = tt(d)
    n = rng.standard_normal((len(t), 2))
    spray = bp(n, 1500, 9000) * (np.minimum(1, t / 0.08) * (0.65 + 0.35 * np.exp(-t / 0.5)))[:, None]
    body = lp(n, 900) * 0.6 * np.exp(-t / 0.9)[:, None]
    splat = np.stack([bubbles(d, 50, 600, 1600), bubbles(d, 50, 700, 1800)], axis=1) * 0.35
    return (spray + body + splat) * env(d, 0.02, 0.9)[:, None]


def rain(d=4.6):
    t = tt(d)
    n = rng.standard_normal((len(t), 2))
    bed = bp(n, 1200, 8000) * 0.35
    drops = np.zeros(len(t))
    for t0 in np.sort(rng.uniform(0, d - 0.05, 160)):
        i = int(t0 * SR)
        k = tt(0.02)
        seg = hp(rng.standard_normal(len(k)), 3000) * np.exp(-k / 0.003) * rng.uniform(0.2, 1.0)
        drops[i : i + len(k)] += seg[: len(drops) - i]
    return (bed + pan(drops, 0.2) * 0.5) * env(d, 0.6, 1.0)[:, None]


def flow(d=3.2):
    t = tt(d)
    n = rng.standard_normal((len(t), 2))
    stream = sweep_bp(n, 700 + 250 * np.sin(2 * np.pi * 0.7 * t), q=1.8) * 0.6
    gl = bubbles(d, 45, 500, 1300)
    return (stream + pan(gl, 0.1) * 0.5) * env(d, 0.25, 0.8)[:, None]


def fill(d=2.3):
    # caixa enchendo: tom do "glug" sobe com o nível
    t = tt(d)
    p = t / d
    n = rng.standard_normal(len(t))
    pour = bp(n, 800, 5000) * 0.35
    res = np.sin(2 * np.pi * np.cumsum(260 + 520 * p) / SR) * (0.25 + 0.15 * np.sin(2 * np.pi * 11 * t))
    return (pour + lp(res, 1500) * 0.5 + bubbles(d, 40, 300 + 0, 900) * 0.4) * env(d, 0.2, 0.6)


def pump(d=2.0):
    t = tt(d)
    f = 95 + 125 * np.minimum(1, t / 0.5)
    whir = np.zeros(len(t))
    for h in (1, 2, 3, 5):
        whir += np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h
    hum = lp(whir, 1400) * 0.6
    start = np.concatenate([click(), np.zeros(len(t) - len(click()))]) * 0.6
    return (hum + bp(rng.standard_normal(len(t)), 400, 2000) * 0.12 + start) * env(d, 0.04, 0.6)



# ---------------------------------------------------------------- tema tsunami
def ocean_amb(d=7.0, lo=180, hi=900):
    t = tt(d)
    n = rng.standard_normal(len(t))
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 3.1) ** 2
    return bp(n, lo, hi) * swell * 0.5 * env(d, 0.8, 1.5)


def deep_amb(d=6.0):
    t = tt(d)
    drone = sum(np.sin(2 * np.pi * f * t + i) / (i + 1) for i, f in enumerate((55, 82.5, 110)))
    return (lp(drone, 400) * 0.35 + lp(rng.standard_normal(len(t)), 220) * 0.4) * env(d, 0.9, 1.6)


def rumble(d=3.2):
    t = tt(d)
    n = lp(rng.standard_normal(len(t)), 120, 4) * 3.0
    sub = np.sin(2 * np.pi * (38 + 8 * np.exp(-t)) * t)
    crack = np.concatenate([hp(rng.standard_normal(int(0.12 * SR)), 900) * np.exp(-np.linspace(0, 6, int(0.12 * SR))), np.zeros(len(t) - int(0.12 * SR))])
    return (n + sub * 0.7) * np.exp(-t / 1.3) * env(d, 0.01, 0.8) + crack * 0.5


def strain(d=1.4):
    t = tt(d)
    f = 70 + 40 * t / d
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    return bp(tone + rng.standard_normal(len(t)) * 0.2, 150, 1200) * (t / d) * env(d, 0.3, 0.2)


def rewind(d=0.6):
    t = tt(d)
    centers = np.geomspace(5000, 300, len(t))
    warble = 1 + 0.3 * np.sin(2 * np.pi * 18 * t)
    return sweep_bp(rng.standard_normal(len(t)), centers * warble, q=2.2) * env(d, 0.05, 0.15) * 1.4


def jet_flyby(d=2.6):
    t = tt(d)
    x = (t - d / 2) / (d / 4)
    amp = 1 / (1 + x ** 2)
    centers = 2200 - 1200 * np.tanh(x)
    roar = sweep_bp(rng.standard_normal(len(t)), centers, q=1.8)
    return pan(roar * amp * env(d, 0.2, 0.4), np.tanh(x) * 0.7)


def rush(d=3.4):
    t = tt(d)
    n = rng.standard_normal(len(t))
    body = lp(n, 900) * 1.2 + bp(n, 900, 4000) * 0.35
    return body * np.minimum(1, t / 0.35) * env(d, 0.05, 1.4)


def drain(d=2.4):
    t = tt(d)
    centers = np.geomspace(1400, 260, len(t))
    suck = sweep_bp(rng.standard_normal(len(t)), centers, q=1.5)
    return suck * env(d, 0.4, 0.9) * 0.9


def flood(d=7.5):
    t = tt(d)
    n = rng.standard_normal(len(t))
    gurgle = bp(n, 250, 1600) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
    return (gurgle + lp(n, 300) * 0.6) * env(d, 0.8, 2.0) * 0.6


OUT.mkdir(parents=True, exist_ok=True)
save("ocean-amb", ocean_amb())
save("deep-amb", deep_amb())
save("rumble", rumble())
save("strain", strain())
save("rewind", rewind())
save("jet-flyby", jet_flyby())
save("rush", rush())
save("drain", drain())
save("flood-loop", flood())
save("whoosh", whoosh(0.7))
save("whoosh-soft", whoosh(0.9, 300, 6, 0.3))
save("whoosh-big", whoosh(1.2, 200, 20, 0.8))
save("dive", dive())
save("pop", pop())
save("pop-high", pop(1150, 640))
save("badge", badge())
save("tick", tick())
save("click", click())
save("buzz", buzz())
save("ding", ding())
save("shimmer", shimmer())
save("glow", glow())
save("final", final())
save("thud", thud())
save("hydraulic", hydraulic())
save("drill", drill())
save("crumble", crumble())
save("clunk", clunk())
save("rumble-soft", rumble_soft())
save("pressure", pressure())
save("bubbles", bubbles())
save("water-rise", water_rise())
save("gush", gush())
save("rain", rain())
save("flow", flow())
save("fill", fill())
save("pump", pump())

# ---------------------------------------------------------------- marca Fenda Umbra
def fenda_open(d=1.3):
    """Fenda abrindo: sopro de ar que sobe + brilho cristalino + baque grave suave no fim."""
    t = tt(d)
    air = sweep_bp(rng.standard_normal(len(t)), np.geomspace(300, 5200, len(t)), q=2.0) * np.minimum(1, t / 0.5) * 0.8
    shimmer = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate((1318.5, 1760, 2637))) * 0.06 * np.clip((t - 0.35) / 0.4, 0, 1)
    n = int(0.5 * SR)
    thump = np.zeros(len(t))
    i0 = int(0.62 * SR)
    seg = np.sin(2 * np.pi * 58 * np.arange(n) / SR) * np.exp(-np.linspace(0, 7, n)) * 0.7
    thump[i0 : i0 + n] = seg[: len(t) - i0]
    return (air + shimmer + thump) * env(d, 0.02, 0.5)


def fenda_close(d=1.6):
    """Fenda fechando: sopro descendo + batida grave (porta de pedra) + cauda escura."""
    t = tt(d)
    air = sweep_bp(rng.standard_normal(len(t)), np.geomspace(4200, 260, len(t)), q=2.0) * np.clip(1 - t / 0.7, 0, 1) * 0.8
    n = int(0.9 * SR)
    hit = np.zeros(len(t))
    i0 = int(0.55 * SR)
    k = np.arange(n) / SR
    seg = (np.sin(2 * np.pi * 46 * k) * 0.8 + lp(rng.standard_normal(n), 220) * 0.6) * np.exp(-k / 0.28)
    hit[i0 : i0 + n] = seg[: len(t) - i0]
    return (air + hit) * env(d, 0.01, 0.6)


save("fenda-open", fenda_open())
save("fenda-close", fenda_close())


def dig(d=0.9):
    t = tt(d)
    out = np.zeros(len(t))
    for k, t0 in enumerate((0.0, 0.42)):
        i = int(t0 * SR)
        n = int(0.32 * SR)
        seg = bp(rng.standard_normal(n), 700, 4200) * np.exp(-np.linspace(0, 5, n)) * 0.9
        thump = np.sin(2 * np.pi * 95 * np.arange(n) / SR) * np.exp(-np.linspace(0, 9, n)) * 0.6
        out[i : i + n] += (seg + thump)[: len(out) - i]
    return out


save("dig", dig())


# ---------------------------------------------------------------- EP. 02 (medieval)
def gallop(d=3.0, bpm=330):
    """Galope de vários cavalos ao longe: batidas graves de casco em grupos de 3."""
    t = tt(d)
    out = np.zeros(len(t))
    step = 60 / bpm
    k = 0
    while k * step < d - 0.1:
        for j, off in enumerate((0, 0.06, 0.12)):
            i = int((k * step + off + rng.uniform(0, 0.012)) * SR)
            n = int(0.07 * SR)
            if i + n >= len(out):
                continue
            seg = (lp(rng.standard_normal(n), 900) * 0.7 + np.sin(2 * np.pi * (110 - j * 12) * np.arange(n) / SR) * 0.6) * np.exp(-np.linspace(0, 8, n))
            out[i : i + n] += seg * (0.9 - 0.15 * j)
        k += 1
    return out * env(d, 0.4, 0.8) * 0.8


def bells(d=3.2):
    """Sinos de catedral: 3 badaladas com parciais inarmônicos e cauda longa."""
    t = tt(d)
    out = np.zeros(len(t))
    for k, (t0, f0) in enumerate(((0.0, 392.0), (0.75, 329.6), (1.5, 261.6))):
        i = int(t0 * SR)
        tk = t[: len(t) - i]
        partials = [(0.5, 0.5), (1.0, 1.0), (1.19, 0.6), (1.5, 0.45), (2.0, 0.35), (2.74, 0.2)]
        seg = sum(a * np.sin(2 * np.pi * f0 * r * tk) * np.exp(-tk / (1.4 / r)) for r, a in partials)
        out[i:] += seg * 0.22
    return out


def fire(d=4.0):
    """Fogo: ruído grave filtrado + estalos aleatórios."""
    t = tt(d)
    base = lp(rng.standard_normal(len(t)), 700) * 0.5 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t))
    crack = np.zeros(len(t))
    for _ in range(int(d * 9)):
        i = rng.integers(0, len(t) - 600)
        n = rng.integers(80, 500)
        crack[i : i + n] += hp(rng.standard_normal(n), 2000) * np.exp(-np.linspace(0, 6, n)) * rng.uniform(0.3, 0.9)
    return (base + crack * 0.5) * env(d, 0.6, 1.2)


def chains(d=1.2):
    """Correntes: cliques metálicos agudos com ressonância curta."""
    t = tt(d)
    out = np.zeros(len(t))
    for _ in range(14):
        i = rng.integers(0, int(0.9 * SR))
        n = int(0.06 * SR)
        f0 = rng.uniform(2400, 4200)
        seg = np.sin(2 * np.pi * f0 * np.arange(n) / SR) * np.exp(-np.linspace(0, 9, n)) + hp(rng.standard_normal(n), 3000) * np.exp(-np.linspace(0, 14, n)) * 0.4
        out[i : i + n] += seg * rng.uniform(0.3, 0.8)
    return out * env(d, 0.01, 0.3) * 0.7


def murmur(d=5.0):
    """Burburinho de sala cheia: ruído na faixa da voz com modulação lenta (sem palavras)."""
    t = tt(d)
    x = bp(rng.standard_normal(len(t)), 250, 1400) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.7 * t + 0.3 * np.sin(2 * np.pi * 0.31 * t))))
    return x * env(d, 0.8, 1.2) * 0.5


save("gallop", gallop())
save("bells", bells())
save("fire", fire())
save("chains", chains())
save("murmur", murmur())

print("sfx:", sorted(p.name for p in OUT.glob("*.wav")))
