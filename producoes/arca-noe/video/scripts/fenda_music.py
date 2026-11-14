"""Motor de trilha Fenda Umbra v3: tema da marca + paletas por assunto. Tudo sintetizado (sem samples, sem direitos).

render(S, intents, dur, palette="historia", hits=(), outro=5.2, seed=7) -> np.ndarray (N, 2) float32 em 48 kHz
  S        início (s) de cada cena; intents uma por cena: calm|curious|groove|tense|build|reveal|resolve
  palette  historia | natureza | tecnologia | espaco | misterio
  hits     segundos de impactos amarrados à voz
  outro    duração do encerramento da marca: o TEMA completo toca nele (assinatura sonora do canal)

O TEMA ("motivo da fenda") é sempre o mesmo contorno e ritmo, em qualquer paleta:
  sobe uma quinta e uma oitava (a fenda se abrindo) e assenta na terça.  0 7 12 10 7 | 3/4 5 0
Ele aparece: (1) logo no início, curto, sobre o gancho; (2) em cada cena "reveal"; (3) inteiro no encerramento.
"""

from __future__ import annotations

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 48000


# ============================================================ util
class Ctx:
    def __init__(self, dur, seed):
        self.N = int(dur * SR)
        self.rng = np.random.default_rng(seed)
        self.bus = {k: np.zeros((self.N, 2)) for k in ("drums", "low", "pads", "leads", "theme", "fx")}
        self.kicks: list[tuple[float, float]] = []

    def place(self, bus, sig, at, gain=1.0, pan=0.0, human=True):
        if human:
            at += self.rng.normal(0, 0.006)
            gain *= 1 + self.rng.normal(0, 0.06)
        i = int(max(0, at) * SR)
        if i >= self.N:
            return
        sig = np.array(sig, dtype=float)
        k = min(len(sig) // 4, int(0.008 * SR))  # rampas anti-estalo (início/fim de toda nota)
        if k > 1:
            r = np.linspace(0, 1, k)
            sig[-k:] = (sig[-k:].T * r[::-1]).T
            k0 = min(k, int(0.0015 * SR))
            sig[:k0] = (sig[:k0].T * r[:k0] / r[k0 - 1]).T if k0 > 1 else sig[:k0]
        if sig.ndim == 1:
            sig = stereo(sig, pan)
        j = min(i + len(sig), self.N)
        self.bus[bus][i:j] += sig[: j - i] * gain


def hz(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def tt(d):
    return np.arange(int(max(d, 0.001) * SR)) / SR


def stereo(x, p=0.0):
    p = float(np.clip(p, -1, 1))
    return np.stack([x * np.cos((p + 1) * np.pi / 4), x * np.sin((p + 1) * np.pi / 4)], axis=1)


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos"), x, axis=0)


def env(d, a, r, hold=None):
    t = tt(d)
    e = np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)
    return e


def phase(f):
    """fase a partir de frequência variável (vibrato/glide)."""
    return 2 * np.pi * np.cumsum(f) / SR


def saw_f(f, rng):
    p = (rng.random() + np.cumsum(f) / SR) % 1.0
    return 2 * p - 1


def ir(length, decay, damp, rng, predelay=0.018):
    t = tt(length)
    h = rng.standard_normal((len(t), 2)) * np.exp(-t / decay)[:, None]
    h = lp(h, damp)
    n = int(0.01 * SR)
    h[:n] *= np.linspace(0, 1, n)[:, None]
    h = np.concatenate([np.zeros((int(predelay * SR), 2)), h])
    return h / np.sqrt(np.sum(h**2))


def verb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c])[: len(x)] for c in range(2)], axis=1)


# ============================================================ instrumentos (mono, exceto pads)
def ks(m, d, bright=0.5, decay=0.996, rng=None):
    """Karplus-Strong (harpa / violão / alaúde) — corda dedilhada real."""
    f = float(hz(m))
    L = max(2, int(round(SR / f)))
    n = int(d * SR)
    x = np.zeros(n)
    burst = rng.standard_normal(L) if rng is not None else np.random.standard_normal(L)
    burst = lp(burst, 1800 + 4000 * bright)  # ataque macio (sem chiado)
    x[:L] = burst
    a = np.zeros(L + 2)
    a[0] = 1
    a[L] = -decay / 2
    a[L + 1] = -decay / 2
    y = lfilter([1], a, x)
    y = lp(hp(y, 60), min(9000, f * 10))
    return y / (np.max(np.abs(y)) + 1e-9) * 0.42 * env(d, 0.001, 0.08)


