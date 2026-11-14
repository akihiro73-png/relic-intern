// 字幕・CTA画面（透過PNG 1080x1920）とBGM（WAV）を、ブラウザ（Playwright）で生成する。
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");

const OUT = path.resolve("build/ov"); mkdirSync(OUT, { recursive: true });
const nm = (p) => "file://" + path.resolve("node_modules", p);
const fontCss = `
@font-face{font-family:'Dela';src:url(${nm("@fontsource/dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff2")})}
@font-face{font-family:'Maru';font-weight:800;src:url(${nm("@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-japanese-800-normal.woff2")})}
@font-face{font-family:'Maru';font-weight:800;unicode-range:U+0000-00FF;src:url(${nm("@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-latin-800-normal.woff2")})}
@font-face{font-family:'Mont';font-weight:900;src:url(${nm("@fontsource/montserrat/files/montserrat-latin-900-normal.woff2")})}
html,body{margin:0;width:1080px;height:1920px;background:transparent}
.sub{position:absolute;left:60px;right:60px;text-align:center;font-family:'Maru';font-weight:800;color:#fff;font-size:62px;line-height:1.4;
  paint-order:stroke fill;-webkit-text-stroke:14px #000;text-shadow:0 6px 0 rgba(0,0,0,.35)}
.sub em{font-style:normal;color:#F5E663}
`;
// 字幕（id, 縦位置top px, HTML）
const SUBS = [
  ["s1", 1060, "気づいたら、<br>また<em>1時間</em>スクロールしてた"],
  ["s2", 1060, "<em>TOEIC</em>始めたのに、<br>参考書は開いてない"],
  ["s3", 1060, "勉強しなきゃと思いながら、<br>また<em>スクロール</em>"],
  ["s4", 1000, "どうせスクロールするなら、<br>TikTokより<br><em>ちょっとマシな時間</em>にしない？"],
  ["s5", 1000, "見終わったら<br>「<em>これTOEICに出るんだ</em>」が<br>ひとつ増えてる"],
  ["s6", 40, "スクロールするだけで、<br><em>TOEICに出る英語</em>が<br>流れてくる"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
// setContent(about:blank) だと file:// のフォントが読めないので、HTMLをファイルに書いて開く
const show = async (html) => { writeFileSync(`${OUT}/_tmp.html`, html); await page.goto("file://" + `${OUT}/_tmp.html`); await page.evaluate(() => document.fonts.ready); };
for (const [id, top, html] of SUBS) {
  await show(`<meta charset=utf-8><style>${fontCss}</style><div class="sub" style="top:${top}px">${html}</div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/${id}.png`, omitBackground: true });
}

// CTA（背景は pr_cut06_cta_bg を ffmpeg 側で敷くので、ここは文字とボタンだけ）
await show(`<meta charset=utf-8><style>${fontCss}
.logo{position:absolute;top:560px;width:100%;text-align:center;font-family:'Dela';font-size:150px;color:#fff;text-shadow:6px 6px 0 #FF3D7F,12px 12px 0 #2EE6D6}
.tag{position:absolute;top:800px;width:100%;text-align:center;font-family:'Maru';font-weight:800;font-size:54px;color:#fff;text-shadow:0 4px 12px rgba(0,0,0,.4)}
.link{position:absolute;top:960px;left:90px;right:90px;padding:30px 0;border-radius:999px;background:#fff;color:#0E0E10;text-align:center;font-family:'Maru';font-weight:800;font-size:50px;box-shadow:0 10px 30px rgba(0,0,0,.3)}
.row{position:absolute;top:1180px;width:100%;display:flex;justify-content:center;gap:70px}
.b{display:flex;flex-direction:column;align-items:center;gap:14px;font-family:'Maru';font-weight:800;font-size:40px;color:#fff;text-shadow:0 3px 10px rgba(0,0,0,.45)}
.i{width:150px;height:150px;border-radius:50%;background:rgba(14,14,16,.55);border:5px solid #fff;display:flex;align-items:center;justify-content:center}
</style>
<div class="logo">Scrollish</div>
<div class="tag">いつものスクロールで、英語にふれる。</div>
<div class="link">プロフィールのリンクから試せます</div>
<div class="row">
 <div class="b"><div class="i"><svg width="80" height="80" viewBox="0 0 24 24" fill="#FF3D7F" stroke="#FF3D7F" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>いいね</div>
 <div class="b"><div class="i"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2EE6D6" stroke-width="2.4" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg></div>フォロー</div>
 <div class="b"><div class="i"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#F5E663" stroke-width="2.4" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg></div>コメント</div>
</div>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${OUT}/cta.png`, omitBackground: true });

