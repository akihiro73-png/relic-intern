// プロトタイプを操作しながら画面録画する（PR動画「結」パート用）。
// 出力: build/rec.webm と build/rec_marks.json（本編開始・終了の秒数）
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // 環境にプリインストール済みのものを使う
import http from "node:http";
import { readFileSync, renameSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve("build");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]) === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  try { res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); res.end(readFileSync(p)); } catch { res.writeHead(404); res.end(); }
}).listen(5173);

const W = 405, H = 720;
const browser = await chromium.launch();
// 画面録画は deviceScaleFactor が効かないので、810x1440 の画面で #root を zoom:2 して 405x720 のスマホ表示を2倍解像度で撮る
const ctx = await browser.newContext({ viewport: { width: W * 2, height: H * 2 }, recordVideo: { dir: "build/rec", size: { width: W * 2, height: H * 2 } } });
const t0 = Date.now();
const page = await ctx.newPage();
// 見せたい順：2択クイズ(在庫切れ) → 教科書vsネイティブ(聞き取れなかった) → あるある(レア・2時間スクロール) → カラオケ
await page.addInitScript(() => {
  window.__ORDER = ["c20", "c7", "c23", "c37"];
  // タップ位置を見せる白い丸
  addEventListener("pointerdown", (e) => {
    const d = document.createElement("div");
    d.style.cssText = `position:fixed;left:${e.clientX - 22}px;top:${e.clientY - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid #fff;pointer-events:none;z-index:9999;transition:transform .45s,opacity .45s`;
    document.body.appendChild(d);
    requestAnimationFrame(() => { d.style.transform = "scale(1.6)"; d.style.opacity = "0"; });
    setTimeout(() => d.remove(), 500);
  }, true);
});
await page.goto("http://localhost:5173/");
await page.addStyleTag({ content: `#root{zoom:2} #root>div{height:${H}px!important;width:${W}px!important} #root>div>div{width:${W}px!important}` });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
await page.getByText("タップして音をON").click();
const wait = (ms) => page.waitForTimeout(ms);
const swipe = async (i) => {
  await page.evaluate((i) => { const f = document.querySelector(".feed"); f.scrollTo({ top: f.clientHeight * i, behavior: "smooth" }); }, i);
};
await wait(300);
const start = (Date.now() - t0) / 1000;
// 1本目：2択クイズ（選択肢は0.8秒で出る）
await wait(1300);
await page.getByRole("button", { name: "out of stock", exact: true }).click();
await wait(800);
await page.getByRole("button", { name: /^保存$/ }).first().click();
await wait(1000);
// 2本目：教科書vsネイティブ（ネイティブ版は3.8秒で出る）
await swipe(1); await wait(5300);
// 3本目：あるある（レア）
await swipe(2); await wait(3000);
const end = (Date.now() - t0) / 1000;
await ctx.close(); await browser.close(); server.close();
const f = readdirSync("build/rec").find((x) => x.endsWith(".webm"));
renameSync(`build/rec/${f}`, "build/rec.webm");
writeFileSync("build/rec_marks.json", JSON.stringify({ start, end }));
console.log({ start, end });
