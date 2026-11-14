// プロトタイプ(prototype/scrollish.jsx)を録画用にビルドする。
// 録画用の変更は2点だけ：Google Fonts の @import をローカルフォントに置き換え、
// window.__ORDER があればフィードの並びをその順にする（PR動画で見せたい動画を固定するため）。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import * as esbuild from "esbuild";

mkdirSync("build", { recursive: true });
let src = readFileSync("../../prototype/scrollish.jsx", "utf8");
src = src.replace(/@import url\([^)]*\);/, "");
const rnd = "cand = CLIPS[Math.floor(Math.random() * CLIPS.length)]";
if (!src.includes(rnd)) throw new Error("feed generator not found");
src = src.replace(rnd, "cand = (window.__ORDER && window.__ORDER.length) ? CLIP_BY_ID[window.__ORDER.shift()] : CLIPS[Math.floor(Math.random() * CLIPS.length)]");
writeFileSync("build/app.jsx", src);

writeFileSync("build/main.jsx", `
import "@fontsource/dela-gothic-one/400.css";
import "@fontsource/m-plus-rounded-1c/500.css";
import "@fontsource/m-plus-rounded-1c/700.css";
import "@fontsource/m-plus-rounded-1c/800.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import { createRoot } from "react-dom/client";
import App from "./app.jsx";
createRoot(document.getElementById("root")).render(<App />);
`);
writeFileSync("build/in.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
execSync("npx tailwindcss -i build/in.css -o build/tw.css --content build/app.jsx", { stdio: "inherit" });
await esbuild.build({
  entryPoints: ["build/main.jsx"], bundle: true, outfile: "build/bundle.js", jsx: "automatic",
  loader: { ".woff": "file", ".woff2": "file" }, nodePaths: ["node_modules"], minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
});
writeFileSync("build/index.html", `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="tw.css"><link rel="stylesheet" href="bundle.css">
<style>html,body,#root{margin:0;height:100%;background:#000}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);
console.log("built");
