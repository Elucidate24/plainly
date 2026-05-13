// ============================================================
// PLAINLY v2 — Legal Document Analyser
// ============================================================
// Required environment variables (Vercel):
//   REACT_APP_SUPABASE_URL
//   REACT_APP_SUPABASE_ANON_KEY
//   REACT_APP_LEMONSQUEEZY_PRODUCT_ID
//   ANTHROPIC_API_KEY           server side only, never exposed to users
//   LEMONSQUEEZY_API_KEY        server side only
//   LEMONSQUEEZY_WEBHOOK_SECRET server side only
//   SUPABASE_URL                server side only
//   SUPABASE_SERVICE_KEY        server side only
// ============================================================

import { useState, useEffect, useRef, memo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONSTANTS ───────────────────────────────────────────────
const APP_NAME = "Plainly";
const APP_TAGLINE = "Understand anything you sign";
const PRO_PRICE = "5.99";
const FREE_LIMIT = 2;
const DISCLAIMER = "Plainly provides information, not legal advice. Always consult a qualified lawyer for important decisions.";

const SAMPLE_DOCUMENT = `FREELANCE SERVICES AGREEMENT

This Agreement is entered into as of the date of signing between the Client and the Freelancer.

1. SERVICES
The Freelancer agrees to provide graphic design services as requested by the Client. The Client may request unlimited revisions to any work until satisfied.

2. PAYMENT
The Client agrees to pay within 60 days of invoice. Late payments will not incur any penalty. The Client may withhold payment if the work does not meet their subjective satisfaction.

3. INTELLECTUAL PROPERTY
All work created becomes the sole property of the Client upon creation, regardless of whether payment has been made.

4. NON-COMPETE
The Freelancer agrees not to work with any business in the same industry for 2 years after termination, anywhere in the world.

5. TERMINATION
The Client may terminate this Agreement at any time without notice and without obligation to pay for completed work.

6. CONFIDENTIALITY
The Freelancer agrees to keep all Client information confidential indefinitely, including after termination.`;

const ONBOARDING_STEPS = [
  { title: "Welcome to Plainly", body: "Paste any legal document and get a plain English breakdown in seconds. No legal knowledge needed.", icon: "👋" },
  { title: "We flag the risks", body: "Red flags are highlighted automatically so you know exactly what is unusual or risky before you sign.", icon: "🚩" },
  { title: "Your first 2 analyses are free", body: "No credit card needed to start. Upgrade to Pro for unlimited analyses whenever you are ready.", icon: "🎉" },
];

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_SUPABASE_ANON_KEY || ""
);

// ─── HELPERS ─────────────────────────────────────────────────
const scoreColor = (s) => s >= 7 ? "#16A34A" : s >= 4 ? "#F59E0B" : "#DC2626";
const sevColor = (s) => s === "high" ? "#DC2626" : s === "medium" ? "#F59E0B" : "#2563EB";
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = { bg: "#FFFFFF", header: "#0A0A0A", accent: "#F97316", success: "#16A34A", warning: "#F59E0B", danger: "#DC2626", text: "#1C1917", sub: "#57534E", border: "#E7E5E4", light: "#F9FAFB" };

