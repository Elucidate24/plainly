import { useState, useEffect, useRef, memo } from "react";
import { createClient } from "@supabase/supabase-js";

const APP_NAME = "Plainly";
const APP_TAGLINE = "Understand anything you sign";
const PRO_PRICE = "4.99";
const FREE_LIMIT = 1;
const DISCLAIMER = "Plainly provides information, not legal advice. Always consult a qualified lawyer for important decisions.";



const ONBOARDING = [
  { title: "Welcome to Plainly", body: "Paste any legal document and get a plain English breakdown in seconds.", icon: "👋" },
  { title: "We flag the risks", body: "Red flags highlighted automatically before you sign anything.", icon: "🚩" },
  { title: "Your privacy is protected", body: "We never store your documents. Everything disappears when you close the app.", icon: "🔒" },
];

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_SUPABASE_ANON_KEY || ""
);

function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isDesktop;
}

const scoreColor = (s) => s >= 7 ? "#C9A84C" : s >= 4 ? "#C4973D" : "#C0504A";
const scoreContext = (s) => {
  if (s >= 9) return { label: "Excellent", desc: "This is a well balanced and fair contract. Safe to sign." };
  if (s >= 7) return { label: "Good", desc: "Generally fair with a few things worth noting. Minor adjustments may help." };
  if (s >= 5) return { label: "Average", desc: "A typical contract. Some clauses favour the other party but this is common. Review the red flags before signing." };
  if (s >= 3) return { label: "Below average", desc: "This contract has notable issues that could affect you. Negotiate before signing." };
  return { label: "High risk", desc: "This contract strongly favours the other party. Several clauses are unusual or potentially harmful." };
};
const sevColor = (s) => s === "high" ? "#C0504A" : s === "medium" ? "#C4973D" : "#2563EB";

const C = {
  bg: "#F8F6F2",
  header: "#1E1E1E",
  accent: "#C9A84C",
  accentLight: "#F5EDD6",
  accentDark: "#A07830",
  success: "#4A7A5A",
  warning: "#C4973D",
  danger: "#C0504A",
  text: "#1A1814",
  sub: "#6B6458",
  muted: "#A8A098",
  border: "#E4DED4",
  light: "#F0ECE4",
  surface: "#FFFFFF",
};