def harp(m, d=1.6, rng=None):
    return ks(m, d, 0.35, 0.9975, rng)


def lute(m, d=1.0, rng=None):
    return ks(m, d, 0.6, 0.994, rng)


def kalimba(m, d=1.2, rng=None):
    t = tt(d)
    f = float(hz(m))
    y = np.sin(phase(f * (1 + 0.004 * np.exp(-t / 0.02)))) * np.exp(-t / 0.45)
    y += 0.3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.05)
    return y * (1 - np.exp(-t / 0.001)) * 0.38


def marimba(m, d=0.9, rng=None):
    t = tt(d)
    f = float(hz(m))
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.32 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.06)
    return y * (1 - np.exp(-t / 0.0015)) * 0.4


def celesta(m, d=1.8, rng=None):
    """sino de caixinha de música / celesta: a voz-assinatura do tema."""
    t = tt(d)
    f = float(hz(m))
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.7) + 0.45 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t / 0.18)
    y += 0.12 * np.sin(2 * np.pi * f * 10.2 * t) * np.exp(-t / 0.04)
    return y * (1 - np.exp(-t / 0.0008)) * 0.34


def bell(m, d=2.6, rng=None):
    t = tt(d)
    f = float(hz(m))
    y = np.sin(2 * np.pi * f * t + 1.4 * np.exp(-t / 0.5) * np.sin(2 * np.pi * f * 3.5 * t))
    return y * np.exp(-t / 0.9) * (1 - np.exp(-t / 0.002)) * 0.26


def synth_pluck(m, d=0.45, rng=None):
    t = tt(d)
    f = float(hz(m))
    x = saw_f(np.full(len(t), f), rng) * 0.6 + saw_f(np.full(len(t), f * 1.006), rng) * 0.4
    cut = 300 + 5200 * np.exp(-t / 0.07)
    out = np.zeros_like(x)
    # filtro varrido em blocos
    zi = None
    for b in range(0, len(x), 256):
        sos = butter(2, float(cut[b]), "low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[b : b + 256], zi = sosfilt(sos, x[b : b + 256], zi=zi)
    return out * env(d, 0.002, 0.15) * 0.36


def sine_arp(m, d=0.7, rng=None):
    t = tt(d)
    f = float(hz(m))
    return (np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t / 0.3) * (1 - np.exp(-t / 0.004)) * 0.34


def horn(m, d=1.0, rng=None):
    """trompa/metal suave (lead épico do tema em História)."""
    t = tt(d)
    f = float(hz(m)) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1))
    x = saw_f(f, rng) * 0.5 + saw_f(f * 1.003, rng) * 0.5
    cut = 600 + 1700 * np.clip(t / 0.12, 0, 1)
    y = lp(x, 2000, 2) * 0.6 + lp(x, 900, 2) * 0.4
    return np.tanh(y * 1.4) * env(d, 0.06, 0.25) * 0.3


def flute(m, d=1.0, rng=None):
    t = tt(d)
    f = float(hz(m)) * (1 + 0.006 * np.sin(2 * np.pi * 5.0 * t) * np.clip((t - 0.15) / 0.3, 0, 1))
    tone = np.sin(phase(f)) + 0.18 * np.sin(2 * phase(f)) + 0.06 * np.sin(3 * phase(f))
    breath = bp(rng.standard_normal(len(t)), float(hz(m)) * 0.8, float(hz(m)) * 3) * 0.08
    return (tone + breath) * env(d, 0.07, 0.2) * 0.3


