// プロトタイプは claude.ai 専用の window.storage を使っているので、
// 公開版では同じ形（get/set）を localStorage で用意する。
// 本番の TypeScript 版では src/lib/repository.ts に置き換える予定（docs/handoff.md 参照）。
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value === null ? null : { key, value };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
  };
}
