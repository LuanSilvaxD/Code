#!/usr/bin/env python3
"""Checagem automática de frames (stills ou frames extraídos de um MP4).

Pega os erros que no Titanic só apareceram olhando frame a frame:
  PRETO    nada visível no quadro (bloqueante)
  ESCURO   quase preto: noite proposital passa, isto é "não dá para ver no celular" (ex.: destroços)
  CHAPADO  quadro sem contraste / vazio (objeto sumiu, câmera olhando para o nada)
  BORDA    o assunto encosta na borda (ex.: navio cortado) — aviso, confira o enquadramento
  ESTOURO  área grande estourada em branco (luz/emissivo forte demais)
  CENTRO   o assunto está pequeno demais no quadro (ex.: bote de 1 cm no casco)

As faixas pretas (letterbox) e as margens de UI são ignoradas automaticamente.

Uso:
  python frame_qa.py out/stills/*.png                 # relatório no terminal
  python frame_qa.py --video out/final.mp4 --every 2 --skip-end 5  # um frame a cada 2 s, sem o encerramento
  python frame_qa.py ... --sheet out/qa.png           # folha com os problemas marcados em vermelho
Saída com código 1 se houver PRETO/CHAPADO (bloqueante); ESCURO/BORDA/ESTOURO/CENTRO são avisos.
"""

import argparse
import glob
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw

# limiares calibrados nos stills do Titanic (noite no mar, interior, fundo do mar)
BLACK_P99 = 45       # nem os 1% mais claros passam disso = nada visível (bloqueante)
DARK_MEAN = 18       # aviso: cena muito escura (noite proposital passa; isto é "quase preto")
DARK_P95 = 45
FLAT_STD = 9         # desvio-padrão da luminância abaixo disso = chapado
BLOWN_FRAC = 0.18    # fração de pixels >= 250
EDGE_BAND = 0.035    # faixa da borda analisada (fração da largura)
SMALL_FRAC = 0.012   # assunto ocupando menos que isso do quadro


def luminance(img):
    a = np.asarray(img.convert("RGB"), dtype=np.float32)
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def crop_letterbox(L):
    """Remove faixas pretas de cima/baixo (linhas quase todas < 6)."""
    rows = np.where(L.max(axis=1) > 6)[0]
    if len(rows) == 0:
        return L, 0, L.shape[0]
    return L[rows[0]: rows[-1] + 1], rows[0], rows[-1] + 1


def subject_mask(L):
    """Assunto = o que se destaca do fundo: bordas fortes + pontos bem mais claros/escuros que a mediana local."""
    gy, gx = np.gradient(L)
    grad = np.hypot(gx, gy)
    med = np.median(L)
    m = (grad > max(18, np.percentile(grad, 92))) | (np.abs(L - med) > 55)
    return m


def check(img):
    L_full = luminance(img)
    L, top, bottom = crop_letterbox(L_full)
    h, w = L.shape
    issues = []
    mean, p95, std = float(L.mean()), float(np.percentile(L, 95)), float(L.std())
    p99 = float(np.percentile(L, 99))
    if p99 < BLACK_P99:
        issues.append(("PRETO", f"nada visível (p99 {p99:.0f})"))
    elif mean < DARK_MEAN and p95 < DARK_P95:
        issues.append(("ESCURO", f"luz média {mean:.0f}, p95 {p95:.0f}"))
    if std < FLAT_STD:
        issues.append(("CHAPADO", f"contraste {std:.1f}"))
    blown = float((L >= 250).mean())
    if blown > BLOWN_FRAC:
        issues.append(("ESTOURO", f"{blown*100:.0f}% estourado"))
    m = subject_mask(L)
    frac = float(m.mean())
    if frac < SMALL_FRAC and not any(i[0] in ("PRETO", "ESCURO", "CHAPADO") for i in issues):
        issues.append(("CENTRO", f"assunto ocupa {frac*100:.1f}% do quadro"))
    band = max(4, int(w * EDGE_BAND))
    # borda: o assunto continua para fora (densidade na faixa lateral comparável à do miolo)
    # só acusa quando UM lado está cheio e o outro vazio (objeto saindo do quadro sobre fundo limpo);
    # cenários que continuam dos dois lados (convés, diagrama, corredor) não contam
    left, right = float(m[:, :band].mean()), float(m[:, -band:].mean())
    for name, d, other in (("esquerda", left, right), ("direita", right, left)):
        if d > 0.12 and other < 0.015:
            issues.append(("BORDA", f"assunto cortado na {name}"))
    return issues, (top, bottom)


def frames_from_video(path, every, skip_end=0.0):
    """Um frame exatamente a cada `every` s (rótulo = tempo real do frame)."""
    d = tempfile.mkdtemp()
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip()
    r = r.splitlines()[0].strip().strip(",") if r else "30/1"
    num, den = (r.split("/") + ["1"])[:2]
    fps = float(num) / float(den)
    n = max(1, round(fps * every))
    subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"select='not(mod(n\\,{n}))',scale=640:-1", "-vsync", "vfr", f"{d}/f%05d.png"], check=True)
    out = sorted(glob.glob(f"{d}/*.png"))
    # o frame 0 costuma ser o fade de entrada (preto de propósito): pula
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip() or 0)
    return [(f"{i * n / fps:.1f}s", p) for i, p in enumerate(out) if i > 0 and i * n / fps < dur - skip_end]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("images", nargs="*")
    ap.add_argument("--video")
    ap.add_argument("--every", type=float, default=2.0)
    ap.add_argument("--skip-end", type=float, default=0.0, help="ignora os últimos N s (encerramento escuro da marca: ~5 nos Shorts)")
    ap.add_argument("--sheet")
    a = ap.parse_args()
    items = [(os.path.basename(p), p) for p in a.images]
    if a.video:
        items += frames_from_video(a.video, a.every, a.skip_end)
    if not items:
        ap.error("passe imagens ou --video")
    results, blocking = [], 0
    for name, p in items:
        img = Image.open(p)
        issues, _ = check(img)
        results.append((name, p, issues))
        if issues:
            print(f"{name}: " + "; ".join(f"[{k}] {v}" for k, v in issues))
            blocking += any(k in ("PRETO", "CHAPADO") for k, _ in issues)
    ok = sum(1 for r in results if not r[2])
    print(f"\n{ok}/{len(results)} frames sem alerta · {blocking} com problema bloqueante (PRETO/CHAPADO)")
    if a.sheet:
        thumbs = []
        for name, p, issues in results:
            im = Image.open(p).convert("RGB")
            im.thumbnail((480, 480))
            dr = ImageDraw.Draw(im)
            if issues:
                dr.rectangle([0, 0, im.width - 1, im.height - 1], outline=(255, 40, 40), width=6)
                dr.text((10, im.height - 18), " ".join(k for k, _ in issues), fill=(255, 80, 80))
            dr.text((10, 8), name, fill=(255, 230, 80))
            thumbs.append(im)
        cols = 5
        tw, th = max(t.width for t in thumbs), max(t.height for t in thumbs)
        sheet = Image.new("RGB", (tw * cols, th * ((len(thumbs) + cols - 1) // cols)), "black")
        for i, t in enumerate(thumbs):
            sheet.paste(t, ((i % cols) * tw, (i // cols) * th))
        sheet.save(a.sheet)
        print("folha:", a.sheet)
    sys.exit(1 if blocking else 0)


if __name__ == "__main__":
    main()
