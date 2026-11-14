# Scrollish（公開版・暫定）

`prototype/scrollish.jsx` をそのまま Vite で動かす、公開用の暫定版です。
保存は localStorage（`src/storage-shim.js` で claude.ai の `window.storage` と同じ形を用意）。
本番の TypeScript 版（repository.ts / react-router / shadcn/ui）は `docs/handoff.md` の残タスク1で作る予定。

- 画面：フィード／保存した英語（右上の🔖）／検証用 lab（上部の「今日 ○本」を2秒以内に5回タップ）
- アプリ本体：`src/App.jsx`（プロトタイプのコピー）

## ローカルで動かす

```bash
cd app
npm install
npm run dev
```

## Vercel で公開する

1. Vercel で「Add New… → Project」から GitHub の `akihiro73-png/relic-intern` を Import
2. **Root Directory を `app` にする**（Framework Preset は Vite が自動で選ばれる）
3. Deploy。以降は、設定した本番ブランチに push すると自動で再公開される
