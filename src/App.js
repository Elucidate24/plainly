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
    createAccount: "Create a free account for 1 analysis per month.",
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
    compareDesc: "Paste a revised version of this contract. Plainly will identify what changed and whether each change helps or hurts you.",
    comparePlaceholder: "Paste the revised contract here...", compareBtn: "Compare versions",
    comparing: "Comparing...", whatChanged: "What changed", send: "Send",
    chatTitle: "Ask anything about this contract", chatPlaceholder: "Ask a question about this contract...",
    chatLocked: "Pro+ feature", chatLockedDesc: "Upgrade to Pro+ to ask unlimited follow-up questions about any analysis.",
    thinking: "Thinking...", noEmail: "No negotiation email was generated for this document.",
    noFlags: "No significant red flags found in this document.", noClauses: "No clauses returned for this document.", flagsIntro: "Issues ranked by severity. Each flag includes the full analysis, industry comparison and negotiation script.",
    upgradeTitle: "You have used your free analysis", upgradeSubtitle: "Choose the plan that works for you.",
    oneTimeDesc: "Single analysis. No subscription. Pay once.", oneTimeLabel: "One-time", buyOne: "Buy one analysis",
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
    nav: { analyse: "Analyse", about: "About", settings: "Settings" },
    auth: {
      createAccount: "Create account", welcomeBack: "Welcome back", resetPassword: "Reset password",
      emailLabel: "Email", passwordLabel: "Password", confirmLabel: "Confirm password",
      emailPh: "you@example.com", passwordPh: "At least 8 characters", confirmPh: "Same password again",
      forgotLink: "Forgot password?", noAccount: "No account? Sign up free", hasAccount: "Already have an account? Sign in",
      sendReset: "Send reset link", pleaseWait: "Please wait...", freeStart: "Free to start. No credit card needed.",
      signInDesc: "Sign in to continue.", resetDesc: "We will email a reset link.",
      confirmEmail: "Confirm your email", checkEmail: "Check your email",
      confirmSent: "We sent a confirmation link to", resetSent: "Reset link sent to",
      confirmNote: "Click the link in the email to activate your account. Then come back here and sign in.",
      goToSignIn: "Go to sign in", backToSignIn: "Back to sign in",
      passwordRequired: "Password is required.", passwordMatch: "Passwords do not match.", passwordLength: "Password must be at least 8 characters.",
      next: "Next", startAnalysing: "Start analysing", skip: "Skip",
    },
    settings: {
      title: "Settings", currentPlan: "Current plan", free: "Free", pro: "Pro", proPlus: "Pro+",
      signOut: "Sign out", upgrade: "Upgrade plan", privacyNote: "We never store your documents. Every analysis is processed and immediately forgotten. Only your usage count is saved.",
      usedThis: "analyses used this month", unlimited: "Unlimited",
    },
    privacyShort: "Your document is never stored. It is analysed and immediately forgotten.",
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
    noFlags: "Geen significante rode vlaggen gevonden.", noClauses: "Geen clausules teruggegeven.", flagsIntro: "Problemen gerangschikt op ernst. Elke vlag bevat de volledige analyse, industrievergelijking en onderhandelingsscript.",
    upgradeTitle: "Je hebt je gratis analyse gebruikt", upgradeSubtitle: "Kies het plan dat bij je past.",
    oneTimeDesc: "Enkele analyse. Geen abonnement.", oneTimeLabel: "Eenmalig", buyOne: "Koop één analyse",
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
    nav: { analyse: "Analyseren", about: "Over ons", settings: "Instellingen" },
    auth: {
      createAccount: "Account aanmaken", welcomeBack: "Welkom terug", resetPassword: "Wachtwoord resetten",
      emailLabel: "E-mail", passwordLabel: "Wachtwoord", confirmLabel: "Wachtwoord bevestigen",
      emailPh: "jij@voorbeeld.nl", passwordPh: "Minimaal 8 tekens", confirmPh: "Hetzelfde wachtwoord",
      forgotLink: "Wachtwoord vergeten?", noAccount: "Geen account? Gratis aanmelden", hasAccount: "Al een account? Inloggen",
      sendReset: "Resetlink sturen", pleaseWait: "Even geduld...", freeStart: "Gratis beginnen. Geen creditcard nodig.",
      signInDesc: "Log in om verder te gaan.", resetDesc: "We sturen een resetlink per e-mail.",
      confirmEmail: "Bevestig je e-mail", checkEmail: "Controleer je e-mail",
      confirmSent: "We hebben een bevestigingslink gestuurd naar", resetSent: "Resetlink verstuurd naar",
      confirmNote: "Klik op de link in de e-mail om je account te activeren. Kom daarna terug en log in.",
      goToSignIn: "Naar inloggen", backToSignIn: "Terug naar inloggen",
      passwordRequired: "Wachtwoord is verplicht.", passwordMatch: "Wachtwoorden komen niet overeen.", passwordLength: "Wachtwoord moet minimaal 8 tekens bevatten.",
      next: "Volgende", startAnalysing: "Beginnen met analyseren", skip: "Overslaan",
    },
    settings: {
      title: "Instellingen", currentPlan: "Huidig abonnement", free: "Gratis", pro: "Pro", proPlus: "Pro+",
      signOut: "Uitloggen", upgrade: "Abonnement upgraden", privacyNote: "Wij slaan je documenten nooit op. Elke analyse wordt verwerkt en onmiddellijk vergeten. Alleen je gebruikstelling wordt opgeslagen.",
      usedThis: "analyses gebruikt deze maand", unlimited: "Onbeperkt",
    },
    privacyShort: "Je document wordt nooit opgeslagen. Het wordt geanalyseerd en onmiddellijk vergeten.",
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
    noFlags: "No se encontraron señales de alerta significativas.", noClauses: "No se devolvieron cláusulas.", flagsIntro: "Problemas clasificados por gravedad. Cada alerta incluye el análisis completo, comparación con el sector y guión de negociación.",
    upgradeTitle: "Has usado tu análisis gratuito", upgradeSubtitle: "Elige el plan que mejor se adapte a ti.",
    oneTimeDesc: "Análisis único. Sin suscripción. Pago único.", oneTimeLabel: "Una vez", buyOne: "Comprar un análisis",
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
    nav: { analyse: "Analizar", about: "Acerca de", settings: "Configuración" },
    auth: {
      createAccount: "Crear cuenta", welcomeBack: "Bienvenido de nuevo", resetPassword: "Restablecer contraseña",
      emailLabel: "Correo electrónico", passwordLabel: "Contraseña", confirmLabel: "Confirmar contraseña",
      emailPh: "tu@ejemplo.com", passwordPh: "Al menos 8 caracteres", confirmPh: "La misma contraseña",
      forgotLink: "¿Olvidaste tu contraseña?", noAccount: "¿Sin cuenta? Regístrate gratis", hasAccount: "¿Ya tienes cuenta? Inicia sesión",
      sendReset: "Enviar enlace de restablecimiento", pleaseWait: "Por favor espera...", freeStart: "Empieza gratis. Sin tarjeta de crédito.",
      signInDesc: "Inicia sesión para continuar.", resetDesc: "Te enviaremos un enlace de restablecimiento.",
      confirmEmail: "Confirma tu correo", checkEmail: "Revisa tu correo",
      confirmSent: "Enviamos un enlace de confirmación a", resetSent: "Enlace de restablecimiento enviado a",
      confirmNote: "Haz clic en el enlace del correo para activar tu cuenta. Luego vuelve aquí e inicia sesión.",
      goToSignIn: "Ir a iniciar sesión", backToSignIn: "Volver a iniciar sesión",
      passwordRequired: "La contraseña es obligatoria.", passwordMatch: "Las contraseñas no coinciden.", passwordLength: "La contraseña debe tener al menos 8 caracteres.",
      next: "Siguiente", startAnalysing: "Empezar a analizar", skip: "Omitir",
    },
    settings: {
      title: "Configuración", currentPlan: "Plan actual", free: "Gratis", pro: "Pro", proPlus: "Pro+",
      signOut: "Cerrar sesión", upgrade: "Mejorar plan", privacyNote: "Nunca almacenamos tus documentos. Cada análisis se procesa y se olvida inmediatamente. Solo se guarda tu contador de uso.",
      usedThis: "análisis usados este mes", unlimited: "Ilimitado",
    },
    privacyShort: "Tu documento nunca se almacena. Se analiza y se olvida inmediatamente.",
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

