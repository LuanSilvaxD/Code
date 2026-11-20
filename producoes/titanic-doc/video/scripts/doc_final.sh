#!/bin/bash
# Junta as 4 partes do documentário com fusões curtas (0,5 s) de vídeo e áudio e normaliza o loudness.
# Uso: bash scripts/doc_final.sh   (a partir de video/)
set -e
X=0.5
P=(out/titanic-doc-parte1.mp4 out/titanic-doc-parte2.mp4 out/titanic-doc-parte3.mp4 out/titanic-doc-parte4.mp4)
d() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
D1=$(d ${P[0]}); D2=$(d ${P[1]}); D3=$(d ${P[2]})
O1=$(echo "$D1 - $X" | bc); O2=$(echo "$O1 + $D2 - $X" | bc); O3=$(echo "$O2 + $D3 - $X" | bc)
ffmpeg -v error -y -i ${P[0]} -i ${P[1]} -i ${P[2]} -i ${P[3]} -filter_complex "\
[0:v][1:v]xfade=transition=fade:duration=$X:offset=$O1[v01];\
[v01][2:v]xfade=transition=fade:duration=$X:offset=$O2[v012];\
[v012][3:v]xfade=transition=fade:duration=$X:offset=$O3,format=yuv420p[v];\
[0:a][1:a]acrossfade=d=$X[a01];[a01][2:a]acrossfade=d=$X[a012];[a012][3:a]acrossfade=d=$X[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k out/titanic-doc-mix.mp4
python3 scripts/loudnorm.py out/titanic-doc-mix.mp4 out/titanic-documentario.mp4
d out/titanic-documentario.mp4
