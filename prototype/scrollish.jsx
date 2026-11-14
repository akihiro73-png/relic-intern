import { useState, useEffect, useRef, useMemo } from "react";
import { Heart, Bookmark, Share2, Play, ArrowLeft, Volume2, Download, Copy, Trash2 } from "lucide-react";

/* ---------- design tokens ---------- */
const C = { bg: "#0E0E10", pink: "#FF3D7F", yellow: "#F5E663", cyan: "#2EE6D6", gold: "#FFC83D", ink: "#FFFFFF", mute: "#A7A7B3", panel: "#1A1A20" };
const THEMES = [
  `radial-gradient(90% 60% at 15% 10%, ${C.pink}66, transparent 60%), radial-gradient(80% 60% at 90% 95%, ${C.cyan}44, transparent 60%), ${C.bg}`,
  `radial-gradient(90% 60% at 85% 10%, ${C.cyan}55, transparent 60%), radial-gradient(80% 60% at 10% 90%, ${C.yellow}33, transparent 60%), ${C.bg}`,
  `linear-gradient(160deg, #1A0B2E 0%, ${C.bg} 55%, #0B2A2A 100%)`,
  `radial-gradient(100% 70% at 50% 0%, ${C.yellow}40, transparent 55%), ${C.bg}`,
  `radial-gradient(100% 70% at 50% 100%, ${C.pink}55, transparent 55%), radial-gradient(60% 40% at 80% 20%, ${C.cyan}33, transparent 60%), ${C.bg}`,
];
const RARE_THEME = `radial-gradient(90% 70% at 50% 30%, ${C.gold}55, transparent 60%), linear-gradient(180deg, #2A1E00 0%, ${C.bg} 70%)`;

/* ---------- content ---------- */
const CREATORS = {
  dopa: { name: "@dopa_eigo", icon: "🧠" },
  neko: { name: "@toeic_neko", icon: "🐱" },
  bro: { name: "@native_bro", icon: "😎" },
  police: { name: "@katakana_police", icon: "🚓" },
  aru: { name: "@aruaru_eng", icon: "🤣" },
  quiz: { name: "@quiz_ojisan", icon: "👴" },
};

const TYPE_META = {
  ieru: { label: "言えるかな", cap: "これ言えたら勝ち", tags: "#英語 #言えるかな" },
  vs: { label: "教科書vsネイティブ", cap: "教科書のままだと浮くかも", tags: "#ネイティブ英語" },
  word: { label: "1単語ドカン", cap: "今日の1単語", tags: "#英単語 #TOEIC" },
  quiz: { label: "2択クイズ", cap: "3秒で答えて", tags: "#英語クイズ" },
  aru: { label: "あるある英語", cap: "わかる人いる？", tags: "#あるある #英語で言うと" },
  rank: { label: "ランキング", cap: "1位わかる？", tags: "#TOEIC #ランキング" },
  kata: { label: "カタカナ英語", cap: "カタカナのままだと通じないかも", tags: "#発音 #カタカナ英語" },
  kara: { label: "カラオケ字幕", cap: "一緒に言ってみて", tags: "#英語フレーズ" },
  reward: { label: "ご褒美", cap: "", tags: "" },
};

