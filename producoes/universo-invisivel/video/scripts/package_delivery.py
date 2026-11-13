"""Monta a entrega final (pedido do usuário): 3 arquivos AVULSOS + 1 zip com o resto.
    avulsos:  <vídeo>.mp4 · publicacao.md · thumb-youtube.png   (copiados para a pasta de --out)
    <nome>-arquivos.zip  LEIA-ME + capa vertical + 02-DOCUMENTOS (roteiro, status...) + 03-PROJETO (código)
--single gera o zip único antigo (com tudo).

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
    ap.add_argument("--out", required=True, help="caminho base: <dir>/<nome>-entrega.zip")
    ap.add_argument("--single", action="store_true", help="um zip só (formato antigo)")
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
    def pack(zpath: Path, parts) -> None:
        zpath.unlink(missing_ok=True)
        n = 0
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for base in parts:
                files = [base] if base.is_file() else sorted(base.rglob("*"))
                for p in files:
                    if p.is_file():
                        z.write(p, p.relative_to(stage.parent))
                        n += 1
        print(f"{zpath} ({zpath.stat().st_size / 1e6:.1f} MB, {n} arquivos)")

    readme = stage / "LEIA-ME.md"
    if a.single:
        pack(out, [stage])
    else:
        # Padrão (pedido do usuário): MP4, publicacao.md e thumbnail vão AVULSOS; todo o resto num zip só.
        base = out.with_suffix("")
        base = base.with_name(base.name.removesuffix("-entrega"))
        loose = [pub / video.name, pub / "publicacao.md", pub / "thumb-youtube.png"]
        rest = [p for p in sorted(stage.rglob("*")) if p.is_file() and p not in loose]
        pack(base.with_name(base.name + "-arquivos.zip"), rest)
        for p in loose:
            if p.exists():
                dst = out.parent / p.name
                shutil.copy2(p, dst)
                print(f"avulso: {dst}")

main()