const cardStyle = { background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "16px", marginBottom: "12px" };
const labelStyle = { fontSize: "11px", fontWeight: "600", color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" };
const inputCss = { width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${C.border}`, fontSize: "15px", fontFamily: "inherit", color: C.text, background: C.surface, outline: "none", boxSizing: "border-box" };
const errCss = { background: "#FAF0EF", border: "1px solid #E8C0BE", borderRadius: "8px", padding: "12px 16px", color: C.danger, fontSize: "14px", marginBottom: "12px", lineHeight: "1.5" };

function btnStyle(variant, disabled) {
  return {
    width: "100%", padding: "14px", borderRadius: "8px",
    border: variant === "secondary" ? `0.5px solid ${C.border}` : "none",
    fontSize: "16px", fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    background: variant === "primary" ? C.accent : "transparent",
    color: variant === "primary" ? "#1A1814" : C.text,
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none"
  };
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #E8D4A0", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: "15px", color: C.sub, margin: "0 0 4px" }}>{label || "Analysing..."}</p>
      <p style={{ fontSize: "12px", color: "#8A8585", margin: 0 }}>Usually 10 to 15 seconds</p>
    </div>
  );
}

function ErrBox({ message, onRetry }) {
  return (
    <div style={errCss}>
      <strong style={{ display: "block", marginBottom: "4px" }}>Something went wrong</strong>
      {message}
      {onRetry && <button onClick={onRetry} style={{ marginTop: "8px", background: "none", border: "none", color: C.danger, fontWeight: "600", cursor: "pointer", padding: 0, fontSize: "14px" }}>Try again</button>}
    </div>
  );
}

function ScoreRing({ score }) {
  const color = scoreColor(score);
  const size = 90; const stroke = 7; const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E4E0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+2} textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="700" fill={color}>{score}</text>
      <text x={size/2} y={size/2+20} textAnchor="middle" fontSize="10" fill="#8A8585">/10</text>
    </svg>
  );
}

function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const cur = ONBOARDING[step];
  const isLast = step === ONBOARDING.length - 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "40px 24px", justifyContent: "space-between", minHeight: "480px" }}>
      <div />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>{cur.icon}</div>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, marginBottom: "12px" }}>{cur.title}</h2>
        <p style={{ fontSize: "17px", color: C.sub, lineHeight: "1.6", margin: 0 }}>{cur.body}</p>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "28px" }}>
          {ONBOARDING.map((_, i) => (
            <div key={i} style={{ width: i === step ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === step ? C.accent : C.border }} />
          ))}
        </div>
        <button onClick={() => isLast ? onFinish() : setStep(s => s + 1)} style={btnStyle("primary", false)}>
          {isLast ? "Start analysing" : "Next"}
        </button>
        {!isLast && <button onClick={onFinish} style={{ ...btnStyle("secondary", false), marginTop: "10px", fontSize: "14px" }}>Skip</button>}
      </div>
    </div>
  );
}

function Landing({ onSignUp, onLogin, onSample, onAbout }) {
  return (
    <div>
      <div style={{ background: C.header, padding: "24px 20px 20px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: "0 0 4px" }}>{APP_NAME}</h1>
        <p style={{ color: C.accent, fontSize: "13px", margin: 0, fontWeight: "500" }}>{APP_TAGLINE}</p>
      </div>
      <div style={{ padding: "28px 20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, lineHeight: "1.2", marginBottom: "12px" }}>Stop signing things you do not understand.</h2>
        <p style={{ fontSize: "15px", color: C.sub, lineHeight: "1.6", marginBottom: "28px" }}>Paste any legal document. Get a plain English breakdown with risk warnings in seconds.</p>

        {[
          { icon: "🔍", title: "Plain English summary", desc: "Legal jargon translated instantly" },
          { icon: "🚩", title: "Red flag detection", desc: "Risky clauses highlighted with worst case scenarios" },
          { icon: "⚖️", title: "Industry comparison", desc: "See exactly how restrictive each clause is versus market standard" },
          { icon: "🔒", title: "Complete privacy", desc: "Your documents are never stored. Analysed and immediately forgotten." },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
            <div style={{ fontSize: "22px", flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: C.text, marginBottom: "2px" }}>{f.title}</div>
              <div style={{ fontSize: "13px", color: C.sub }}>{f.desc}</div>
            </div>
          </div>
        ))}

        {/* Trust section */}
        <div style={{ background: C.light, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "16px" }}>What happens when you paste a document</div>
          {[
            { step: "1", icon: "📄", title: "You paste your document", desc: "The text goes directly to our analysis engine. It never touches a database." },
            { step: "2", icon: "🤖", title: "AI analyses it in seconds", desc: "Our system reads every clause and generates your breakdown." },
            { step: "3", icon: "🗑️", title: "Document is immediately forgotten", desc: "The moment your results appear, the document is gone. Permanently. We have no record it ever existed." },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", marginBottom: i < 2 ? "16px" : 0, alignItems: "flex-start" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, marginBottom: "2px" }}>{s.icon} {s.title}</div>
                <div style={{ fontSize: "12px", color: C.sub, lineHeight: "1.5" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#F5EDD6", border: `1px solid #E8D4A0`, borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
          <div style={{ fontWeight: "600", fontSize: "14px", color: "#8A6828", marginBottom: "6px" }}>See a real example</div>
          <p style={{ fontSize: "13px", color: "#6A5020", margin: "0 0 12px", lineHeight: "1.5" }}>See how Plainly analyses a freelance contract. No account needed.</p>
          <button onClick={onSample} style={{ ...btnStyle("primary", false), background: "#8A6828", padding: "10px", fontSize: "14px" }}>View sample analysis</button>
        </div>

        <button onClick={onSignUp} style={{ ...btnStyle("primary", false), marginBottom: "10px" }}>Get started free</button>
        <button onClick={onLogin} style={{ ...btnStyle("secondary", false), marginBottom: "10px" }}>Sign in</button>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "20px" }}>
          <button onClick={onAbout} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", fontWeight: "500" }}>About</button>
          <a href="mailto:plainlyteam@gmail.com" style={{ color: C.accent, fontSize: "14px", textDecoration: "none", fontWeight: "500" }}>Contact</a>
        </div>

        <div style={{ background: C.light, borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>What people say</div>
          <div style={{ fontSize: "14px", color: C.text, lineHeight: "1.6", fontStyle: "italic", marginBottom: "8px" }}>"Finally understood what I was signing in my rental agreement. Found two clauses I would never have noticed."</div>
          <div style={{ fontSize: "12px", color: C.sub }}>— Freelance designer, Amsterdam</div>
        </div>

        <div style={{ border: `0.5px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, padding: "16px", borderRight: `0.5px solid ${C.border}` }}>
              <div style={{ fontWeight: "700", fontSize: "15px", color: C.text, marginBottom: "4px" }}>Free</div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: C.text, marginBottom: "8px" }}>$0</div>
              {["1 analysis per month", "Full analysis every time", "No document storage"].map((f, i) => (
                <div key={i} style={{ fontSize: "12px", color: C.sub, marginBottom: "4px" }}>✓ {f}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "16px", background: C.header }}>
              <div style={{ fontWeight: "700", fontSize: "15px", color: C.accent, marginBottom: "4px" }}>Pro</div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>${PRO_PRICE}<span style={{ fontSize: "12px", fontWeight: "400", color: "#8A8585" }}>/mo</span></div>
              {["Unlimited analyses", "No document storage", "Cancel anytime"].map((f, i) => (
                <div key={i} style={{ fontSize: "12px", color: "#E8D4A0", marginBottom: "4px" }}>✓ {f}</div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", lineHeight: "1.5" }}>{DISCLAIMER}</p>
      </div>
    </div>
  );
}

function Auth({ mode, onSuccess, onSwitch, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const isSignUp = mode === "signup";

  const submit = async () => {
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!forgot && !password) return setError("Password is required.");
    if (isSignUp && password !== confirm) return setError("Passwords do not match.");
    if (isSignUp && password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      if (forgot) {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email);
        if (e) throw e;
        setForgotSent(true);
      } else if (isSignUp) {
        const { error: e } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: "https://plainly-opal.vercel.app" } });
        if (e) throw e;
        setForgotSent(true);
        return;
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onSuccess(false);
      }
    } catch (e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  if (forgotSent) return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
        {isSignUp ? "Confirm your email" : "Check your email"}
      </h2>
      <p style={{ color: C.sub, marginBottom: "8px" }}>
        {isSignUp ? `We sent a confirmation link to ${email}` : `Reset link sent to ${email}`}
      </p>
      {isSignUp && <p style={{ color: C.sub, fontSize: "13px", marginBottom: "24px" }}>Click the link in the email to activate your account. Then come back here and sign in.</p>}
      <button onClick={() => { setForgot(false); setForgotSent(false); }} style={btnStyle("secondary", false)}>
        {isSignUp ? "Go to sign in" : "Back to sign in"}
      </button>
    </div>
  );

  return (
    <div style={{ padding: "32px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", marginBottom: "20px", padding: 0 }}>← Back to home</button>
      <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>
        {forgot ? "Reset password" : isSignUp ? "Create account" : "Welcome back"}
      </h2>
      <p style={{ fontSize: "14px", color: C.sub, marginBottom: "24px" }}>
        {forgot ? "We will email a reset link." : isSignUp ? "Free to start. No credit card needed." : "Sign in to continue."}
      </p>
      {error && <div style={errCss}>{error}</div>}
      {[
        { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
        ...(!forgot ? [{ label: "Password", type: "password", val: password, set: setPassword, ph: "At least 8 characters" }] : []),
        ...(isSignUp && !forgot ? [{ label: "Confirm password", type: "password", val: confirm, set: setConfirm, ph: "Same password again" }] : []),
      ].map(({ label, type, val, set, ph }) => (
        <div key={label} style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: C.sub, display: "block", marginBottom: "6px" }}>{label}</label>
          <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputCss} />
        </div>
      ))}
      <button onClick={submit} disabled={loading} style={{ ...btnStyle("primary", loading), marginBottom: "12px" }}>
        {loading ? "Please wait..." : forgot ? "Send reset link" : isSignUp ? "Create account" : "Sign in"}
      </button>
      {!forgot && !isSignUp && <button onClick={() => setForgot(true)} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", display: "block", marginBottom: "12px", padding: 0 }}>Forgot password?</button>}
      <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.sub, fontSize: "14px", cursor: "pointer", padding: 0 }}>
        {isSignUp ? "Already have an account? Sign in" : "No account? Sign up free"}
      </button>
    </div>
  );
}

function Analyse({ user, userMeta, prefill, onDone, onUpgrade }) {
  const [text, setText] = useState(prefill || "");
  const [charCount, setCharCount] = useState(prefill ? prefill.length : 0);
  const [loading, setLoading] = useState(false);
  const [stepMsg, setStepMsg] = useState("");
  const [error, setError] = useState("");
  const debounce = useRef(null);

  const change = (val) => {
    setText(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setCharCount(val.length), 100);
  };

  const analyse = async () => {
    if (!text.trim()) return setError("Please add a document first.");
    if (!user && !prefill) { onUpgrade(); return; }
    if (user && !userMeta?.is_pro && (userMeta?.usage_count || 0) >= FREE_LIMIT) { onUpgrade(); return; }
    setError("");
    setLoading(true);
    try {
      setStepMsg("Sending to AI analyst...");
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-plainly-secret": process.env.REACT_APP_API_SECRET || "" },
        body: JSON.stringify({ text: text.trim(), userId: user?.id || null })
      });
      setStepMsg("Generating plain English summary...");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      if (user) {
        try {
          await supabase.from("profiles").update({ usage_count: (userMeta?.usage_count || 0) + 1 }).eq("id", user.id);
        } catch (err) {}
      }
      onDone(data.result);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setStepMsg("");
    }
  };

  const canGo = text.trim().length >= 50 && !loading;
  const tooShort = text.trim().length > 0 && text.trim().length < 100;
  const usage = userMeta?.usage_count || 0;

  return (
    <div>
      {user && !userMeta?.is_pro && (
        <div style={{ background: C.light, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: C.sub }}>{usage}/{FREE_LIMIT} free analyses used this month</span>
          <span style={{ fontSize: "12px", color: C.accent, fontWeight: "600" }}>Free plan</span>
        </div>
      )}
      <div style={{ background: "#F5EDD6", border: "1px solid #E8D4A0", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "16px" }}>🔒</span>
        <span style={{ fontSize: "13px", color: "#8A6828" }}>Your document is never stored. It is analysed and immediately forgotten.</span>
      </div>
      <div style={{ marginBottom: "14px" }}>
        <textarea value={text} onChange={e => change(e.target.value)}
          placeholder="Paste your contract, rental agreement, employment terms, or any legal document here..."
          style={{ ...inputCss, height: "200px", resize: "vertical", lineHeight: "1.6", fontSize: "14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
          <span style={{ fontSize: "12px", color: C.sub }}>{charCount.toLocaleString()} characters</span>
        </div>
      </div>
      {tooShort && <div style={{ background: "#F8F4E8", border: "1px solid #E8D898", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#8A6828", marginBottom: "12px" }}>This looks quite short. A real legal document is usually much longer.</div>}
      {text.trim() && !loading && <button onClick={() => { setText(""); setCharCount(0); setError(""); }} style={{ ...btnStyle("secondary", false), marginBottom: "10px", padding: "10px", fontSize: "14px" }}>Clear</button>}
      {error && <ErrBox message={error} onRetry={canGo ? analyse : null} />}
      {loading ? <Spinner label={stepMsg} /> : <button onClick={analyse} disabled={!canGo} style={btnStyle("primary", !canGo)}>Analyse document</button>}
      <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", marginTop: "16px", lineHeight: "1.5" }}>{DISCLAIMER}</p>
    </div>
  );
}

const Results = memo(function Results({ data, onNew, isGuest, onSignUp }) {
  const [expTerm, setExpTerm] = useState(null);
  const recColor = data.recommendation?.toLowerCase().includes("avoid") || data.recommendation?.toLowerCase().includes("do not") ? C.danger : data.recommendation?.toLowerCase().includes("negotiate") ? C.warning : C.success;
  const sortedFlags = [...(data.red_flags || [])].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - ({ high: 0, medium: 1, low: 2 }[b.severity])));
  const copy = () => navigator.clipboard.writeText(`Plainly Analysis\n\n${data.document_type} Score: ${data.trust_score}/10\n\n${data.summary}\n\nRecommendation: ${data.recommendation}`).catch(() => {});

  return (
    <div>
      {isGuest && (
        <div style={{ background: C.header, borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "#fff", fontSize: "14px", margin: "0 0 4px", fontWeight: "600" }}>You have used your 1 free analysis</p>
          <p style={{ color: "#8A8585", fontSize: "13px", margin: "0 0 10px" }}>Create a free account for 1 analysis per month.</p>
          <button onClick={onSignUp} style={{ ...btnStyle("primary", false), padding: "10px", fontSize: "14px" }}>Sign up free</button>
        </div>
      )}
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#EDECE6", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600", color: C.sub, marginBottom: "12px" }}>{data.document_type}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}><ScoreRing score={data.trust_score} /></div>
        <div style={{ display: "inline-block", background: scoreColor(data.trust_score) + "22", color: scoreColor(data.trust_score), borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
          {scoreContext(data.trust_score).label}
        </div>
        <p style={{ fontSize: "13px", color: C.sub, margin: "0 0 10px", lineHeight: "1.5" }}>{scoreContext(data.trust_score).desc}</p>
        <div style={{ fontWeight: "700", fontSize: "16px", color: C.text, marginBottom: "4px" }}>{data.score_label}</div>
        <div style={{ fontSize: "13px", color: C.sub, lineHeight: "1.5" }}>{data.score_reasoning}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>What this document says</div>
        <p style={{ fontSize: "15px", color: C.text, lineHeight: "1.6", margin: 0 }}>{data.summary}</p>
      </div>

      {data.deep_analysis && (
        <div style={cardStyle}>
          <div style={labelStyle}>Expert analysis</div>
          {data.deep_analysis.split('\n').filter(p => p.trim()).map((paragraph, i) => (
            <p key={i} style={{ fontSize: "15px", color: C.text, lineHeight: "1.8", margin: 0, marginBottom: i < data.deep_analysis.split('\n').filter(p => p.trim()).length - 1 ? "16px" : 0 }}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
      {sortedFlags.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ ...labelStyle, marginBottom: "8px" }}>Red flags ({sortedFlags.length})</div>
          {sortedFlags.map((flag, i) => (
            <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${sevColor(flag.severity)}`, marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, flex: 1 }}>{flag.title}</div>
                <span style={{ background: sevColor(flag.severity) + "22", color: sevColor(flag.severity), fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", marginLeft: "8px" }}>{flag.severity}</span>
              </div>
              <p style={{ fontSize: "13px", color: C.sub, margin: 0, lineHeight: "1.5" }}>{flag.explanation}</p>
              {flag.industry_comparison && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "600", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>vs industry standard</div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                    {["standard", "more restrictive", "significantly more restrictive", "unusually aggressive"].map((level, i) => {
                      const compLower = flag.industry_comparison?.toLowerCase() || "";
                      const activeIndex = compLower.includes("unusually aggressive") || compLower.includes("rarely seen") ? 3 : compLower.includes("significantly") ? 2 : compLower.includes("more restrictive") || compLower.includes("stricter") || compLower.includes("broader") || compLower.includes("longer") || compLower.includes("higher") ? 1 : 0;
                      const isActive = i <= activeIndex;
                      const colors = ["#4A7A5A", "#C4973D", "#C07040", "#C0504A"];
                      return (
                        <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: isActive ? colors[activeIndex] : C.border, transition: "background 0.2s" }} />
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    {[
                      { label: "Standard", color: "#4A7A5A" },
                      { label: "Restrictive", color: "#C4973D" },
                      { label: "Very restrictive", color: "#C07040" },
                      { label: "Aggressive", color: "#C0504A" },
                    ].map(({ label, color }, i) => {
                      const compLower = flag.industry_comparison?.toLowerCase() || "";
                      const activeIndex = compLower.includes("unusually aggressive") || compLower.includes("rarely seen") ? 3 : compLower.includes("significantly") ? 2 : compLower.includes("more restrictive") || compLower.includes("stricter") || compLower.includes("broader") || compLower.includes("longer") || compLower.includes("higher") ? 1 : 0;
                      return (
                        <span key={i} style={{ fontSize: "9px", color: i === activeIndex ? color : C.muted, fontWeight: i === activeIndex ? "700" : "400", letterSpacing: "0.3px" }}>{label}</span>
                      );
                    })}
                  </div>
                  {(() => {
                    const compLower = flag.industry_comparison?.toLowerCase() || "";
                    const activeIndex = compLower.includes("unusually aggressive") || compLower.includes("rarely seen") ? 3 : compLower.includes("significantly") ? 2 : compLower.includes("more restrictive") || compLower.includes("stricter") || compLower.includes("broader") || compLower.includes("longer") || compLower.includes("higher") ? 1 : 0;
                    const meanings = [
                      { color: "#4A7A5A", bg: "#F0F7F0", text: "Consistent with prevailing market terms for this contract type. No material deviation from established commercial practice. This clause presents no elevated risk to the signing party." },
                      { color: "#C4973D", bg: "#FBF5E8", text: "Departs from standard market practice in a manner that shifts risk toward the signing party. While not uncommon in commercially negotiated agreements, this clause warrants specific attention and should be addressed before execution." },
                      { color: "#C07040", bg: "#FBF0E8", text: "Materially exceeds what is commercially reasonable for this contract type. Indicative of a drafting party seeking disproportionate protection at the counterparty's expense. This clause should be subject to negotiation or amendment prior to signing." },
                      { color: "#C0504A", bg: "#FBF0F0", text: "Significantly outside the bounds of acceptable commercial practice for this agreement type. Clauses of this nature are typically challenged or removed in arm's length negotiations between informed parties. Execution without amendment exposes the signing party to disproportionate risk." },
                    ];
                    const m = meanings[activeIndex];
                    return (
                      <div style={{ background: m.bg, borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", borderLeft: `3px solid ${m.color}` }}>
                        <span style={{ fontSize: "12px", color: m.color, fontWeight: "600", display: "block", marginBottom: "3px" }}>
                          {["Standard", "Restrictive", "Very restrictive", "Aggressive"][activeIndex]}
                        </span>
                        <span style={{ fontSize: "12px", color: C.sub, lineHeight: "1.5" }}>{m.text}</span>
                      </div>
                    );
                  })()}
                  <div style={{ background: C.light, borderRadius: "6px", padding: "8px 12px" }}>
                    <span style={{ fontSize: "12px", color: C.sub, lineHeight: "1.5", fontStyle: "italic" }}>{flag.industry_comparison}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={cardStyle}>
        <div style={labelStyle}>3 things to know before signing</div>
        {(data.key_points || []).map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none" }}>
            <span style={{ color: C.success, fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>✓</span>
            <p style={{ fontSize: "14px", color: C.text, margin: 0, lineHeight: "1.5" }}>{pt}</p>
          </div>
        ))}
      </div>
      {data.missing_clauses?.length > 0 && (
        <div style={cardStyle}>
          <div style={labelStyle}>Missing from this document</div>
          {data.missing_clauses.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", padding: "6px 0" }}>
              <span style={{ color: C.warning, flexShrink: 0 }}>⚠</span>
              <p style={{ fontSize: "13px", color: C.sub, margin: 0 }}>{c}</p>
            </div>
          ))}
        </div>
      )}
      {data.legal_terms?.length > 0 && (
        <div style={cardStyle}>
          <div style={labelStyle}>Legal terms explained</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: expTerm !== null ? "10px" : 0 }}>
            {data.legal_terms.map((lt, i) => (
              <button key={i} onClick={() => setExpTerm(expTerm === i ? null : i)}
                style={{ background: expTerm === i ? C.accent : "#EDECE6", color: expTerm === i ? "#fff" : C.text, border: "none", borderRadius: "20px", padding: "5px 12px", fontSize: "13px", cursor: "pointer" }}>
                {lt.term}
              </button>
            ))}
          </div>
          {expTerm !== null && data.legal_terms[expTerm] && (
            <div style={{ background: "#F5EDD6", border: "1px solid #E8D4A0", borderRadius: "8px", padding: "12px", fontSize: "13px", color: C.text, lineHeight: "1.5" }}>
              <strong>{data.legal_terms[expTerm].term}:</strong> {data.legal_terms[expTerm].plain_english}
            </div>
          )}
        </div>
      )}
      <div style={{ ...cardStyle, background: recColor + "11", border: `1px solid ${recColor}44`, textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: recColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Recommendation</div>
        <p style={{ fontSize: "15px", color: C.text, margin: 0, fontWeight: "500" }}>{data.recommendation}</p>
      </div>
      <button onClick={() => {
        const text = `📋 Plainly Contract Analysis\n\n${data.document_type}\nTrust Score: ${data.trust_score}/10\n\n${data.score_label}\n\n${data.recommendation}\n\nAnalysed with Plainly — plainly-opal.vercel.app`;
        navigator.clipboard.writeText(text).catch(() => {});
      }} style={{ ...btnStyle("secondary", false), marginBottom: "8px", fontSize: "14px", padding: "12px" }}>
        📤 Share this analysis
      </button>
      <button onClick={copy} style={{ ...btnStyle("secondary", false), marginBottom: "8px", fontSize: "14px", padding: "12px" }}>📋 Copy summary</button>
      <button onClick={onNew} style={{ ...btnStyle("primary", false), marginBottom: "12px" }}>Analyse another document</button>
      <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", lineHeight: "1.5" }}>{DISCLAIMER}</p>
    </div>
  );
});

function Upgrade({ userEmail, onClose }) {
  const productId = process.env.REACT_APP_LEMONSQUEEZY_PRODUCT_ID;
  const checkoutUrl = productId
    ? `https://store.lemonsqueezy.com/checkout/buy/${productId}?checkout[email]=${encodeURIComponent(userEmail || "")}`
    : "https://app.lemonsqueezy.com";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.bg, borderRadius: "20px 20px 0 0", padding: "24px 20px 44px", width: "100%", maxWidth: "720px" }}>
        <div style={{ width: "36px", height: "4px", background: C.border, borderRadius: "2px", margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔓</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px", color: C.text }}>Upgrade to Pro</h2>
          <p style={{ fontSize: "15px", color: C.sub, margin: 0 }}>Unlimited analyses. Complete privacy. Cancel anytime.</p>
        </div>
        <div style={{ background: C.header, borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#8A8585", marginBottom: "4px" }}>Pro Plan</div>
          <div style={{ fontSize: "40px", fontWeight: "700", color: "#fff" }}>${PRO_PRICE}<span style={{ fontSize: "16px", fontWeight: "400", color: "#8A8585" }}>/month</span></div>
          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {["Unlimited analyses", "Documents never stored", "Cancel anytime"].map((f, i) => (
              <div key={i} style={{ fontSize: "13px", color: "#E8D4A0" }}>✓ {f}</div>
            ))}
          </div>
        </div>
        <a href={checkoutUrl} target="_blank" rel="noreferrer" style={{ ...btnStyle("primary", false), marginBottom: "10px" }}>
          Start Pro — ${PRO_PRICE}/month
        </a>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", color: C.sub }}>or pay once, no subscription</span>
        </div>
        <a href={checkoutUrl} target="_blank" rel="noreferrer" style={{ ...btnStyle("secondary", false), marginBottom: "10px", fontSize: "14px" }}>
          Single analysis — $1.99
        </a>
        <button onClick={onClose} style={{ ...btnStyle("secondary", false), fontSize: "13px", color: C.sub }}>Continue on free plan</button>
      </div>
    </div>
  );
}

function About({ onBack }) {
  return (
    <div style={{ padding: "20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", marginBottom: "20px", padding: 0 }}>← Back</button>
      <h2 style={{ fontSize: "28px", fontWeight: "700", color: C.text, marginBottom: "8px", lineHeight: "1.2" }}>Why Plainly exists.</h2>
      <p style={{ fontSize: "15px", color: C.sub, marginBottom: "32px", lineHeight: "1.6" }}>Every day people sign contracts they do not understand. We built a tool to change that.</p>

      <div style={{ background: "#F5EDD6", borderLeft: `4px solid ${C.accent}`, padding: "16px 20px", borderRadius: "0 8px 8px 0", marginBottom: "28px" }}>
        <p style={{ fontSize: "16px", color: "#8A6828", fontStyle: "italic", margin: 0 }}>Most people never read the full terms of a contract before signing. Not because they do not care. Because the language is deliberately difficult.</p>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "10px" }}>The problem</h3>
      <p style={{ fontSize: "15px", color: C.sub, lineHeight: "1.7", marginBottom: "24px" }}>Employment contracts, rental agreements, freelance terms. These documents shape people's lives. Yet most people sign them with only a vague sense of what they contain. The result is people routinely agree to things that are unfair or not what they thought.</p>

      <h3 style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "10px" }}>What we built</h3>
      <p style={{ fontSize: "15px", color: C.sub, lineHeight: "1.7", marginBottom: "24px" }}>Plainly reads any document and explains it in plain English in seconds. Red flags highlighted. Legal jargon explained. A clear trust score. A direct recommendation. Clear, honest, and genuinely on your side.</p>

      <h3 style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "16px" }}>What we believe</h3>
      {[
        { icon: "🔒", title: "Privacy is non-negotiable", desc: "We never store your documents. Every analysis is processed and immediately forgotten." },
        { icon: "⚖️", title: "Honesty over reassurance", desc: "If a contract is bad, we say it is bad. We never soften findings." },
        { icon: "🌍", title: "Access for everyone", desc: "Document clarity should not be expensive. Plainly gives everyone access to clear analysis." },
        { icon: "💡", title: "Clarity over complexity", desc: "Every explanation is written so anyone can understand it. No jargon. No assumptions." },
      ].map((v, i) => (
        <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "16px", background: C.light, borderRadius: "10px", padding: "16px" }}>
          <div style={{ fontSize: "22px", flexShrink: 0 }}>{v.icon}</div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "15px", color: C.text, marginBottom: "4px" }}>{v.title}</div>
            <div style={{ fontSize: "13px", color: C.sub, lineHeight: "1.5" }}>{v.desc}</div>
          </div>
        </div>
      ))}

      <div style={{ background: C.header, borderRadius: "12px", padding: "24px", textAlign: "center", marginTop: "8px" }}>
        <p style={{ color: "#fff", fontSize: "15px", margin: "0 0 4px", fontWeight: "600" }}>Questions or feedback?</p>
        <a href="mailto:plainlyteam@gmail.com" style={{ color: C.accent, fontSize: "14px" }}>plainlyteam@gmail.com</a>
      </div>
    </div>
  );
}