const RAW = [
  { type: "ieru", cr: "dopa", hook: "「推しが尊すぎる」", en: "My fave is just too precious.", ja: "推しが尊すぎる", emoji: "🥹", rare: true },
  { type: "ieru", cr: "dopa", hook: "「ドタキャンされた」", en: "They bailed on me last minute.", ja: "直前にドタキャンされた", emoji: "🙃" },
  { type: "ieru", cr: "bro", hook: "「動画見ながら寝落ちした」", en: "I passed out watching videos.", ja: "動画見ながら寝落ちした", emoji: "😪" },
  { type: "ieru", cr: "bro", hook: "「それな」", en: "Facts.", ja: "それな（まじそれ）", emoji: "👉" },
  { type: "ieru", cr: "dopa", hook: "「まだワンチャンある」", en: "There's still a shot.", ja: "まだワンチャンある", emoji: "🎯" },

  { type: "vs", cr: "bro", hook: "How are you? になんて返す？", tb: "I'm fine, thank you.", en: "Pretty good! You?", ja: "いい感じ！そっちは？", emoji: "👋" },
  { type: "vs", cr: "bro", hook: "聞き取れなかったとき", tb: "I don't understand.", en: "Sorry, I didn't catch that.", ja: "ごめん、聞き取れなかった", emoji: "👂" },
  { type: "vs", cr: "bro", hook: "「おいしい」って言いたい", tb: "It is delicious.", en: "This is so good!", ja: "これめっちゃうまい！", emoji: "🤤" },
  { type: "vs", cr: "bro", hook: "「お腹すいた」を強めに", tb: "I am hungry.", en: "I'm starving.", ja: "お腹ペコペコ", emoji: "🍔" },
  { type: "vs", cr: "bro", hook: "「疲れた」を強めに", tb: "I am tired.", en: "I'm wiped out.", ja: "もうヘトヘト", emoji: "🫠" },

  { type: "word", cr: "neko", en: "procrastinate", ja: "先延ばしにする", ex: "I procrastinate every night.", exja: "毎晩先延ばしにしてる", emoji: "🐢" },
  { type: "word", cr: "neko", en: "deadline", ja: "締め切り", ex: "The deadline is tomorrow.", exja: "締め切りは明日", emoji: "⏳" },
  { type: "word", cr: "dopa", en: "addicted", ja: "ハマっている", ex: "I'm addicted to this app.", exja: "このアプリにハマってる", emoji: "📱" },
  { type: "word", cr: "neko", en: "reschedule", ja: "予定を変更する", ex: "Can we reschedule the meeting?", exja: "会議の日程を変えられますか？", emoji: "📅" },
  { type: "word", cr: "neko", en: "available", ja: "空いている", ex: "Are you available on Friday?", exja: "金曜は空いてる？", emoji: "🙋" },

  { type: "quiz", cr: "quiz", hook: "「会議を延期する」は？", choices: ["postpone", "postcard"], answer: 0, en: "We need to postpone the meeting.", ja: "会議を延期しないと", emoji: "🗓️" },
  { type: "quiz", cr: "quiz", hook: "「領収書」は？", choices: ["recipe", "receipt"], answer: 1, en: "Can I have a receipt?", ja: "領収書もらえますか？", emoji: "🧾" },
  { type: "quiz", cr: "quiz", hook: "「お釣りはいらないよ」は？", choices: ["Keep the change.", "Keep the money."], answer: 0, en: "Keep the change.", ja: "お釣りはとっておいて", emoji: "🪙" },
  { type: "quiz", cr: "quiz", hook: "I'm on my way. の意味は？", choices: ["今向かってる", "我が道を行く"], answer: 0, en: "I'm on my way.", ja: "今向かってる", emoji: "🏃" },
  { type: "quiz", cr: "quiz", hook: "「在庫切れ」は？", choices: ["out of order", "out of stock"], answer: 1, en: "This item is out of stock.", ja: "在庫切れです（out of order は故障中）", emoji: "📦" },

  { type: "aru", cr: "aru", hook: "アラーム5回止めた朝", en: "I hit snooze five times.", ja: "スヌーズ5回押した", emoji: "⏰" },
  { type: "aru", cr: "aru", hook: "深夜のラーメン", en: "Midnight ramen just hits different.", ja: "深夜のラーメンは格別", emoji: "🍜" },
  { type: "aru", cr: "aru", hook: "気づいたら2時間スクロール", en: "I totally lost track of time.", ja: "完全に時間を忘れてた", emoji: "📱", rare: true },
  { type: "aru", cr: "aru", hook: "給料日前", en: "I'm broke until payday.", ja: "給料日まで金欠", emoji: "💸" },
  { type: "aru", cr: "aru", hook: "推しのライブ当選", en: "I got tickets! I'm screaming!", ja: "チケット当たった！叫んでる！", emoji: "🎤" },

  { type: "rank", cr: "neko", hook: "TOEICに出る「会議」単語 TOP3", items: [["agenda", "議題"], ["minutes", "議事録"], ["attendee", "出席者"]], emoji: "🏢" },
  { type: "rank", cr: "neko", hook: "TOEICに出る「お店」単語 TOP3", items: [["refund", "返金"], ["invoice", "請求書"], ["discount", "割引"]], emoji: "🛍️" },
  { type: "rank", cr: "neko", hook: "TOEICに出る「仕事」単語 TOP3", items: [["colleague", "同僚"], ["supervisor", "上司"], ["promotion", "昇進"]], emoji: "💼", rare: true },
  { type: "rank", cr: "neko", hook: "TOEICに出る「旅行」単語 TOP3", items: [["itinerary", "旅程"], ["departure", "出発"], ["reservation", "予約"]], emoji: "✈️" },
  { type: "rank", cr: "neko", hook: "TOEICに出る「会社」単語 TOP3", items: [["headquarters", "本社"], ["branch", "支店"], ["personnel", "人事"]], emoji: "🏙️" },

  { type: "kata", cr: "police", kata: "トマト", en: "tomato", ja: "「トメイトウ」に近い", emoji: "🍅" },
  { type: "kata", cr: "police", kata: "ビタミン", en: "vitamin", ja: "「ヴァイタミン」に近い", emoji: "💊" },
  { type: "kata", cr: "police", kata: "コーヒー", en: "coffee", ja: "「カーフィ」に近い", emoji: "☕" },
  { type: "kata", cr: "police", kata: "バニラ", en: "vanilla", ja: "「ヴァニラ」、ニを強く", emoji: "🍦" },
  { type: "kata", cr: "police", kata: "エネルギー", en: "energy", ja: "「エナジー」に近い", emoji: "⚡" },

  { type: "kara", cr: "dopa", en: "I'll get it done tomorrow.", ja: "明日やるから（たぶん）", emoji: "🫣" },
  { type: "kara", cr: "dopa", en: "Just one more video.", ja: "あと1本だけ", emoji: "🔁", rare: true },
  { type: "kara", cr: "bro", en: "Let me sleep five more minutes.", ja: "あと5分寝かせて", emoji: "🛌" },
  { type: "kara", cr: "dopa", en: "I'm gonna start for real tomorrow.", ja: "明日から本気出す", emoji: "🔥" },
  { type: "kara", cr: "bro", en: "Can you say that again?", ja: "もう一回言って？", emoji: "🔂" },
];
const CLIPS = RAW.map((c, i) => ({ ...c, id: `c${i + 1}`, theme: i % THEMES.length }));
const CLIP_BY_ID = Object.fromEntries(CLIPS.map((c) => [c.id, c]));

