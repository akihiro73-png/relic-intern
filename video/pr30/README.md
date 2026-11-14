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