function Settings({ user, userMeta, onSignOut, onUpgrade }) {
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    if (!window.confirm("Cancel your Pro subscription?")) return;
    setCancelling(true);
    try {
      await fetch("/api/cancel-subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id }) });
      window.location.reload();
    } catch (err) { alert("Could not cancel. Please try again."); }
    finally { setCancelling(false); }
  };

  const deleteAccount = async () => {
    if (!window.confirm("This permanently deletes your account. Are you sure?")) return;
    try {
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
    } catch (err) { alert("Could not delete account. Please contact support."); }
  };

  return (
    <div>
      <div style={cardStyle}>
        <div style={labelStyle}>Account</div>
        <div style={{ fontSize: "15px", color: C.text, fontWeight: "500" }}>{user.email}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Plan</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: userMeta?.is_pro ? "12px" : 0 }}>
          <div>
            <span style={{ fontWeight: "700", fontSize: "18px", color: userMeta?.is_pro ? C.accent : C.text }}>{userMeta?.is_pro ? "Pro" : "Free"}</span>
            {!userMeta?.is_pro && <span style={{ fontSize: "13px", color: C.sub, marginLeft: "8px" }}>{userMeta?.usage_count || 0}/{FREE_LIMIT} used this month</span>}
          </div>
          {!userMeta?.is_pro && <button onClick={onUpgrade} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>Upgrade</button>}
        </div>
        {userMeta?.is_pro && <button onClick={cancel} disabled={cancelling} style={{ background: "none", border: "none", color: C.danger, fontSize: "13px", cursor: "pointer", padding: 0 }}>{cancelling ? "Cancelling..." : "Cancel Pro subscription"}</button>}
      </div>
      <div style={{ ...cardStyle, background: "#F5EDD6", border: "1px solid #E8D4A0" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "20px" }}>🔒</span>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#8A6828", marginBottom: "4px" }}>Your privacy is protected</div>
            <div style={{ fontSize: "13px", color: "#8A6828", lineHeight: "1.5" }}>We never store your documents. Every analysis is processed and immediately forgotten. Only your usage count is saved.</div>
          </div>
        </div>
      </div>
      <button onClick={onSignOut} style={{ ...btnStyle("secondary", false), marginBottom: "8px" }}>Sign out</button>
      <button onClick={deleteAccount} style={{ ...btnStyle("secondary", false), color: C.danger, borderColor: "#E8C0BE", marginBottom: "20px", fontSize: "14px" }}>Delete my account</button>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <a href="/about.html" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>About</a>
        <a href="/privacy.html" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>Privacy policy</a>
        <a href="/terms.html" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>Terms of service</a>
        <a href="mailto:plainlyteam@gmail.com" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>Contact</a>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("signup");
  const [tab, setTab] = useState("analyse");
  const [result, setResult] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [booting, setBooting] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) { loadMeta(s.user.id); setScreen("app"); }
      setBooting(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) { loadMeta(s.user.id); setScreen("app"); }
      else setScreen("landing");
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadMeta = async (uid) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      setUserMeta(data || { is_pro: false, usage_count: 0 });
    } catch (err) { setUserMeta({ is_pro: false, usage_count: 0 }); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setUserMeta(null); setScreen("landing"); setResult(null); setTab("analyse");
  };

  const isAuthed = !!session;
  const isDesktop = useDesktop();
  const showNav = isAuthed && screen === "app" && !onboarding;

  const renderBody = () => {
    if (onboarding) return <Onboarding onFinish={() => setOnboarding(false)} />;
    if (screen === "landing") return <Landing
      onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }}
      onLogin={() => { setAuthMode("login"); setScreen("auth"); }}
      onSample={() => setScreen("sample")}
      onAbout={() => setScreen("about")}
    />;
    if (screen === "auth") return <Auth
      mode={authMode}
      onSuccess={(isNew) => { if (isNew) setOnboarding(true); setScreen("app"); setTab("analyse"); }}
      onSwitch={() => setAuthMode(m => m === "signup" ? "login" : "signup")}
      onBack={() => setScreen("landing")}
    />;
    if (screen === "about") return <About onBack={() => setScreen("landing")} />;
    if (screen === "sample") {
      const DEMO = {
        document_type: "Freelance Services Agreement",
        trust_score: 3,
        score_label: "This contract strongly favours the client and leaves you with almost no protection.",
        score_reasoning: "The unlimited revisions clause, 60-day payment terms with no late penalty, and the right to terminate without paying for completed work create serious financial risk. The worldwide 2-year non-compete is unusually aggressive.",
        summary: "This is a freelance agreement where the client holds almost all the power. They can request unlimited changes, withhold payment subjectively, terminate without notice, and prevent you from working in your industry for 2 years worldwide. Your work becomes their property before you are even paid.",
        deep_analysis: "This contract was drafted by the client with no input from the freelancer. Every ambiguous clause resolves in the client favour. This is a deliberate pattern not an accident.\n\nThe combination of unlimited revisions and subjective payment withholding is particularly dangerous. Together they mean the client can demand changes indefinitely and then decide the work is not good enough to pay for. There is no mechanism that protects you from a client acting in bad faith.\n\nThe termination clause compounds this further. The client can walk away at any point without paying for completed work. Combined with the IP transfer clause which gives them ownership from the moment of creation, they could take your work and legally owe you nothing.\n\nThe non-compete is the clause that should concern you most long term. Two years worldwide in the same industry is not a standard freelance restriction. For a graphic design agreement it is disproportionate and could seriously limit your ability to earn a living after this single project ends.",
        red_flags: [
          { title: "Unlimited revisions with no cap", explanation: "The contract allows the client to request unlimited changes until satisfied. This means a project could drag on indefinitely while you receive no additional pay.", severity: "high", industry_comparison: "This is unusually aggressive. Most fair freelance contracts cap revisions at 2 to 3 rounds. Unlimited revisions with no additional compensation is rarely seen in balanced agreements." },
          { title: "Client can withhold payment subjectively", explanation: "Payment can be withheld if the work does not meet subjective satisfaction. The client has complete discretion to refuse payment for any reason with little recourse for you.", severity: "high" },
          { title: "No payment for completed work on termination", explanation: "The client can terminate at any time without paying for work already completed. You could spend weeks on a project and walk away with nothing.", severity: "high" },
          { title: "Worldwide 2-year non-compete", explanation: "You cannot work with any business in the same industry for 2 years anywhere in the world. This is extremely broad for a freelance contract.", severity: "medium" },
          { title: "IP transfers before payment", explanation: "Your work becomes the client's property the moment you create it, regardless of whether payment has been made.", severity: "medium" },
        ],
        key_points: [
          "You must provide unlimited revisions at no extra cost with no protection against a client who is never satisfied.",
          "The client can terminate at any time and legally owes you nothing for work already completed.",
          "You cannot work in the same industry anywhere in the world for 2 years after this contract ends."
        ],
        legal_terms: [
          { term: "Intellectual Property", plain_english: "The rights to your creative work. This contract transfers all rights to the client before you are even paid." },
          { term: "Non-compete", plain_english: "An agreement not to work with competing businesses. This one covers the entire world for 2 years which is unusually broad." },
        ],
        missing_clauses: [
          "Revision limit: a fair contract specifies a maximum number of revision rounds.",
          "Kill fee: a fair contract compensates the freelancer for work completed if the client cancels.",
        ],
        recommendation: "Do not sign this contract as-is. Negotiate a revision cap, a kill fee, and removal of the worldwide non-compete before agreeing."
      };
      return <Results data={DEMO} onNew={() => setScreen("landing")} isGuest onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }} />;
    }
    if (!isAuthed) { setScreen("landing"); return null; }
    if (tab === "analyse") {
      if (result) return <Results data={result} onNew={() => setResult(null)} />;
      return <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />;
    }
    if (tab === "about") return <About onBack={() => setTab("analyse")} />;
    if (tab === "settings") return <Settings user={session.user} userMeta={userMeta} onSignOut={signOut} onUpgrade={() => setShowUpgrade(true)} />;
    return null;
  };

  if (booting) return (
    <div style={{ minHeight: "100vh", background: "#EDECE6", display: "flex", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ width: "100%", maxWidth: isDesktop ? "1100px" : "480px", minHeight: "100vh", background: C.bg }}>
        <div style={{ background: C.header, padding: "14px 20px 12px" }}><h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 }}>{APP_NAME}</h1></div>
        <Spinner label="Loading..." />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#EDECE6", fontFamily: "Georgia, serif" }}>
      {!onboarding && (
        <div style={{ background: C.header, padding: isDesktop ? "16px 40px" : "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: isDesktop ? "22px" : "20px", fontWeight: "700", margin: "0 0 2px" }}>{APP_NAME}</h1>
            <p style={{ color: C.accent, fontSize: "12px", margin: 0, fontWeight: "500" }}>{APP_TAGLINE}</p>
          </div>
          {showNav && isDesktop && (
            <div style={{ display: "flex", gap: "8px" }}>
              {[{ key: "analyse", label: "Analyse", icon: "📄" }, { key: "about", label: "About", icon: "ℹ️" }, { key: "settings", label: "Settings", icon: "⚙️" }].map(({ key, label, icon }) => (
                <button key={key} onClick={() => { setTab(key); setResult(null); }}
                  style={{ background: tab === key ? C.accent : "transparent", color: tab === key ? "#1A1814" : "#9CA3AF", border: tab === key ? "none" : "0.5px solid #555", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: isDesktop ? "1100px" : "480px", margin: "0 auto", padding: isDesktop ? "40px" : "0", minHeight: "calc(100vh - 60px)" }}>
        {onboarding ? (
          <div style={{ background: C.bg, borderRadius: isDesktop ? "16px" : 0, padding: isDesktop ? "40px" : "20px" }}>
            <Onboarding onFinish={() => setOnboarding(false)} />
          </div>
        ) : isDesktop && screen === "app" && isAuthed ? (
          <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "600px", gap: "32px", alignItems: "start", justifyContent: "center" }}>
            <div style={{ background: C.bg, borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {tab === "analyse" && !result && <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />}
              {tab === "analyse" && result && <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />}
              {tab === "about" && <About onBack={() => setTab("analyse")} />}
              {tab === "settings" && <Settings user={session.user} userMeta={userMeta} onSignOut={signOut} onUpgrade={() => setShowUpgrade(true)} />}
            </div>
            {result && tab === "analyse" && (
              <div style={{ background: C.bg, borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <Results data={result} onNew={() => setResult(null)} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: screen === "landing" || screen === "sample" ? "transparent" : C.bg, borderRadius: isDesktop ? "16px" : 0, boxShadow: screen !== "landing" && isDesktop ? "0 1px 4px rgba(0,0,0,0.06)" : "none", paddingBottom: showNav && !isDesktop ? "88px" : 0, overflow: "hidden" }}>
            {renderBody()}
          </div>
        )}
      </div>

      {showNav && !isDesktop && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.bg, borderTop: `0.5px solid ${C.border}`, display: "flex", zIndex: 100 }}>
          {[{ key: "analyse", label: "Analyse", icon: "📄" }, { key: "about", label: "About", icon: "ℹ️" }, { key: "settings", label: "Settings", icon: "⚙️" }].map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setTab(key); setResult(null); }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0 14px", cursor: "pointer", border: "none", background: "transparent", color: tab === key ? C.accent : "#8A8585", fontSize: "11px", fontWeight: tab === key ? "600" : "400" }}>
              <span style={{ fontSize: "20px" }}>{icon}</span>{label}
            </button>
          ))}
        </nav>
      )}
      {showUpgrade && <Upgrade userEmail={session?.user?.email} onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