function getBeats(c) {
  switch (c.type) {
    case "ieru": return { dur: 8000, beats: [{ at: 0, st: 0, sfx: "don" }, { at: 1900, st: 1, sfx: "kira", say: c.en }, { at: 3800, st: 2 }] };
    case "vs": return { dur: 10500, beats: [{ at: 0, st: 0, sfx: "don" }, { at: 1300, st: 1, sfx: "bubu", say: c.tb }, { at: 3800, st: 2, sfx: "kira", say: c.en }, { at: 6200, st: 3 }] };
    case "word": return { dur: 8500, beats: [{ at: 0, st: 0, sfx: "don", say: c.en }, { at: 1500, st: 1, sfx: "pop" }, { at: 2800, st: 2, say: c.ex }] };
    case "quiz": return { dur: 11000, beats: [{ at: 0, st: 0, sfx: "don" }, { at: 800, st: 1, sfx: "pop" }, { at: 6500, st: 2, sfx: "kira", say: c.en }] };
    case "aru": return { dur: 8000, beats: [{ at: 0, st: 0, sfx: "shaa" }, { at: 1600, st: 1, sfx: "don", say: c.en }, { at: 3600, st: 2 }] };
    case "rank": return { dur: 10500, beats: [{ at: 0, st: 0, sfx: "don" }, { at: 1500, st: 1, sfx: "pop", say: c.items[2][0] }, { at: 3700, st: 2, sfx: "pop", say: c.items[1][0] }, { at: 5900, st: 3, sfx: "kira", say: c.items[0][0] }] };
    case "kata": return { dur: 9500, beats: [{ at: 0, st: 0, sfx: "don" }, { at: 1200, st: 1, sfx: "bubu", say: c.kata, lang: "ja-JP" }, { at: 3400, st: 2, sfx: "kira", say: c.en }, { at: 5600, st: 3, say: c.en, rate: 0.7 }] };
    case "kara": { const n = c.en.split(" ").length; return { dur: 1000 + n * 420 + 3000, beats: [{ at: 0, st: 0, sfx: "pop" }, { at: 1000, st: 1, say: c.en, rate: 0.85 }] }; }
    default: return { dur: 5000, beats: [{ at: 0, st: 0, sfx: "kira" }] };
  }
}

/* ---------- sound ---------- */
let actx = null;
function initAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!actx && AC) actx = new AC();
    if (actx && actx.state === "suspended") actx.resume();
  } catch (e) {}
}
function tone(type, f1, f2, start, dur, vol) {
  const o = actx.createOscillator(); const g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, start);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, start + dur);
  g.gain.setValueAtTime(vol, start); g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(actx.destination); o.start(start); o.stop(start + dur + 0.02);
}
function sfx(name) {
  if (!actx) return;
  try {
    const t = actx.currentTime;
    if (name === "don") { tone("sine", 180, 45, t, 0.35, 0.7); tone("triangle", 90, 40, t, 0.25, 0.4); }
    if (name === "kira") [1320, 1760, 2640].forEach((f, i) => tone("triangle", f, null, t + i * 0.07, 0.18, 0.18));
    if (name === "bubu") { tone("square", 150, null, t, 0.12, 0.12); tone("square", 150, null, t + 0.16, 0.18, 0.12); }
    if (name === "pop") tone("sine", 500, 1000, t, 0.1, 0.35);
    if (name === "correct") { tone("sine", 880, null, t, 0.12, 0.25); tone("sine", 1320, null, t + 0.12, 0.22, 0.25); }
    if (name === "shaa") {
      const len = Math.floor(actx.sampleRate * 0.3); const buf = actx.createBuffer(1, len, actx.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = actx.createBufferSource(); s.buffer = buf; const f = actx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2500;
      const g = actx.createGain(); g.gain.value = 0.3; s.connect(f); f.connect(g); g.connect(actx.destination); s.start(t);
    }
  } catch (e) {}
}
function say(text, lang = "en-US", rate = 0.95) {
  try {
    const s = window.speechSynthesis; if (!s || !text) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate;
    const vs = s.getVoices(); const v = vs.find((x) => x.lang === lang) || vs.find((x) => x.lang && x.lang.startsWith(lang.slice(0, 2)));
    if (v) u.voice = v; s.speak(u);
  } catch (e) {}
}
function hush() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }

/* ---------- utils ---------- */
const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const ymd = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const seed = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const fmt = (n) => (n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString());
const STORE_KEY = "scrollish:data";
const EMPTY = { sessions: [], reactions: {} };

