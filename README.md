# relic-intern — Scrollish

いつものスクロールで、英語にふれる。英語の縦型ショート動画SNS「Scrollish」の検証用プロジェクト。

## アプリ（Vercel でそのまま公開できる構成）

- リポジトリ直下が Vite + React のアプリ。Vercel の「New Project → Import → Deploy」を設定変更なしで実行すれば公開される。
- アプリ本体：`src/App.jsx`（`prototype/scrollish.jsx` のコピー）。保存は localStorage（`src/storage-shim.js`）。
- 画面：フィード／保存した英語（右上の🔖）／検証用 lab（上部の「今日 ○本」を2秒以内に5回タップ）
- 本番の TypeScript 版（repository.ts / react-router / shadcn/ui）は `docs/handoff.md` の残タスク1で作る予定。

```bash
npm install
npm run dev
```

## そのほかのフォルダ

| フォルダ | 中身 |
| --- | --- |
| `docs/handoff.md` | claude.ai チャットからの引き継ぎメモ（経緯・決定事項・要件・残タスク） |
| `prototype/` | claude.ai アーティファクト用に作った1ファイルのプロトタイプ |
| `assets/images/` | 画像素材（キャラ・背景の見本、PR動画のカット） |
| `video/pr30/` | PR動画（30秒・縦型）と作り直し用スクリプト |