function Onboarding({ onFinish, t }) {
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
          {isLast ? (t?.auth?.startAnalysing || "Start analysing") : (t?.auth?.next || "Next")}
        </button>
        {!isLast && <button onClick={onFinish} style={{ ...btnStyle("secondary", false), marginTop: "10px", fontSize: "14px" }}>{t?.auth?.skip || "Skip"}</button>}
      </div>
    </div>
  );
}

function Landing({ onSignUp, onLogin, onSample, onAbout, t, lang, onLangChange }) {
  const tx = t || T.en;
  return (
    <div>
      <div style={{ background: C.header, padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>{APP_NAME}</h1>
          <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "3px" }}>
            {Object.entries(LANGS).map(([code, label]) => (
              <button key={code} onClick={() => onLangChange(code)}
                style={{ background: lang === code ? C.accent : "transparent", color: lang === code ? "#1A1814" : "#9CA3AF", border: "none", borderRadius: "6px", padding: "4px 9px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <p style={{ color: C.accent, fontSize: "13px", margin: 0, fontWeight: "500" }}>{tx.tagline}</p>
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
        <button onClick={onLogin} style={{ ...btnStyle("secondary", false), marginBottom: "10px" }}>{tx.signIn}</button>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "20px" }}>
          <button onClick={onAbout} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", fontWeight: "500" }}>{tx.about}</button>
          <a href="mailto:plainlyteam@gmail.com" style={{ color: C.accent, fontSize: "14px", textDecoration: "none", fontWeight: "500" }}>{tx.contact}</a>
        </div>

        <div style={{ background: C.light, borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>{lang === "nl" ? "Wat mensen zeggen" : lang === "es" ? "Lo que dice la gente" : "What people say"}</div>
          <div style={{ fontSize: "14px", color: C.text, lineHeight: "1.6", fontStyle: "italic", marginBottom: "8px" }}>{tx.testimonial}</div>
          <div style={{ fontSize: "12px", color: C.sub }}>— Freelance designer, Amsterdam</div>
        </div>

        <div style={{ border: `0.5px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, padding: "12px", borderRight: `0.5px solid ${C.border}` }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{lang === "nl" ? "Gratis" : lang === "es" ? "Gratis" : "Free"}</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "6px" }}>$0</div>
              {(tx.freeFeatures || T.en.freeFeatures).map((f, i) => (
                <div key={i} style={{ fontSize: "10px", color: C.sub, marginBottom: "3px" }}>✓ {f}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "12px", borderRight: `0.5px solid ${C.border}`, background: C.light }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{lang === "nl" ? "Eenmalig" : lang === "es" ? "Una vez" : "One-time"}</div>
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

function Auth({ mode, onSuccess, onSwitch, onBack, t }) {
  const tx = t || T.en;
  const a = tx.auth || T.en.auth;
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
    if (!forgot && !password) return setError(a.passwordRequired);
    if (isSignUp && password !== confirm) return setError(a.passwordMatch);
    if (isSignUp && password.length < 8) return setError(a.passwordLength);
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
        {isSignUp ? a.confirmEmail : a.checkEmail}
      </h2>
      <p style={{ color: C.sub, marginBottom: "8px" }}>
        {isSignUp ? `${a.confirmSent} ${email}` : `${a.resetSent} ${email}`}
      </p>
      {isSignUp && <p style={{ color: C.sub, fontSize: "13px", marginBottom: "24px" }}>{a.confirmNote}</p>}
      <button onClick={() => { setForgot(false); setForgotSent(false); }} style={btnStyle("secondary", false)}>
        {isSignUp ? a.goToSignIn : a.backToSignIn}
      </button>
    </div>
  );

  return (
    <div style={{ padding: "32px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", marginBottom: "20px", padding: 0 }}>← {tx.about === "Over ons" ? "Terug" : tx.about === "Acerca de" ? "Volver" : "Back to home"}</button>
      <h2 style={{ fontSize: "26px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>
        {forgot ? a.resetPassword : isSignUp ? a.createAccount : a.welcomeBack}
      </h2>
      <p style={{ fontSize: "14px", color: C.sub, marginBottom: "24px" }}>
        {forgot ? a.resetDesc : isSignUp ? a.freeStart : a.signInDesc}
      </p>
      {error && <div style={errCss}>{error}</div>}
      {[
        { label: a.emailLabel, type: "email", val: email, set: setEmail, ph: a.emailPh },
        ...(!forgot ? [{ label: a.passwordLabel, type: "password", val: password, set: setPassword, ph: a.passwordPh }] : []),
        ...(isSignUp && !forgot ? [{ label: a.confirmLabel, type: "password", val: confirm, set: setConfirm, ph: a.confirmPh }] : []),
      ].map(({ label, type, val, set, ph }) => (
        <div key={label} style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: C.sub, display: "block", marginBottom: "6px" }}>{label}</label>
          <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputCss} />
        </div>
      ))}
      <button onClick={submit} disabled={loading} style={{ ...btnStyle("primary", loading), marginBottom: "12px" }}>
        {loading ? a.pleaseWait : forgot ? a.sendReset : isSignUp ? a.createAccount : tx.signIn}
      </button>
      {!forgot && !isSignUp && <button onClick={() => setForgot(true)} style={{ background: "none", border: "none", color: C.accent, fontSize: "14px", cursor: "pointer", display: "block", marginBottom: "12px", padding: 0 }}>{a.forgotLink}</button>}
      <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.sub, fontSize: "14px", cursor: "pointer", padding: 0 }}>
        {isSignUp ? a.hasAccount : a.noAccount}
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
        <span style={{ fontSize: "13px", color: "#8A6828" }}>{tx.privacyShort || tx.privacyNote}</span>
      </div>
      <div style={{ marginBottom: "14px" }}>
        <textarea value={text} onChange={e => change(e.target.value)}
          placeholder={tx.placeholder}
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
        body: JSON.stringify({ text: context + "\n\nUser question: " + msg, userId: null, chatMode: true, lang: lang || "en" })
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
          <p style={{ fontSize: "17px", fontWeight: "700", color: C.text, marginBottom: "14px", lineHeight: "1.5" }}>{tx.flagsIntro || "Issues ranked by severity. Each flag includes the full analysis, industry comparison and negotiation script."}</p>
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
                  body: JSON.stringify({ text: prompt, userId: null, chatMode: true, lang: lang || "en" })
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
              <button onClick={onSignUp} style={{ ...btnStyle("primary", false), padding: "10px", fontSize: "14px", background: C.accent, color: "#1A1814" }}>{tx.startProPlus} — ${PRO_PLUS_PRICE}/mo</button>
            </div>
          )}
          <div style={{ ...cardStyle, opacity: isProPlus ? 1 : 0.4, pointerEvents: isProPlus ? "auto" : "none" }}>
            <div style={labelStyle}>{tx.chatTitle}</div>
            <div ref={chatRef} style={{ height: "280px", overflowY: "auto", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMessages.length === 0 && (
                <div style={{ color: C.muted, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
                  {tx.chatEmpty || "Ask anything about this contract. Try:"}<br /><br />
                  <span style={{ color: C.sub }}>{(tx.chatSuggestions || []).map((s, i) => <span key={i}>"{s}"<br /></span>)}</span>
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
            <div style={{ fontSize: "10px", fontWeight: "700", color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{tx.oneTimeLabel || "One-time"}</div>
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

function Settings({ user, userMeta, onSignOut, onUpgrade, t }) {
  const tx = t || T.en;
  const s = tx.settings || T.en.settings;
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

  const planLabel = userMeta?.is_pro_plus ? s.proPlus : userMeta?.is_pro ? s.pro : s.free;

  return (
    <div>
      <div style={cardStyle}>
        <div style={labelStyle}>Account</div>
        <div style={{ fontSize: "15px", color: C.text, fontWeight: "500" }}>{user.email}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>{s.currentPlan}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: userMeta?.is_pro ? "12px" : 0 }}>
          <div>
            <span style={{ fontWeight: "700", fontSize: "18px", color: userMeta?.is_pro ? C.accent : C.text }}>{planLabel}</span>
            {!userMeta?.is_pro && <span style={{ fontSize: "13px", color: C.sub, marginLeft: "8px" }}>{userMeta?.usage_count || 0}/{FREE_LIMIT} {s.usedThis}</span>}
          </div>
          {!userMeta?.is_pro && <button onClick={onUpgrade} style={{ background: C.accent, color: "#1A1814", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>{s.upgrade}</button>}
        </div>
        {userMeta?.is_pro && <button onClick={cancel} disabled={cancelling} style={{ background: "none", border: "none", color: C.danger, fontSize: "13px", cursor: "pointer", padding: 0 }}>{cancelling ? "..." : "Cancel Pro subscription"}</button>}
      </div>
      <div style={{ ...cardStyle, background: "#F5EDD6", border: "1px solid #E8D4A0" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "20px" }}>🔒</span>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#8A6828", marginBottom: "4px" }}>{tx.about === "Over ons" ? "Je privacy is beschermd" : tx.about === "Acerca de" ? "Tu privacidad está protegida" : "Your privacy is protected"}</div>
            <div style={{ fontSize: "13px", color: "#8A6828", lineHeight: "1.5" }}>{s.privacyNote}</div>
          </div>
        </div>
      </div>
      <button onClick={onSignOut} style={{ ...btnStyle("secondary", false), marginBottom: "8px" }}>{s.signOut}</button>
      <button onClick={deleteAccount} style={{ ...btnStyle("secondary", false), color: C.danger, borderColor: "#E8C0BE", marginBottom: "20px", fontSize: "14px" }}>{tx.about === "Over ons" ? "Account verwijderen" : tx.about === "Acerca de" ? "Eliminar mi cuenta" : "Delete my account"}</button>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <a href="/about.html" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>{tx.about}</a>
        <a href="/privacy.html" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>{tx.about === "Over ons" ? "Privacybeleid" : tx.about === "Acerca de" ? "Política de privacidad" : "Privacy policy"}</a>
        <a href="/terms.html" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>{tx.about === "Over ons" ? "Gebruiksvoorwaarden" : tx.about === "Acerca de" ? "Términos de servicio" : "Terms of service"}</a>
        <a href="mailto:plainlyteam@gmail.com" style={{ fontSize: "12px", color: C.sub, textDecoration: "none" }}>{tx.contact}</a>
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
    if (onboarding) return <Onboarding onFinish={() => setOnboarding(false)} t={t} />;
    if (screen === "landing") return <Landing
      t={t} lang={lang} onLangChange={setLang}
      onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }}
      onLogin={() => { setAuthMode("login"); setScreen("auth"); }}
      onSample={() => setScreen("sample")}
      onAbout={() => setScreen("about")}
    />;
    if (screen === "auth") return <Auth
      t={t}
      mode={authMode}
      onSuccess={(isNew) => { if (isNew) setOnboarding(true); setScreen("app"); setTab("analyse"); }}
      onSwitch={() => setAuthMode(m => m === "signup" ? "login" : "signup")}
      onBack={() => setScreen("landing")}
    />;
    if (screen === "about") return <About onBack={() => setScreen("landing")} />;
    if (screen === "sample") {
      const DEMOS = {
        en: {
          document_type: "Freelance Services Agreement",
          trust_score: 3,
          score_label: "This contract strongly favours the client and leaves the freelancer with almost no protection.",
          score_reasoning: "Three clauses in combination create serious financial exposure: unlimited revisions with no cap, payment withholding at the client's sole discretion, and termination without payment for completed work. The 2-year worldwide non-compete is disproportionate for a single freelance project. This contract was drafted entirely in the client's interest.",
          summary: "This is a freelance agreement where the client holds almost all the power. They can request unlimited changes, withhold payment subjectively, terminate without notice, and prevent you from working in your industry for 2 years worldwide. Your work becomes their property before you are even paid. Every ambiguous clause resolves in the client's favour. This is a deliberate drafting choice, not an oversight.",
          deep_analysis: "This contract was drafted by someone whose sole objective was to protect the client at every point of friction. The structure is consistent: wherever a clause could go either way, it goes the client's way.\n\nThe unlimited revisions clause is the most immediately dangerous provision. Combined with the subjective payment standard, it creates a mechanism by which a client can demand changes indefinitely and legally withhold payment in full. There is no definition of what constitutes satisfactory completion and no limit on revision cycles.\n\nThe termination clause compounds this risk severely. The client can end the agreement at any time without compensating the freelancer for work already completed. Combined with the IP transfer clause, the client could terminate after receiving substantial completed work, retain full ownership, and owe nothing.\n\nThe 2-year worldwide non-compete is not proportionate to a single freelance project. It is designed to prevent a competitor from hiring the freelancer, not to protect any legitimate business interest. Courts in most EU jurisdictions would likely find this unenforceable, but proving that requires expensive litigation.",
          clauses: [
            { title: "Unlimited revisions", what_it_says: "The freelancer must make revisions until the client is satisfied. There is no limit on revision rounds and no definition of satisfaction.", standard: "unusually aggressive", worst_case: "A client could request revisions for months, changing direction repeatedly, with no financial recourse for the freelancer.", negotiation_script: "I propose a limit of 2 rounds of revisions within the agreed scope. Anything beyond that would be treated as a new instruction and quoted separately. Could we update clause 4 to reflect that?" },
            { title: "Subjective payment standard", what_it_says: "Payment is conditional on the client's satisfaction. The client has sole discretion with no objective benchmark or independent review mechanism.", standard: "unusually aggressive", worst_case: "The client could withhold payment indefinitely by claiming dissatisfaction with no obligation to specify what would constitute acceptable work.", negotiation_script: "Payment should be tied to delivery against the agreed brief, not subjective satisfaction. I would like to replace the satisfaction standard with delivery consistent with the specifications in Schedule A." },
            { title: "Termination without payment", what_it_says: "The client may terminate at any time for any reason. On termination, the freelancer is not entitled to payment for work completed but not yet invoiced.", standard: "unusually aggressive", worst_case: "The client terminates after receiving 80% of the completed project, retains full ownership, and owes nothing.", negotiation_script: "I need a kill fee provision. If you terminate the project I need to be paid for all work completed to the termination date at the pro-rata day rate." },
            { title: "2-year worldwide non-compete", what_it_says: "For 2 years after this agreement, the freelancer may not provide services to any business in the same industry anywhere in the world.", standard: "unusually aggressive", worst_case: "The freelancer cannot work in their primary industry globally for 2 years, effectively ending their freelance practice.", negotiation_script: "A 2-year worldwide restriction is disproportionate for a freelance project. I would accept a 3-month non-solicitation restricted to your direct competitors in the Netherlands only." },
            { title: "IP transfer before payment", what_it_says: "All intellectual property transfers to the client at the moment of creation, regardless of whether payment has been received.", standard: "very restrictive", worst_case: "The client receives full ownership before paying. If payment is withheld, the freelancer cannot use their work as leverage.", negotiation_script: "IP should transfer on receipt of full payment, not on creation. Please amend clause 8 so that IP transfers upon final payment being received in full." },
          ],
          red_flags: [
            { title: "Unlimited revisions with no cap", explanation: "Clause 4 requires the freelancer to make revisions until the client is satisfied with no limit on rounds and no definition of satisfaction. Combined with the subjective payment standard, this creates a mechanism for a client to demand indefinite work without ever triggering a payment obligation.", severity: "high", industry_comparison: "This is unusually aggressive. Standard freelance contracts cap revisions at 2 to 3 rounds. Unlimited revisions without additional compensation are not found in balanced commercial agreements.", negotiation_script: "Clause 4 needs a revision limit. I propose 2 rounds within the original scope, with any further revisions quoted at my standard day rate." },
            { title: "Payment withheld at client's discretion", explanation: "Clause 6 makes payment conditional on the client's subjective satisfaction. There is no objective standard, no independent arbiter and no timeline for the client to communicate their decision. This is the most common cause of non-payment disputes in freelance agreements.", severity: "high", industry_comparison: "This is significantly more restrictive than standard. Industry standard payment terms tie payment to delivery consistent with the agreed brief. Subjective satisfaction standards are not acceptable in commercial B2B freelance contracts.", negotiation_script: "Payment should not be conditional on satisfaction. It should be conditional on delivery consistent with the agreed brief in Schedule A. I need clause 6 amended before I can sign." },
            { title: "Termination without compensation", explanation: "The client can terminate at any time and is explicitly not required to pay for work completed but not yet invoiced. Combined with the IP transfer clause, this means the client can take completed work and legally owe nothing.", severity: "high", industry_comparison: "This is unusually aggressive. Standard freelance contracts include a kill fee requiring payment for all work completed to the termination date. Termination without any compensation is not found in fair commercial agreements.", negotiation_script: "I cannot sign a contract that allows termination without paying for completed work. I need a kill fee clause confirming payment for all work completed to the termination date." },
            { title: "2-year worldwide non-compete", explanation: "The non-compete prohibits the freelancer from working in the same industry anywhere in the world for 2 years. For a single freelance project this is grossly disproportionate and would likely be found unenforceable by Dutch courts, but proving that requires litigation.", severity: "high", industry_comparison: "This is unusually aggressive. Standard non-competes in freelance agreements are 3 to 6 months and restricted to direct competitors in the same geographic market. A 2-year worldwide restriction is not commercially proportionate.", negotiation_script: "I cannot accept a 2-year worldwide non-compete. I would consider a 3-month non-solicitation covering your direct competitors in the Netherlands only." },
            { title: "60-day payment with no late penalty", explanation: "Payment is due 60 days after invoice with no late payment interest or penalty. Industry standard is 14 to 30 days. 60 days creates significant cash flow burden with no financial consequence for late payment.", severity: "medium", industry_comparison: "This is more restrictive than standard. The EU Late Payment Directive entitles business creditors to interest at 8 percentage points above the ECB reference rate on overdue invoices. A fair contract includes this right explicitly with 14 to 30 day payment terms.", negotiation_script: "I work on 30-day payment terms. I would also like to add a late payment clause at the statutory rate under the EU Late Payment Directive." },
          ],
          key_points: [
            "The client can request unlimited revisions, decide the work is unsatisfactory, and legally withhold payment in full. These three clauses work together and the combination is the most dangerous element of this contract.",
            "Your work becomes the client's property the moment you create it, before you are paid. If they terminate or refuse to pay, they keep everything you made.",
            "The 2-year worldwide non-compete would prevent you from working in your industry globally for 2 years after one project. This clause alone is sufficient reason to decline to sign."
          ],
          legal_terms: [
            { term: "Intellectual Property", plain_english: "The legal rights to creative work including designs, code, writing and images. This contract transfers all intellectual property to the client at the moment of creation, meaning you lose ownership of your own work before receiving any payment." },
            { term: "Non-compete", plain_english: "A clause preventing you from working with competing businesses. This one covers the entire world for 2 years which is disproportionate for a freelance agreement. Dutch courts would likely find this unenforceable but proving that requires litigation." },
            { term: "Termination", plain_english: "The right to end the contract. This clause gives the client an unconditional right to terminate at any time without paying for completed work. It is drafted entirely in the client's favour." },
            { term: "Indemnification", plain_english: "A requirement to compensate the other party for losses caused by your actions. This contract requires the freelancer to indemnify the client for any third party claims arising from the work, including work the client now owns." },
          ],
          missing_clauses: [
            "Revision limit: a fair contract specifies a maximum number of revision rounds included in the fee, typically 2 to 3. Any additional revisions should be treated as a change request and quoted separately.",
            "Kill fee: a fair contract requires the client to pay for all work completed to the termination date if they choose to end the project early.",
            "Late payment interest: a fair contract includes the right to charge statutory interest on overdue invoices under the EU Late Payment Directive.",
          ],
          negotiation_email: "Subject: Proposed amendments to the Freelance Services Agreement\n\nDear [Client name],\n\nThank you for sending the agreement. Before I sign I need to propose a small number of amendments.\n\n1. Revision limit (Clause 4): I propose a limit of 2 rounds of revisions within the agreed scope. Further revisions would be quoted separately.\n\n2. Payment standard (Clause 6): Payment should be tied to delivery against the agreed brief, not subjective satisfaction.\n\n3. Kill fee: If you terminate the project, payment is due for all work completed to the termination date at the pro-rata rate.\n\n4. Non-compete (Clause 11): A 2-year worldwide restriction is not proportionate. I would accept a 3-month non-solicitation covering your direct competitors in the Netherlands only.\n\n5. IP transfer (Clause 8): IP should transfer on receipt of full payment, not on creation.\n\n6. Payment terms: I work on 30-day payment terms with statutory late payment interest.\n\nBest regards,\n[Your name]",
          recommendation: "Do not sign this contract as-is. Negotiate a revision cap, an objective payment standard, a kill fee, removal of the worldwide non-compete and IP transfer on payment before signing anything."
        },
        nl: {
          document_type: "Freelance Dienstverleningsovereenkomst",
          trust_score: 3,
          score_label: "Dit contract bevoordeelt de opdrachtgever sterk en laat de freelancer bijna zonder bescherming.",
          score_reasoning: "Drie clausules samen creëren ernstig financieel risico: onbeperkte revisies zonder limiet, betaling inhouden naar goeddunken van de opdrachtgever, en beëindiging zonder betaling voor voltooid werk. Het 2-jarige wereldwijde concurrentiebeding is onevenredig voor één freelanceproject. Dit contract is volledig in het belang van de opdrachtgever opgesteld.",
          summary: "Dit is een freelanceovereenkomst waarbij de opdrachtgever bijna alle macht heeft. Ze kunnen onbeperkte wijzigingen aanvragen, betaling subjectief inhouden, zonder opzegtermijn beëindigen en je verbieden in je vakgebied te werken voor 2 jaar wereldwijd. Je werk wordt hun eigendom voordat je betaald wordt. Elke onduidelijke clausule werkt in het voordeel van de opdrachtgever. Dit is een bewuste keuze, geen vergissing.",
          deep_analysis: "Dit contract is opgesteld door iemand wiens enige doel was de opdrachtgever op elk conflictpunt te beschermen. De structuur is consistent: overal waar een clausule beide kanten op kan, gaat hij de kant van de opdrachtgever op.\n\nDe clausule over onbeperkte revisies is het meest direct gevaarlijk. Gecombineerd met de subjectieve betalingsstandaard creëert het een mechanisme waarmee een opdrachtgever onbeperkt wijzigingen kan eisen en de betaling volledig kan inhouden. Er is geen definitie van wat een bevredigende oplevering is en geen limiet op het aantal revisierondes.\n\nDe beëindigingsclausule vergroot dit risico ernstig. De opdrachtgever kan de overeenkomst op elk moment beëindigen zonder de freelancer te compenseren voor reeds voltooid werk. Gecombineerd met de IP-overdrachtclausule kan de opdrachtgever beëindigen na ontvangst van substantieel werk, het volledige eigendom behouden en niets verschuldigd zijn.\n\nHet 2-jarige wereldwijde concurrentiebeding is niet evenredig aan één freelanceproject. Nederlandse rechters zouden dit waarschijnlijk onuitvoerbaar achten vanwege de onevenredige reikwijdte, maar dat bewijzen vereist dure rechtszaken.",
          clauses: [
            { title: "Onbeperkte revisies", what_it_says: "De freelancer moet revisies uitvoeren totdat de opdrachtgever tevreden is. Er is geen limiet op het aantal revisierondes en geen definitie van tevredenheid.", standard: "unusually aggressive", worst_case: "Een opdrachtgever kan maandenlang revisies aanvragen, steeds van richting veranderen, zonder financieel verhaal voor de freelancer.", negotiation_script: "Ik stel een limiet voor van 2 revisierondes binnen de afgesproken scope. Alles daarboven wordt behandeld als een nieuwe opdracht en apart geoffreerd. Kunt u clausule 4 aanpassen?" },
            { title: "Subjectieve betalingsstandaard", what_it_says: "Betaling is afhankelijk van de tevredenheid van de opdrachtgever. De opdrachtgever heeft volledig discretie zonder objectieve maatstaf of onafhankelijk beoordelingsmechanisme.", standard: "unusually aggressive", worst_case: "De opdrachtgever kan betaling voor onbepaalde tijd inhouden door ontevredenheid te claimen zonder te specificeren wat acceptabel werk zou zijn.", negotiation_script: "Betaling moet gekoppeld zijn aan levering conform de afgesproken briefing, niet aan subjectieve tevredenheid. Ik wil clausule 6 aanpassen naar objectieve leveringscriteria." },
            { title: "Beëindiging zonder betaling", what_it_says: "De opdrachtgever kan op elk moment om welke reden dan ook beëindigen. Bij beëindiging heeft de freelancer geen recht op betaling voor voltooid maar nog niet gefactureerd werk.", standard: "unusually aggressive", worst_case: "De opdrachtgever beëindigt na ontvangst van 80% van het voltooide project, behoudt volledig eigendom en is niets verschuldigd.", negotiation_script: "Ik heb een annuleringsvergoeding nodig. Als u het project beëindigt, moet ik worden betaald voor al het werk tot de beëindigingsdatum naar rato van het dagtarief." },
            { title: "2-jarig wereldwijd concurrentiebeding", what_it_says: "Gedurende 2 jaar na deze overeenkomst mag de freelancer geen diensten verlenen aan bedrijven in dezelfde sector wereldwijd.", standard: "unusually aggressive", worst_case: "De freelancer kan 2 jaar niet werken in hun primaire sector wereldwijd, wat hun freelancepraktijk effectief beëindigt.", negotiation_script: "Een wereldwijd verbod van 2 jaar is onevenredig voor één freelanceproject. Ik accepteer een non-solicitatiebeding van 3 maanden beperkt tot uw directe concurrenten in Nederland." },
            { title: "IP-overdracht vóór betaling", what_it_says: "Alle intellectuele eigendom wordt overgedragen aan de opdrachtgever op het moment van creatie, ongeacht of er betaald is.", standard: "very restrictive", worst_case: "De opdrachtgever ontvangt volledig eigendom vóór betaling. Als betaling wordt ingehouden, kan de freelancer hun werk niet als hefboom gebruiken.", negotiation_script: "IP moet worden overgedragen bij ontvangst van volledige betaling, niet bij creatie. Pas clausule 8 aan zodat overdracht plaatsvindt bij volledige betaling." },
          ],
          red_flags: [
            { title: "Onbeperkte revisies zonder limiet", explanation: "Clausule 4 vereist dat de freelancer revisies uitvoert totdat de opdrachtgever tevreden is, zonder limiet op het aantal rondes. Gecombineerd met de subjectieve betalingsstandaard creëert dit een mechanisme voor een opdrachtgever om onbeperkt werk te eisen zonder ooit een betalingsverplichting te activeren.", severity: "high", industry_comparison: "Dit is ongebruikelijk agressief. Standaard freelancecontracten beperken revisies tot 2 à 3 rondes. Onbeperkte revisies zonder aanvullende vergoeding komen niet voor in evenwichtige commerciële overeenkomsten.", negotiation_script: "Clausule 4 heeft een revisielimiet nodig. Ik stel 2 rondes voor binnen de originele scope, met verdere revisies gefactureerd naar mijn standaard dagtarief." },
            { title: "Betaling ingehouden naar goeddunken", explanation: "Clausule 6 maakt betaling afhankelijk van de subjectieve tevredenheid van de opdrachtgever. Er is geen objectieve standaard, geen onafhankelijke arbiter en geen tijdlijn. Dit is de meest voorkomende oorzaak van niet-betalingsgeschillen in freelanceovereenkomsten.", severity: "high", industry_comparison: "Dit is significant restrictiever dan standaard. Standaard betalingsvoorwaarden koppelen betaling aan levering conform de afgesproken briefing. Subjectieve tevredenheidsstandaarden zijn niet acceptabel in commerciële B2B freelancecontracten.", negotiation_script: "Betaling mag niet afhankelijk zijn van tevredenheid. Het moet afhankelijk zijn van levering conform de afgesproken briefing. Ik heb clausule 6 nodig aangepast voordat ik kan tekenen." },
            { title: "Beëindiging zonder compensatie", explanation: "De opdrachtgever kan op elk moment beëindigen en is expliciet niet verplicht te betalen voor voltooid maar nog niet gefactureerd werk. Gecombineerd met de IP-overdrachtclausule kan de opdrachtgever voltooid werk overnemen en wettelijk niets verschuldigd zijn.", severity: "high", industry_comparison: "Dit is ongebruikelijk agressief. Standaard freelancecontracten bevatten een annuleringsvergoeding die betaling vereist voor al het werk tot de beëindigingsdatum. Beëindiging zonder compensatie komt niet voor in eerlijke overeenkomsten.", negotiation_script: "Ik kan geen contract tekenen dat beëindiging zonder betaling voor voltooid werk toestaat. Ik heb een clausule nodig die betaling garandeert voor al het werk tot de beëindigingsdatum." },
            { title: "2-jarig wereldwijd concurrentiebeding", explanation: "Het concurrentiebeding verbiedt de freelancer om 2 jaar wereldwijd te werken in dezelfde sector. Voor één freelanceproject is dit buitensporig onevenredig. Nederlandse rechters zouden dit waarschijnlijk onuitvoerbaar vinden vanwege de onevenredige reikwijdte, maar dat bewijzen vereist rechtszaken.", severity: "high", industry_comparison: "Dit is ongebruikelijk agressief. Standaard concurrentiebedingen in freelanceovereenkomsten zijn 3 tot 6 maanden en beperkt tot directe concurrenten in hetzelfde geografische markt.", negotiation_script: "Ik kan geen 2-jarig wereldwijd concurrentiebeding accepteren. Ik overweeg een non-solicitatiebeding van 3 maanden voor uw directe concurrenten in Nederland." },
            { title: "60 dagen betaling zonder late vergoeding", explanation: "Betaling is verschuldigd 60 dagen na factuur zonder rente of boete bij te late betaling. Industriestandaard is 14 tot 30 dagen. 60 dagen creëert een aanzienlijke cashflowlast zonder financiële consequentie voor te late betaling.", severity: "medium", industry_comparison: "Dit is restrictiever dan standaard. De EU-richtlijn betalingsachterstand geeft zakelijke crediteuren recht op rente van 8 procentpunten boven de ECB-referentierente op achterstallige facturen. Een eerlijk contract bevat dit recht expliciet met 14 tot 30 dagen betalingstermijn.", negotiation_script: "Ik werk met 30 dagen betalingstermijn. Ik wil ook een clausule voor wettelijke rente bij te late betaling conform de EU-richtlijn betalingsachterstand toevoegen." },
          ],
          key_points: [
            "De opdrachtgever kan onbeperkte revisies aanvragen, beslissen dat het werk onbevredigend is en de betaling volledig inhouden. Deze drie clausules werken samen en de combinatie is het gevaarlijkste element van dit contract.",
            "Je werk wordt eigendom van de opdrachtgever op het moment dat je het maakt, voordat je betaald wordt. Als ze beëindigen of weigeren te betalen, behouden ze alles wat je gemaakt hebt.",
            "Het 2-jarige wereldwijde concurrentiebeding zou je verbieden om 2 jaar wereldwijd in je sector te werken na één project. Deze clausule alleen is al voldoende reden om niet te tekenen."
          ],
          legal_terms: [
            { term: "Intellectuele eigendom", plain_english: "De wettelijke rechten op creatief werk inclusief ontwerpen, code, teksten en afbeeldingen. Dit contract draagt alle intellectuele eigendom over aan de opdrachtgever op het moment van creatie, wat betekent dat je eigendom verliest over je eigen werk voordat je betaald wordt." },
            { term: "Concurrentiebeding", plain_english: "Een clausule die je verhindert te werken voor concurrerende bedrijven. Deze geldt voor de hele wereld gedurende 2 jaar, wat onevenredig is voor een freelanceovereenkomst. Nederlandse rechters zouden dit waarschijnlijk onuitvoerbaar achten maar dat bewijzen vereist rechtszaken." },
            { term: "Beëindiging", plain_english: "Het recht om het contract te beëindigen. Deze clausule geeft de opdrachtgever een onvoorwaardelijk recht om op elk moment te beëindigen zonder te betalen voor voltooid werk. Het is volledig in het voordeel van de opdrachtgever opgesteld." },
            { term: "Vrijwaring", plain_english: "Een verplichting om de andere partij te compenseren voor verliezen veroorzaakt door jouw acties. Dit contract vereist dat de freelancer de opdrachtgever vrijwaart voor claims van derden die voortvloeien uit het werk, inclusief werk dat de opdrachtgever nu bezit." },
          ],
          missing_clauses: [
            "Revisielimiet: een eerlijk contract specificeert een maximaal aantal revisierondes inbegrepen in het honorarium, doorgaans 2 à 3. Aanvullende revisies worden behandeld als een nieuwe opdracht en apart geoffreerd.",
            "Annuleringsvergoeding: een eerlijk contract vereist dat de opdrachtgever betaalt voor al het werk tot de beëindigingsdatum als ze het project vroegtijdig beëindigen.",
            "Rente bij te late betaling: een eerlijk contract bevat het recht op wettelijke rente bij achterstallige facturen conform de EU-richtlijn betalingsachterstand.",
          ],
          negotiation_email: "Onderwerp: Voorgestelde wijzigingen op de Freelance Dienstverleningsovereenkomst\n\nGeachte [naam opdrachtgever],\n\nBedankt voor het toesturen van de overeenkomst. Voordat ik teken wil ik een aantal wijzigingen voorstellen.\n\n1. Revisielimiet (Clausule 4): Ik stel een limiet voor van 2 revisierondes binnen de afgesproken scope. Verdere revisies worden apart geoffreerd.\n\n2. Betalingsstandaard (Clausule 6): Betaling moet gekoppeld zijn aan levering conform de briefing, niet aan subjectieve tevredenheid.\n\n3. Annuleringsvergoeding: Bij beëindiging moet betaald worden voor al het werk tot de beëindigingsdatum naar rato.\n\n4. Concurrentiebeding (Clausule 11): Een wereldwijd verbod van 2 jaar is niet proportioneel. Ik accepteer een non-solicitatiebeding van 3 maanden voor uw directe concurrenten in Nederland.\n\n5. IP-overdracht (Clausule 8): IP moet worden overgedragen bij ontvangst van volledige betaling, niet bij creatie.\n\n6. Betalingstermijn: Ik werk met 30 dagen betalingstermijn en wettelijke rente bij te late betaling.\n\nMet vriendelijke groet,\n[Uw naam]",
          recommendation: "Teken dit contract niet zoals het er nu staat. Onderhandel over een revisielimiet, een objectieve betalingsstandaard, een annuleringsvergoeding, verwijdering van het wereldwijde concurrentiebeding en IP-overdracht bij betaling voordat je iets tekent."
        },
        es: {
          document_type: "Acuerdo de Servicios Freelance",
          trust_score: 3,
          score_label: "Este contrato favorece fuertemente al cliente y deja al freelancer sin casi ninguna protección.",
          score_reasoning: "Tres cláusulas en combinación crean una exposición financiera seria: revisiones ilimitadas sin límite, retención de pago a discreción exclusiva del cliente, y rescisión sin pago por trabajo completado. El pacto de no competencia mundial de 2 años es desproporcionado para un solo proyecto freelance. Este contrato fue redactado completamente en interés del cliente.",
          summary: "Este es un acuerdo freelance donde el cliente tiene casi todo el poder. Pueden solicitar cambios ilimitados, retener el pago subjetivamente, rescindir sin previo aviso e impedirte trabajar en tu sector durante 2 años en todo el mundo. Tu trabajo se convierte en su propiedad antes de que te paguen. Cada cláusula ambigua se resuelve a favor del cliente. Esta es una elección deliberada de redacción, no un error.",
          deep_analysis: "Este contrato fue redactado por alguien cuyo único objetivo era proteger al cliente en cada punto de fricción. La estructura es consistente: donde una cláusula podría ir en cualquier dirección, va en la del cliente.\n\nLa cláusula de revisiones ilimitadas es la más inmediatamente peligrosa. Combinada con el estándar subjetivo de pago, crea un mecanismo por el cual un cliente puede exigir cambios indefinidamente y retener el pago legalmente en su totalidad. No hay definición de lo que constituye una entrega satisfactoria y no hay límite en los ciclos de revisión.\n\nLa cláusula de rescisión agrava este riesgo severamente. El cliente puede terminar el acuerdo en cualquier momento sin compensar al freelancer por el trabajo ya completado. Combinado con la cláusula de transferencia de PI, el cliente podría rescindir después de recibir trabajo completado sustancial, retener la plena propiedad y no deber nada.\n\nEl pacto de no competencia mundial de 2 años no es proporcional a un único proyecto freelance. Los tribunales en la mayoría de las jurisdicciones de la UE probablemente lo encontrarían inaplicable, pero probarlo requiere litigios costosos.",
          clauses: [
            { title: "Revisiones ilimitadas", what_it_says: "El freelancer debe realizar revisiones hasta que el cliente esté satisfecho. No hay límite en las rondas de revisión ni definición de satisfacción.", standard: "unusually aggressive", worst_case: "Un cliente podría solicitar revisiones durante meses, cambiando de dirección repetidamente, sin recurso financiero para el freelancer.", negotiation_script: "Propongo un límite de 2 rondas de revisiones dentro del alcance acordado. Cualquier revisión adicional se trataría como una nueva instrucción y se cotizaría por separado. ¿Podríamos actualizar la cláusula 4?" },
            { title: "Estándar de pago subjetivo", what_it_says: "El pago está condicionado a la satisfacción del cliente. El cliente tiene discreción exclusiva sin criterio objetivo ni mecanismo de revisión independiente.", standard: "unusually aggressive", worst_case: "El cliente podría retener el pago indefinidamente alegando insatisfacción sin obligación de especificar qué constituiría trabajo aceptable.", negotiation_script: "El pago debe estar vinculado a la entrega conforme al brief acordado, no a la satisfacción subjetiva. Quisiera reemplazar el estándar de satisfacción por criterios de entrega objetivos en la cláusula 6." },
            { title: "Rescisión sin pago", what_it_says: "El cliente puede rescindir en cualquier momento por cualquier razón. Al rescindir, el freelancer no tiene derecho al pago por trabajo completado pero aún no facturado.", standard: "unusually aggressive", worst_case: "El cliente rescinde después de recibir el 80% del proyecto completado, retiene la propiedad completa y no debe nada.", negotiation_script: "Necesito una cláusula de compensación por cancelación. Si rescinden el proyecto necesito que se me pague por todo el trabajo completado hasta la fecha de rescisión al tipo diario prorrateado." },
            { title: "No competencia mundial de 2 años", what_it_says: "Durante 2 años tras este acuerdo, el freelancer no puede prestar servicios a ninguna empresa del mismo sector en ningún lugar del mundo.", standard: "unusually aggressive", worst_case: "El freelancer no puede trabajar en su sector principal a nivel mundial durante 2 años, poniendo fin efectivamente a su práctica freelance.", negotiation_script: "Una restricción mundial de 2 años es desproporcionada para un proyecto freelance. Aceptaría una cláusula de no solicitud de 3 meses limitada a sus competidores directos en España." },
            { title: "Transferencia de PI antes del pago", what_it_says: "Toda la propiedad intelectual se transfiere al cliente en el momento de la creación, independientemente de si se ha recibido el pago.", standard: "very restrictive", worst_case: "El cliente recibe la propiedad completa antes de pagar. Si se retiene el pago, el freelancer no puede usar su trabajo como palanca.", negotiation_script: "La PI debe transferirse al recibir el pago completo, no en el momento de la creación. Por favor modifiquen la cláusula 8 para que la transferencia ocurra al recibir el pago final completo." },
          ],
          red_flags: [
            { title: "Revisiones ilimitadas sin límite", explanation: "La cláusula 4 requiere que el freelancer realice revisiones hasta que el cliente esté satisfecho sin límite en el número de rondas. Combinada con el estándar subjetivo de pago, crea un mecanismo para que un cliente exija trabajo indefinido sin activar nunca una obligación de pago.", severity: "high", industry_comparison: "Esto es inusualmente agresivo. Los contratos freelance estándar limitan las revisiones a 2 o 3 rondas. Las revisiones ilimitadas sin compensación adicional no se encuentran en acuerdos comerciales equilibrados.", negotiation_script: "La cláusula 4 necesita un límite de revisiones. Propongo 2 rondas dentro del alcance original, con revisiones adicionales facturadas a mi tarifa diaria estándar." },
            { title: "Pago retenido a discreción del cliente", explanation: "La cláusula 6 condiciona el pago a la satisfacción subjetiva del cliente. No hay estándar objetivo, árbitro independiente ni plazo para que el cliente comunique su decisión. Esta es la causa más común de disputas de impago en acuerdos freelance.", severity: "high", industry_comparison: "Esto es significativamente más restrictivo que el estándar. Los términos de pago estándar vinculan el pago a la entrega conforme al brief acordado. Los estándares de satisfacción subjetiva no son aceptables en contratos comerciales B2B freelance.", negotiation_script: "El pago no debe estar condicionado a la satisfacción. Debe estar condicionado a la entrega conforme al brief acordado. Necesito que la cláusula 6 sea enmendada antes de poder firmar." },
            { title: "Rescisión sin compensación", explanation: "El cliente puede rescindir en cualquier momento y no está obligado a pagar por trabajo completado pero aún no facturado. Combinado con la cláusula de transferencia de PI, el cliente puede tomar trabajo completado y no deber nada legalmente.", severity: "high", industry_comparison: "Esto es inusualmente agresivo. Los contratos freelance estándar incluyen una tarifa de cancelación que requiere el pago por todo el trabajo completado hasta la fecha de rescisión. La rescisión sin compensación no se encuentra en acuerdos comerciales justos.", negotiation_script: "No puedo firmar un contrato que permita la rescisión sin pagar por el trabajo completado. Necesito una cláusula de compensación por cancelación que garantice el pago por todo el trabajo completado hasta la fecha de rescisión." },
            { title: "No competencia mundial de 2 años", explanation: "El pacto de no competencia prohíbe al freelancer trabajar en el mismo sector en cualquier parte del mundo durante 2 años. Para un solo proyecto freelance esto es groseramente desproporcionado. Los tribunales en la mayoría de las jurisdicciones de la UE probablemente lo encontrarían inaplicable, pero probarlo requiere litigios.", severity: "high", industry_comparison: "Esto es inusualmente agresivo. Los pactos de no competencia estándar en acuerdos freelance son de 3 a 6 meses y se limitan a competidores directos en el mismo mercado geográfico. Una restricción mundial de 2 años no es comercialmente proporcionada.", negotiation_script: "No puedo aceptar un pacto de no competencia mundial de 2 años. Consideraría una cláusula de no solicitud de 3 meses para sus competidores directos en España únicamente." },
            { title: "60 días de pago sin penalización tardía", explanation: "El pago vence 60 días después de la factura sin intereses ni penalización por pago tardío. El estándar del sector es de 14 a 30 días. 60 días crea una carga significativa de flujo de caja sin consecuencia financiera por el retraso en el pago.", severity: "medium", industry_comparison: "Esto es más restrictivo que el estándar. La Directiva de Morosidad de la UE otorga a los acreedores comerciales el derecho a intereses de 8 puntos porcentuales sobre la tasa de referencia del BCE en facturas vencidas. Un contrato justo incluye este derecho explícitamente con plazos de pago de 14 a 30 días.", negotiation_script: "Trabajo con plazos de pago de 30 días. También quisiera añadir una cláusula de intereses por pago tardío a la tasa legal bajo la Directiva de Morosidad de la UE." },
          ],
          key_points: [
            "El cliente puede solicitar revisiones ilimitadas, decidir que el trabajo es insatisfactorio y retener el pago en su totalidad. Estas tres cláusulas funcionan juntas y la combinación es el elemento más peligroso de este contrato.",
            "Tu trabajo se convierte en propiedad del cliente en el momento en que lo creas, antes de que te paguen. Si rescinden o se niegan a pagar, conservan todo lo que hiciste.",
            "El pacto de no competencia mundial de 2 años te impediría trabajar en tu sector globalmente durante 2 años después de un solo proyecto. Esta cláusula por sí sola es razón suficiente para negarse a firmar."
          ],
          legal_terms: [
            { term: "Propiedad intelectual", plain_english: "Los derechos legales sobre el trabajo creativo incluyendo diseños, código, escritura e imágenes. Este contrato transfiere toda la propiedad intelectual al cliente en el momento de la creación, lo que significa que pierdes la propiedad de tu propio trabajo antes de recibir cualquier pago." },
            { term: "Pacto de no competencia", plain_english: "Una cláusula que te impide trabajar con empresas competidoras. Esta abarca todo el mundo durante 2 años, lo cual es desproporcionado para un acuerdo freelance. Los tribunales en la mayoría de las jurisdicciones de la UE probablemente lo encontrarían inaplicable, pero probarlo requiere litigios." },
            { term: "Rescisión", plain_english: "El derecho a terminar el contrato. Esta cláusula le da al cliente un derecho incondicional de rescindir en cualquier momento sin pagar por el trabajo completado. Está redactada completamente a favor del cliente." },
            { term: "Indemnización", plain_english: "Un requisito de compensar a la otra parte por las pérdidas causadas por tus acciones. Este contrato requiere que el freelancer indemnice al cliente por cualquier reclamación de terceros que surja del trabajo, incluyendo el trabajo que el cliente ahora posee." },
          ],
          missing_clauses: [
            "Límite de revisiones: un contrato justo especifica un número máximo de rondas de revisión incluidas en los honorarios, típicamente 2 o 3. Las revisiones adicionales deben tratarse como una solicitud de cambio y cotizarse por separado.",
            "Tarifa de cancelación: un contrato justo requiere que el cliente pague por todo el trabajo completado hasta la fecha de rescisión si elige terminar el proyecto antes de tiempo.",
            "Intereses por pago tardío: un contrato justo incluye el derecho a cobrar intereses legales sobre facturas vencidas bajo la Directiva de Morosidad de la UE.",
          ],
          negotiation_email: "Asunto: Modificaciones propuestas al Acuerdo de Servicios Freelance\n\nEstimado/a [nombre del cliente],\n\nGracias por enviarme el acuerdo. Antes de firmar necesito proponer algunas modificaciones.\n\n1. Límite de revisiones (Cláusula 4): Propongo un límite de 2 rondas de revisiones dentro del alcance acordado. Las revisiones adicionales se cotizarán por separado.\n\n2. Estándar de pago (Cláusula 6): El pago debe vincularse a la entrega conforme al brief acordado, no a la satisfacción subjetiva.\n\n3. Tarifa de cancelación: Si rescinden el proyecto, el pago vence por todo el trabajo completado hasta la fecha de rescisión a prorrata.\n\n4. Pacto de no competencia (Cláusula 11): Una restricción mundial de 2 años no es proporcional. Aceptaría una cláusula de no solicitud de 3 meses para sus competidores directos en España únicamente.\n\n5. Transferencia de PI (Cláusula 8): La PI debe transferirse al recibir el pago completo, no en el momento de la creación.\n\n6. Plazo de pago: Trabajo con plazos de 30 días con intereses legales por pago tardío.\n\nAtentamente,\n[Su nombre]",
          recommendation: "No firme este contrato tal como está. Negocie un límite de revisiones, un estándar de pago objetivo, una tarifa de cancelación, la eliminación del pacto de no competencia mundial y la transferencia de PI al pago antes de firmar nada."
        }
      };
      const DEMO = DEMOS[lang] || DEMOS.en;
      return (
        <div>
          <div style={{ background: C.header, padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setScreen("landing")}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px 14px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              ← {lang === "nl" ? "Terug" : lang === "es" ? "Volver" : "Go back"}
            </button>
            <span style={{ color: C.accent, fontSize: "13px", fontWeight: "500" }}>
              {lang === "nl" ? "Voorbeeldanalyse" : lang === "es" ? "Análisis de ejemplo" : "Sample analysis"}
            </span>
          </div>
          <Results data={DEMO} onNew={() => setScreen("landing")} isGuest onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }} t={t} lang={lang} />
        </div>
      );
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
                {[{ key: "analyse", label: t?.nav?.analyse || "Analyse", icon: "📄" }, { key: "about", label: t?.nav?.about || "About", icon: "ℹ️" }, { key: "settings", label: t?.nav?.settings || "Settings", icon: "⚙️" }].map(({ key, label, icon }) => (
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
            <Onboarding onFinish={() => setOnboarding(false)} t={t} />
          </div>
        ) : isDesktop && screen === "app" && isAuthed ? (
          <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "600px", gap: "32px", alignItems: "start", justifyContent: "center" }}>
            <div style={{ background: C.bg, borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {tab === "analyse" && !result && <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />}
              {tab === "analyse" && result && <Analyse user={session.user} userMeta={userMeta} prefill={null} onDone={(d) => { setResult(d); loadMeta(session.user.id); }} onUpgrade={() => setShowUpgrade(true)} />}
              {tab === "about" && <About onBack={() => setTab("analyse")} />}
              {tab === "settings" && <Settings user={session.user} userMeta={userMeta} onSignOut={signOut} onUpgrade={() => setShowUpgrade(true)} t={t} />}
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
          {[{ key: "analyse", label: t?.nav?.analyse || "Analyse", icon: "📄" }, { key: "about", label: t?.nav?.about || "About", icon: "ℹ️" }, { key: "settings", label: t?.nav?.settings || "Settings", icon: "⚙️" }].map(({ key, label, icon }) => (
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