const card  = { background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "16px", marginBottom: "12px" };
const clabel = { fontSize: "11px", fontWeight: "600", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${C.border}`, fontSize: "15px", fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" };
const errBox = { background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", color: C.danger, fontSize: "14px", marginBottom: "12px", lineHeight: "1.5" };

function btn(variant = "primary", disabled = false) {
  return { width: "100%", padding: "14px", borderRadius: "8px", border: variant === "secondary" ? `0.5px solid ${C.border}` : "none", fontSize: "16px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s", background: variant === "primary" ? C.accent : "transparent", color: variant === "primary" ? "#fff" : C.text, opacity: disabled ? 0.5 : 1 };
}

// ─── MICRO COMPONENTS ────────────────────────────────────────

function Spin({ label = "Analysing your document..." }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #FED7AA", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: "15px", color: C.sub, margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Usually 10 to 15 seconds</p>
    </div>
  );
}

function Err({ message, onRetry }) {
  return (
    <div style={errBox}>
      <strong style={{ display: "block", marginBottom: "4px" }}>Something went wrong</strong>
      {message}
      {onRetry && <button onClick={onRetry} style={{ marginTop: "8px", background: "none", border: "none", color: C.danger, fontWeight: "600", cursor: "pointer", padding: 0, fontSize: "14px" }}>Try again →</button>}
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
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E7E5E4" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={size/2} y={size/2+2} textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="700" fill={color}>{score}</text>
      <text x={size/2} y={size/2+20} textAnchor="middle" fontSize="10" fill="#9CA3AF">/10</text>
    </svg>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────

function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const cur = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 24px", justifyContent: "space-between", minHeight: "480px" }}>
      <div />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>{cur.icon}</div>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, marginBottom: "12px", lineHeight: "1.2" }}>{cur.title}</h2>
        <p style={{ fontSize: "17px", color: C.sub, lineHeight: "1.6", margin: 0 }}>{cur.body}</p>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "28px" }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === step ? C.accent : C.border, transition: "all 0.3s" }} />
          ))}
        </div>
        <button onClick={() => isLast ? onFinish() : setStep(s => s + 1)} style={btn()}>
          {isLast ? "Start analysing documents" : "Next"}
        </button>
        {!isLast && <button onClick={onFinish} style={{ ...btn("secondary"), marginTop: "10px", fontSize: "14px" }}>Skip</button>}
      </div>
    </div>
  );
}

// ─── LANDING ─────────────────────────────────────────────────

function Landing({ onSignUp, onLogin, onSample }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.header, padding: "24px 20px 20px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: "0 0 4px", letterSpacing: "-0.5px" }}>{APP_NAME}</h1>
        <p style={{ color: C.accent, fontSize: "13px", margin: 0, fontWeight: "500" }}>{APP_TAGLINE}</p>
      </div>
      <div style={{ flex: 1, padding: "28px 20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, lineHeight: "1.2", marginBottom: "12px" }}>Stop signing things you do not understand.</h2>
        <p style={{ fontSize: "15px", color: C.sub, lineHeight: "1.6", marginBottom: "28px" }}>Paste any legal document. Get a plain English breakdown with risk warnings in seconds.</p>
        {[
          { icon: "🔍", title: "Plain English summary", desc: "Legal jargon translated instantly" },
          { icon: "🚩", title: "Red flag detection", desc: "Risky clauses highlighted automatically" },
          { icon: "⚖️", title: "Trust score out of 10", desc: "Know instantly if it is safe to sign" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
            <div style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: C.text, marginBottom: "2px" }}>{f.title}</div>
              <div style={{ fontSize: "13px", color: C.sub }}>{f.desc}</div>
            </div>
          </div>
        ))}
        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "12px", padding: "16px", marginBottom: "24px", marginTop: "8px" }}>
          <div style={{ fontWeight: "600", fontSize: "14px", color: "#92400E", marginBottom: "6px" }}>Try it now, no account needed</div>
          <p style={{ fontSize: "13px", color: "#78350F", margin: "0 0 12px", lineHeight: "1.5" }}>We have loaded a real sample freelance contract with several risky clauses. See how Plainly works.</p>
          <button onClick={onSample} style={{ ...btn(), background: "#92400E", padding: "10px", fontSize: "14px" }}>Analyse sample contract →</button>
        </div>
        <button onClick={onSignUp} style={{ ...btn(), marginBottom: "10px" }}>Get started free</button>
        <button onClick={onLogin} style={btn("secondary")}>Sign in</button>
        <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", marginTop: "16px", lineHeight: "1.5" }}>{DISCLAIMER}</p>
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────

function Auth({ mode, onSuccess, onSwitch, onBack }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(""); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const isSignUp = mode === "signup";
  const fo = (e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; };
  const fb = (e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

  const submit = async () => {
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!forgot && !password) return setError("Password is required.");
    if (isSignUp && password !== confirm) return setError("Passwords do not match.");
    if (isSignUp && password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      if (forgot) {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email);
        if (e) throw e;
        setForgotSent(true);
      } else if (isSignUp) {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        onSuccess(true);
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onSuccess(false);
      }
    } catch (e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  if (forgotSent) return (
    <div style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Check your email</h2>
      <p style={{ color: C.sub, marginBottom: "24px" }}>Reset link sent to {email}</p>
      <button onClick={() => { setForgot(false); setForgotSent(false); }} style={btn("secondary")}>Back to sign in</button>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: "32px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", marginBottom: "20px", padding: 0 }}>← Back</button>
      <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>{forgot ? "Reset password" : isSignUp ? "Create account" : "Welcome back"}</h2>
      <p style={{ fontSize: "14px", color: C.sub, marginBottom: "24px" }}>{forgot ? "We will email you a reset link." : isSignUp ? "Free to start. No credit card needed." : "Sign in to continue."}</p>
      {error && <div style={errBox}>{error}</div>}
      {[
        { label: "Email", type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
        ...(!forgot ? [{ label: "Password", type: "password", value: password, set: setPassword, placeholder: "At least 6 characters" }] : []),
        ...(isSignUp && !forgot ? [{ label: "Confirm password", type: "password", value: confirm, set: setConfirm, placeholder: "Same password again" }] : []),
      ].map(({ label, type, value, set, placeholder }) => (
        <div key={label} style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: C.sub, display: "block", marginBottom: "6px" }}>{label}</label>
          <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} style={inputStyle} onFocus={fo} onBlur={fb} />
        </div>
      ))}
      {isSignUp && <p style={{ fontSize: "11px", color: C.sub, marginBottom: "16px", lineHeight: "1.5" }}>We store your analyses so you can review them later. Delete your data any time in Settings.</p>}
      <button onClick={submit} disabled={loading} style={{ ...btn("primary", loading), marginBottom: "12px" }}>{loading ? "Please wait..." : forgot ? "Send reset link" : isSignUp ? "Create account" : "Sign in"}</button>
      {!forgot && !isSignUp && <button onClick={() => setForgot(true)} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", display: "block", marginBottom: "12px", padding: 0 }}>Forgot password?</button>}
      <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.sub, fontSize: "14px", cursor: "pointer", padding: 0 }}>{isSignUp ? "Already have an account? Sign in" : "No account? Sign up free"}</button>
    </div>
  );
}

// ─── ANALYSE ─────────────────────────────────────────────────

function Analyse({ user, userMeta, prefill, onDone, onUpgrade }) {
  const [text, setText] = useState(prefill || "");
  const [fileName, setFileName] = useState(prefill ? "sample-contract.txt" : "");
  const [charCount, setCharCount] = useState(prefill?.length || 0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const debounce = useRef(null);

  const change = (val) => { setText(val); clearTimeout(debounce.current); debounce.current = setTimeout(() => setCharCount(val.length), 100); };

  const handleFile = async (file) => {
    setError(""); setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "txt") { change(await file.text()); return; }
    if (ext === "pdf") {
      setStep("Reading PDF...");
      try {
        const ab = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
        const res = await fetch("/api/extract-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64, fileName: file.name }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        change(data.text);
      } catch (e) { setError(e.message || "Could not read this PDF. Please paste the text instead."); setFileName(""); }
      setStep(""); return;
    }
    if (ext === "docx") {
      setError("DOCX upload coming soon. Please paste the text instead.");
      setFileName("");
      return;
    }
    setError("Please upload a PDF, DOCX, or TXT file."); setFileName("");
  };

  const analyse = async () => {
    if (!text.trim()) return setError("Please add a document first.");
    if (user && !userMeta?.is_pro && (userMeta?.usage_count || 0) >= FREE_LIMIT) { onUpgrade(); return; }
    setError(""); setLoading(true);
    try {
      setStep("Sending to AI analyst...");
      const res = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.trim(), userId: user?.id }) });
      setStep("Generating plain English summary...");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      if (user) {
        try {
          await supabase.from("analyses").insert({ user_id: user.id, document_type: data.result.document_type, trust_score: data.result.trust_score, result: data.result, created_at: new Date().toISOString() });
          await supabase.from("profiles").update({ usage_count: (userMeta?.usage_count || 0) + 1 }).eq("id", user.id);
        } catch {}
      }
      onDone(data.result);
    } catch (e) { setError(e.message || "Analysis failed. Please try again."); }
    finally { setLoading(false); setStep(""); }
  };

  const canGo = text.trim().length >= 50 && !loading;
  const tooShort = text.trim().length > 0 && text.trim().length < 100;
  const usage = userMeta?.usage_count || 0;

  return (
    <div>
      {user && !userMeta?.is_pro && (
        <div style={{ background: C.light, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: C.sub }}>{usage}/{FREE_LIMIT} free analyses used this month</span>
          <span style={{ fontSize: "12px", color: C.accent, fontWeight: "600" }}>Free plan</span>
        </div>
      )}
      <div style={{ marginBottom: "14px" }}>
        <textarea value={text} onChange={e => change(e.target.value)} placeholder="Paste your contract, rental agreement, employment terms, or any legal document here..."
          style={{ ...inputStyle, height: "200px", resize: "vertical", lineHeight: "1.6", fontSize: "14px" }}
          onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
          <span style={{ fontSize: "12px", color: C.sub }}>{charCount.toLocaleString()} characters{fileName ? ` · ${fileName}` : ""}</span>
          <label style={{ fontSize: "13px", color: C.accent, fontWeight: "600", cursor: "pointer" }}>
            Upload file
            <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          </label>
        </div>
      </div>
      {tooShort && <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#92400E", marginBottom: "12px" }}>⚠ This looks quite short. A real legal document is usually much longer.</div>}
      {text.trim() && !loading && <button onClick={() => { setText(""); setFileName(""); setCharCount(0); setError(""); }} style={{ ...btn("secondary"), marginBottom: "10px", padding: "10px", fontSize: "14px" }}>Clear</button>}
      {error && <Err message={error} onRetry={canGo ? analyse : undefined} />}
      {loading ? <Spin label={step || "Analysing your document..."} /> : <button onClick={analyse} disabled={!canGo} style={btn("primary", !canGo)}>Analyse document</button>}
      <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", marginTop: "16px", lineHeight: "1.5" }}>{DISCLAIMER}</p>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────

const Results = memo(function Results({ data, onNew, isGuest, onSignUp }) {
  const [expTerm, setExpTerm] = useState(null);
  const recColor = data.recommendation?.toLowerCase().includes("avoid") || data.recommendation?.toLowerCase().includes("do not") ? C.danger : data.recommendation?.toLowerCase().includes("negotiate") ? C.warning : C.success;
  const sortedFlags = [...(data.red_flags || [])].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - ({ high: 0, medium: 1, low: 2 }[b.severity])));
  const copy = () => navigator.clipboard.writeText(`Plainly Analysis\n\n${data.document_type} — Score: ${data.trust_score}/10\n\n${data.summary}\n\nRecommendation: ${data.recommendation}`).catch(() => {});

  return (
    <div>
      {isGuest && (
        <div style={{ background: C.header, borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "#fff", fontSize: "14px", margin: "0 0 10px", lineHeight: "1.5" }}>Create a free account to save this and analyse your own documents.</p>
          <button onClick={onSignUp} style={{ ...btn(), padding: "10px", fontSize: "14px" }}>Sign up free</button>
        </div>
      )}
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#F3F4F6", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600", color: C.sub, marginBottom: "12px" }}>{data.document_type}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}><ScoreRing score={data.trust_score} /></div>
        <div style={{ fontWeight: "700", fontSize: "16px", color: C.text, marginBottom: "4px" }}>{data.score_label}</div>
        <div style={{ fontSize: "13px", color: C.sub, lineHeight: "1.5" }}>{data.score_reasoning}</div>
      </div>
      <div style={card}>
        <div style={clabel}>What this document says</div>
        <p style={{ fontSize: "15px", color: C.text, lineHeight: "1.6", margin: 0 }}>{data.summary}</p>
      </div>
      {sortedFlags.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ ...clabel, marginBottom: "8px" }}>Red flags ({sortedFlags.length})</div>
          {sortedFlags.map((flag, i) => (
            <div key={i} style={{ ...card, borderLeft: `4px solid ${sevColor(flag.severity)}`, marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, flex: 1, lineHeight: "1.3" }}>{flag.title}</div>
                <span style={{ background: sevColor(flag.severity) + "22", color: sevColor(flag.severity), fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", marginLeft: "8px", flexShrink: 0 }}>{flag.severity}</span>
              </div>
              <p style={{ fontSize: "13px", color: C.sub, margin: 0, lineHeight: "1.5" }}>{flag.explanation}</p>
            </div>
          ))}
        </div>
      )}
      <div style={card}>
        <div style={clabel}>3 things to know before signing</div>
        {(data.key_points || []).map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none" }}>
            <span style={{ color: C.success, fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>✓</span>
            <p style={{ fontSize: "14px", color: C.text, margin: 0, lineHeight: "1.5" }}>{pt}</p>
          </div>
        ))}
      </div>
      {data.missing_clauses?.length > 0 && (
        <div style={card}>
          <div style={clabel}>Missing from this document</div>
          {data.missing_clauses.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", padding: "6px 0" }}>
              <span style={{ color: C.warning, flexShrink: 0 }}>⚠</span>
              <p style={{ fontSize: "13px", color: C.sub, margin: 0, lineHeight: "1.4" }}>{c}</p>
            </div>
          ))}
        </div>
      )}
      {data.legal_terms?.length > 0 && (
        <div style={card}>
          <div style={clabel}>Legal terms explained</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: expTerm !== null ? "10px" : 0 }}>
            {data.legal_terms.map((lt, i) => (
              <button key={i} onClick={() => setExpTerm(expTerm === i ? null : i)}
                style={{ background: expTerm === i ? C.accent : "#F3F4F6", color: expTerm === i ? "#fff" : C.text, border: "none", borderRadius: "20px", padding: "5px 12px", fontSize: "13px", cursor: "pointer", fontWeight: "500", transition: "all 0.2s" }}>
                {lt.term}
              </button>
            ))}
          </div>
          {expTerm !== null && data.legal_terms[expTerm] && (
            <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", padding: "12px", fontSize: "13px", color: C.text, lineHeight: "1.5" }}>
              <strong>{data.legal_terms[expTerm].term}:</strong> {data.legal_terms[expTerm].plain_english}
            </div>
          )}
        </div>
      )}
      <div style={{ ...card, background: recColor + "11", border: `1px solid ${recColor}44`, textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: recColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Recommendation</div>
        <p style={{ fontSize: "15px", color: C.text, margin: 0, fontWeight: "500" }}>{data.recommendation}</p>
      </div>
      <button onClick={copy} style={{ ...btn("secondary"), marginBottom: "8px", fontSize: "14px", padding: "12px" }}>📋 Copy summary</button>
      <button onClick={onNew} style={{ ...btn(), marginBottom: "12px" }}>Analyse another document</button>
      <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", lineHeight: "1.5" }}>{DISCLAIMER}</p>
    </div>
  );
});

// ─── UPGRADE MODAL ────────────────────────────────────────────

function Upgrade({ userEmail, onClose }) {
  const productId = process.env.REACT_APP_LEMONSQUEEZY_PRODUCT_ID;
  const checkoutUrl = `https://store.lemonsqueezy.com/checkout/buy/${productId}?checkout[email]=${encodeURIComponent(userEmail || "")}`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.bg, borderRadius: "20px 20px 0 0", padding: "24px 20px 44px", width: "100%", maxWidth: "420px" }}>
        <div style={{ width: "36px", height: "4px", background: C.border, borderRadius: "2px", margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔓</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px", color: C.text }}>Upgrade to Pro</h2>
          <p style={{ fontSize: "15px", color: C.sub, margin: 0, lineHeight: "1.5" }}>You have used your {FREE_LIMIT} free analyses this month.</p>
        </div>
        <div style={{ background: C.header, borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "4px" }}>Pro Plan</div>
          <div style={{ fontSize: "40px", fontWeight: "700", color: "#fff" }}>${PRO_PRICE}<span style={{ fontSize: "16px", fontWeight: "400", color: "#9CA3AF" }}>/month</span></div>
          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {["Unlimited document analyses", "Full history stored forever", "Priority AI processing", "Cancel anytime"].map((f, i) => (
              <div key={i} style={{ fontSize: "13px", color: "#D1FAE5" }}>✓ {f}</div>
            ))}
          </div>
        </div>
        <a href={checkoutUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: C.accent, color: "#fff", padding: "14px", borderRadius: "8px", fontWeight: "600", fontSize: "16px", textDecoration: "none", marginBottom: "10px" }}>
          Pay with card — ${PRO_PRICE}/month
        </a>
        <button onClick={onClose} style={btn("secondary")}>Continue on free plan</button>
      </div>
    </div>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────

function History({ user, userMeta, onView }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        let q = supabase.from("analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (!userMeta?.is_pro) q = q.limit(3);
        const { data, error: e } = await q;
        if (e) throw e;
        setItems(data || []);
      } catch { setError("Could not load history."); }
      finally { setLoading(false); }
    })();
  }, [user.id, userMeta]);

  const del = async (id) => { await supabase.from("analyses").delete().eq("id", id); setItems(h => h.filter(i => i.id !== id)); };

  if (loading) return <Spin label="Loading history..." />;
  if (error) return <Err message={error} />;
  if (!items.length) return <div style={{ textAlign: "center", padding: "60px 20px" }}><div style={{ fontSize: "40px", marginBottom: "16px" }}>📄</div><h3 style={{ fontSize: "18px", fontWeight: "600", color: C.text, marginBottom: "8px" }}>No analyses yet</h3><p style={{ fontSize: "14px", color: C.sub }}>Documents you analyse will appear here.</p></div>;

  return (
    <div>
      {!userMeta?.is_pro && <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#92400E", marginBottom: "16px", lineHeight: "1.5" }}>Free plan shows your last 3 analyses. Upgrade for unlimited history.</div>}
      {items.map(item => (
        <div key={item.id} style={{ ...card, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.document_type || "Document"}</div>
            <div style={{ fontSize: "12px", color: C.sub }}>{fmtDate(item.created_at)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span style={{ background: scoreColor(item.trust_score) + "22", color: scoreColor(item.trust_score), fontWeight: "700", fontSize: "13px", padding: "3px 8px", borderRadius: "20px" }}>{item.trust_score}/10</span>
            <button onClick={() => onView(item.result)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>View</button>
            <button onClick={() => del(item.id)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "18px", cursor: "pointer", padding: "2px", lineHeight: 1 }}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────

function Settings({ user, userMeta, onSignOut, onUpgrade }) {
  const [cancelling, setCancelling] = useState(false);
  const cancel = async () => {
    if (!window.confirm("Cancel your Pro subscription?")) return;
    setCancelling(true);
    try { await fetch("/api/cancel-subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id }) }); window.location.reload(); }
    catch { alert("Could not cancel. Please try again."); }
    finally { setCancelling(false); }
  };
  const deleteAccount = async () => {
    if (!window.confirm("This permanently deletes your account and all data. Are you sure?")) return;
    try { await supabase.from("analyses").delete().eq("user_id", user.id); await supabase.from("profiles").delete().eq("id", user.id); await supabase.auth.signOut(); }
    catch { alert("Could not delete account. Please contact support."); }
  };
  return (
    <div>
      <div style={card}><div style={clabel}>Account</div><div style={{ fontSize: "15px", color: C.text, fontWeight: "500" }}>{user.email}</div></div>
      <div style={card}>
        <div style={clabel}>Plan</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: userMeta?.is_pro ? "12px" : 0 }}>
          <div>
            <span style={{ fontWeight: "700", fontSize: "18px", color: userMeta?.is_pro ? C.accent : C.text }}>{userMeta?.is_pro ? "Pro" : "Free"}</span>
            {!userMeta?.is_pro && <span style={{ fontSize: "13px", color: C.sub, marginLeft: "8px" }}>{userMeta?.usage_count || 0}/{FREE_LIMIT} used this month</span>}
          </div>
          {!userMeta?.is_pro && <button onClick={onUpgrade} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>Upgrade</button>}
        </div>
        {userMeta?.is_pro && <button onClick={cancel} disabled={cancelling} style={{ background: "none", border: "none", color: C.danger, fontSize: "13px", cursor: "pointer", padding: 0 }}>{cancelling ? "Cancelling..." : "Cancel Pro subscription"}</button>}
      </div>
      <button onClick={onSignOut} style={{ ...btn("secondary"), marginBottom: "8px" }}>Sign out</button>
      <button onClick={deleteAccount} style={{ ...btn("secondary"), color: C.danger, borderColor: "#FECACA", marginBottom: "20px", fontSize: "14px" }}>Delete my account and data</button>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <a href="/privacy" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>Privacy policy</a>
        <a href="/terms" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>Terms of service</a>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("signup");
  const [tab, setTab] = useState("analyse");
  const [result, setResult] = useState(null);
  const [histResult, setHistResult] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [booting, setBooting] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [sampleMode, setSampleMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { loadMeta(session.user.id); setScreen("app"); }
      setBooting(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) { loadMeta(s.user.id); setScreen("app"); } else setScreen("landing");
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadMeta = async (uid) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      setUserMeta(data || { is_pro: false, usage_count: 0 });
    } catch { setUserMeta({ is_pro: false, usage_count: 0 }); }
  };

  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setUserMeta(null); setScreen("landing"); setResult(null); setTab("analyse"); setSampleMode(false); };

  if (booting) return (
    <div style={{ minHeight: "100vh", background: "#F2F2EF", display: "flex", justifyContent: "center", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <div style={{ background: C.header, padding: "14px 20px 12px" }}><h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 }}>{APP_NAME}</h1></div>
        <Spin label="Loading..." />
      </div>
    </div>
  );

  const isAuthed = !!session;
  const showNav = isAuthed && screen === "app" && !onboarding;

  const renderBody = () => {
    if (onboarding) return <Onboarding onFinish={() => setOnboarding(false)} />;
    if (screen === "landing") return <Landing onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }} onLogin={() => { setAuthMode("login"); setScreen("auth"); }} onSample={() => { setSampleMode(true); setScreen("sample"); }} />;
    if (screen === "auth") return <Auth mode={authMode} onSuccess={(isNew) => { if (isNew) setOnboarding(true); setScreen("app"); setTab("analyse"); }} onSwitch={() => setAuthMode(m => m === "signup" ? "login" : "signup")} onBack={() => setScreen("landing")} />;
    if (screen === "sample") {
      if (result) return <Results data={result} onNew={() => { setResult(null); setScreen("landing"); }} isGuest onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }} />;
      return <Analyse user={null} userMeta={null} prefill={SAMPLE_DOCUMENT} onDone={setResult} onUpgrade={() => { setAuthMode("signup"); setScreen("auth"); }} />;
    }
    if (!isAuthed) { setScreen("landing"); return null; }
    if (histResult) return <div><button onClick={() => setHistResult(null)} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", marginBottom: "16px", padding: 0 }}>← Back to history</button><Results data={histResult} onNew={() => { setHistResult(null); setTab("analyse"); }} /></div>;
    if (tab === "analyse") {
      if (result) return <Results data={result} onNew={() => setResult(null)} />;
      return <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />;
    }
    if (tab === "history") return <History user={session.user} userMeta={userMeta} onView={setHistResult} />;
    if (tab === "settings") return <Settings user={session.user} userMeta={userMeta} onSignOut={signOut} onUpgrade={() => setShowUpgrade(true)} />;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F2F2EF", display: "flex", justifyContent: "center", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", position: "relative" }}>
        {!onboarding && (
          <div style={{ background: C.header, padding: "14px 20px 12px", flexShrink: 0 }}>
            <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0 0 2px", letterSpacing: "-0.3px" }}>{APP_NAME}</h1>
            <p style={{ color: C.accent, fontSize: "12px", margin: 0, fontWeight: "500" }}>{APP_TAGLINE}</p>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", paddingBottom: showNav ? "88px" : "20px" }}>
          {renderBody()}
        </div>
        {showNav && (
          <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "420px", background: C.bg, borderTop: `0.5px solid ${C.border}`, display: "flex", zIndex: 100 }}>
            {[{ key: "analyse", label: "Analyse", icon: "📄" }, { key: "history", label: "History", icon: "🕐" }, { key: "settings", label: "Settings", icon: "⚙️" }].map(({ key, label, icon }) => (
              <button key={key} onClick={() => { setTab(key); setResult(null); setHistResult(null); }}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0 14px", cursor: "pointer", border: "none", background: "transparent", color: tab === key ? C.accent : "#9CA3AF", fontSize: "11px", fontWeight: tab === key ? "600" : "400", transition: "color 0.2s" }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>{label}
              </button>
            ))}
          </nav>
        )}
        {showUpgrade && <Upgrade userEmail={session?.user?.email} onClose={() => setShowUpgrade(false)} />}
      </div>
    </div>
  );
}