def synth_lead(m, d=1.0, rng=None):
    t = tt(d)
    f = float(hz(m)) * (1 + 0.005 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.2) / 0.3, 0, 1))
    x = np.sign(np.sin(phase(f))) * 0.4 + saw_f(f * 1.005, rng) * 0.6
    return lp(x, 2600) * env(d, 0.01, 0.2) * 0.22


LEADS = {"horn": horn, "flute": flute, "synth": synth_lead, "celesta": celesta, "bell": bell}
ARPS = {"harp": harp, "lute": lute, "kalimba": kalimba, "marimba": marimba, "pluck": synth_pluck, "sine": sine_arp, "celesta": celesta}


# ---------------------------------------------------------------- pads (estéreo)
def strings(chord, d, rng, cutoff=2200, gain=1.0):
    """ensemble de cordas: 3 vozes desafinadas por nota, vibrato lento, ataque macio."""
    out = np.zeros((int(d * SR), 2))
    t = tt(d)
    for i, m in enumerate(chord):
        for v in (-0.1, 0.0, 0.1):
            vib = 1 + 0.003 * np.sin(2 * np.pi * (4.6 + rng.random()) * t + rng.random() * 6)
            x = saw_f(float(hz(m + v)) * vib, rng)
            out += stereo(x, -0.7 + 1.4 * ((i + v + 0.1) / max(1, len(chord) - 0.8)))
    out = lp(out / (3 * len(chord)), cutoff)
    out = hp(out, 120)
    return out * env(d, 0.7, 0.9)[:, None] * gain


def choir(chord, d, rng, gain=1.0):
    """coro "aah": serras passadas por formantes (700/1220/2600 Hz)."""
    out = np.zeros((int(d * SR), 2))
    t = tt(d)
    for i, m in enumerate(chord):
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.0 * t + i)
        x = saw_f(float(hz(m)) * vib, rng) + saw_f(float(hz(m + 0.07)) * vib, rng)
        y = bp(x, 600, 820) * 1.0 + bp(x, 1100, 1350) * 0.5 + bp(x, 2400, 2800) * 0.25
        out += stereo(y, -0.5 + 1.0 * i / max(1, len(chord) - 1))
    return out / len(chord) * env(d, 0.9, 1.0)[:, None] * 1.6 * gain


def warm_pad(chord, d, rng, cutoff=1500, gain=1.0):
    out = np.zeros((int(d * SR), 2))
    t = tt(d)
    lfo = 1 + 0.25 * np.sin(2 * np.pi * 0.15 * t)
    for i, m in enumerate(chord):
        for v in (-0.08, 0.08):
            out += stereo(saw_f(np.full(len(t), float(hz(m + v))), rng), -0.6 + 1.2 * i / max(1, len(chord) - 1))
    out = out / (2 * len(chord))
    a = lp(out, cutoff * 0.7)
    b = lp(out, cutoff * 1.3)
    mixw = ((lfo - 0.75) / 0.5)[:, None]
    return (a * (1 - mixw) + b * mixw) * env(d, 0.5, 0.8)[:, None] * gain


def glass_pad(chord, d, rng, gain=1.0):
    out = np.zeros((int(d * SR), 2))
    t = tt(d)
    for i, m in enumerate(chord):
        f = float(hz(m + 12))
        y = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2.0 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t + i))
        out += stereo(y, -0.6 + 1.2 * i / max(1, len(chord) - 1))
    return out / len(chord) * env(d, 0.6, 0.9)[:, None] * 0.55 * gain


def space_pad(chord, d, rng, gain=1.0):
    out = warm_pad(chord, d, rng, 900, 0.7) + glass_pad(chord, d, rng, 0.6)
    t = tt(d)
    return out * env(d, 1.4, 1.4)[:, None] * (0.85 + 0.15 * np.sin(2 * np.pi * 0.1 * t))[:, None] * gain


# ---------------------------------------------------------------- graves e percussão
def bass(m, d, rng=None, kind="round"):
    t = tt(d)
    f = float(hz(m))
    if kind == "strings":  # contrabaixo de orquestra (arco)
        x = saw_f(np.full(len(t), f), rng) * 0.6 + np.sin(2 * np.pi * f * t) * 0.6
        return lp(x, 500) * env(d, 0.05, 0.2) * 0.55
    if kind == "sub":
        return np.sin(2 * np.pi * f * t) * env(d, 0.03, 0.3) * 0.6
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    return np.tanh(y * 1.3) * env(d, 0.01, 0.12) * 0.5