// BGM：OfflineAudioContext で30秒のローファイ風ループを合成
// 0〜10秒：パッドだけ（もやっと）／10秒〜：ビートが入る（転）／18秒〜：メロディが入って明るく（結）
const wav = await page.evaluate(async () => {
  const SR = 44100, DUR = 30.5, BPM = 90, beat = 60 / BPM;
  const ctx = new OfflineAudioContext(2, SR * DUR, SR);
  const master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]; // Fmaj7 Em7 Dm7 Cmaj7
  const bar = beat * 4;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(700, 0); lp.frequency.linearRampToValueAtTime(700, 10); lp.frequency.linearRampToValueAtTime(1800, 11); lp.frequency.setValueAtTime(1800, 17.5); lp.frequency.linearRampToValueAtTime(3200, 18.5); lp.connect(master);
  for (let t = 0, i = 0; t < DUR; t += bar, i++) {
    const ch = chords[i % 4];
    ch.forEach((m) => [-6, 6].forEach((det) => {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = det;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.4); g.gain.setValueAtTime(0.035, t + bar - 0.3); g.gain.linearRampToValueAtTime(0, t + bar + 0.1);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + bar + 0.2);
    }));
    // ベース
    const b = ctx.createOscillator(); b.type = "sine"; b.frequency.value = mtof(ch[0] - 12);
    const bg = ctx.createGain(); bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(t >= 10 ? 0.35 : 0.15, t + 0.05); bg.gain.exponentialRampToValueAtTime(0.001, t + bar);
    b.connect(bg); bg.connect(master); b.start(t); b.stop(t + bar);
  }
  // ドラム（10秒〜）
  const noise = ctx.createBuffer(1, SR, SR); const nd = noise.getChannelData(0); for (let i = 0; i < SR; i++) nd[i] = Math.random() * 2 - 1;
  for (let k = 0; ; k++) {
    const t = 10 + k * beat / 2; if (t > 29.6) break;
    const step = k % 8;
    if (step === 0 || step === 5) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25); const g = ctx.createGain(); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3); }
    if (step === 2 || step === 6) { const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800; const g = ctx.createGain(); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.2); }
    { const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; const g = ctx.createGain(); g.gain.setValueAtTime(step % 2 ? 0.06 : 0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.06); }
  }
  // メロディ（18秒〜、ペンタトニックのベル）
  const mel = [72, 74, 76, 79, 76, 74, 72, 69, 72, 76, 79, 81, 79, 76, 74, 76];
  mel.forEach((m, i) => { const t = 18 + i * beat / 2 * 1.5; if (t > 29) return; const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = mtof(m); const g = ctx.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.6); });
  // 効果音：18秒「ドン」、26秒「キラーン」
  { const t = 18; const o = ctx.createOscillator(); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.4); const g = ctx.createGain(); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5); }
  [1320, 1760, 2640].forEach((f, i) => { const t = 26 + i * 0.07; const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f; const g = ctx.createGain(); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3); });
  // 最後はフェードアウト
  master.gain.setValueAtTime(0.55, 28.5); master.gain.linearRampToValueAtTime(0, 30);
  const buf = await ctx.startRendering();
  // WAV(16bit) にして base64 で返す
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
  const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab);
  const ws = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  ws(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); ws(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, SR, true); v.setUint32(28, SR * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); ws(36, "data"); v.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { v.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); v.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  let s = ""; const u8 = new Uint8Array(ab); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
});
writeFileSync(`${OUT}/bgm.wav`, Buffer.from(wav, "base64"));
await browser.close();
console.log("overlays done");
