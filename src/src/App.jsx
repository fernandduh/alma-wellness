import { useState, useEffect, useRef, useCallback } from "react";

const TEAL = "#1D9E75";
const TEAL_LIGHT = "#E1F5EE";
const TEAL_DARK = "#085041";
const PINK = "#D4537E";
const PINK_LIGHT = "#FBEAF0";
const BLUE = "#378ADD";
const BLUE_LIGHT = "#E6F1FB";
const AMBER = "#BA7517";
const AMBER_LIGHT = "#FAEEDA";

const PROFILE = {
  startWeight: 234,
  startDate: "2025-10-06",
  goalWeight: 165,
  calories: 1550,
  protein: 130,
  carbs: 140,
  fat: 55,
  streakStart: "2025-10-06",
};

const PHASE_INFO = {
  menstrual: {
    label: "Menstrual", days: "Days 1–5",
    color: PINK, light: PINK_LIGHT, textColor: "#72243E",
    tips: ["Rest is productive — honor low energy, gentle walks over intense sets.", "Iron-rich foods help: spinach, lentils, lean red meat, pumpkin seeds.", "Magnesium eases cramps — dark chocolate, avocado, almonds.", "Hydrate extra. Mounjaro + menstruation = easy to under-drink."],
  },
  follicular: {
    label: "Follicular", days: "Days 6–13",
    color: BLUE, light: BLUE_LIGHT, textColor: "#0C447C",
    tips: ["Energy is rising — great time to push harder on Studio Era workouts.", "Estrogen supports muscle building. Slightly higher carbs are well-used now.", "Good window to try new healthy recipes or social movement.", "Mood tends to be upbeat — use this energy for hard conversations or planning."],
  },
  ovulatory: {
    label: "Ovulatory", days: "Days 14–16",
    color: TEAL, light: TEAL_LIGHT, textColor: TEAL_DARK,
    tips: ["Peak strength and energy — best days for your hardest sessions.", "Protein is especially important now to support muscle repair.", "You may feel less hungry (common with ovulation) — still hit that protein target.", "Great time for social connection — energy and mood are at their highest."],
  },
  luteal: {
    label: "Luteal", days: "Days 17–26",
    color: AMBER, light: AMBER_LIGHT, textColor: "#633806",
    tips: ["Cravings increase due to progesterone. Prioritize protein + fiber to stay full.", "Scale may show water retention — not fat. Don't stress the number.", "Wind down workout intensity. Strength is fine, ease up on max effort.", "Sleep support: magnesium glycinate before bed, limit screens after 9pm."],
  },
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getPhase(lastPeriodDate, cycleLen = 26) {
  const start = new Date(lastPeriodDate);
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const day = (diff % cycleLen) + 1;
  if (day <= 5) return { key: "menstrual", day };
  if (day <= 13) return { key: "follicular", day };
  if (day <= 16) return { key: "ovulatory", day };
  return { key: "luteal", day };
}

function getNextPeriod(lastPeriodDate, cycleLen = 26) {
  const start = new Date(lastPeriodDate);
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const daysLeft = cycleLen - (diff % cycleLen);
  const next = new Date(today);
  next.setDate(next.getDate() + daysLeft);
  return next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calcStreak() {
  return Math.floor((new Date() - new Date(PROFILE.streakStart)) / (1000 * 60 * 60 * 24));
}

function streakMsg(d) {
  if (d < 30) return "Every day is a win.";
  if (d < 60) return "Over a month. Your body thanks you.";
  if (d < 90) return "Nearly 2 months. This is you now.";
  if (d < 180) return "You've rewritten the script.";
  if (d < 365) return "Over half a year. Identity shift.";
  return "A full year. This is just your life.";
}

const DEFAULT_WEIGHTS = [
  { date: "2025-10-06", w: 234 }, { date: "2025-11-01", w: 226 },
  { date: "2025-12-01", w: 218 }, { date: "2026-01-01", w: 210 },
  { date: "2026-02-01", w: 203 }, { date: "2026-03-01", w: 197 },
  { date: "2026-04-01", w: 193 }, { date: "2026-04-17", w: 190 },
];

function WeightChart({ weights }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    const labels = weights.map(d => new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
    chartRef.current = new window.Chart(canvasRef.current, {
      type: "line",
      data: { labels, datasets: [
        { label: "Weight", data: weights.map(d => d.w), borderColor: TEAL, backgroundColor: "rgba(29,158,117,0.07)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: TEAL, borderWidth: 2 },
        { label: "Goal", data: weights.map(() => 165), borderColor: "#9FE1CB", borderDash: [5,4], borderWidth: 1.5, pointRadius: 0, fill: false },
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { min: 155, max: 240, ticks: { color: "#bbb", font: { size: 10 }, stepSize: 20 }, grid: { color: "rgba(0,0,0,0.05)" } }, x: { ticks: { color: "#bbb", font: { size: 10 }, maxRotation: 30, autoSkip: true }, grid: { display: false } } } },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [weights]);
  return <canvas ref={canvasRef} role="img" aria-label="Weight loss journey" style={{ width: "100%", height: "100%" }} />;
}

function CycleWheel({ phaseKey, day }) {
  const phases = [
    { key: "menstrual", label: "Period", days: 5, color: PINK, textColor: "#72243E" },
    { key: "follicular", label: "Follicular", days: 8, color: BLUE, textColor: "#0C447C" },
    { key: "ovulatory", label: "Ovulatory", days: 3, color: TEAL, textColor: TEAL_DARK },
    { key: "luteal", label: "Luteal", days: 10, color: AMBER, textColor: "#633806" },
  ];
  const cx = 100, cy = 100, r = 80, inner = 46;
  let angle = -Math.PI / 2;
  const paths = phases.map(p => {
    const sweep = (p.days / 26) * 2 * Math.PI;
    const endAngle = angle + sweep;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + inner * Math.cos(angle), iy1 = cy + inner * Math.sin(angle);
    const ix2 = cx + inner * Math.cos(endAngle), iy2 = cy + inner * Math.sin(endAngle);
    const large = sweep > Math.PI ? 1 : 0;
    const mid = angle + sweep / 2;
    const lx = cx + ((r + inner) / 2) * Math.cos(mid) * 1.08;
    const ly = cy + ((r + inner) / 2) * Math.sin(mid) * 1.08;
    const isActive = p.key === phaseKey;
    const d = `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${ix2.toFixed(1)},${iy2.toFixed(1)} A${inner},${inner} 0 ${large},0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z`;
    angle = endAngle;
    return { d, color: p.color, textColor: p.textColor, label: p.label, lx, ly, isActive, sweep };
  });
  const info = PHASE_INFO[phaseKey];
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" style={{ display: "block", margin: "0 auto" }}>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} fill={p.color} opacity={p.isActive ? 1 : 0.35} stroke="white" strokeWidth="2" />
          {p.sweep > 0.5 && <text x={p.lx.toFixed(1)} y={p.ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight={p.isActive ? "600" : "400"} fill={p.textColor} opacity={p.isActive ? 1 : 0.5}>{p.label}</text>}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={inner} fill="white" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="13" fontWeight="600" fill={info.color}>{info.label}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="#888">Day {day}</text>
    </svg>
  );
}

function MacroBar({ label, value, target, color }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "#888", width: 60 }}>{label}</div>
      <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, width: 64, textAlign: "right", color: "#333" }}>{Math.round(value)} / {target}</div>
    </div>
  );
}
export default function Alma() {
  const [tab, setTab] = useState("dashboard");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [periods, setPeriods] = useState(["2026-04-15"]);
  const [meals, setMeals] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [periodInput, setPeriodInput] = useState("");
  const [mealInput, setMealInput] = useState("");
  const [mealLoading, setMealLoading] = useState(false);
  const [mealFeedback, setMealFeedback] = useState("");
  const [chatMode, setChatMode] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySet, setKeySet] = useState(false);
  const [saveStatus, setSaveStatus] = useState("ready");
  const [chartLoaded, setChartLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const todayMeals = meals.filter(m => m.date === todayStr());
  const todayMacros = todayMeals.reduce(
    (acc, m) => ({ cal: acc.cal + m.cal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => setChartLoaded(true);
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("alma_weights");
    if (saved) setWeights(JSON.parse(saved));
    const savedP = localStorage.getItem("alma_periods");
    if (savedP) setPeriods(JSON.parse(savedP));
    const savedM = localStorage.getItem("alma_meals");
    if (savedM) {
      const all = JSON.parse(savedM);
      setMeals(all.filter(m => m.date === todayStr()));
    }
    const savedKey = localStorage.getItem("alma_api_key");
    if (savedKey) { setApiKey(savedKey); setKeySet(true); }
  }, []);

  useEffect(() => {
    const opener = {
      chat: "What's on your mind today? Ask me anything — nutrition, workouts, cycle, mindset, all of it.",
      morning: "Good morning, Fernanda! On a scale of 1–5, how did you sleep last night?",
      evening: "Hey! Let's close out the day. Did you get any movement in today?",
    }[chatMode];
    setMessages([{ from: "alma", text: opener }]);
    setChatHistory([{ role: "assistant", content: opener }]);
  }, [chatMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentWeight = weights.length ? weights[weights.length - 1].w : 190;
  const lastPeriod = periods.length ? periods[periods.length - 1] : "2026-04-15";
  const phase = getPhase(lastPeriod);
  const phaseInfo = PHASE_INFO[phase.key];
  const streak = calcStreak();
  const lostLbs = (234 - currentWeight).toFixed(1);
  const toGoal = (currentWeight - 165).toFixed(1);
  const pctDone = Math.round(((234 - currentWeight) / (234 - 165)) * 100);

  function saveWeights(w) {
    localStorage.setItem("alma_weights", JSON.stringify(w));
    setSaveStatus("saved");
  }
  function savePeriods(p) {
    localStorage.setItem("alma_periods", JSON.stringify(p));
    setSaveStatus("saved");
  }
  function saveMeals(newMeals) {
    const stored = localStorage.getItem("alma_meals");
    let all = stored ? JSON.parse(stored) : [];
    all = all.filter(m => m.date !== todayStr()).concat(newMeals);
    localStorage.setItem("alma_meals", JSON.stringify(all));
    setSaveStatus("saved");
  }

  function logWeight() {
    const val = parseFloat(weightInput);
    if (!val || val < 100 || val > 350) return;
    const updated = [...weights.filter(w => w.date !== todayStr()), { date: todayStr(), w: val }].sort((a, b) => a.date.localeCompare(b.date));
    setWeights(updated);
    setWeightInput("");
    saveWeights(updated);
  }

  function logPeriod() {
    if (!periodInput) return;
    const updated = [...new Set([...periods, periodInput])].sort();
    setPeriods(updated);
    setPeriodInput("");
    savePeriods(updated);
  }

  function deletePeriod(d) {
    const updated = periods.filter(p => p !== d);
    setPeriods(updated);
    savePeriods(updated);
  }

  async function logMeal() {
    const desc = mealInput.trim();
    if (!desc || !keySet) return;
    setMealInput("");
    setMealLoading(true);
    setMealFeedback("Estimating macros...");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 200,
          system: "You are a nutrition expert. Return ONLY a JSON object with keys: cal, protein, carbs, fat (all numbers). No markdown, no preamble.",
          messages: [{ role: "user", content: "Estimate macros for: " + desc }],
        }),
      });
      const data = await res.json();
      const text = (data.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim();
      const macros = JSON.parse(text);
      const meal = { date: todayStr(), desc, cal: macros.cal || 0, protein: macros.protein || 0, carbs: macros.carbs || 0, fat: macros.fat || 0 };
      const updated = [...meals, meal];
      setMeals(updated);
      saveMeals(updated);
      setMealFeedback(`${meal.cal} cal · ${meal.protein}g protein · ${meal.carbs}g carbs · ${meal.fat}g fat`);
      setTimeout(() => setMealFeedback(""), 4000);
    } catch {
      setMealFeedback("Could not estimate — check your API key.");
    }
    setMealLoading(false);
  }

  const systemPrompt = useCallback(() =>
    `You are Alma, a warm, direct, knowledgeable personal wellness coach. You coach Fernanda — 37 years old, 5'7", currently ${currentWeight} lbs (down from 234 lbs since Oct 6 2025), goal weight 165 lbs. On Mounjaro 5mg weekly. Does 2-3 home strength workouts/week (Studio Era app) + 1-2 x 2-mile walks. Lightly active. Alcohol-free for ${streak} days since Oct 6 2025.
Daily targets: ~1,550 cal, 130g protein, 140g carbs, 55g fat.
Current cycle phase: ${phaseInfo.label} (day ${phase.day} of 26-day cycle). Tailor advice to this phase when relevant.
Today's nutrition so far: ${Math.round(todayMacros.cal)} cal, ${Math.round(todayMacros.protein)}g protein.
Today's meals: ${todayMeals.map(m => m.desc).join(", ") || "none logged yet"}.
Approach: steady, sustainable fat loss — lifestyle and mindset change. No rush.
Persona: warm, direct, no-fluff. Like a brilliant friend who is a wellness expert. Never preachy. Always actionable. Keep responses to 2-5 sentences unless doing a structured check-in.`,
  [currentWeight, streak, phase, phaseInfo, todayMacros, todayMeals]);

  async function sendMsg() {
    const text = chatInput.trim();
    if (!text || chatLoading || !keySet) return;
    setChatInput("");
    setMessages(prev => [...prev, { from: "user", text }]);
    const newHistory = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt(), messages: newHistory }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Try again in a moment.";
      setMessages(prev => [...prev, { from: "alma", text: reply }]);
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { from: "alma", text: "Something went wrong — try again." }]);
    }
    setChatLoading(false);
  }

  const s = {
    app: { fontFamily: "'DM Sans', sans-serif", background: "#fafaf9", minHeight: "100vh", display: "flex", flexDirection: "column" },
    topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "white", borderBottom: "1px solid #f0f0ee" },
    logoCircle: { width: 34, height: 34, borderRadius: "50%", background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: TEAL_DARK },
    appName: { fontSize: 17, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" },
    appSub: { fontSize: 11, color: "#aaa", marginTop: 1 },
    badge: { fontSize: 11, padding: "3px 9px", background: TEAL_LIGHT, color: TEAL_DARK, borderRadius: 20, fontWeight: 500 },
    tabs: { display: "flex", background: "white", borderBottom: "1px solid #f0f0ee" },
    tab: (active) => ({ flex: 1, padding: "10px 4px", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? TEAL : "#999", border: "none", borderBottom: active ? `2px solid ${TEAL}` : "2px solid transparent", background: "transparent", cursor: "pointer" }),
    panel: { padding: 14, flex: 1 },
    card: { background: "white", border: "1px solid #f0f0ee", borderRadius: 14, padding: "14px 16px", marginBottom: 12 },
    cardLabel: { fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontWeight: 600 },
    cardValue: { fontSize: 26, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" },
    cardSub: { fontSize: 12, color: "#aaa", marginTop: 3 },
    cardAccent: { fontSize: 12, fontWeight: 600, marginTop: 5, color: TEAL },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, marginBottom: 12 },
    input: { flex: 1, fontSize: 14, padding: "9px 12px", borderRadius: 10, border: "1px solid #eee", background: "white", color: "#1a1a1a", outline: "none" },
    btnTeal: { fontSize: 13, padding: "9px 16px", borderRadius: 10, border: "none", background: TEAL, color: "white", cursor: "pointer", fontWeight: 600 },
    btnGhost: (active) => ({ padding: "6px 14px", borderRadius: 20, fontSize: 12, border: `1px solid ${active ? TEAL : "#eee"}`, background: active ? TEAL_LIGHT : "transparent", color: active ? TEAL_DARK : "#999", cursor: "pointer", fontWeight: active ? 600 : 400 }),
    phaseBadge: { display: "inline-block", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: phaseInfo.light, color: phaseInfo.textColor },
    bubble: (from) => ({ padding: "10px 14px", borderRadius: from === "alma" ? "4px 14px 14px 14px" : "14px 4px 14px 14px", fontSize: 14, lineHeight: 1.6, maxWidth: "84%", background: from === "alma" ? "white" : TEAL_LIGHT, color: from === "alma" ? "#1a1a1a" : TEAL_DARK, border: from === "alma" ? "1px solid #f0f0ee" : "none" }),
    av: (from) => ({ width: 28, height: 28, borderRadius: "50%", background: from === "alma" ? TEAL_LIGHT : "#f0f0ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: from === "alma" ? TEAL_DARK : "#888", flexShrink: 0 }),
  };

  if (!keySet) {
    return (
      <div style={{ ...s.app, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ ...s.card, maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ ...s.logoCircle, margin: "0 auto 16px" }}>A</div>
          <div style={{ ...s.appName, marginBottom: 6 }}>Welcome to Alma</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>Enter your Anthropic API key to get started. It's stored only on your device.</div>
          <input style={{ ...s.input, marginBottom: 10, width: "100%" }} type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && apiKey.startsWith("sk-")) { localStorage.setItem("alma_api_key", apiKey); setKeySet(true); }}} />
          <button style={{ ...s.btnTeal, width: "100%" }} onClick={() => { if (apiKey.startsWith("sk-")) { localStorage.setItem("alma_api_key", apiKey); setKeySet(true); } }}>Start</button>
          <div style={{ fontSize: 11, color: "#ccc", marginTop: 12 }}>Get your key at console.anthropic.com</div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={s.logoCircle}>A</div>
          <div><div style={s.appName}>Alma</div><div style={s.appSub}>your wellness coach</div></div>
        </div>
        <span style={s.badge}>{saveStatus}</span>
      </div>

      <div style={s.tabs}>
        {["dashboard","cycle","nutrition","chat"].map((t, i) => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {["Home","Cycle","Nutrition","Alma"][i]}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div style={s.panel}>
          <div style={s.grid3}>
            <div style={s.card}><div style={s.cardLabel}>Lost</div><div style={s.cardValue}>{lostLbs}<span style={{ fontSize: 14, fontWeight: 500, color: "#aaa" }}>lbs</span></div><div style={s.cardAccent}>{pctDone}% to goal</div></div>
            <div style={s.card}><div style={s.cardLabel}>Current</div><div style={s.cardValue}>{currentWeight}<span style={{ fontSize: 14, fontWeight: 500, color: "#aaa" }}>lbs</span></div><div style={s.cardSub}>{toGoal} to go</div></div>
            <div style={s.card}><div style={s.cardLabel}>Sober</div><div style={s.cardValue}>{streak}<span style={{ fontSize: 14, fontWeight: 500, color: "#aaa" }}>d</span></div><div style={s.cardAccent}>{streakMsg(streak)}</div></div>
          </div>
          <div style={{ ...s.card, marginBottom: 12 }}>
            <div style={s.cardLabel}>Weight journey</div>
            <div style={{ height: 150, marginTop: 8 }}>{chartLoaded && <WeightChart weights={weights} />}</div>
          </div>
          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardLabel}>Log weight</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input style={{ ...s.input, width: 80, flex: "none" }} type="number" placeholder="lbs" value={weightInput} onChange={e => setWeightInput(e.target.value)} onKeyDown={e => e.key === "Enter" && logWeight()} min="100" max="350" step="0.1" />
                <button style={s.btnTeal} onClick={logWeight}>Log</button>
              </div>
            </div>
            <div style={s.card}><div style={s.cardLabel}>Cycle phase</div><div style={{ marginTop: 6 }}><span style={s.phaseBadge}>{phaseInfo.label}</span></div><div style={s.cardSub}>Day {phase.day} of cycle</div></div>
          </div>
        </div>
      )}

      {tab === "cycle" && (
        <div style={s.panel}>
          <div style={s.grid2}>
            <div style={s.card}><div style={s.cardLabel}>Phase</div><span style={s.phaseBadge}>{phaseInfo.label}</span><div style={s.cardSub}>{phaseInfo.days} · Day {phase.day}</div></div>
            <div style={s.card}><div style={s.cardLabel}>Next period</div><div style={{ ...s.cardValue, fontSize: 20 }}>{getNextPeriod(lastPeriod)}</div><div style={s.cardSub}>est. 26-day cycle</div></div>
          </div>
          <div style={{ ...s.card, marginBottom: 12 }}><CycleWheel phaseKey={phase.key} day={phase.day} /></div>
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>{phaseInfo.label} phase tips</div>
            {phaseInfo.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#444", lineHeight: 1.5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: phaseInfo.color, marginTop: 6, flexShrink: 0 }} /><div>{tip}</div>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Log period start</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input style={s.input} type="date" value={periodInput} onChange={e => setPeriodInput(e.target.value)} />
              <button style={s.btnTeal} onClick={logPeriod}>Log</button>
            </div>
            {[...periods].reverse().slice(0, 6).map(d => (
              <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f3", fontSize: 13 }}>
                <span>{new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <button onClick={() => deletePeriod(d)} style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer" }}>remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "nutrition" && (
        <div style={s.panel}>
          <div style={s.card}>
            <div style={s.cardLabel}>Daily targets</div>
            <div style={{ marginTop: 8 }}>
              <MacroBar label="Protein" value={todayMacros.protein} target={PROFILE.protein} color={TEAL} />
              <MacroBar label="Carbs" value={todayMacros.carbs} target={PROFILE.carbs} color={BLUE} />
              <MacroBar label="Fat" value={todayMacros.fat} target={PROFILE.fat} color={AMBER} />
              <MacroBar label="Calories" value={todayMacros.cal} target={PROFILE.calories} color={PINK} />
            </div>
          </div>
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Log a meal</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={s.input} type="text" placeholder="e.g. 2 eggs, turkey sausage, black coffee" value={mealInput} onChange={e => setMealInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !mealLoading && logMeal()} />
              <button style={s.btnTeal} onClick={logMeal} disabled={mealLoading}>{mealLoading ? "..." : "Add"}</button>
            </div>
            {mealFeedback && <div style={{ fontSize: 12, color: TEAL_DARK, marginTop: 6, fontWeight: 500 }}>{mealFeedback}</div>}
          </div>
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Today's log</div>
            {todayMeals.length === 0
              ? <div style={{ fontSize: 13, color: "#ccc", textAlign: "center", padding: "16px 0" }}>Nothing logged yet</div>
              : todayMeals.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f3", fontSize: 13 }}>
                  <span style={{ color: "#444" }}>{m.desc}</span>
                  <span style={{ color: "#bbb", fontSize: 12 }}>{m.cal} cal · {m.protein}g</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {tab === "chat" && (
        <div style={{ ...s.panel, display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", padding: "12px 14px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {["chat","morning","evening"].map(m => (
              <button key={m} style={s.btnGhost(chatMode === m)} onClick={() => setChatMode(m)}>
                {m === "chat" ? "Free chat" : m === "morning" ? "Morning" : "Evening"}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.from === "user" ? "row-reverse" : "row" }}>
                <div style={s.av(msg.from)}>{msg.from === "user" ? "F" : "A"}</div>
                <div style={s.bubble(msg.from)}>{msg.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={s.av("alma")}>A</div>
                <div style={{ ...s.bubble("alma"), display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: TEAL, animation: `blink 1.2s ${d}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid #f0f0ee" }}>
            <input style={s.input} type="text" placeholder="Ask Alma anything..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
            <button style={s.btnTeal} onClick={sendMsg} disabled={chatLoading}>Send</button>
          </div>
        </div>
      )}
      <style>{`@keyframes blink{0%,80%,100%{opacity:0.2}40%{opacity:1}}`}</style>
    </div>
  );
}