def kick(g=1.0, rng=None):
    t = tt(0.4)
    y = np.sin(phase(48 + 100 * np.exp(-t / 0.03))) * np.exp(-t / 0.2)
    return np.tanh(y * 1.5) * 0.8 * g


def taiko(g=1.0, rng=None):
    t = tt(1.2)
    body = np.sin(phase(62 + 70 * np.exp(-t / 0.05))) * np.exp(-t / 0.35)
    skin = lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.05) * 0.5
    return np.tanh((body + skin) * 1.6) * 0.75 * g


def frame_drum(g=1.0, rng=None):
    t = tt(0.35)
    body = np.sin(phase(150 + 60 * np.exp(-t / 0.02))) * np.exp(-t / 0.12)
    skin = bp(rng.standard_normal(len(t)), 400, 2500) * np.exp(-t / 0.03) * 0.4
    return (body * 0.6 + skin) * 0.55 * g


def shaker(rng=None):
    t = tt(0.09)
    return hp(rng.standard_normal(len(t)), 6000, 4) * np.exp(-t / 0.025) * 0.35


def hat(rng=None):
    t = tt(0.06)
    return hp(rng.standard_normal(len(t)), 8000, 4) * np.exp(-t / 0.012) * 0.4


def clap(rng=None):
    t = tt(0.3)
    n = rng.standard_normal(len(t))
    e = sum(np.where(t >= o, np.exp(-(t - o) / 0.006), 0) for o in (0.0, 0.01, 0.02)) + np.where(t >= 0.02, np.exp(-(t - 0.02) / 0.1), 0) * 0.5
    return bp(n * e, 1000, 5000) * 0.7


def riser(d, rng):
    t = tt(d)
    p = t / d
    n = hp(rng.standard_normal((len(t), 2)), 400)
    cut = 500 + 5000 * p**2
    out = np.zeros_like(n)
    zi = None
    for b in range(0, len(n), 512):
        sos = butter(2, float(cut[b]), "low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, 2))
        out[b : b + 512], zi = sosfilt(sos, n[b : b + 512], axis=0, zi=zi)
    tone = np.sin(phase(220 * 2 ** (p * 2))) * 0.15
    return (out * 0.5 + tone[:, None]) * (p**2)[:, None]


def soft_hit(size=1.0, rng=None):
    t = tt(2.2)
    boom = np.sin(phase(40 + 70 * np.exp(-t / 0.08))) * np.exp(-t / (0.5 * size))
    air = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.12) * 0.3
    return np.tanh((boom + air) * 1.2) * 0.7


def reverse_swell(d, rng):
    """“sopro ao contrário” antes da revelação: sobe e corta seco no impacto."""
    t = tt(d)
    p = t / d
    n = lp(rng.standard_normal((len(t), 2)), 3000) * (p**3)[:, None] * 0.35
    return n


# ============================================================ harmonia
QUAL = {"M": [0, 4, 7], "m": [0, 3, 7], "sus2": [0, 2, 7], "M7": [0, 4, 7, 11], "m7": [0, 3, 7, 10], "add9": [0, 4, 7, 14], "madd9": [0, 3, 7, 14]}


def voice(tonic, root, q, center=60):
    """acorde em posição fechada perto de `center` (condução de vozes suave entre acordes)."""
    base = tonic + root
    notes = [base + iv for iv in QUAL[q]]
    out = []
    for n in notes:
        while n < center - 6:
            n += 12
        while n > center + 7:
            n -= 12
        out.append(n)
    return sorted(out)


