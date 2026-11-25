"""Narração "humanizada" do documentário (voz aprovada em 20/11/2026: amostra 13e).

Voz: en-AU-WilliamMultilingualNeural (edge-tts, grátis). Cada frase é gerada à parte com ritmo/tom
conforme a marca, as pontas de silêncio são aparadas e a pausa entra pelo sentido. No fim, acabamento
(passa-alta, calor leve, compressão suave, "ar" de sala discreto, loudness -16 LUFS).

Formato das linhas no roteiro (um bloco por arquivo .txt):
    (n) texto normal
    (d) texto dramático         -> mais lento e um pouco mais grave
    (f) revelação / impacto     -> o mais lento e grave, pausa longa depois
    (p) pergunta                -> ritmo normal, tom levemente acima
  Uma frase que termina em vírgula ganha pausa curta (fala continua na próxima linha).
  "texto | 1.2" força a pausa depois (em segundos).

Uso: python voz_doc.py bloco0.txt saida.mp3
"""

import asyncio
import os
import re
import subprocess
import sys
import tempfile

import edge_tts

VOICE = "en-AU-WilliamMultilingualNeural"
MODES = {  # ritmo, tom, pausa padrão depois (s)
    "n": ("-6%", "+0Hz", 0.6),
    "d": ("-10%", "-2Hz", 0.85),
    "f": ("-12%", "-3Hz", 1.05),
    "p": ("-6%", "+1Hz", 0.5),
}
FINISH = "highpass=f=70,equalizer=f=180:t=q:w=1:g=2,equalizer=f=6000:t=q:w=2:g=-2,acompressor=threshold=-20dB:ratio=2.5:attack=15:release=200,aecho=0.8:0.5:35:0.08,loudnorm=I=-16:TP=-1.5"
# palavras que a voz lê melhor escritas de outro jeito (só no áudio)
SAY = {}


def parse(path):
    lines = []
    for raw in open(path, encoding="utf-8"):
        raw = raw.strip()
        m = re.match(r"^\((n|d|f|p)\)\s*(.+)$", raw)
        if not m:
            continue
        mode, text = m.groups()
        pause = None
        if "|" in text:
            text, p = text.rsplit("|", 1)
            text, pause = text.strip(), float(p)
        rate, pitch, default = MODES[mode]
        if pause is None:
            pause = 0.25 if text.endswith(",") else default
        lines.append((text, rate, pitch, pause))
    return lines


async def build(src, out):
    proxy = os.environ.get("HTTPS_PROXY") or None
    d = tempfile.mkdtemp()
    parts = []
    timings = []
    t = 0.0
    for i, (text, rate, pitch, pause) in enumerate(parse(src)):
        spoken = text
        for k, v in SAY.items():
            spoken = spoken.replace(k, v)
        mp3 = f"{d}/{i:03d}.mp3"
        for attempt in range(3):
            try:
                await edge_tts.Communicate(spoken, VOICE, rate=rate, pitch=pitch, proxy=proxy).save(mp3)
                break
            except Exception:
                if attempt == 2:
                    raise
                await asyncio.sleep(2)
        wav = f"{d}/{i:03d}.wav"
        trim = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af", f"{trim},apad=pad_dur={pause}", "-ar", "24000", "-ac", "1", wav], check=True)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
        if (dur - pause) < 0.2 * len(text.split()):  # áudio cortado pelo serviço: gera de novo
            print("áudio curto demais, refazendo:", text[:40])
            await edge_tts.Communicate(spoken, VOICE, rate=rate, pitch=pitch, proxy=proxy).save(mp3)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af", f"{trim},apad=pad_dur={pause}", "-ar", "24000", "-ac", "1", wav], check=True)
            dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
        timings.append({"text": text, "start": round(t, 3), "speech": round(dur - pause, 3), "end": round(t + dur, 3)})
        t += dur
        parts.append(wav)
    lst = f"{d}/list.txt"
    with open(lst, "w") as fh:
        fh.write("".join(f"file '{p}'\n" for p in parts))
    raw = f"{d}/raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, raw], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", FINISH, "-ar", "48000", out], check=True)
    import json
    with open(re.sub(r"\.\w+$", ".json", out), "w", encoding="utf-8") as fh:
        json.dump({"seconds": round(t, 3), "lines": timings}, fh, ensure_ascii=False, indent=1)
    print(out, round(t, 2), "s")


if __name__ == "__main__":
    asyncio.run(build(sys.argv[1], sys.argv[2]))
