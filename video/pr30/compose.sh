#!/usr/bin/env bash
# PR動画（30秒・1080x1920・30fps）を組み立てる。先に build.mjs → record.mjs → overlays.mjs を実行しておく。
set -euo pipefail
cd "$(dirname "$0")"
IMG=../../assets/images
AUDIO=${1:-bgm}   # bgm（合成BGM入り）または sfx（効果音だけ。TikTokの楽曲を重ねる用）
OUTFILE=build/scrollish_pr30.mp4; [ "$AUDIO" = sfx ] && OUTFILE=build/scrollish_pr30_sfx_only.mp4
OV=build/ov
read START END < <(node -e 'const m=require("./build/rec_marks.json");console.log(m.start,m.end)')
APP_LEN=8          # 「結」の画面録画パートの長さ（18〜26秒）
SPEED=$(node -e "console.log(((${END}-${START})/${APP_LEN}).toFixed(4))")
echo "rec ${START}-${END}s -> speed x${SPEED}"

# 静止画をゆっくりズームさせるフィルタ（秒数, ズーム量）
# 入力は 30fps の連続フレームにしてから d=1 でズームする
kb() { local d=$1 z=$2; local n=$((d*30)); echo "fps=30,scale=2160:3840,zoompan=z='1+${z}*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,setsar=1"; }

ffmpeg -y -v error \
  -loop 1 -t 3   -i $IMG/pr_cut01_scroll_bed.webp \
  -loop 1 -t 4   -i $IMG/pr_cut02_book_desk.webp \
  -loop 1 -t 3   -i $IMG/pr_cut03_desk_scroll.webp \
  -loop 1 -t 2   -i $IMG/pr_cut01_scroll_bed.webp \
  -loop 1 -t 7   -i $IMG/pr_cut04_smile.webp \
  -loop 1 -t 8   -i $IMG/pr_cut05_greenscreen_phone.webp \
  -i build/rec.webm \
  -loop 1 -t 4   -i $IMG/pr_cut06_cta_bg.webp \
  -loop 1 -i $OV/s1.png -loop 1 -i $OV/s2.png -loop 1 -i $OV/s3.png -loop 1 -i $OV/s4.png \
  -loop 1 -i $OV/s5.png -loop 1 -i $OV/s6.png -loop 1 -i $OV/cta.png \
  -i $OV/${AUDIO}.wav \
  -filter_complex "
  [0]$(kb 3 0.10)[a];
  [1]$(kb 4 0.08)[b0];
  [2]$(kb 3 0.08)[c0];
  [3]$(kb 2 0.04)[d1];
  [4]$(kb 7 0.10)[d2];
  [d1][d2]xfade=transition=fade:duration=1:offset=1[d];
  [6]trim=start=${START}:end=${END},setpts=(PTS-STARTPTS)/${SPEED},fps=30,scale=600:-2,pad=600:1262:0:(oh-ih)/2:color=0x0E0E10,setsar=1[rec];
  [5]scale=1080:1920,setsar=1,split[ph1][ph2];
  [ph2]colorkey=0x00FF00:0.42:0.1[phk];
  [ph1][rec]overlay=256:281:shortest=0[e0];
  [e0][phk]overlay=0:0,trim=duration=8,$(kb 8 0.05)[e];
  [7]$(kb 4 0.06)[f0];
  [f0][14]overlay=0:0:shortest=1,fade=t=in:st=0:d=0.3[f];
  [a][b0][c0][d][e][f]concat=n=6:v=1:a=0[base];
  [8]format=rgba,fade=t=in:st=0.15:d=0.2:alpha=1[s1];
  [9]format=rgba,fade=t=in:st=3.1:d=0.2:alpha=1[s2];
  [10]format=rgba,fade=t=in:st=7.1:d=0.2:alpha=1[s3];
  [11]format=rgba,fade=t=in:st=11.0:d=0.25:alpha=1[s4];
  [12]format=rgba,fade=t=in:st=14.5:d=0.25:alpha=1[s5];
  [13]format=rgba,fade=t=in:st=18.3:d=0.25:alpha=1[s6];
  [base][s1]overlay=enable='between(t,0,3)':shortest=1[v1];
  [v1][s2]overlay=enable='between(t,3,7)':shortest=1[v2];
  [v2][s3]overlay=enable='between(t,7,10)':shortest=1[v3];
  [v3][s4]overlay=enable='between(t,11,14.5)':shortest=1[v4];
  [v4][s5]overlay=enable='between(t,14.5,18)':shortest=1[v5];
  [v5][s6]overlay=enable='between(t,18,26)':shortest=1,format=yuv420p[v]
  " -map "[v]" -map 15:a -t 30 -r 30 -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -movflags +faststart "$OUTFILE"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTFILE"