# Paletas: tom, andamento, progressões (grau, qualidade) e instrumentos.
PALETTES = {
    "historia": dict(arp_alt="lute",   # Ré menor, épico e humano: harpa, cordas, coro, taiko, trompa no tema
        tonic=50, bpm=84, minor=True,
        calm=[(0, "m"), (8, "M")], main=[(0, "m"), (10, "M"), (8, "M"), (10, "M")],
        tense=[(0, "m"), (8, "M"), (5, "m"), (7, "M")], bright=[(3, "M"), (10, "M"), (8, "M"), (10, "M")],
        end=(0, "add9"), pad="strings", choir=True, arp="harp", lead="horn", perc="taiko", bass="strings",
    ),
    "natureza": dict(arp_alt="marimba",   # Dó lídio/maior, leve: kalimba, marimba, flauta, chocalho
        tonic=48, bpm=96, minor=False,
        calm=[(0, "M7"), (2, "M")], main=[(0, "M"), (9, "m"), (5, "M"), (7, "M")],
        tense=[(9, "m"), (5, "M"), (2, "m"), (4, "M")], bright=[(5, "M"), (7, "M"), (0, "M"), (9, "m")],
        end=(0, "add9"), pad="warm", choir=False, arp="kalimba", lead="flute", perc="soft", bass="round",
    ),
    "tecnologia": dict(arp_alt="sine",   # Mi menor, pulsante: pluck sintético, pad de vidro, bateria eletrônica
        tonic=52, bpm=108, minor=True,
        calm=[(0, "m"), (8, "M")], main=[(0, "m"), (8, "M"), (3, "M"), (10, "M")],
        tense=[(0, "m"), (8, "M"), (5, "m"), (7, "M")], bright=[(3, "M"), (10, "M"), (0, "m"), (8, "M")],
        end=(0, "madd9"), pad="glass", choir=False, arp="pluck", lead="synth", perc="electro", bass="round",
    ),
    "espaco": dict(arp_alt="celesta",   # Lá menor, lento e amplo: pad espacial, arpejo de senos com eco, sub
        tonic=45, bpm=78, minor=True,
        calm=[(0, "sus2"), (8, "M")], main=[(0, "m"), (5, "m"), (8, "M"), (7, "m")],
        tense=[(0, "m"), (1, "M"), (0, "m"), (1, "M")], bright=[(8, "M"), (10, "M"), (3, "M"), (10, "M")],
        end=(0, "sus2"), pad="space", choir=False, arp="sine", lead="bell", perc="minimal", bass="sub",
    ),
    "misterio": dict(arp_alt="harp",   # Dó# menor, suspense: caixinha de música, cordas escuras, pulso grave
        tonic=49, bpm=76, minor=True,
        calm=[(0, "m"), (8, "M")], main=[(0, "m"), (8, "M"), (5, "m"), (7, "M")],
        tense=[(0, "m"), (1, "M"), (0, "m"), (11, "M")], bright=[(8, "M"), (3, "M"), (10, "M"), (0, "m")],
        end=(0, "madd9"), pad="strings", choir=True, arp="celesta", lead="celesta", perc="minimal", bass="strings",
    ),
}

# Tema: (semitons acima da tônica, duração em tempos). A nota "3" vira 4 em tom maior.
THEME = [(0, 0.5), (7, 0.5), (12, 1.5), (10, 0.5), (7, 1.0), ("3", 0.5), (5, 0.5), (0, 2.0)]
THEME_SHORT = THEME[:3]


# ============================================================ arranjo
def vary(P, variant):
    """Variação determinística por vídeo: transpõe (-2..+3 semitons), muda o andamento (±6%) e alterna a
    progressão principal. O contorno e o ritmo do TEMA não mudam: a marca continua reconhecível."""
    if variant is None:
        return dict(P)
    r = np.random.default_rng(int.from_bytes(__import__('hashlib').md5(str(variant).encode()).digest()[:4], 'little') if not isinstance(variant, int) else variant)
    Q = dict(P)
    Q["tonic"] = P["tonic"] + int(r.choice([-2, -1, 0, 1, 2, 3]))
    Q["bpm"] = P["bpm"] * float(r.uniform(0.94, 1.06))
    k = int(r.integers(0, len(P["main"])))
    Q["main"] = P["main"][k:] + P["main"][:k]
    if r.random() < 0.5:
        Q["bright"] = P["bright"][::-1]
    if r.random() < 0.4:
        Q["arp"] = P["arp_alt"]  # instrumento do arpejo alternativo da paleta
    return Q


