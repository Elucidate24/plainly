import { useState, useEffect, useRef, memo } from "react";
import { createClient } from "@supabase/supabase-js";

const LANGS = { en: "EN", nl: "NL", es: "ES" };

const T = {
  en: {
    tagline: "Understand anything you sign",
    disclaimer: "Plainly provides information, not legal advice. Always consult a qualified lawyer for important decisions.",
    analyseBtn: "Analyse document", analysing: "Analysing...", clearBtn: "Clear",
    newBtn: "Analyse another document", shareBtn: "Share this analysis",
    placeholder: "Paste your contract, rental agreement, employment terms, or any legal document here...",
    privacyNote: "Your document is never stored. It is analysed and immediately forgotten.",
    tooShort: "This looks quite short. A real legal document is usually much longer.",
    usedFree: "free analyses used this month", freePlan: "Free plan",
    signUpFree: "Sign up free", usedAnalysis: "You have used your 1 free analysis",
    createAccount: "{tx.createAccount}",
    recommendation: "Recommendation", whatItSays: "What this document says",
    expertAnalysis: "Expert analysis", threeThings: "3 things to know before signing",
    missing: "Missing from this document", legalTerms: "Legal terms explained",
    redFlags: "Red flags", vsIndustry: "vs industry standard",
    worstCase: "Worst case if enforced", negotiationScript: "Negotiation script",
    copy: "Copy", copied: "Copied!", readyEmail: "Ready-to-send negotiation email",
    emailDesc: "This email addresses all the major issues in this contract. Fill in the bracketed details and send.",
    copyEmail: "Copy email", clauseScripts: "Clause-by-clause scripts",
    clauseScriptsDesc: "Use these individually in conversation or on a call.",
    compareTitle: "Compare with another version",
    compareDesc: "{tx.compareDesc}",
    comparePlaceholder: "Paste the revised contract here...", compareBtn: "Compare versions",
    comparing: "Comparing...", whatChanged: "What changed", send: "Send",
    chatTitle: "Ask anything about this contract", chatPlaceholder: "Ask a question about this contract...",
    chatLocked: "Pro+ feature", chatLockedDesc: "{tx.chatLockedDesc}",
    thinking: "Thinking...", noEmail: "{tx.noEmail}",
    noFlags: "{tx.noFlags}", noClauses: "{tx.noClauses}",
    upgradeTitle: "You have used your free analysis", upgradeSubtitle: "{tx.upgradeSubtitle}",
    oneTimeDesc: "Single analysis. No subscription. Pay once.", buyOne: "Buy one analysis",
    proDesc: "Unlimited analyses. No storage. Cancel anytime.", startPro: "Start Pro",
    proPlusDesc: "Unlimited analyses plus unlimited AI chat on every analysis.", startProPlus: "Start Pro+",
    continueFree: "Continue on free plan", newAnalysis: "Analyse another document",
    viewDemo: "View sample analysis", getStarted: "Get started free", signIn: "Sign in",
    about: "About", contact: "Contact", demoTitle: "See a real example",
    demoDesc: "See how Plainly analyses a freelance contract. No account needed.",
    landingHeadline: "Stop signing things you do not understand.",
    landingSubtitle: "Paste any legal document. Get a plain English breakdown with risk warnings in seconds.",
    trustTitle: "What happens when you paste a document",
    testimonial: "Finally understood what I was signing in my rental agreement. Found two clauses I would never have noticed.",
    testimonialAuthor: "Freelance designer, Amsterdam",
    showDetails: "Show details", hideDetails: "Hide",
    tabs: { overview: "Overview", clauses: "Clauses", flags: "Flags", negotiate: "Negotiate", compare: "Compare", chat: "Chat" },
    freeFeatures: ["1 analysis per month", "Full analysis every time", "No document storage"],
    proFeatures: ["Unlimited analyses", "No storage", "Cancel anytime"],
    proPlusFeatures: ["Unlimited analyses", "Unlimited chat", "No storage", "Cancel anytime"],
    features: [
      { icon: "🔍", title: "Plain English summary", desc: "Legal jargon translated instantly" },
      { icon: "🚩", title: "Red flag detection", desc: "Risky clauses highlighted with worst case scenarios" },
      { icon: "⚖️", title: "Industry comparison", desc: "See exactly how restrictive each clause is versus market standard" },
      { icon: "🔒", title: "Complete privacy", desc: "Your documents are never stored. Analysed and immediately forgotten." },
    ],
    trustSteps: [
      { step: "1", icon: "📄", title: "You paste your document", desc: "The text goes directly to our analysis engine. It never touches a database." },
      { step: "2", icon: "🤖", title: "AI analyses it in seconds", desc: "Our system reads every clause and generates your breakdown." },
      { step: "3", icon: "🗑️", title: "Document is immediately forgotten", desc: "The moment your results appear, the document is gone. Permanently." },
    ],
    gaugeMeta: [
      { label: "Standard", desc: "Consistent with prevailing market terms. No elevated risk." },
      { label: "Restrictive", desc: "Departs from standard practice. Shifts risk toward the signing party." },
      { label: "Very restrictive", desc: "Materially exceeds what is commercially reasonable. Should be negotiated." },
      { label: "Aggressive", desc: "Significantly outside acceptable commercial practice." },
    ],
    onboarding: [
      { title: "Welcome to Plainly", body: "Paste any legal document and get a plain English breakdown in seconds.", icon: "👋" },
      { title: "We flag the risks", body: "Red flags highlighted automatically before you sign anything.", icon: "🚩" },
      { title: "Your privacy is protected", body: "We never store your documents. Everything disappears when you close the app.", icon: "🔒" },
    ],
  },
  nl: {
    tagline: "Begrijp alles wat je ondertekent",
    disclaimer: "Plainly biedt informatie, geen juridisch advies. Raadpleeg altijd een gekwalificeerde advocaat voor belangrijke beslissingen.",
    analyseBtn: "Document analyseren", analysing: "Analyseren...", clearBtn: "Wissen",
    newBtn: "Nog een document analyseren", shareBtn: "Analyse delen",
    placeholder: "Plak hier je contract, huurovereenkomst, arbeidsvoorwaarden of een ander juridisch document...",
    privacyNote: "Je document wordt nooit opgeslagen. Het wordt geanalyseerd en onmiddellijk vergeten.",
    tooShort: "Dit lijkt erg kort. Een echt juridisch document is meestal veel langer.",
    usedFree: "gratis analyses gebruikt deze maand", freePlan: "Gratis plan",
    signUpFree: "Gratis aanmelden", usedAnalysis: "Je hebt je gratis analyse gebruikt",
    createAccount: "Maak een gratis account aan voor 1 analyse per maand.",
    recommendation: "Aanbeveling", whatItSays: "Wat dit document zegt",
    expertAnalysis: "Expertanalyse", threeThings: "3 dingen om te weten voor het tekenen",
    missing: "Ontbreekt in dit document", legalTerms: "Juridische termen uitgelegd",
    redFlags: "Rode vlaggen", vsIndustry: "vs. industriestandaard",
    worstCase: "Worst case als dit wordt afgedwongen", negotiationScript: "Onderhandelingsscript",
    copy: "Kopiëren", copied: "Gekopieerd!", readyEmail: "Kant-en-klare onderhandelingsmail",
    emailDesc: "Deze e-mail behandelt alle belangrijke kwesties. Vul de gegevens in en verstuur.",
    copyEmail: "E-mail kopiëren", clauseScripts: "Clausule-per-clausule scripts",
    clauseScriptsDesc: "Gebruik deze individueel in een gesprek of telefoongesprek.",
    compareTitle: "Vergelijk met een andere versie",
    compareDesc: "Plak een herziene versie. Plainly identificeert wat er veranderd is.",
    comparePlaceholder: "Plak hier het herziene contract...", compareBtn: "Versies vergelijken",
    comparing: "Vergelijken...", whatChanged: "Wat er veranderd is", send: "Versturen",
    chatTitle: "Stel alles over dit contract", chatPlaceholder: "Stel een vraag over dit contract...",
    chatLocked: "Pro+ functie", chatLockedDesc: "Upgrade naar Pro+ voor onbeperkte vervolgvragen.",
    thinking: "Nadenken...", noEmail: "Geen onderhandelingsmail gegenereerd voor dit document.",
    noFlags: "Geen significante rode vlaggen gevonden.", noClauses: "Geen clausules teruggegeven.",
    upgradeTitle: "Je hebt je gratis analyse gebruikt", upgradeSubtitle: "Kies het plan dat bij je past.",
    oneTimeDesc: "Enkele analyse. Geen abonnement.", buyOne: "Koop één analyse",
    proDesc: "Onbeperkte analyses. Geen opslag. Altijd opzegbaar.", startPro: "Pro starten",
    proPlusDesc: "Onbeperkte analyses plus onbeperkte AI-chat.", startProPlus: "Pro+ starten",
    continueFree: "Doorgaan met gratis plan", newAnalysis: "Nog een document analyseren",
    viewDemo: "Voorbeeldanalyse bekijken", getStarted: "Gratis beginnen",
    signIn: "Inloggen", about: "Over ons", contact: "Contact",
    demoTitle: "Bekijk een echt voorbeeld", demoDesc: "Zie hoe Plainly een freelancecontract analyseert. Geen account nodig.",
    landingHeadline: "Stop met ondertekenen wat je niet begrijpt.",
    landingSubtitle: "Plak een juridisch document. Krijg in seconden een duidelijke uitleg met risicowaarschuwingen.",
    trustTitle: "Wat er gebeurt als je een document plakt",
    testimonial: "Begreep eindelijk wat ik tekende in mijn huurcontract. Vond twee clausules die ik nooit had opgemerkt.",
    testimonialAuthor: "Freelance ontwerper, Amsterdam",
    showDetails: "Details tonen", hideDetails: "Verbergen",
    tabs: { overview: "Overzicht", clauses: "Clausules", flags: "Vlaggen", negotiate: "Onderhandelen", compare: "Vergelijken", chat: "Chat" },
    freeFeatures: ["1 analyse per maand", "Volledige analyse elke keer", "Geen documentopslag"],
    proFeatures: ["Onbeperkte analyses", "Geen opslag", "Altijd opzegbaar"],
    proPlusFeatures: ["Onbeperkte analyses", "Onbeperkte chat", "Geen opslag", "Altijd opzegbaar"],
    features: [
      { icon: "🔍", title: "Begrijpelijke samenvatting", desc: "Juridisch jargon direct vertaald" },
      { icon: "🚩", title: "Rode vlaggen detecteren", desc: "Risicovolle clausules gemarkeerd met worst-case scenario's" },
      { icon: "⚖️", title: "Industrievergelijking", desc: "Zie hoe restrictief elke clausule is ten opzichte van de marktstandaard" },
      { icon: "🔒", title: "Volledige privacy", desc: "Je documenten worden nooit opgeslagen." },
    ],
    trustSteps: [
      { step: "1", icon: "📄", title: "Je plakt je document", desc: "De tekst gaat rechtstreeks naar onze analyse-engine. Het raakt nooit een database." },
      { step: "2", icon: "🤖", title: "AI analyseert het in seconden", desc: "Ons systeem leest elke clausule en genereert jouw analyse." },
      { step: "3", icon: "🗑️", title: "Document wordt onmiddellijk vergeten", desc: "Op het moment dat je resultaten verschijnen, is het document weg. Permanent." },
    ],
    gaugeMeta: [
      { label: "Standaard", desc: "In overeenstemming met gangbare marktvoorwaarden. Geen verhoogd risico." },
      { label: "Restrictief", desc: "Wijkt af van de standaard marktpraktijk. Verdient aandacht voor ondertekening." },
      { label: "Zeer restrictief", desc: "Overschrijdt wat commercieel redelijk is. Moet worden onderhandeld." },
      { label: "Agressief", desc: "Significant buiten de grenzen van aanvaardbare commerciële praktijk." },
    ],
    onboarding: [
      { title: "Welkom bij Plainly", body: "Plak een juridisch document en krijg in seconden een begrijpelijke uitleg.", icon: "👋" },
      { title: "Wij signaleren de risico's", body: "Rode vlaggen automatisch gemarkeerd voordat je iets ondertekent.", icon: "🚩" },
      { title: "Je privacy is beschermd", body: "Wij slaan je documenten nooit op.", icon: "🔒" },
    ],
  },
  es: {
    tagline: "Entiende todo lo que firmas",
    disclaimer: "Plainly proporciona información, no asesoramiento legal. Consulta siempre a un abogado cualificado para decisiones importantes.",
    analyseBtn: "Analizar documento", analysing: "Analizando...", clearBtn: "Limpiar",
    newBtn: "Analizar otro documento", shareBtn: "Compartir este análisis",
    placeholder: "Pega aquí tu contrato, contrato de arrendamiento, condiciones laborales o cualquier documento legal...",
    privacyNote: "Tu documento nunca se almacena. Se analiza y se olvida inmediatamente.",
    tooShort: "Esto parece muy corto. Un documento legal real suele ser mucho más largo.",
    usedFree: "análisis gratuitos usados este mes", freePlan: "Plan gratuito",
    signUpFree: "Registrarse gratis", usedAnalysis: "Has usado tu análisis gratuito",
    createAccount: "Crea una cuenta gratuita para 1 análisis por mes.",
    recommendation: "Recomendación", whatItSays: "Lo que dice este documento",
    expertAnalysis: "Análisis experto", threeThings: "3 cosas que saber antes de firmar",
    missing: "Lo que falta en este documento", legalTerms: "Términos legales explicados",
    redFlags: "Señales de alerta", vsIndustry: "vs. estándar de la industria",
    worstCase: "Peor caso si se aplica", negotiationScript: "Guión de negociación",
    copy: "Copiar", copied: "¡Copiado!", readyEmail: "Correo de negociación listo para enviar",
    emailDesc: "Este correo aborda todos los problemas principales. Rellena los detalles y envía.",
    copyEmail: "Copiar correo", clauseScripts: "Guiones cláusula por cláusula",
    clauseScriptsDesc: "Úsalos individualmente en una conversación o llamada.",
    compareTitle: "Comparar con otra versión",
    compareDesc: "Pega una versión revisada. Plainly identificará qué cambió y si te beneficia o perjudica.",
    comparePlaceholder: "Pega aquí el contrato revisado...", compareBtn: "Comparar versiones",
    comparing: "Comparando...", whatChanged: "Qué cambió", send: "Enviar",
    chatTitle: "Pregunta lo que quieras sobre este contrato", chatPlaceholder: "Haz una pregunta sobre este contrato...",
    chatLocked: "Función Pro+", chatLockedDesc: "Actualiza a Pro+ para hacer preguntas ilimitadas.",
    thinking: "Pensando...", noEmail: "No se generó ningún correo de negociación para este documento.",
    noFlags: "No se encontraron señales de alerta significativas.", noClauses: "No se devolvieron cláusulas.",
    upgradeTitle: "Has usado tu análisis gratuito", upgradeSubtitle: "Elige el plan que mejor se adapte a ti.",
    oneTimeDesc: "Análisis único. Sin suscripción. Pago único.", buyOne: "Comprar un análisis",
    proDesc: "Análisis ilimitados. Sin almacenamiento. Cancela cuando quieras.", startPro: "Empezar Pro",
    proPlusDesc: "Análisis ilimitados más chat IA ilimitado.", startProPlus: "Empezar Pro+",
    continueFree: "Continuar con el plan gratuito", newAnalysis: "Analizar otro documento",
    viewDemo: "Ver análisis de ejemplo", getStarted: "Empezar gratis",
    signIn: "Iniciar sesión", about: "Acerca de", contact: "Contacto",
    demoTitle: "Ver un ejemplo real", demoDesc: "Mira cómo Plainly analiza un contrato freelance. Sin cuenta necesaria.",
    landingHeadline: "Deja de firmar lo que no entiendes.",
    landingSubtitle: "Pega cualquier documento legal. Obtén una explicación clara con avisos de riesgo en segundos.",
    trustTitle: "Qué ocurre cuando pegas un documento",
    testimonial: "Por fin entendí lo que firmaba en mi contrato de alquiler. Encontré dos cláusulas que nunca habría notado.",
    testimonialAuthor: "Diseñadora freelance, Barcelona",
    showDetails: "Mostrar detalles", hideDetails: "Ocultar",
    tabs: { overview: "Resumen", clauses: "Cláusulas", flags: "Alertas", negotiate: "Negociar", compare: "Comparar", chat: "Chat" },
    freeFeatures: ["1 análisis por mes", "Análisis completo cada vez", "Sin almacenamiento"],
    proFeatures: ["Análisis ilimitados", "Sin almacenamiento", "Cancela cuando quieras"],
    proPlusFeatures: ["Análisis ilimitados", "Chat ilimitado", "Sin almacenamiento", "Cancela cuando quieras"],
    features: [
      { icon: "🔍", title: "Resumen en lenguaje claro", desc: "Jerga legal traducida al instante" },
      { icon: "🚩", title: "Detección de alertas", desc: "Cláusulas de riesgo destacadas con escenarios en el peor caso" },
      { icon: "⚖️", title: "Comparación con el sector", desc: "Ve cómo de restrictiva es cada cláusula frente al estándar del mercado" },
      { icon: "🔒", title: "Privacidad total", desc: "Tus documentos nunca se almacenan." },
    ],
    trustSteps: [
      { step: "1", icon: "📄", title: "Pegas tu documento", desc: "El texto va directamente a nuestro motor de análisis. Nunca toca una base de datos." },
      { step: "2", icon: "🤖", title: "La IA lo analiza en segundos", desc: "Nuestro sistema lee cada cláusula y genera tu análisis." },
      { step: "3", icon: "🗑️", title: "El documento se olvida inmediatamente", desc: "En el momento en que aparecen tus resultados, el documento desaparece. Permanentemente." },
    ],
    gaugeMeta: [
      { label: "Estándar", desc: "Coherente con los términos de mercado predominantes. Sin riesgo elevado." },
      { label: "Restrictivo", desc: "Se aparta de la práctica estándar. Merece atención antes de la firma." },
      { label: "Muy restrictivo", desc: "Supera lo que es comercialmente razonable. Debe negociarse antes de firmar." },
      { label: "Agresivo", desc: "Significativamente fuera de los límites de la práctica comercial aceptable." },
    ],
    onboarding: [
      { title: "Bienvenido a Plainly", body: "Pega cualquier documento legal y obtén una explicación en segundos.", icon: "👋" },
      { title: "Detectamos los riesgos", body: "Señales de alerta resaltadas automáticamente antes de que firmes nada.", icon: "🚩" },
      { title: "Tu privacidad está protegida", body: "Nunca almacenamos tus documentos.", icon: "🔒" },
    ],
  },
};