/* ---------- slide ---------- */
function Slide({ item, active, paused, onTogglePause, reaction, onReact, onAnswer, onShare, todayCount }) {
  const c = item.clip;
  const { dur, beats } = useMemo(() => getBeats(c), [c]);
  const [elapsed, setElapsed] = useState(0);
  const [picked, setPicked] = useState(null);
  const elRef = useRef(0); const firedRef = useRef(-1);

  useEffect(() => {
    if (!active) { elRef.current = 0; firedRef.current = -1; setElapsed(0); return; }
    if (paused) return;
    let raf; let last = performance.now();
    const loop = (now) => {
      elRef.current += now - last; last = now;
      if (elRef.current >= dur) { elRef.current = 0; firedRef.current = -1; }
      for (let i = firedRef.current + 1; i < beats.length; i++) {
        if (elRef.current >= beats[i].at) { firedRef.current = i; const b = beats[i]; if (b.sfx) sfx(b.sfx); if (b.say) say(b.say, b.lang, b.rate); } else break;
      }
      setElapsed(elRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, dur, beats]);

  let st = 0; for (const b of beats) if (elapsed >= b.at) st = b.st;
  const isReward = c.type === "reward";
  const creator = isReward ? { name: "@scrollish", icon: "🌀" } : CREATORS[c.cr];
  const meta = TYPE_META[c.type];
  const h = seed(c.id);
  const liked = !!reaction?.liked; const saved = !!reaction?.saved;

  const pick = (i, e) => {
    e.stopPropagation(); if (picked !== null) return;
    setPicked(i); const ok = i === c.answer; sfx(ok ? "correct" : "bubu"); onAnswer(ok);
  };

  return (
    <div className="relative w-full overflow-hidden select-none" style={{ height: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", background: c.rare ? RARE_THEME : THEMES[c.theme ?? 0] }} onClick={onTogglePause}>
      {c.rare && <div className="absolute left-4 f-maru font-bold text-sm px-3 py-1 rounded-full" style={{ top: 64, background: C.gold, color: "#2A1E00" }}>✨ レア動画</div>}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "96px 76px 150px 24px" }}>
        <Content c={c} st={st} elapsed={elapsed} picked={picked} pick={pick} todayCount={todayCount} />
      </div>

      {!isReward && (
        <div className="absolute flex flex-col items-center gap-5" style={{ right: 10, bottom: 120 }}>
          <div className="flex items-center justify-center rounded-full text-2xl" style={{ width: 48, height: 48, background: C.panel, border: `2px solid ${C.ink}` }}>{creator.icon}</div>
          <RailBtn label={fmt(1200 + (h % 90000) + (liked ? 1 : 0))} onClick={(e) => { e.stopPropagation(); if (!liked) sfx("pop"); onReact({ liked: !liked }); }}>
            <Heart size={30} color={liked ? C.pink : C.ink} fill={liked ? C.pink : "none"} />
          </RailBtn>
          <RailBtn label={saved ? "保存済み" : "保存"} onClick={(e) => { e.stopPropagation(); if (!saved) sfx("kira"); onReact({ saved: !saved }); }}>
            <Bookmark size={30} color={saved ? C.yellow : C.ink} fill={saved ? C.yellow : "none"} />
          </RailBtn>
          <RailBtn label="シェア" onClick={(e) => { e.stopPropagation(); onShare(c); }}>
            <Share2 size={28} color={C.ink} />
          </RailBtn>
        </div>
      )}

      {!isReward && (
        <div className="absolute f-maru" style={{ left: 16, right: 84, bottom: 22, color: C.ink }}>
          <div className="font-bold text-base">{creator.name}</div>
          <div className="text-sm mt-1" style={{ color: "#E6E6EE" }}>{meta.cap} {c.emoji}</div>
          <div className="text-sm mt-1" style={{ color: C.cyan }}>{meta.tags} #Scrollish</div>
        </div>
      )}

      <div className="absolute left-0 right-0 bottom-0" style={{ height: 3, background: "rgba(255,255,255,.18)" }}>
        <div style={{ height: "100%", width: `${Math.min(100, (elapsed / dur) * 100)}%`, background: C.ink }} />
      </div>

      {active && paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full flex items-center justify-center" style={{ width: 84, height: 84, background: "rgba(0,0,0,.45)" }}><Play size={44} color={C.ink} fill={C.ink} /></div>
        </div>
      )}
    </div>
  );
}

function RailBtn({ children, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 f-maru focus-ring" style={{ minWidth: 48, minHeight: 48, color: C.ink, background: "transparent" }}>
      {children}
      <span className="text-xs font-bold" style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}>{label}</span>
    </button>
  );
}

const Big = ({ children, color = C.ink, size = 34, k }) => (
  <div key={k} className="pin f-en" style={{ color, fontSize: size, fontWeight: 900, lineHeight: 1.15, textShadow: `3px 3px 0 ${C.pink}88` }}>{children}</div>
);
const Hook = ({ children, size = 30, color = C.yellow }) => (
  <div className="f-dela pin" style={{ color, fontSize: size, lineHeight: 1.3, textShadow: `2px 2px 0 #000, 4px 4px 0 ${C.pink}` }}>{children}</div>
);
const Sub = ({ children, k }) => <div key={k} className="pin f-maru font-bold mt-3" style={{ color: "#E6E6EE", fontSize: 17 }}>{children}</div>;

