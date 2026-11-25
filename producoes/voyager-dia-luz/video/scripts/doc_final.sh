#!/bin/bash
# Junta as partes do documentário com fusões curtas de vídeo e áudio e normaliza o loudness (-14 LUFS).
# Uso (de video/): bash doc_final.sh out/final.mp4 out/parte1.mp4 out/parte2.mp4 [out/parte3.mp4 ...]
# Fusão: XFADE=0.5 (s). Imprime os offsets de cada parte no vídeo final (use para os capítulos da descrição).
set -e
OUT=$1; shift
X=${XFADE:-0.5}
N=$#
[ $N -ge 2 ] || { echo "precisa de 2+ partes"; exit 1; }
d() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
IN=(); for p in "$@"; do IN+=(-i "$p"); done
FC=""; off=0; prevv="0:v"; preva="0:a"; i=0
echo "parte 1 começa em 0.00 s"
for p in "$@"; do
  if [ $i -gt 0 ]; then
    off=$(echo "$off + $(d "${PARTS[$((i-1))]}") - $X" | bc)
    echo "parte $((i+1)) começa em $off s"
    v="v$i"; a="a$i"
    FC="$FC[$prevv][$i:v]xfade=transition=fade:duration=$X:offset=$off[$v];[$preva][$i:a]acrossfade=d=$X[$a];"
    prevv=$v; preva=$a
  fi
  PARTS[$i]="$p"; i=$((i+1))
done
FC="${FC}[$prevv]format=yuv420p[vout]"
TMP="${OUT%.mp4}-mix.mp4"
ffmpeg -v error -y "${IN[@]}" -filter_complex "$FC" -map "[vout]" -map "[$preva]" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k "$TMP"
python3 "$(dirname "$0")/loudnorm.py" "$TMP" "$OUT"
echo "final: $OUT · $(d "$OUT") s"
