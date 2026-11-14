#!/usr/bin/env bash
# PR動画「叫びバージョン」（30秒）。冒頭を「TikTok見てたら1日終わってた！？」の叫びに差し替えたもの。
# 先に build.mjs → record.mjs → overlays.mjs を実行しておく。
# 叫んでいる女性の画像 assets/images/pr_cut00_scream.webp（または .png）があれば使い、なければカット③で代用する。
set -euo pipefail
cd "$(dirname "$0")"
IMG=../../assets/images
AUDIO=${1:-bgm}   # bgm（合成BGM入り）または sfx（効果音だけ）
OUTFILE=build/scrollish_pr30_scream.mp4; [ "$AUDIO" = sfx ] && OUTFILE=build/scrollish_pr30_scream_sfx_only.mp4
SCREAM=$IMG/pr_cut03_desk_scroll.webp
for f in $IMG/pr_cut00_scream.webp $IMG/pr_cut00_scream.png; do [ -f "$f" ] && SCREAM=$f; done
echo "scream image: $SCREAM"
OV=build/ov
read START END < <(node -e 'const m=require("./build/rec_marks.json");console.log(m.start,m.end)')
SPEED=$(node -e "console.log(((${END}-${START})/8).toFixed(4))")

# ゆっくりズーム（フレーム数, ズーム量）
kbf() { local n=$1 z=$2; echo "fps=30,scale=2160:3840,zoompan=z='1+${z}*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,setsar=1"; }
# 叫び：最初の6コマで一気に寄って（パンチズーム）、揺れながら落ち着く
PUNCH="fps=30,scale=2160:3840,zoompan=z='1.0+0.18*min(on/6\,1)':x='iw/2-(iw/zoom/2)':y='ih*0.42-(ih/zoom/2)':d=1:s=1140x2027:fps=30,crop=1080:1920:x='30+28*sin(n*2.3)*exp(-n/18)':y='53+28*cos(n*2.9)*exp(-n/18)',setsar=1"
# 手元に寄るズーム（カット①の別アングル代わり）
HANDS="fps=30,scale=2160:3840,zoompan=z='1.3+0.08*on/90':x='iw/2-(iw/zoom/2)+120':y='ih-ih/zoom':d=1:s=1080x1920:fps=30,setsar=1"

ffmpeg -y -v error \
  -loop 1 -t 1.2 -i $IMG/pr_cut01_scroll_bed.webp \
  -loop 1 -t 2.3 -i $SCREAM \
  -loop 1 -t 3.5 -i $IMG/pr_cut02_book_desk.webp \
  -loop 1 -t 3   -i $IMG/pr_cut01_scroll_bed.webp \
  -loop 1 -t 2   -i $IMG/pr_cut01_scroll_bed.webp \
  -loop 1 -t 7   -i $IMG/pr_cut04_smile.webp \
  -loop 1 -t 8   -i $IMG/pr_cut05_greenscreen_phone.webp \
  -i build/rec.webm \
  -loop 1 -t 4   -i $IMG/pr_cut06_cta_bg.webp \
  -loop 1 -i $OV/s0_scream.png \
  -framerate 30 -i $OV/clock_%02d.png \
  -loop 1 -i $OV/hook_scream.png \
  -loop 1 -i $OV/s2.png -loop 1 -i $OV/s3.png -loop 1 -i $OV/s4.png -loop 1 -i $OV/s5.png -loop 1 -i $OV/s6.png -loop 1 -i $OV/cta.png \
  -i $OV/${AUDIO}_scream.wav \
  -f lavfi -t 0.4 -i "color=c=0xFF3D7F:s=1080x1920:r=30" \
  -filter_complex "
  [0]$(kbf 36 0.05)[a0];
  [a0][10]overlay=0:0:eof_action=repeat[a1];
  [a1][9]overlay=0:0:shortest=1[a];
  [19]format=rgba,colorchannelmixer=aa=0.55,fade=t=out:st=0:d=0.4:alpha=1[flash];
  [1]${PUNCH}[h0];
  [h0][flash]overlay=0:0:eof_action=pass[h1];
  [11]format=rgba,fade=t=in:st=0.05:d=0.12:alpha=1[hk];
  [h1][hk]overlay=0:0:shortest=1[h];
  [2]$(kbf 105 0.08)[b];
  [3]${HANDS}[c];
  [4]$(kbf 60 0.04)[d1];
  [5]$(kbf 210 0.10)[d2];
  [d1][d2]xfade=transition=fade:duration=1:offset=1[d];
  [7]trim=start=${START}:end=${END},setpts=(PTS-STARTPTS)/${SPEED},fps=30,scale=600:-2,pad=600:1262:0:(oh-ih)/2:color=0x0E0E10,setsar=1[rec];
  [6]scale=1080:1920,setsar=1,split[ph1][ph2];
  [ph2]colorkey=0x00FF00:0.42:0.1[phk];
  [ph1][rec]overlay=256:281:shortest=0[e0];
  [e0][phk]overlay=0:0,trim=duration=8,$(kbf 240 0.05)[e];
  [8]$(kbf 120 0.06)[f0];
  [f0][17]overlay=0:0:shortest=1,fade=t=in:st=0:d=0.3[f];
  [a][h][b][c][d][e][f]concat=n=7:v=1:a=0[base];
  [12]format=rgba,fade=t=in:st=3.6:d=0.2:alpha=1[s2];
  [13]format=rgba,fade=t=in:st=7.1:d=0.2:alpha=1[s3];
  [14]format=rgba,fade=t=in:st=11.0:d=0.25:alpha=1[s4];
  [15]format=rgba,fade=t=in:st=14.5:d=0.25:alpha=1[s5];
  [16]format=rgba,fade=t=in:st=18.3:d=0.25:alpha=1[s6];
  [base][s2]overlay=enable='between(t,3.5,7)':shortest=1[v2];
  [v2][s3]overlay=enable='between(t,7,10)':shortest=1[v3];
  [v3][s4]overlay=enable='between(t,11,14.5)':shortest=1[v4];
  [v4][s5]overlay=enable='between(t,14.5,18)':shortest=1[v5];
  [v5][s6]overlay=enable='between(t,18,26)':shortest=1,format=yuv420p[v]
  " -map "[v]" -map 18:a -t 30 -r 30 -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -movflags +faststart "$OUTFILE"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTFILE"
