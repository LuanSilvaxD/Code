"""Folha de contato com quadros extraídos do PRÓPRIO MP4 final (confere o que foi de fato codificado).

    python scripts/mp4sheet.py out/<nome>.mp4 out/mp4sheet.png            # 16 quadros espaçados
    python scripts/mp4sheet.py out/<nome>.mp4 out/mp4sheet.png 2 9 16 23  # segundos específicos
"""

import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw


def duration(path: str) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    times = [float(t) for t in sys.argv[3:]]
    if not times:
        d = duration(src)
        times = [round(0.5 + i * (d - 1.0) / 15, 2) for i in range(16)]
    tmp = Path(tempfile.mkdtemp())
    ims = []
    for i, t in enumerate(times):
        f = tmp / f"t{i:02d}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", src, "-frames:v", "1", "-vf", "scale=432:-1", str(f)], check=True)
        ims.append((t, Image.open(f)))
    w, h = ims[0][1].size
    cols = 8
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h), "black")
    draw = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * h
        sheet.paste(im, (x, y))
        draw.rectangle([x, y, x + 70, y + 22], fill="black")
        draw.text((x + 6, y + 5), f"{t:.1f}s", fill="yellow")
    sheet.save(dst)
    print(dst, sheet.size)


main()