const APP_NAME = "Plainly";
const APP_TAGLINE = "Understand anything you sign";
const PRO_PRICE = "4.99";
const PRO_PLUS_PRICE = "7.99";
const ONE_TIME_PRICE = "0.99";
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

function Landing({ onSignUp, onLogin, onSample, onAbout, t, lang }) {
  const tx = t || T.en;
  return (
    <div>
      <div style={{ background: C.header, padding: "24px 20px 20px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: "0 0 4px" }}>{APP_NAME}</h1>
        <p style={{ color: C.accent, fontSize: "13px", margin: 0, fontWeight: "500" }}>{APP_TAGLINE}</p>
      </div>
      <div style={{ padding: "28px 20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, lineHeight: "1.2", marginBottom: "12px" }}>{tx.landingHeadline}</h2>
        <p style={{ fontSize: "15px", color: C.sub, lineHeight: "1.6", marginBottom: "28px" }}>{tx.landingSubtitle}</p>

        {(tx.features || T.en.features).map((f, i) => (
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
          <div style={{ fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "16px" }}>{tx.trustTitle}</div>
          {(tx.trustSteps || T.en.trustSteps).map((s, i) => (
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
          <button onClick={onSample} style={{ ...btnStyle("primary", false), background: "#8A6828", padding: "10px", fontSize: "14px" }}>{tx.viewDemo}</button>
        </div>

        <button onClick={onSignUp} style={{ ...btnStyle("primary", false), marginBottom: "10px" }}>{tx.getStarted}</button>
        <button onClick={onLogin} style={{ ...btnStyle("secondary", false), marginBottom: "10px" }}>Sign in</button>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "20px" }}>
          <button onClick={onAbout} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", fontWeight: "500" }}>About</button>
          <a href="mailto:plainlyteam@gmail.com" style={{ color: C.accent, fontSize: "14px", textDecoration: "none", fontWeight: "500" }}>Contact</a>
        </div>

        <div style={{ background: C.light, borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>What people say</div>
          <div style={{ fontSize: "14px", color: C.text, lineHeight: "1.6", fontStyle: "italic", marginBottom: "8px" }}>{tx.testimonial}</div>
          <div style={{ fontSize: "12px", color: C.sub }}>— Freelance designer, Amsterdam</div>
        </div>

        <div style={{ border: `0.5px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, padding: "12px", borderRight: `0.5px solid ${C.border}` }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Free</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "6px" }}>$0</div>
              {(tx.freeFeatures || T.en.freeFeatures).map((f, i) => (
                <div key={i} style={{ fontSize: "10px", color: C.sub, marginBottom: "3px" }}>✓ {f}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "12px", borderRight: `0.5px solid ${C.border}`, background: C.light }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>One-time</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "6px" }}>${ONE_TIME_PRICE}</div>
              {(tx.freeFeatures || T.en.freeFeatures).map((f, i) => (
                <div key={i} style={{ fontSize: "10px", color: C.sub, marginBottom: "3px" }}>✓ {f}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "12px", borderRight: `0.5px solid ${C.border}`, background: C.header }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Pro</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>${PRO_PRICE}<span style={{ fontSize: "10px", fontWeight: "400", color: "#8A8585" }}>/mo</span></div>
              {(tx.proFeatures || T.en.proFeatures).map((f, i) => (
                <div key={i} style={{ fontSize: "10px", color: "#E8D4A0", marginBottom: "3px" }}>✓ {f}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "12px", background: "#141414" }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Pro+</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>${PRO_PLUS_PRICE}<span style={{ fontSize: "10px", fontWeight: "400", color: "#8A8585" }}>/mo</span></div>
              {(tx.proPlusFeatures || T.en.proPlusFeatures).map((f, i) => (
                <div key={i} style={{ fontSize: "10px", color: "#E8D4A0", marginBottom: "3px" }}>✓ {f}</div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", lineHeight: "1.5" }}>{tx ? tx.disclaimer : DISCLAIMER}</p>
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

function Analyse({ user, userMeta, prefill, onDone, onUpgrade, t, lang }) {
  const tx = t || T.en;
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
      <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", marginTop: "16px", lineHeight: "1.5" }}>{tx ? tx.disclaimer : DISCLAIMER}</p>
    </div>
  );
}

const Results = memo(function Results({ data, onNew, isGuest, onSignUp, user, userMeta, t, lang }) {
  const tx = t || T.en;
  const [expTerm, setExpTerm] = useState(null);
  const [expClause, setExpClause] = useState(0);
  const [expFlag, setExpFlag] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);
  const [compText, setCompText] = useState("");
  const [compResult, setCompResult] = useState(null);
  const [compLoading, setCompLoading] = useState(false);
  const chatRef = useRef(null);

  const isProPlus = userMeta?.is_pro_plus;

  const recColor = data.recommendation?.toLowerCase().includes("avoid") || data.recommendation?.toLowerCase().includes("do not") ? C.danger
    : data.recommendation?.toLowerCase().includes("negotiate") ? C.warning : C.success;
  const sortedFlags = [...(data.red_flags || [])].sort((a, b) =>
    ({ high: 0, medium: 1, low: 2 }[a.severity] - ({ high: 0, medium: 1, low: 2 }[b.severity])));

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const context = `You are a legal expert assistant. The user has just had this document analysed:\n\nDocument type: ${data.document_type}\nTrust score: ${data.trust_score}/10\nSummary: ${data.summary}\nRed flags: ${sortedFlags.map(f => f.title + ": " + f.explanation).join(". ")}\nRecommendation: ${data.recommendation}\n\nAnswer their follow-up questions clearly and specifically based on this document. Be direct. Do not hedge unnecessarily. If you do not know something, say so.`;
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-plainly-secret": process.env.REACT_APP_API_SECRET || "" },
        body: JSON.stringify({ text: context + "\n\nUser question: " + msg, userId: null, chatMode: true })
      });
      const resData = await res.json();
      const reply = resData.chatReply || resData.result?.summary || "I could not answer that. Please try rephrasing.";
      setChatMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
    }
  };

  const gaugeLevel = (comparison) => {
    const c = (comparison || "").toLowerCase();
    if (c.includes("unusually aggressive") || c.includes("rarely seen")) return 3;
    if (c.includes("significantly")) return 2;
    if (c.includes("more restrictive") || c.includes("stricter") || c.includes("broader") || c.includes("longer") || c.includes("higher")) return 1;
    return 0;
  };

  const gaugeColors = ["#4A7A5A","#C4973D","#C07040","#C0504A"];
  const gaugeBgs = ["#F0F7F0","#FBF5E8","#FBF0E8","#FBF0F0"];
  const gaugeMeta = (tx.gaugeMeta || T.en.gaugeMeta).map((m, i) => ({ ...m, color: gaugeColors[i], bg: gaugeBgs[i] }));

  const tbs = tx.tabs || T.en.tabs;
  const TABS = [
    { key: "overview", label: tbs.overview },
    { key: "clauses", label: tbs.clauses },
    { key: "flags", label: `${tbs.flags} (${sortedFlags.length})` },
    { key: "negotiate", label: tbs.negotiate },
    { key: "compare", label: tbs.compare },
    { key: "chat", label: tbs.chat },
  ];

  return (
    <div>
      {isGuest && (
        <div style={{ background: C.header, borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "#fff", fontSize: "14px", margin: "0 0 4px", fontWeight: "600" }}>{tx.usedAnalysis}</p>
          <p style={{ color: "#8A8585", fontSize: "13px", margin: "0 0 10px" }}>{tx.createAccount}</p>
          <button onClick={onSignUp} style={{ ...btnStyle("primary", false), padding: "10px", fontSize: "14px" }}>{tx.signUpFree}</button>
        </div>
      )}

      {/* Score card */}
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#EDECE6", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600", color: C.sub, marginBottom: "12px" }}>{data.document_type}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}><ScoreRing score={data.trust_score} /></div>
        <div style={{ display: "inline-block", background: scoreColor(data.trust_score) + "22", color: scoreColor(data.trust_score), borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
          {scoreContext(data.trust_score).label}
        </div>
        <p style={{ fontSize: "13px", color: C.sub, margin: "0 0 10px", lineHeight: "1.5" }}>{scoreContext(data.trust_score).desc}</p>
        <div style={{ fontWeight: "700", fontSize: "16px", color: C.text, marginBottom: "4px" }}>{data.score_label}</div>
        <div style={{ fontSize: "13px", color: C.sub, lineHeight: "1.6" }}>{data.score_reasoning}</div>
      </div>

      {/* Recommendation */}
      <div style={{ ...cardStyle, background: recColor + "11", border: `1px solid ${recColor}44`, textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: recColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{tx.recommendation}</div>
        <p style={{ fontSize: "15px", color: C.text, margin: 0, fontWeight: "600" }}>{data.recommendation}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", overflowX: "auto", marginBottom: "16px", paddingBottom: "2px" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ flexShrink: 0, padding: "7px 14px", borderRadius: "20px", border: "none", fontSize: "13px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap",
              background: activeTab === t.key ? C.header : C.light,
              color: activeTab === t.key ? C.accent : C.sub }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div>
          <div style={cardStyle}>
            <div style={labelStyle}>{tx.whatItSays}</div>
            <p style={{ fontSize: "15px", color: C.text, lineHeight: "1.7", margin: 0 }}>{data.summary}</p>
          </div>

          {data.deep_analysis && (
            <div style={cardStyle}>
              <div style={labelStyle}>{tx.expertAnalysis}</div>
              {data.deep_analysis.split("\n").filter(p => p.trim()).map((para, i, arr) => (
                <p key={i} style={{ fontSize: "14px", color: C.text, lineHeight: "1.8", margin: 0, marginBottom: i < arr.length - 1 ? "14px" : 0 }}>{para}</p>
              ))}
            </div>
          )}

          <div style={cardStyle}>
            <div style={labelStyle}>{tx.threeThings}</div>
            {(data.key_points || []).map((pt, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", padding: "10px 0", borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none" }}>
                <span style={{ color: C.accent, fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>0{i + 1}</span>
                <p style={{ fontSize: "14px", color: C.text, margin: 0, lineHeight: "1.6" }}>{pt}</p>
              </div>
            ))}
          </div>

          {data.missing_clauses?.length > 0 && (
            <div style={cardStyle}>
              <div style={labelStyle}>{tx.missing}</div>
              {data.missing_clauses.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < data.missing_clauses.length - 1 ? `0.5px solid ${C.border}` : "none" }}>
                  <span style={{ color: C.warning, flexShrink: 0, fontSize: "16px" }}>⚠</span>
                  <p style={{ fontSize: "13px", color: C.text, margin: 0, lineHeight: "1.6" }}>{c}</p>
                </div>
              ))}
            </div>
          )}

          {data.legal_terms?.length > 0 && (
            <div style={cardStyle}>
              <div style={labelStyle}>{tx.legalTerms}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: expTerm !== null ? "12px" : 0 }}>
                {data.legal_terms.map((lt, i) => (
                  <button key={i} onClick={() => setExpTerm(expTerm === i ? null : i)}
                    style={{ background: expTerm === i ? C.accent : "#EDECE6", color: expTerm === i ? "#1A1814" : C.text, border: "none", borderRadius: "20px", padding: "5px 12px", fontSize: "13px", cursor: "pointer", fontWeight: expTerm === i ? "600" : "400" }}>
                    {lt.term}
                  </button>
                ))}
              </div>
              {expTerm !== null && data.legal_terms[expTerm] && (
                <div style={{ background: C.accentLight, border: `1px solid #E8D4A0`, borderRadius: "8px", padding: "12px 14px", fontSize: "13px", color: C.text, lineHeight: "1.6" }}>
                  <strong style={{ color: C.accentDark }}>{data.legal_terms[expTerm].term}:</strong> {data.legal_terms[expTerm].plain_english}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CLAUSES TAB */}
      {activeTab === "clauses" && (
        <div>
          <p style={{ fontSize: "13px", color: C.sub, marginBottom: "12px", lineHeight: "1.5" }}>Every significant clause rated and explained. Tap any clause to read the full analysis and negotiation script.</p>
          {(data.clauses || []).length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", color: C.sub }}>{tx.noClauses}</div>
          )}
          {(data.clauses || []).map((cl, i) => {
            const lvl = cl.standard === "unusually aggressive" ? 3 : cl.standard === "very restrictive" ? 2 : cl.standard === "restrictive" ? 1 : 0;
            const meta = gaugeMeta[lvl];
            const open = expClause === i;
            return (
              <div key={i} style={{ ...cardStyle, marginBottom: "8px", borderLeft: `4px solid ${meta.color}`, cursor: "pointer" }} onClick={() => setExpClause(open ? null : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, flex: 1 }}>{cl.title}</div>
                  <span style={{ background: meta.bg, color: meta.color, fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", marginLeft: "8px", whiteSpace: "nowrap" }}>{meta.label}</span>
                </div>
                {open && (
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>What it says</div>
                    <p style={{ fontSize: "13px", color: C.text, lineHeight: "1.6", margin: "0 0 12px" }}>{cl.what_it_says}</p>
                    <div style={{ background: "#FAF0EF", border: "1px solid #E8C0BE", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: C.danger, marginBottom: "4px" }}>{tx.worstCase}</div>
                      <p style={{ fontSize: "13px", color: C.text, margin: 0, lineHeight: "1.5" }}>{cl.worst_case}</p>
                    </div>
                    {cl.negotiation_script && (
                      <div style={{ background: C.accentLight, border: `1px solid #E8D4A0`, borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: C.accentDark }}>{tx.negotiationScript}</div>
                          <button onClick={e => { e.stopPropagation(); copy(cl.negotiation_script, "clause" + i); }}
                            style={{ background: "none", border: "none", color: C.accent, fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                            {copied === "clause" + i ? tx.copied : tx.copy}
                          </button>
                        </div>
                        <p style={{ fontSize: "13px", color: C.text, margin: 0, lineHeight: "1.6", fontStyle: "italic" }}>{cl.negotiation_script}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FLAGS TAB */}
      {activeTab === "flags" && (
        <div>
          <p style={{ fontSize: "13px", color: C.sub, marginBottom: "12px", lineHeight: "1.5" }}>Issues ranked by severity. Tap any flag for the full analysis, industry comparison and negotiation script.</p>
          {sortedFlags.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", color: C.sub }}>{tx.noFlags}</div>
          )}
          {sortedFlags.map((flag, i) => {
            const lvl = gaugeLevel(flag.industry_comparison);
            const meta = gaugeMeta[lvl];
            const open = expFlag === i;
            return (
              <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${sevColor(flag.severity)}`, marginBottom: "8px", cursor: "pointer" }} onClick={() => setExpFlag(open ? null : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, flex: 1 }}>{flag.title}</div>
                  <span style={{ background: sevColor(flag.severity) + "22", color: sevColor(flag.severity), fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", marginLeft: "8px" }}>{flag.severity}</span>
                </div>
                {!open && <p style={{ fontSize: "13px", color: C.sub, margin: "6px 0 0", lineHeight: "1.5" }}>{flag.explanation?.slice(0, 120)}...</p>}
                {open && (
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ fontSize: "13px", color: C.text, margin: "0 0 14px", lineHeight: "1.7" }}>{flag.explanation}</p>
                    {flag.industry_comparison && (
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "10px", fontWeight: "600", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{tx.vsIndustry}</div>
                        <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                          {[0, 1, 2, 3].map(j => (
                            <div key={j} style={{ flex: 1, height: "4px", borderRadius: "2px", background: j <= lvl ? gaugeMeta[lvl].color : C.border }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          {gaugeMeta.map((m, j) => (
                            <span key={j} style={{ fontSize: "9px", color: j === lvl ? m.color : C.muted, fontWeight: j === lvl ? "700" : "400" }}>{m.label}</span>
                          ))}
                        </div>
                        <div style={{ background: meta.bg, borderRadius: "8px", padding: "10px 12px", borderLeft: `3px solid ${meta.color}`, marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", color: meta.color, fontWeight: "600", display: "block", marginBottom: "4px" }}>{meta.label}</span>
                          <span style={{ fontSize: "12px", color: C.sub, lineHeight: "1.5" }}>{meta.desc}</span>
                        </div>
                        <div style={{ background: C.light, borderRadius: "6px", padding: "8px 12px" }}>
                          <span style={{ fontSize: "12px", color: C.sub, fontStyle: "italic" }}>{flag.industry_comparison}</span>
                        </div>
                      </div>
                    )}
                    {flag.negotiation_script && (
                      <div style={{ background: C.accentLight, border: `1px solid #E8D4A0`, borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: C.accentDark }}>{tx.negotiationScript}</div>
                          <button onClick={e => { e.stopPropagation(); copy(flag.negotiation_script, "flag" + i); }}
                            style={{ background: "none", border: "none", color: C.accent, fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                            {copied === "flag" + i ? tx.copied : tx.copy}
                          </button>
                        </div>
                        <p style={{ fontSize: "13px", color: C.text, margin: 0, lineHeight: "1.6", fontStyle: "italic" }}>{flag.negotiation_script}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* NEGOTIATE TAB */}
      {activeTab === "negotiate" && (
        <div>
          <div style={cardStyle}>
            <div style={labelStyle}>{tx.readyEmail}</div>
            <p style={{ fontSize: "13px", color: C.sub, marginBottom: "14px", lineHeight: "1.5" }}>{tx.emailDesc}</p>
            {data.negotiation_email ? (
              <>
                <div style={{ background: C.light, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "14px", fontSize: "13px", color: C.text, lineHeight: "1.8", whiteSpace: "pre-wrap", fontFamily: "inherit", marginBottom: "12px" }}>
                  {data.negotiation_email}
                </div>
                <button onClick={() => { copy(data.negotiation_email, "email"); setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000); }}
                  style={{ ...btnStyle("primary", false), padding: "12px", fontSize: "14px" }}>
                  {emailCopied ? "Copied to clipboard!" : "Copy email"}
                </button>
              </>
            ) : (
              <div style={{ color: C.sub, fontSize: "13px" }}>{tx.noEmail}</div>
            )}
          </div>

          {(data.clauses || []).filter(c => c.negotiation_script).length > 0 && (
            <div style={cardStyle}>
              <div style={labelStyle}>{tx.clauseScripts}</div>
              <p style={{ fontSize: "13px", color: C.sub, marginBottom: "12px" }}>{tx.clauseScriptsDesc}</p>
              {(data.clauses || []).filter(c => c.negotiation_script).map((cl, i) => (
                <div key={i} style={{ background: C.light, borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ fontWeight: "600", fontSize: "13px", color: C.text }}>{cl.title}</div>
                    <button onClick={() => copy(cl.negotiation_script, "neg" + i)}
                      style={{ background: "none", border: "none", color: C.accent, fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                      {copied === "neg" + i ? tx.copied : tx.copy}
                    </button>
                  </div>
                  <p style={{ fontSize: "13px", color: C.sub, margin: 0, lineHeight: "1.6", fontStyle: "italic" }}>{cl.negotiation_script}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPARE TAB */}
      {activeTab === "compare" && (
        <div>
          <div style={cardStyle}>
            <div style={labelStyle}>{tx.compareTitle}</div>
            <p style={{ fontSize: "13px", color: C.sub, marginBottom: "12px", lineHeight: "1.5" }}>{tx.compareDesc}</p>
            <textarea value={compText} onChange={e => setCompText(e.target.value)}
              placeholder="Paste the revised contract here..."
              style={{ ...inputCss, height: "160px", resize: "vertical", fontSize: "13px", lineHeight: "1.6", marginBottom: "10px" }} />
            <button onClick={async () => {
              if (!compText.trim() || compLoading) return;
              setCompLoading(true);
              setCompResult(null);
              try {
                const prompt = `Original contract summary:\n${data.summary}\n\nOriginal red flags: ${sortedFlags.map(f => f.title).join(", ")}\n\nOriginal trust score: ${data.trust_score}/10\n\nRevised version:\n${compText.slice(0, 8000)}\n\nIdentify what changed between the original and revised version. For each change, state: what changed, whether it helps or hurts the signing party, and why. Then give an overall verdict on whether the revision is better or worse than the original. Be specific and direct.`;
                const res = await fetch("/api/analyse", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "x-plainly-secret": process.env.REACT_APP_API_SECRET || "" },
                  body: JSON.stringify({ text: prompt, userId: null, chatMode: true })
                });
                const d = await res.json();
                setCompResult(d.chatReply || d.result?.summary || "Could not generate comparison.");
              } catch { setCompResult("Something went wrong. Please try again."); }
              finally { setCompLoading(false); }
            }} disabled={!compText.trim() || compLoading} style={{ ...btnStyle("primary", !compText.trim() || compLoading), padding: "12px", fontSize: "14px" }}>
              {compLoading ? "Comparing..." : "Compare versions"}
            </button>
          </div>
          {compResult && (
            <div style={cardStyle}>
              <div style={labelStyle}>{tx.whatChanged}</div>
              {compResult.split("\n").filter(p => p.trim()).map((para, i, arr) => (
                <p key={i} style={{ fontSize: "14px", color: C.text, lineHeight: "1.7", margin: 0, marginBottom: i < arr.length - 1 ? "12px" : 0 }}>{para}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === "chat" && (
        <div>
          {!isProPlus && (
            <div style={{ background: C.header, borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center" }}>
              <p style={{ color: "#fff", fontSize: "14px", margin: "0 0 4px", fontWeight: "600" }}>{tx.chatLocked}</p>
              <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "0 0 10px" }}>{tx.chatLockedDesc}</p>
              <button onClick={onSignUp} style={{ ...btnStyle("primary", false), padding: "10px", fontSize: "14px", background: C.accent, color: "#1A1814" }}>Upgrade to Pro+ — ${PRO_PLUS_PRICE}/mo</button>
            </div>
          )}
          <div style={{ ...cardStyle, opacity: isProPlus ? 1 : 0.4, pointerEvents: isProPlus ? "auto" : "none" }}>
            <div style={labelStyle}>{tx.chatTitle}</div>
            <div ref={chatRef} style={{ height: "280px", overflowY: "auto", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMessages.length === 0 && (
                <div style={{ color: C.muted, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
                  Ask anything about this contract. Try:<br /><br />
                  <span style={{ color: C.sub }}>"Can I negotiate the non-compete clause?"<br />"What happens if I break clause 3?"<br />"Is the payment term normal?"</span>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", background: m.role === "user" ? C.header : C.light, color: m.role === "user" ? "#fff" : C.text, borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "10px 14px", fontSize: "13px", lineHeight: "1.6" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ background: C.light, borderRadius: "12px 12px 12px 2px", padding: "10px 14px", fontSize: "13px", color: C.sub }}>{tx.thinking}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                placeholder={tx.chatPlaceholder}
                style={{ ...inputCss, flex: 1, padding: "10px 14px", fontSize: "14px" }} />
              <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                style={{ background: C.accent, color: "#1A1814", border: "none", borderRadius: "8px", padding: "0 16px", fontWeight: "600", cursor: chatInput.trim() && !chatLoading ? "pointer" : "not-allowed", opacity: chatInput.trim() && !chatLoading ? 1 : 0.5, fontSize: "14px", flexShrink: 0 }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div style={{ marginTop: "16px" }}>
        <button onClick={() => { copy(`Plainly Contract Analysis\n\n${data.document_type}\nTrust Score: ${data.trust_score}/10\n\n${data.score_label}\n\n${data.recommendation}\n\nAnalysed with Plainly — plainly-opal.vercel.app`, "share"); }}
          style={{ ...btnStyle("secondary", false), marginBottom: "8px", fontSize: "14px", padding: "12px" }}>
          {copied === "share" ? tx.copied : "Share this analysis"}
        </button>
        <button onClick={onNew} style={{ ...btnStyle("primary", false), marginBottom: "12px" }}>{tx.newBtn}</button>
        <p style={{ fontSize: "11px", color: C.sub, textAlign: "center", lineHeight: "1.5" }}>{tx ? tx.disclaimer : DISCLAIMER}</p>
      </div>
    </div>
  );
});


function Upgrade({ userEmail, onClose, t }) {
  const tx = t || T.en;
  const productId = process.env.REACT_APP_LEMONSQUEEZY_PRODUCT_ID;
  const proUrl = productId ? `https://store.lemonsqueezy.com/checkout/buy/${productId}?checkout[email]=${encodeURIComponent(userEmail || "")}` : "https://app.lemonsqueezy.com";
  const proPlusUrl = proUrl;
  const oneTimeUrl = proUrl;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.bg, borderRadius: "20px 20px 0 0", padding: "24px 20px 44px", width: "100%", maxWidth: "720px" }}>
        <div style={{ width: "36px", height: "4px", background: C.border, borderRadius: "2px", margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 6px", color: C.text }}>{tx.upgradeTitle}</h2>
          <p style={{ fontSize: "14px", color: C.sub, margin: 0 }}>{tx.upgradeSubtitle}</p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div style={{ flex: 1, background: C.light, borderRadius: "12px", padding: "14px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>One-time</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: C.text, marginBottom: "6px" }}>${ONE_TIME_PRICE}</div>
            <div style={{ fontSize: "11px", color: C.sub, marginBottom: "10px", lineHeight: "1.4" }}>{tx.oneTimeDesc}</div>
            <a href={oneTimeUrl} target="_blank" rel="noreferrer" style={{ ...btnStyle("secondary", false), fontSize: "12px", padding: "8px", textDecoration: "none" }}>
              Buy one analysis
            </a>
          </div>

          <div style={{ flex: 1, background: C.surface, borderRadius: "12px", padding: "14px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Pro</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: C.text, marginBottom: "2px" }}>${PRO_PRICE}<span style={{ fontSize: "11px", fontWeight: "400", color: C.sub }}>/mo</span></div>
            <div style={{ fontSize: "11px", color: C.sub, marginBottom: "10px", lineHeight: "1.4" }}>{tx.proDesc}</div>
            <a href={proUrl} target="_blank" rel="noreferrer" style={{ ...btnStyle("primary", false), fontSize: "12px", padding: "8px", textDecoration: "none" }}>
              Start Pro
            </a>
          </div>

          <div style={{ flex: 1, background: C.header, borderRadius: "12px", padding: "14px", border: `1px solid ${C.header}` }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Pro+</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "2px" }}>${PRO_PLUS_PRICE}<span style={{ fontSize: "11px", fontWeight: "400", color: "#8A8585" }}>/mo</span></div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px", lineHeight: "1.4" }}>{tx.proPlusDesc}</div>
            <a href={proPlusUrl} target="_blank" rel="noreferrer" style={{ ...btnStyle("primary", false), fontSize: "12px", padding: "8px", textDecoration: "none", background: C.accent, color: C.header }}>
              Start Pro+
            </a>
          </div>
        </div>

        <button onClick={onClose} style={{ ...btnStyle("secondary", false), fontSize: "13px", color: C.sub }}>{tx.continueFree}</button>
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
  const [lang, setLang] = useState("en");
  const t = T[lang];

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
        score_label: "This contract strongly favours the client and leaves the freelancer with almost no protection.",
        score_reasoning: "Three clauses in combination create serious financial exposure: unlimited revisions with no cap, payment withholding at the client's sole discretion, and termination without payment for completed work. The 2-year worldwide non-compete is disproportionate for a single freelance project and would not survive scrutiny in most jurisdictions. This contract was drafted entirely in the client's interest.",
        summary: "This is a freelance services agreement in which the client retains almost all control. The freelancer must complete unlimited revisions at no extra cost, cannot enforce payment if the client deems the work unsatisfactory, and forfeits all completed work if the client terminates. Intellectual property transfers to the client at the moment of creation, before any payment is made. A 2-year worldwide non-compete prevents the freelancer from working in the same industry after the project ends. Every ambiguous clause resolves in the client's favour. This is a deliberate drafting choice, not an oversight.",
        deep_analysis: "This contract was drafted by someone whose sole objective was to protect the client at every point of friction. The structure is consistent: wherever a clause could go either way, it goes the client's way. This is not a balanced commercial agreement between two parties. It is a terms of engagement document written by one party for signature by the other.\n\nThe unlimited revisions clause is the most immediately dangerous provision. Combined with the subjective payment standard, it creates a mechanism by which a client can demand changes indefinitely, decide at any point that the work does not meet their satisfaction, and legally withhold payment in full. There is no definition of what constitutes satisfactory completion, no limit on the number of revision cycles, and no independent standard against which the work is measured. A client acting in bad faith has everything they need here.\n\nThe termination clause compounds this risk severely. The client can end the agreement at any time for any reason without compensating the freelancer for work already completed. Combined with the IP transfer clause which vests ownership in the client from the moment of creation, the client could terminate after receiving substantial completed work, retain full ownership of that work, and owe nothing. This is not a theoretical risk. It is the most common mechanism through which freelancers are defrauded.\n\nThe 2-year worldwide non-compete is the clause that will cause the most long-term damage. A restriction of this scope is simply not proportionate to a single freelance project. It is designed to prevent a competitor from hiring the freelancer after the project ends, not to protect any legitimate business interest. Courts in the Netherlands, the United Kingdom and most European jurisdictions would likely find this unenforceable, but enforceability depends on litigation, which is expensive and uncertain. The safer approach is to remove it before signing.\n\nThe payment terms of 60 days with no late payment penalty create a final layer of risk. Industry standard for freelance work is 14 to 30 days with a late payment clause. 60 days with no consequence for delay is a cash flow problem that compounds every other issue in this agreement.",
        clauses: [
          {
            title: "Unlimited revisions",
            what_it_says: "The freelancer must make revisions to the work until the client is satisfied. There is no limit on the number of revision rounds and no definition of what constitutes satisfaction. The obligation continues indefinitely until the client approves the work.",
            standard: "unusually aggressive",
            worst_case: "A client could request revisions for months or years, changing direction repeatedly, and the freelancer would be contractually obligated to comply without additional compensation. The project could consume far more time than scoped with no financial recourse.",
            negotiation_script: "I am happy to include a revision clause but I need it to be limited to two rounds of revisions within the agreed scope. Anything beyond that would be treated as a new instruction and quoted separately. Could we update clause 4 to reflect that?"
          },
          {
            title: "Subjective payment standard",
            what_it_says: "Payment is conditional on the client's satisfaction. The client has sole discretion to determine whether the work meets the required standard. There is no objective benchmark, no independent review mechanism and no timeline for the client to communicate their decision.",
            standard: "unusually aggressive",
            worst_case: "The client could withhold payment indefinitely or permanently by claiming dissatisfaction with no obligation to specify what would constitute acceptable work. The freelancer has no contractual ground to enforce payment even after delivering work that meets the original brief.",
            negotiation_script: "Payment should be tied to delivery against the agreed brief, not to subjective satisfaction. I would like to replace the satisfaction standard with delivery of work consistent with the specifications in Schedule A. Can we make that change to clause 6?"
          },
          {
            title: "Termination without payment",
            what_it_says: "The client may terminate this agreement at any time for any reason by giving written notice. On termination, the freelancer is not entitled to payment for work completed but not yet invoiced.",
            standard: "unusually aggressive",
            worst_case: "The client terminates after receiving 80 percent of the completed project. They retain ownership of all work created to that point and owe nothing. The freelancer loses all time invested with no compensation.",
            negotiation_script: "I need a kill fee provision. If you terminate the project I need to be paid for all work completed to the termination date at the pro-rata day rate. Could we add a clause confirming that termination does not affect the right to payment for work already delivered?"
          },
          {
            title: "Worldwide 2-year non-compete",
            what_it_says: "For 2 years following the end of this agreement, the freelancer may not provide services to any business operating in the same industry anywhere in the world.",
            standard: "unusually aggressive",
            worst_case: "The freelancer is prevented from working in their primary industry for 2 years globally. A graphic designer working for a marketing agency could not take any marketing agency client worldwide for 2 years. This effectively ends their freelance practice.",
            negotiation_script: "A 2-year worldwide restriction is disproportionate for a freelance project. I cannot accept a clause that prevents me from working in my industry. I would accept a 3-month non-solicitation restricted to your direct competitors in the Netherlands, but not a global non-compete of this scope."
          },
          {
            title: "IP transfer before payment",
            what_it_says: "All intellectual property in the work transfers to the client at the moment of creation. The freelancer retains no rights in the work from that point regardless of whether payment has been received.",
            standard: "very restrictive",
            worst_case: "The client receives full ownership of the work before paying for it. If payment is withheld or the client terminates, the freelancer cannot use their own work as leverage because they no longer own it.",
            negotiation_script: "IP should transfer on receipt of full payment, not on creation. Until payment clears I need to retain ownership as security. Please amend clause 8 so that IP transfers upon final payment being received in full."
          },
        ],
        red_flags: [
          {
            title: "Unlimited revisions with no cap",
            explanation: "Clause 4 requires the freelancer to make revisions until the client is satisfied with no limit on the number of rounds and no definition of satisfaction. This clause, combined with the subjective payment standard in clause 6, creates a mechanism for a client to demand indefinite work without ever triggering a payment obligation. The freelancer has no contractual exit from this cycle. In practice this is how projects drag from weeks into months without additional compensation.",
            severity: "high",
            industry_comparison: "This is unusually aggressive. Standard freelance contracts in the Netherlands and across the EU cap revisions at 2 to 3 rounds within the original scope. Any additional revisions are treated as change requests and quoted separately. Unlimited revision obligations without compensation are not found in balanced commercial agreements.",
            negotiation_script: "Clause 4 needs a revision limit. I propose 2 rounds of revisions within the original scope included in the fee, with any further revisions quoted at my standard day rate. Please confirm you are happy to amend this before I sign."
          },
          {
            title: "Payment withheld at client's sole discretion",
            explanation: "Clause 6 makes payment conditional on the client's subjective satisfaction. There is no objective standard, no independent arbiter and no timeline for the client to communicate their decision. This gives the client a legally defensible reason to withhold payment indefinitely simply by claiming dissatisfaction. A freelancer who has delivered work consistent with the brief has no contractual mechanism to enforce payment if the client chooses to invoke this clause. This is the single most common cause of non-payment disputes in freelance agreements.",
            severity: "high",
            industry_comparison: "This is significantly more restrictive than standard. Industry standard payment terms tie payment to delivery of work consistent with the agreed brief or specification. Subjective satisfaction standards are occasionally seen in consumer-facing service agreements but are not acceptable in commercial B2B freelance contracts.",
            negotiation_script: "Payment should not be conditional on satisfaction. It should be conditional on delivery of work consistent with the agreed brief in Schedule A. I need clause 6 amended to reflect objective delivery criteria before I can sign."
          },
          {
            title: "Termination without compensation for completed work",
            explanation: "The termination clause allows the client to end the agreement at any time for any reason and explicitly excludes payment for work completed but not yet invoiced. Combined with the IP transfer clause which vests ownership in the client from the moment of creation, this means the client can terminate after receiving substantial completed work, retain full ownership of everything created, and owe nothing. This is not a theoretical edge case. It is the mechanism most commonly used in deliberate non-payment disputes.",
            severity: "high",
            industry_comparison: "This is unusually aggressive. Standard freelance and agency contracts include a kill fee provision requiring payment for all work completed to the termination date, typically at the pro-rata project rate or day rate. Termination without any compensation for completed work is not found in fair commercial agreements.",
            negotiation_script: "I cannot sign a contract that allows termination without paying for completed work. I need a kill fee clause confirming that if you terminate, you pay for all work completed to the termination date at the pro-rata rate. This is a standard provision and I require it before signing."
          },
          {
            title: "2-year worldwide non-compete",
            explanation: "The non-compete clause prohibits the freelancer from working with any business in the same industry anywhere in the world for 2 years after the agreement ends. For a single freelance project this restriction is grossly disproportionate. It would prevent a graphic designer working for one marketing agency from taking any other marketing client globally for 2 years. While this clause would likely be found unenforceable by Dutch courts due to its disproportionate scope, enforceability requires litigation which is expensive and uncertain. The safer approach is to remove or significantly narrow it before signing.",
            severity: "high",
            industry_comparison: "This is unusually aggressive. Standard freelance non-compete provisions, where they exist at all, are limited to 3 to 6 months and restricted to direct competitors in the same geographic market. A 2-year worldwide restriction is not commercially proportionate to any single freelance engagement and would not survive challenge in most EU jurisdictions.",
            negotiation_script: "A 2-year worldwide non-compete is not something I can accept for a single project. I would consider a 3-month non-solicitation clause covering your direct competitors in the Netherlands only. Please remove the current clause and replace it with that narrower restriction if you need any non-compete protection at all."
          },
          {
            title: "60-day payment terms with no late payment penalty",
            explanation: "Payment is due 60 days after invoice with no late payment interest or penalty clause. Industry standard for freelance services is 14 to 30 days. 60 days creates a significant cash flow burden on the freelancer, and the absence of any late payment consequence means there is no financial incentive for the client to pay on time.",
            severity: "medium",
            industry_comparison: "This is more restrictive than standard. The EU Late Payment Directive entitles business creditors to interest at 8 percentage points above the ECB reference rate on overdue invoices automatically. A well-drafted freelance contract includes this right explicitly and specifies 14 to 30 day payment terms.",
            negotiation_script: "I work on 30-day payment terms. 60 days is not something I can accommodate for project work. I would also like to add a late payment clause at the statutory rate under the EU Late Payment Directive. Can we update the payment clause to 30 days net with statutory interest on overdue amounts?"
          },
        ],
        key_points: [
          "The client can request unlimited revisions, decide the work is unsatisfactory, and legally withhold payment in full. These three clauses work together and the combination is the most dangerous element of this contract.",
          "Your work becomes the client's property the moment you create it, before you are paid. If they terminate or refuse to pay, they keep everything you made.",
          "The 2-year worldwide non-compete would prevent you from working in your industry globally for 2 years after one project. This clause alone is sufficient reason to decline to sign."
        ],
        legal_terms: [
          { term: "Intellectual Property", plain_english: "The legal rights to creative work including designs, code, writing and images. This contract transfers all intellectual property to the client at the moment of creation, which means you lose ownership of your own work before receiving any payment. If payment is refused you cannot reclaim the work." },
          { term: "Non-compete", plain_english: "A clause preventing you from working with competing businesses. This one covers the entire world for 2 years which is disproportionate for a freelance agreement. Dutch courts would likely find this unenforceable due to its scope but proving that requires litigation." },
          { term: "Termination", plain_english: "The right to end the contract. This clause gives the client an unconditional right to terminate at any time without paying for completed work. It is drafted entirely in the client's favour with no reciprocal protection for the freelancer." },
          { term: "Indemnification", plain_english: "A requirement to compensate the other party for losses caused by your actions. This contract requires the freelancer to indemnify the client for any third party claims arising from the work. Combined with the IP transfer clause this means you bear legal risk for work you no longer own." },
        ],
        missing_clauses: [
          "Revision limit: a fair contract specifies a maximum number of revision rounds included in the fee, typically 2 to 3. Any additional revisions should be treated as a change request and quoted separately.",
          "Kill fee: a fair contract requires the client to pay for all work completed to the termination date if they choose to end the project early. The current contract has no such provision.",
          "Late payment interest: a fair contract includes the right to charge statutory interest on overdue invoices under the EU Late Payment Directive. The current contract has no late payment consequence.",
        ],
        negotiation_email: `Subject: Proposed amendments to the Freelance Services Agreement before signing

Dear [Client name],

Thank you for sending the agreement. I have reviewed it carefully and I am keen to proceed with the project. Before I can sign I need to propose a small number of amendments to ensure the terms are workable for both of us.

1. Revision limit (Clause 4)
The current clause requires unlimited revisions. I propose a limit of 2 rounds of revisions within the agreed scope, included in the project fee. Any further revisions would be treated as a change request and quoted separately at my standard rate.

2. Payment standard (Clause 6)
Payment should be tied to delivery of work consistent with the agreed brief in Schedule A rather than to subjective satisfaction. I would like to replace the satisfaction standard with an objective delivery criterion.

3. Termination and kill fee
I need a provision confirming that if you terminate the project, payment is due for all work completed to the termination date at the pro-rata rate. I cannot carry the risk of delivering work for which I receive no payment if the project ends early.

4. Non-compete (Clause 11)
A 2-year worldwide restriction is not proportionate to a single freelance project. I would accept a 3-month non-solicitation clause covering your direct competitors in the Netherlands only.

5. IP transfer (Clause 8)
Intellectual property should transfer on receipt of full payment rather than on creation. Until payment is received I need to retain ownership as standard commercial security.

6. Payment terms
I work on 30-day payment terms. I would also like to include statutory late payment interest under the EU Late Payment Directive.

These are standard commercial protections that I include in all my agreements. I am happy to discuss any of these points on a call if that would help. I look forward to working with you on this project.

Best regards,
[Your name]`,
        recommendation: "Do not sign this contract as-is. Negotiate a revision cap, an objective payment standard, a kill fee, removal of the worldwide non-compete and IP transfer on payment before signing anything."
      };
      return <Results data={DEMO} onNew={() => setScreen("landing")} isGuest onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }} t={t} lang={lang} />;
    }
    if (!isAuthed) { setScreen("landing"); return null; }
    if (tab === "analyse") {
      if (result) return <Results data={result} onNew={() => setResult(null)} user={session?.user} userMeta={userMeta} t={t} lang={lang} />;
      return <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />;
    }
    if (tab === "about") return <About onBack={() => setTab("analyse")} />;
    if (tab === "settings") return <Settings user={session.user} userMeta={userMeta} onSignOut={signOut} onUpgrade={() => setShowUpgrade(true)} />;
    return null;
  };

  if (booting) return (
    <div style={{ minHeight: "100vh", background: "#EDECE6", display: "flex", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ width: "100%", maxWidth: isDesktop ? "1100px" : "480px", minHeight: "100vh", background: C.bg }}>
        <div style={{ background: C.header, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 }}>{APP_NAME}</h1><div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "3px" }}>{Object.entries(LANGS).map(([code, label]) => (<button key={code} onClick={() => setLang(code)} style={{ background: lang === code ? C.accent : "transparent", color: lang === code ? "#1A1814" : "#9CA3AF", border: "none", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>{label}</button>))}</div></div>
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
            <p style={{ color: C.accent, fontSize: "12px", margin: 0, fontWeight: "500" }}>{t ? t.tagline : APP_TAGLINE}</p>
          </div>
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "3px" }}>
              {Object.entries(LANGS).map(([code, label]) => (
                <button key={code} onClick={() => setLang(code)}
                  style={{ background: lang === code ? C.accent : "transparent", color: lang === code ? "#1A1814" : "#9CA3AF", border: "none", borderRadius: "6px", padding: "4px 9px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                  {label}
                </button>
              ))}
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
                <Results data={result} onNew={() => setResult(null)} user={session?.user} userMeta={userMeta} t={t} lang={lang} />
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
      {showUpgrade && <Upgrade userEmail={session?.user?.email} onClose={() => setShowUpgrade(false)} t={t} />}
    </div>
  );
}