function Content({ c, st, elapsed, picked, pick, todayCount }) {
  switch (c.type) {
    case "ieru": {
      const n = Math.max(1, Math.ceil((1900 - elapsed) / 633));
      return (
        <>
          <div className="text-6xl mb-4">{c.emoji}</div>
          <Hook size={st === 0 ? 30 : 22}>{c.hook}って<br />英語で言える？</Hook>
          {st === 0 && <div key={n} className="pin f-en mt-6" style={{ color: C.cyan, fontSize: 56, fontWeight: 900 }}>{n}</div>}
          {st >= 1 && <div className="mt-6"><Big k="en">{c.en}</Big></div>}
          {st >= 2 && <Sub k="ja">{c.ja}</Sub>}
        </>
      );
    }
    case "vs":
      return (
        <>
          <Hook size={24}>{c.hook}</Hook>
          {st >= 1 && (
            <div key="tb" className="pin mt-6 f-maru" style={{ color: C.mute }}>
              <div className="text-sm font-bold">📕 教科書</div>
              <div className="f-en" style={{ fontSize: 22, fontWeight: 800, textDecoration: st >= 2 ? "line-through" : "none", textDecorationColor: C.pink }}>{c.tb}</div>
            </div>
          )}
          {st >= 2 && (
            <div key="nv" className="pin mt-6">
              <div className="f-maru text-sm font-bold" style={{ color: C.cyan }}>😎 ネイティブ</div>
              <Big color={C.cyan}>{c.en}</Big>
            </div>
          )}
          {st >= 3 && <Sub k="ja">{c.ja}</Sub>}
        </>
      );
    case "word":
      return (
        <>
          <div className="text-6xl mb-2">{c.emoji}</div>
          <Big k="w" color={C.yellow} size={c.en.length > 10 ? 38 : 50}>{c.en}</Big>
          {st >= 1 && <div key="m" className="pin f-dela mt-3" style={{ color: C.ink, fontSize: 26 }}>{c.ja}</div>}
          {st >= 2 && (
            <div key="ex" className="pin mt-6 rounded-2xl px-4 py-3" style={{ background: "rgba(0,0,0,.45)" }}>
              <div className="f-en" style={{ color: C.ink, fontSize: 19, fontWeight: 800 }}>{c.ex}</div>
              <div className="f-maru text-sm mt-1" style={{ color: C.mute }}>{c.exja}</div>
            </div>
          )}
        </>
      );
    case "quiz": {
      const reveal = picked !== null || st >= 2;
      return (
        <>
          <div className="text-5xl mb-3">{c.emoji}</div>
          <Hook size={26}>{c.hook}</Hook>
          {st >= 1 && (
            <div className="w-full mt-6 flex flex-col gap-3">
              {c.choices.map((ch, i) => {
                const ok = i === c.answer; const mine = picked === i;
                let bg = "rgba(0,0,0,.4)", bd = i === 0 ? C.yellow : C.cyan;
                if (reveal && ok) { bg = "#1F8F5A"; bd = "#4BE39A"; }
                if (reveal && mine && !ok) { bg = "#8F1F3A"; bd = C.pink; }
                return (
                  <button key={i} onClick={(e) => pick(i, e)} className={`pin f-en rounded-2xl focus-ring ${reveal && mine && !ok ? "shake" : ""}`}
                    style={{ minHeight: 56, fontSize: 20, fontWeight: 800, color: C.ink, background: bg, border: `3px solid ${bd}`, animationDelay: `${i * 80}ms` }}>
                    {ch}{reveal && ok ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
          )}
          {reveal && (
            <div key="ans" className="pin mt-5">
              {picked !== null && <div className="f-dela" style={{ color: picked === c.answer ? "#4BE39A" : C.pink, fontSize: 22 }}>{picked === c.answer ? "正解！天才か" : "おしい！"}</div>}
              <div className="f-en mt-2" style={{ color: C.ink, fontSize: 19, fontWeight: 800 }}>{c.en}</div>
              <div className="f-maru text-sm mt-1" style={{ color: C.mute }}>{c.ja}</div>
            </div>
          )}
        </>
      );
    }
    case "aru":
      return (
        <>
          <div className={st === 0 ? "pin" : ""} style={{ fontSize: st === 0 ? 96 : 56 }}>{c.emoji}</div>
          <Hook size={st === 0 ? 30 : 22} color={C.ink}>{c.hook}</Hook>
          {st >= 1 && <div className="mt-6"><Big k="en" color={C.yellow}>{c.en}</Big></div>}
          {st >= 2 && <Sub k="ja">{c.ja}</Sub>}
        </>
      );
    case "rank": {
      const rows = [2, 1, 0];
      return (
        <>
          <Hook size={22}>{c.emoji} {c.hook}</Hook>
          <div className="w-full mt-6 flex flex-col gap-3">
            {rows.map((r, idx) => {
              const shown = st >= idx + 1; const first = r === 0;
              return (
                <div key={`${r}-${shown}`} className={`${shown ? "pin" : ""} flex items-center gap-3 rounded-2xl px-4`}
                  style={{ minHeight: 60, background: first && shown ? `${C.gold}33` : "rgba(0,0,0,.4)", border: `2px solid ${first && shown ? C.gold : "rgba(255,255,255,.15)"}` }}>
                  <div className="f-dela" style={{ fontSize: 24, color: first ? C.gold : C.ink, width: 44 }}>{first ? "👑" : `${r + 1}位`}</div>
                  {shown ? (
                    <div className="text-left">
                      <div className="f-en" style={{ fontSize: 22, fontWeight: 900, color: first ? C.gold : C.ink }}>{c.items[r][0]}</div>
                      <div className="f-maru text-sm" style={{ color: C.mute }}>{c.items[r][1]}</div>
                    </div>
                  ) : <div className="f-en" style={{ fontSize: 22, fontWeight: 900, color: C.mute }}>？？？</div>}
                </div>
              );
            })}
          </div>
        </>
      );
    }
    case "kata":
      return (
        <>
          <div className="text-6xl mb-3">{c.emoji}</div>
          <Hook size={24}>カタカナで言うと…</Hook>
          {st >= 1 && <div key="k" className="pin f-dela mt-4" style={{ fontSize: 40, color: C.ink, textDecoration: st >= 2 ? "line-through" : "none", textDecorationColor: C.pink }}>{c.kata}</div>}
          {st >= 2 && (
            <div key="r" className="pin mt-5">
              <div className="f-maru text-sm font-bold" style={{ color: C.cyan }}>ほんとはこう</div>
              <Big color={C.cyan} size={46}>{c.en}</Big>
            </div>
          )}
          {st >= 3 && <Sub k="n">{c.ja}　🐢 もう一回ゆっくり</Sub>}
        </>
      );
    case "kara": {
      const words = c.en.split(" ");
      const idx = st >= 1 ? Math.floor((elapsed - 1000) / 420) : -1;
      return (
        <>
          <div className="text-6xl mb-5">{c.emoji}</div>
          <div className="flex flex-wrap justify-center gap-2">
            {words.map((w, i) => (
              <span key={i} className="f-en rounded-lg px-2" style={{ fontSize: 30, fontWeight: 900, color: i <= idx ? "#000" : C.ink, background: i <= idx ? C.yellow : "transparent", transform: i === idx ? "scale(1.12)" : "none", transition: "transform .12s, background .12s" }}>{w}</span>
            ))}
          </div>
          {idx >= words.length - 1 && <Sub k="ja">{c.ja}</Sub>}
          {st >= 1 && idx >= words.length - 1 && <div key="t" className="pin f-maru text-sm mt-4" style={{ color: C.cyan }}>声に出したら、もう言える</div>}
        </>
      );
    }
    case "reward":
      return (
        <>
          <div className="f-maru font-bold" style={{ color: C.mute, fontSize: 16 }}>今日ふれた英語</div>
          <div className="pin f-dela" style={{ fontSize: 96, color: C.yellow, textShadow: `4px 4px 0 ${C.pink}` }}>{todayCount}</div>
          <div className="f-dela" style={{ fontSize: 26, color: C.ink }}>フレーズ</div>
          <div className="f-maru font-bold mt-8" style={{ color: C.cyan, fontSize: 17 }}>この調子で、次いこ 👆</div>
        </>
      );
    default: return null;
  }
}

/* ---------- feed order ---------- */
function useFeedGenerator() {
  const g = useRef({ n: 0, lastType: null, real: 0, lastWasReal: false });
  return (arr, k = 20) => {
    const out = [...arr];
    for (let i = 0; i < k; i++) {
      const s = g.current;
      if (s.real > 0 && s.real % 10 === 0 && s.lastWasReal) {
        out.push({ key: `k${s.n++}`, clip: { id: "reward", type: "reward", theme: 3 } }); s.lastWasReal = false; continue;
      }
      let cand, tries = 0;
      do { cand = CLIPS[Math.floor(Math.random() * CLIPS.length)]; tries++; } while (cand.type === s.lastType && tries < 30);
      out.push({ key: `k${s.n++}`, clip: cand }); s.lastType = cand.type; s.real++; s.lastWasReal = true;
    }
    return out;
  };
}

/* ---------- app ---------- */
export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [view, setView] = useState("feed");
  const [data, setData] = useState(EMPTY);
  const dataRef = useRef(EMPTY);
  const extend = useFeedGenerator();
  const [items, setItems] = useState(() => extend([], 20));
  const [activeIdx, setActiveIdx] = useState(0);
  const activeRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedPlay, setSavedPlay] = useState(null);
  const [savedPaused, setSavedPaused] = useState(false);
  const feedRef = useRef(null);
  const sessionRef = useRef(null);
  const viewRef = useRef(null);
  const saveTimer = useRef(null);
  const taps = useRef([]);
  const itemsRef = useRef(items);
  itemsRef.current = items; activeRef.current = activeIdx;

  // load
  useEffect(() => {
    (async () => {
      try {
        if (window.storage) {
          const r = await window.storage.get(STORE_KEY, false);
          if (r && r.value) { const d = { ...EMPTY, ...JSON.parse(r.value) }; dataRef.current = d; setData(d); }
        }
      } catch (e) { /* first visit */ }
    })();
  }, []);

  const saveNow = async () => {
    try { if (window.storage) await window.storage.set(STORE_KEY, JSON.stringify(dataRef.current), false); } catch (e) { console.error("storage error", e); }
  };
  const update = (fn) => {
    const nd = fn(dataRef.current); dataRef.current = nd; setData(nd);
    clearTimeout(saveTimer.current); saveTimer.current = setTimeout(saveNow, 600);
  };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const writeSession = () => {
    const s = sessionRef.current; if (!s) return;
    s.clips_viewed = s.views.filter((v) => v.type !== "reward").length;
    s.total_ms = s.views.reduce((a, v) => a + v.watched_ms, 0);
    const snap = { ...s, views: [...s.views] };
    update((d) => { const others = d.sessions.filter((x) => x.id !== s.id); return { ...d, sessions: [...others, snap].slice(-200) }; });
  };
  const finishView = () => {
    const v = viewRef.current; const s = sessionRef.current; if (!v || !s) return;
    const watched = Date.now() - v.start;
    if (v.type !== "reward") s.views.push({ id: uid(), clip_id: v.clip_id, type: v.type, started_at: new Date(v.start).toISOString(), watched_ms: watched, completed: watched >= getBeats(CLIP_BY_ID[v.clip_id]).dur, answered: v.answered || null });
    viewRef.current = null; writeSession();
  };
  const startView = (idx) => {
    const it = itemsRef.current[idx]; if (!it || !sessionRef.current) return;
    viewRef.current = { clip_id: it.clip.id, type: it.clip.type, start: Date.now(), answered: null };
  };
  const startSession = () => {
    sessionRef.current = { id: uid(), user_id: null, started_at: new Date().toISOString(), ended_at: null, views: [], clips_viewed: 0, total_ms: 0 };
  };
  const endSession = () => {
    if (!sessionRef.current) return;
    finishView(); sessionRef.current.ended_at = new Date().toISOString(); writeSession();
    clearTimeout(saveTimer.current); saveNow(); sessionRef.current = null; hush();
  };

  // view tracking on active change
  useEffect(() => {
    if (!unlocked) return;
    hush(); setPaused(false); finishView(); startView(activeIdx);
    if (activeIdx > items.length - 6) setItems((it) => extend(it, 20));
    // eslint-disable-next-line
  }, [activeIdx, unlocked]);

  // session open/close
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") endSession();
      else if (unlocked && !sessionRef.current) { startSession(); startView(activeRef.current); }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", endSession);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pagehide", endSession); };
    // eslint-disable-next-line
  }, [unlocked]);

  // observe slides
  useEffect(() => {
    if (!unlocked || view !== "feed" || !feedRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting && e.intersectionRatio >= 0.6) setActiveIdx(Number(e.target.dataset.idx)); });
    }, { root: feedRef.current, threshold: [0.6] });
    feedRef.current.querySelectorAll("[data-idx]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [unlocked, items.length]);

  const unlock = () => {
    initAudio();
    try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; window.speechSynthesis && window.speechSynthesis.speak(u); } catch (e) {}
    sfx("don"); startSession(); setUnlocked(true);
  };

  const todayCount = useMemo(() => {
    const t = ymd(Date.now());
    return data.sessions.filter((s) => ymd(s.started_at) === t).reduce((a, s) => a + (s.clips_viewed || 0), 0) + (viewRef.current && viewRef.current.type !== "reward" ? 1 : 0);
  }, [data, activeIdx]);

  const react = (clipId, patch) => update((d) => ({ ...d, reactions: { ...d.reactions, [clipId]: { liked: false, saved: false, ...d.reactions[clipId], ...patch, updated_at: new Date().toISOString() } } }));
  const onAnswer = (ok) => { if (viewRef.current) viewRef.current.answered = ok ? "correct" : "wrong"; };
  const share = async (c) => {
    const url = window.location.href;
    const text = `「${c.en || c.hook}」Scrollishで見つけた英語 #Scrollish`;
    if (navigator.share) { try { await navigator.share({ title: "Scrollish", text, url }); } catch (e) {} return; }
    try { await navigator.clipboard.writeText(`${text} ${url}`); flash("リンクをコピーしました"); } catch (e) { flash("コピーできませんでした"); }
  };
  const tapCounter = () => {
    const now = Date.now(); taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) { taps.current = []; setView("lab"); hush(); }
  };

  const savedClips = Object.entries(data.reactions).filter(([, r]) => r.saved).sort((a, b) => (b[1].updated_at || "").localeCompare(a[1].updated_at || "")).map(([id]) => CLIP_BY_ID[id]).filter(Boolean);

  return (
    <div className="w-full flex justify-center" style={{ height: "100dvh", background: "#000" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=M+PLUS+Rounded+1c:wght@500;700;800&family=Montserrat:wght@700;800;900&display=swap');
        .f-dela{font-family:'Dela Gothic One','M PLUS Rounded 1c',sans-serif}
        .f-maru{font-family:'M PLUS Rounded 1c',sans-serif}
        .f-en{font-family:'Montserrat','M PLUS Rounded 1c',sans-serif}
        @keyframes pin{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}}
        .pin{animation:pin .38s cubic-bezier(.2,.9,.3,1.3) both}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        .shake{animation:shake .3s ease both}
        .feed::-webkit-scrollbar{display:none}.feed{scrollbar-width:none}
        .focus-ring:focus-visible{outline:3px solid ${C.cyan};outline-offset:2px}
        @media (prefers-reduced-motion: reduce){.pin,.shake{animation:none}}
      `}</style>

      <div className="relative overflow-hidden" style={{ width: "min(100vw, calc(100dvh * 9 / 16))", height: "100%", background: C.bg }}>
        {!unlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-8" style={{ background: THEMES[0] }}>
            <div className="f-dela" style={{ fontSize: 52, color: C.ink, textShadow: `3px 3px 0 ${C.pink}, 6px 6px 0 ${C.cyan}` }}>Scrollish</div>
            <div className="f-maru font-bold mt-4" style={{ color: "#E6E6EE", fontSize: 17 }}>いつものスクロールで、英語にふれる。</div>
            <button onClick={unlock} className="f-maru font-bold rounded-full mt-10 flex items-center gap-2 px-8 focus-ring" style={{ minHeight: 56, background: C.pink, color: C.ink, fontSize: 18 }}>
              <Volume2 size={22} /> タップして音をON
            </button>
            <div className="f-maru text-sm mt-4" style={{ color: C.mute }}>音が出ます。電車ではイヤホンで</div>
          </div>
        )}

        {(
          <>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4" style={{ height: 56, background: "linear-gradient(180deg, rgba(0,0,0,.55), transparent)" }}>
              <div className="f-dela" style={{ color: C.ink, fontSize: 20, textShadow: `2px 2px 0 ${C.pink}` }}>Scrollish</div>
              <div className="flex items-center gap-2">
                <button onClick={tapCounter} className="f-maru font-bold text-sm rounded-full px-3 focus-ring" style={{ minHeight: 34, background: "rgba(0,0,0,.45)", color: C.yellow }}>今日 {todayCount}本</button>
                <button onClick={() => { hush(); setView("saved"); }} aria-label="保存した英語" className="flex items-center justify-center rounded-full focus-ring" style={{ width: 44, height: 44, background: "rgba(0,0,0,.45)" }}>
                  <Bookmark size={20} color={C.ink} />
                </button>
              </div>
            </div>
            <div ref={feedRef} className="feed w-full" style={{ height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory" }}>
              {items.map((it, i) => (
                <div key={it.key} data-idx={i} style={{ height: "100%" }}>
                  {Math.abs(i - activeIdx) <= 3 ? (
                    <Slide item={it} active={unlocked && view === "feed" && !savedPlay && i === activeIdx} paused={paused}
                      onTogglePause={() => { setPaused((p) => { if (!p) hush(); return !p; }); }}
                      reaction={data.reactions[it.clip.id]} onReact={(p) => react(it.clip.id, p)}
                      onAnswer={onAnswer} onShare={share} todayCount={todayCount} />
                  ) : <div style={{ height: "100%", scrollSnapAlign: "start", background: C.bg }} />}
                </div>
              ))}
            </div>
          </>
        )}

        {view === "saved" && (
          <div className="absolute inset-0 z-30 flex flex-col f-maru" style={{ background: C.bg, color: C.ink }}>
            <div className="flex items-center gap-2 px-2" style={{ height: 56 }}>
              <button onClick={() => setView("feed")} aria-label="フィードに戻る" className="flex items-center justify-center focus-ring rounded-full" style={{ width: 44, height: 44 }}><ArrowLeft size={22} color={C.ink} /></button>
              <div className="font-bold text-lg">保存した英語</div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {savedClips.length === 0 ? (
                <div className="text-center mt-24" style={{ color: C.mute }}>気になった英語は右の🔖で保存できるよ</div>
              ) : savedClips.map((c) => (
                <button key={c.id} onClick={() => { setSavedPaused(false); setSavedPlay(c); }} className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3 mb-2 focus-ring" style={{ background: C.panel, minHeight: 64 }}>
                  <div className="text-3xl">{c.emoji}</div>
                  <div>
                    <div className="f-en font-bold" style={{ fontSize: 17 }}>{c.type === "rank" ? c.items.map((x) => x[0]).join(" / ") : c.type === "word" ? c.en : c.en}</div>
                    <div className="text-sm" style={{ color: C.mute }}>{c.type === "rank" ? c.items.map((x) => x[1]).join("・") : c.ja}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "lab" && <Lab data={data} onBack={() => setView("feed")} onReset={() => { update(() => EMPTY); flash("データを消しました"); }} flash={flash} />}

        {savedPlay && (
          <div className="absolute inset-0 z-40">
            <Slide item={{ key: "sp", clip: savedPlay }} active paused={savedPaused} onTogglePause={() => setSavedPaused((p) => { if (!p) hush(); return !p; })}
              reaction={data.reactions[savedPlay.id]} onReact={(p) => react(savedPlay.id, p)} onAnswer={() => {}} onShare={share} todayCount={todayCount} />
            <button onClick={() => { hush(); setSavedPlay(null); }} aria-label="一覧に戻る" className="absolute flex items-center justify-center rounded-full focus-ring" style={{ top: 8, left: 8, width: 44, height: 44, background: "rgba(0,0,0,.5)" }}>
              <ArrowLeft size={22} color={C.ink} />
            </button>
          </div>
        )}

        {toast && (
          <div className="absolute z-50 left-0 right-0 flex justify-center pointer-events-none" style={{ top: 70 }}>
            <div className="f-maru font-bold text-sm rounded-full px-4 py-2" style={{ background: C.ink, color: C.bg }}>{toast}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- lab ---------- */
function Lab({ data, onBack, onReset, flash }) {
  const [confirm, setConfirm] = useState(false);
  const sessions = [...data.sessions].sort((a, b) => b.started_at.localeCompare(a.started_at));
  const views = data.sessions.flatMap((s) => s.views);
  const n = sessions.length;
  const avgClips = n ? (sessions.reduce((a, s) => a + (s.clips_viewed || 0), 0) / n).toFixed(1) : "0";
  const avgMin = n ? (sessions.reduce((a, s) => a + (s.total_ms || 0), 0) / n / 60000).toFixed(1) : "0";
  const byType = Object.keys(TYPE_META).filter((t) => t !== "reward").map((t) => {
    const vs = views.filter((v) => v.type === t);
    return { t, count: vs.length, avg: vs.length ? (vs.reduce((a, v) => a + v.watched_ms, 0) / vs.length / 1000).toFixed(1) : "-", done: vs.length ? Math.round((vs.filter((v) => v.completed).length / vs.length) * 100) : "-" };
  });
  const json = JSON.stringify(data, null, 2);
  const download = () => {
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([json], { type: "application/json" })); a.download = `scrollish-lab-${ymd(Date.now())}.json`; a.click(); } catch (e) { flash("ダウンロードできませんでした"); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(json); flash("JSONをコピーしました"); } catch (e) { flash("コピーできませんでした"); } };
  const cell = { padding: "8px 6px", borderBottom: "1px solid #2A2A33" };

  return (
    <div className="absolute inset-0 z-30 flex flex-col f-maru" style={{ background: C.bg, color: C.ink }}>
      <div className="flex items-center gap-2 px-2" style={{ height: 56 }}>
        <button onClick={onBack} aria-label="フィードに戻る" className="flex items-center justify-center rounded-full focus-ring" style={{ width: 44, height: 44 }}><ArrowLeft size={22} color={C.ink} /></button>
        <div className="font-bold text-lg">/lab 検証用</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8 text-sm">
        <div className="grid grid-cols-3 gap-2">
          {[["開いた回数", n], ["平均本数／回", avgClips], ["平均分数／回", avgMin]].map(([l, v]) => (
            <div key={l} className="rounded-xl px-3 py-3" style={{ background: C.panel }}>
              <div style={{ color: C.mute }}>{l}</div>
              <div className="f-en" style={{ fontSize: 24, fontWeight: 900, color: C.yellow }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="font-bold mt-6 mb-2">形式ごとの見られ方</div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead><tr style={{ color: C.mute, textAlign: "left" }}><th style={cell}>形式</th><th style={cell}>回数</th><th style={cell}>平均秒</th><th style={cell}>最後まで</th></tr></thead>
          <tbody>{byType.map((r) => (
            <tr key={r.t}><td style={cell}>{TYPE_META[r.t].label}</td><td style={cell}>{r.count}</td><td style={cell}>{r.avg}</td><td style={cell}>{r.done === "-" ? "-" : `${r.done}%`}</td></tr>
          ))}</tbody>
        </table>

        <div className="font-bold mt-6 mb-2">開いた回ごとの記録（新しい順）</div>
        {sessions.length === 0 && <div style={{ color: C.mute }}>まだ記録がありません。フィードを見ると、閉じたときに記録されます。</div>}
        {sessions.slice(0, 30).map((s) => {
          const last = s.views[s.views.length - 1];
          return (
            <div key={s.id} className="rounded-xl px-3 py-2 mb-2" style={{ background: C.panel }}>
              <div style={{ color: C.mute }}>{new Date(s.started_at).toLocaleString("ja-JP")}{s.ended_at ? "" : "（視聴中）"}</div>
              <div>{s.clips_viewed || 0}本・{((s.total_ms || 0) / 60000).toFixed(1)}分・最後に見た形式：{last ? TYPE_META[last.type].label : "-"}</div>
            </div>
          );
        })}

        <div className="flex flex-col gap-2 mt-6">
          <button onClick={download} className="flex items-center justify-center gap-2 rounded-xl font-bold focus-ring" style={{ minHeight: 48, background: C.cyan, color: "#000" }}><Download size={18} /> JSONをダウンロード</button>
          <button onClick={copy} className="flex items-center justify-center gap-2 rounded-xl font-bold focus-ring" style={{ minHeight: 48, background: C.panel, color: C.ink }}><Copy size={18} /> JSONをコピー</button>
          <button onClick={() => { if (confirm) { onReset(); setConfirm(false); } else setConfirm(true); }} className="flex items-center justify-center gap-2 rounded-xl font-bold focus-ring" style={{ minHeight: 48, background: confirm ? C.pink : "transparent", color: C.ink, border: `1px solid ${C.pink}` }}>
            <Trash2 size={18} /> {confirm ? "もう一度押すと全データを消します" : "記録を消す"}
          </button>
        </div>
      </div>
    </div>
  );
}
