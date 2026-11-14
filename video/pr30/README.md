# Scrollish PR動画（30秒・縦型 1080x1920）

完成品：`scrollish_pr30.mp4`（合成BGM入り）／`scrollish_pr30_sfx_only.mp4`（効果音だけ。TikTokの楽曲を重ねる用）

投稿用のキャプション案と手順は `tiktok_post.md`。

## 構成

| 秒 | 映像 | 字幕 |
| --- | --- | --- |
| 0–3 起 | `pr_cut01_scroll_bed`（ベッドでスクロール） | 気づいたら、また1時間スクロールしてた |
| 3–7 承 | `pr_cut02_book_desk`（参考書の上にスマホ） | TOEIC始めたのに、参考書は開いてない |
| 7–10 承 | `pr_cut03_desk_scroll`（参考書を開いたままスクロール） | 勉強しなきゃと思いながら、またスクロール |
| 10–18 転 | `pr_cut01` → `pr_cut04_smile` にクロスフェード（表情が変わる） | どうせスクロールするなら、TikTokよりちょっとマシな時間にしない？／見終わったら「これTOEICに出るんだ」がひとつ増えてる |
| 18–26 結 | `pr_cut05_greenscreen_phone` にプロトタイプの画面録画をはめ込み（2択クイズ「在庫切れ」→教科書vsネイティブ→あるある・レア） | スクロールするだけで、TOEICに出る英語が流れてくる |
| 26–30 結 | `pr_cut06_cta_bg` に Scrollish ロゴ／プロフィールのリンクから試せます／いいね・フォロー・コメント／「牛乳」ってコメントしてね🥛 | — |

音：合成したローファイ風BGM（0–10秒はパッドだけ、10秒からビート、18秒からメロディ）＋18秒「ドン」・26秒「キラーン」。ナレーションなし。

## 作り直し方

```bash
cd video/pr30
npm install        # 初回のみ（react, esbuild, tailwindcss, fontsource）
node build.mjs     # prototype/scrollish.jsx を録画用にビルド
node record.mjs    # Playwright でプロトタイプを操作して画面録画 → build/rec.webm
node overlays.mjs  # 字幕PNG・CTA PNG・BGM(WAV) を生成 → build/ov/
./compose.sh       # ffmpeg で合成 → build/scrollish_pr30.mp4
./compose.sh sfx   # 効果音だけの版 → build/scrollish_pr30_sfx_only.mp4
```

- 字幕の文言・位置は `overlays.mjs` の `SUBS`、表示タイミングは `compose.sh` の `fade=...:st=` と `enable='between(...)'`。
- 画面録画で見せる動画の順番は `record.mjs` の `window.__ORDER`（クリップID）。
- 録画用ビルドはプロトタイプ本体を変更せず、フォントのローカル化と並び順の固定だけを行う。

## 叫びバージョン（`compose_scream.sh`）

冒頭だけ差し替えた別バージョン。完成品：`scrollish_pr30_scream.mp4`／`scrollish_pr30_scream_sfx_only.mp4`

| 秒 | 映像 | 字幕・演出 |
| --- | --- | --- |
| 0–1.2 | カット①（ベッドでスクロール）＋時計の早回し 09:00→23:59 | TikTok見てただけなのに… |
| 1.2–3.5 | 叫ぶ女性（`pr_cut00_scream` があれば使用。なければカット③で代用）にパンチズーム＋揺れ＋ピンクのフラッシュ | え、1日終わってる！？ |
| 3.5–7 | カット② | TOEIC始めたのに、参考書は開いてない |
| 7–10 | カット①の手元アップ | 勉強しなきゃと思いながら、またスクロール |
| 10–30 | 通常版と同じ | 通常版と同じ |

```bash
./compose_scream.sh       # 合成BGM入り
./compose_scream.sh sfx   # 効果音だけ
```

### 叫ぶ女性の画像（ChatGPT 用プロンプト）

`assets/images/pr_cut00_scream.png` として保存して `./compose_scream.sh` を再実行すると差し替わる。

```
Vertical 9:16 photo, same young Japanese woman as the other cuts (messy bun with bangs, oversized gray hoodie),
sitting up in bed at night in a cozy dorm room lit by a warm desk lamp, holding a smartphone in one hand,
the other hand on her cheek, eyes wide and mouth wide open in a shocked scream, realizing the whole day has passed.
Dark window with city lights behind her. Natural candid photo style, shallow depth of field, slight motion blur
on the hair. Face in the upper-center of the frame. No text, no logos, no watermark.
```