def render(S, intents, dur, palette="historia", hits=(), outro=5.2, seed=7, theme=True, variant=None):
    """variant: qualquer texto/número fixo do vídeo (ex.: o slug "joana-darc"). Mesma entrada = mesma trilha."""
    P = vary(PALETTES[palette], variant)
    cx = Ctx(dur, seed)
    rng = cx.rng
    BEAT = 60 / P["bpm"]
    BAR = BEAT * 4
    T = P["tonic"]
    third = 3 if P["minor"] else 4

    def pad_of(chord, d, gain, cutoff=1800):
        k = P["pad"]
        if k == "strings":
            return strings(chord, d, rng, cutoff + 400, gain)
        if k == "glass":
            return glass_pad(chord, d, rng, gain) + warm_pad(chord, d, rng, 900, 0.35 * gain)
        if k == "space":
            return space_pad(chord, d, rng, gain)
        return warm_pad(chord, d, rng, cutoff, gain)

    def pads(a, b, prog, gain, cutoff=1800, choir_g=0.0):
        t0, k = a, 0
        while t0 < b - 0.05:
            d = min(BAR, b - t0)
            r, q = prog[k % len(prog)]
            ch = voice(T, r, q, 62)
            cx.place("pads", pad_of(ch, d + 0.8, gain, cutoff), t0, 1.0, human=False)
            if choir_g > 0 and P["choir"]:
                cx.place("pads", choir(voice(T, r, q, 67), d + 0.8, rng, choir_g), t0, 1.0, human=False)
            t0 += BAR
            k += 1

    def chord_at(t, prog, a):
        r, q = prog[int((t - a) // BAR) % len(prog)]
        return r, q

    def arps(a, b, prog, step, pattern, gain, octave=12, inst=None):
        fn = ARPS[inst or P["arp"]]
        for k, t0 in enumerate(np.arange(a, b - 0.02, step)):
            r, q = chord_at(t0, prog, a)
            ch = voice(T, r, q, 64)
            n = ch[pattern[k % len(pattern)] % len(ch)] + octave
            cx.place("leads", fn(n, rng=rng), t0, gain * (1.0 if k % 2 == 0 else 0.8), pan=(-0.35, 0.35)[k % 2])

    def basses(a, b, prog, pattern, gain, sub=0.5):
        for k, t0 in enumerate(np.arange(a, b - 0.02, BEAT * sub)):
            if not pattern[k % len(pattern)]:
                continue
            r, _ = chord_at(t0, prog, a)
            d = BEAT * (1.6 if P["bass"] == "strings" else 0.45)
            cx.place("low", bass(T - 12 + r if r < 7 else T - 24 + r, d, rng, P["bass"]), t0, gain)

    def perc(a, b, energy):
        kind = P["perc"]
        for k, t0 in enumerate(np.arange(a, b - 0.02, BEAT)):
            if kind == "taiko":
                if k % 4 == 0:
                    cx.place("drums", taiko(energy, rng), t0)
                    cx.kicks.append((t0, energy * 0.8))
                if energy > 0.5 and k % 4 == 2:
                    cx.place("drums", taiko(energy * 0.6, rng), t0, pan=0.2)
                for s in (0.0, 0.5):
                    cx.place("drums", frame_drum(0.35 * energy, rng), t0 + s * BEAT, pan=-0.25 if s else 0.25)
            elif kind == "electro":
                if k % 2 == 0:
                    cx.place("drums", kick(energy, rng), t0)
                    cx.kicks.append((t0, energy))
                elif energy > 0.45:
                    cx.place("drums", clap(rng), t0, 0.35 * energy)
                for s in (0.0, 0.5):
                    cx.place("drums", hat(rng), t0 + s * BEAT, (0.25 if s == 0 else 0.4) * energy, pan=0.3)
            elif kind == "soft":
                if k % 2 == 0 and energy > 0.4:
                    cx.place("drums", kick(0.55 * energy, rng), t0)
                    cx.kicks.append((t0, 0.5 * energy))
                for s in (0.0, 0.5):
                    cx.place("drums", shaker(rng), t0 + s * BEAT, 0.5 * energy * (1 if s else 0.6), pan=0.25)
            else:  # minimal: pulso grave + tique
                if k % 4 == 0:
                    cx.place("drums", kick(0.5 * energy, rng), t0)
                    cx.kicks.append((t0, 0.4 * energy))
                if energy > 0.4:
                    cx.place("drums", hat(rng), t0 + 0.5 * BEAT, 0.2 * energy, pan=0.3)

    def theme_line(at, notes, lead=None, octave=12, gain=0.5, bells=True):
        fn = LEADS[lead or P["lead"]]
        t0 = at
        for semi, beats in notes:
            s = third if semi == "3" else semi
            d = beats * BEAT
            m = T + octave + s
            cx.place("theme", fn(m, max(d * 1.25, 0.5), rng=rng), t0, gain, human=False)
            if bells:  # a celesta dobra o tema em todas as paletas: é a "cor" da marca
                cx.place("theme", celesta(m + 12, 1.6), t0, gain * 0.45, pan=0.2, human=False)
            t0 += d
        return t0

    n = len(S)
    end_scenes = dur - outro
    for i, it in enumerate(intents):
        a = S[i]
        b = S[i + 1] if i + 1 < n else end_scenes
        b = min(b, end_scenes)
        if b - a < 0.3:
            continue
        if it == "calm":
            pads(a, b, P["calm"], 0.7, 1200, 0.25)
            arps(a + BAR / 2, b, P["calm"], BEAT, [0, 2, 1, 3], 0.28)
            basses(a, b, P["calm"], [1, 0, 0, 0, 0, 0, 0, 0], 0.4)
        elif it == "curious":
            pads(a, b, P["main"], 0.65, 1600)
            arps(a, b, P["main"], BEAT / 2, [0, 2, 3, 1, 2, 3, 1, 2], 0.34)
            perc(a, b, 0.45)
            basses(a, b, P["main"], [1, 0, 0, 1, 0, 0, 1, 0], 0.5)
        elif it == "groove":
            pads(a, b, P["main"], 0.55, 1900)
            arps(a, b, P["main"], BEAT / 4, [0, 1, 2, 3, 2, 1], 0.2, octave=24)
            perc(a, b - 0.2, 0.8)
            basses(a, b, P["main"], [1, 0, 1, 1, 0, 1, 1, 0], 0.58)
        elif it == "tense":
            pads(a, b, P["tense"], 0.85, 900, 0.3)
            for t0 in np.arange(a, b - 0.05, BEAT):
                r, _ = chord_at(t0, P["tense"], a)
                cx.place("low", bass(T - 24 + r, BEAT * 0.3, rng, "round"), t0, 0.42)
            arps(a + BEAT, b, P["tense"], BEAT, [0, 2, 1, 3], 0.24)
            if P["perc"] == "taiko":
                for t0 in np.arange(a, b - 0.05, BAR):
                    cx.place("drums", taiko(0.6, rng), t0)
        elif it == "build":
            pads(a, b, P["tense"], 0.85, 1300, 0.45)
            arps(a, b, P["tense"], BEAT / 2, [0, 2, 1, 3], 0.28)
            perc(a + BAR / 2, b - 0.3, 0.55)
            cx.place("fx", riser(max(0.8, b - a - 0.2), rng), a + 0.2, 0.16, human=False)
            sw = min(1.2, b - a)
            cx.place("fx", reverse_swell(sw, rng), b - sw, 0.22, human=False)
        elif it == "reveal":
            cx.place("fx", soft_hit(1.4, rng), a + 0.25, 0.6, human=False)
            pads(a, b, P["bright"], 0.85, 2300, 0.4)
            arps(a, b, P["bright"], BEAT / 2, [0, 1, 2, 3, 2, 1], 0.3)
            perc(a + BAR / 2, b - 0.2, 0.6)
            basses(a, b, P["bright"], [1, 0, 0, 1, 0, 1, 0, 0], 0.5)
            if theme:
                theme_line(a + 0.3, THEME_SHORT + [(7, 1.5)], gain=0.42)
        else:  # resolve
            cx.place("fx", soft_hit(1.0, rng), a, 0.4, human=False)
            pads(a, b, [P["end"]], 0.9, 2400, 0.4)
            arps(a, b, [P["end"]], BEAT / 2, [0, 1, 2, 3, 2, 1], 0.26)
            basses(a, b, [P["end"]], [1, 0, 0, 0, 0, 0, 0, 0], 0.5)

    # tema curto logo no gancho (antes da 1ª fala engrenar)
    if theme:
        theme_line(max(0.15, S[0] + 0.1), THEME_SHORT, gain=0.38)
        for h in hits:
            cx.place("fx", soft_hit(1.0, rng), h, 0.4, human=False)
        # ENCERRAMENTO: tema completo sobre o acorde final (a assinatura do canal)
        a = end_scenes
        cx.place("fx", soft_hit(1.1, rng), a, 0.45, human=False)
        pads(a, dur, [P["end"]], 0.8, 2600, 0.45)
        cx.place("low", bass(T - 12, min(outro, 4.0), rng, "sub"), a, 0.55, human=False)
        tb = 60 / P["bpm"]
        line_len = sum(bt for _, bt in THEME) * tb
        start = a + max(0.2, (outro - line_len - 0.6) * 0.35)
        e = theme_line(start, THEME, gain=0.55)
        for k, m in enumerate(voice(T, *P["end"], 76)):
            cx.place("theme", bell(m, 2.6), min(e, dur - 1.2) + 0.05 * k, 0.2, pan=-0.5 + 0.33 * k, human=False)
    else:
        for h in hits:
            cx.place("fx", soft_hit(1.0, rng), h, 0.4, human=False)

    return mix(cx, dur, BEAT)


def mix(cx, dur, BEAT):
    B = cx.bus
    N = cx.N
    rng = cx.rng
    sc = np.ones(N)
    tf = np.arange(N) / SR
    for k, depth in cx.kicks:
        i = int(k * SR)
        seg = tf[i : i + int(0.3 * SR)] - k
        sc[i : i + len(seg)] = np.minimum(sc[i : i + len(seg)], 1 - 0.4 * depth * np.exp(-seg / 0.09))
    sc = lp(sc, 40)
    pads = B["pads"] * sc[:, None]
    low = B["low"] * (sc**0.5)[:, None]

    leads = B["leads"]
    d1 = int(BEAT * 0.75 * SR)
    echo = np.zeros_like(leads)
    echo[d1:, 0] = leads[:-d1, 1] * 0.26
    echo[2 * d1 :, 1] = leads[: -2 * d1, 0] * 0.16
    leads = leads + lp(echo, 4000)

    # médios abertos para a voz: corta 1,5–3 kHz da trilha (a fala mora ali)
    def voice_pocket(x):
        return x - bp(x, 1500, 3200) * 0.35

    hall = ir(3.2, 0.9, 6000, rng, 0.025)
    room = ir(0.9, 0.2, 7000, rng, 0.008)
    wet = verb(pads * 0.28 + leads * 0.42 + B["theme"] * 0.5 + B["fx"] * 0.3, hall) * 0.85 + verb(B["drums"] * 0.12, room)
    m = B["drums"] * 0.75 + low * 0.9 + pads * 0.85 + leads * 0.85 + B["theme"] * 1.0 + B["fx"] * 0.7 + wet
    m = voice_pocket(hp(m, 30))
    # alarga só os agudos (graves no centro)
    lo = lp(m, 200)
    hi = m - lo
    mid = (hi[:, 0] + hi[:, 1]) / 2
    side = (hi[:, 0] - hi[:, 1]) / 2 * 1.25
    m = lo + np.stack([mid + side, mid - side], axis=1)
    m *= (np.clip((dur - tf) / 0.9, 0, 1) ** 1.5)[:, None]
    m = np.tanh(m * 1.15)
    m *= 0.89 / (np.max(np.abs(m)) + 1e-9)
    return m.astype(np.float32)
