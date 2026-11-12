"""Monta a entrega final num ÚNICO .zip organizado (o que o usuário salva/posta).

    python scripts/package_delivery.py --prod <pasta-de-producao> --video <projeto>/out/<nome>.mp4 \\
        --title "Título do vídeo" --out <scratchpad>/<nome>-entrega.zip

Estrutura gerada:
    <nome>-entrega/
      LEIA-ME.md
      01-PUBLICAR/    vídeo · capa-vertical.png · thumb-youtube.png · publicacao.md
      02-DOCUMENTOS/  roteiro.md · production-status.md · narration.json · scene-plan.ts
      03-PROJETO/video/  projeto Remotion sem node_modules/ e out/ (recria com npm install)
A capa/thumbnail são lidas de <projeto>/out/ (capa-vertical.png, thumb-youtube.png) se existirem.
"""

import argparse
import shutil
import sys
import zipfile
from pathlib import Path

SKIP_DIRS = {"node_modules", "out", "__pycache__", ".git"}


def copy_project(src: Path, dst: Path) -> None:
    for p in src.rglob("*"):
        rel = p.relative_to(src)
        if any(part in SKIP_DIRS for part in rel.parts) or p.is_dir():
            continue
        target = dst / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, target)


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--prod", required=True, help="pasta de produção (roteiro.md, publicacao.md...)")
    ap.add_argument("--video", required=True, help="MP4 final")
    ap.add_argument("--project", default=None, help="projeto Remotion (padrão: <prod>/video)")
    ap.add_argument("--title", required=True)
    ap.add_argument("--out", required=True, help="caminho do .zip")
    a = ap.parse_args()

    prod = Path(a.prod)
    project = Path(a.project) if a.project else prod / "video"
    video = Path(a.video)
    out = Path(a.out)
    name = out.stem
    stage = out.parent / name
    shutil.rmtree(stage, ignore_errors=True)
    pub, docs, proj = stage / "01-PUBLICAR", stage / "02-DOCUMENTOS", stage / "03-PROJETO"
    for d in (pub, docs, proj):
        d.mkdir(parents=True)

    shutil.copy2(video, pub / video.name)
    for f in ("capa-vertical.png", "thumb-youtube.png"):
        if (project / "out" / f).exists():
            shutil.copy2(project / "out" / f, pub / f)
    if (prod / "publicacao.md").exists():
        shutil.copy2(prod / "publicacao.md", pub / "publicacao.md")
    for f in ("roteiro.md", "production-status.md", "narration.json", "scene-plan.ts"):
        if (prod / f).exists():
            shutil.copy2(prod / f, docs / f)
    copy_project(project, proj / "video")

    (stage / "LEIA-ME.md").write_text(
        f"""# {a.title}

## 01-PUBLICAR — o que você posta
- `{video.name}` — vídeo final
- `capa-vertical.png` — capa TikTok/Shorts (1080×1920) · `thumb-youtube.png` — thumbnail horizontal (1280×720)
- `publicacao.md` — títulos, legenda/descrição e hashtags (TikTok e YouTube)

## 02-DOCUMENTOS — registro da produção
- `roteiro.md` — roteiro aprovado, com fontes · `production-status.md` — ajustes, verificações e comando de render
- `narration.json` — narração · `scene-plan.ts` — plano de dados das cenas

## 03-PROJETO — para editar ou renderizar de novo
1. `cd 03-PROJETO/video` → `npm install`
2. `npx remotion studio` (pré-visualizar) ou `node scripts/render.mjs <Id> out/video.mp4`
""",
        encoding="utf-8",
    )
    out.unlink(missing_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(stage.rglob("*")):
            if p.is_file():
                z.write(p, p.relative_to(stage.parent))
    n = sum(1 for p in stage.rglob("*") if p.is_file())
    print(f"{out} ({out.stat().st_size / 1e6:.1f} MB, {n} arquivos)")


main()
