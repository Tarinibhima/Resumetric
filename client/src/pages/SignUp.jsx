import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, API } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

// ─── Shared social icons ─────────────────────────────────
function Socials() {
  return (
    <div className="mt-10 flex items-center gap-4">
      <a href="https://github.com/Tarinibhima" target="_blank" rel="noopener noreferrer"
        className="text-ink-muted hover:text-ink transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
        </svg>
      </a>
      <a href="https://www.linkedin.com/in/tarini-bhima/" target="_blank" rel="noopener noreferrer"
        className="text-ink-muted hover:text-ink transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a href="https://instagram.com/tarini56" target="_blank" rel="noopener noreferrer"
        className="text-ink-muted hover:text-ink transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      </a>
    </div>
  );
}

// ─── Step 1: Enter details, then request OTP ─────────────
function StepDetails({ onNext }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) { setError("Please enter your full name."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email: form.email.trim(), name: form.name.trim() });
      onNext(form);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-sm w-full"
    >
      <h1 className="font-display text-3xl text-ink tracking-tightest mb-2">
        Create account
      </h1>
      <p className="text-sm text-ink-muted mb-8">
        Already have an account?{" "}
        <Link to="/signin" className="text-ink underline underline-offset-4">Sign in</Link>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">Full name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required
            autoComplete="name" placeholder="Jane Smith"
            className="w-full bg-paper border border-paper-border rounded-sm px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-ink transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required
            autoComplete="email" placeholder="you@example.com"
            className="w-full bg-paper border border-paper-border rounded-sm px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-ink transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Password <span className="ml-1 font-normal normal-case text-ink-muted/60">(min. 8 characters)</span>
          </label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required
            autoComplete="new-password" placeholder="••••••••"
            className="w-full bg-paper border border-paper-border rounded-sm px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-ink transition-colors" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-ink text-paper py-3 rounded-sm text-sm font-medium hover:bg-ink-soft disabled:opacity-50 transition-colors duration-200 mt-2">
          {loading ? "Sending code…" : "Continue →"}
        </button>
      </form>
      <Socials />
    </motion.div>
  );
}

// ─── Step 2: Enter the 6-digit OTP ───────────────────────
function StepOTP({ formData, onSuccess, onBack }) {
  const { register } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // Individual input refs
  const refs = Array.from({ length: 6 }, () => ({ current: null }));

  const focusRef = (i) => {
    if (refs[i] && refs[i].current) refs[i].current.focus();
  };

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) focusRef(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) focusRef(i - 1);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      focusRef(5);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      // Verify OTP on server
      await API.post("/auth/verify-otp", { email: formData.email, otp: code });
      // OTP valid — create account
      await register(formData.name, formData.email, formData.password);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid or expired code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setResendMsg("");
    try {
      await API.post("/auth/send-otp", { email: formData.email, name: formData.name });
      setResendMsg("A new code has been sent.");
    } catch {
      setResendMsg("Could not resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-sm w-full"
    >
      <button onClick={onBack}
        className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink mb-6 transition-colors">
        ← Back
      </button>

      <h1 className="font-display text-3xl text-ink tracking-tightest mb-2">
        Check your email
      </h1>
      <p className="text-sm text-ink-muted mb-8 leading-relaxed">
        We sent a 6-digit verification code to{" "}
        <span className="text-ink font-medium">{formData.email}</span>.
        Enter it below.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm mb-5">
          {error}
        </div>
      )}
      {resendMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-sm mb-5">
          {resendMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* 6 OTP digit boxes */}
        <div className="flex gap-2 mb-8" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs[i].current = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-full aspect-square text-center text-xl font-mono font-medium bg-paper border border-paper-border rounded-sm focus:outline-none focus:border-ink transition-colors"
            />
          ))}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-ink text-paper py-3 rounded-sm text-sm font-medium hover:bg-ink-soft disabled:opacity-50 transition-colors duration-200">
          {loading ? "Verifying…" : "Verify & create account →"}
        </button>
      </form>

      <p className="text-xs text-ink-muted mt-5">
        Didn't receive it?{" "}
        <button onClick={handleResend} disabled={resending}
          className="text-ink underline underline-offset-4 disabled:opacity-50">
          {resending ? "Sending…" : "Resend code"}
        </button>
      </p>
      <Socials />
    </motion.div>
  );
}

// ─── Step 3: Success — auto-redirects to landing ─────────
function StepSuccess({ firstName }) {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/"), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-sm w-full text-center"
    >
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <h1 className="font-display text-3xl text-ink tracking-tightest mb-3">
        Sign up successful!
      </h1>
      <p className="text-sm text-ink-muted leading-relaxed mb-8">
        Welcome, <span className="text-ink font-medium">{firstName}</span>.
        Your account is ready. Taking you back to the home page…
      </p>

      {/* Progress bar auto-countdown */}
      <div className="w-full h-px bg-paper-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-ink"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
        />
      </div>
      <p className="text-xs text-ink-muted mt-3">Redirecting in 3 seconds…</p>

      <button onClick={() => navigate("/")}
        className="mt-6 text-sm text-ink underline underline-offset-4">
        Go now →
      </button>
    </motion.div>
  );
}

// ─── Root ────────────────────────────────────────────────
export default function SignUp() {
  const [step, setStep] = useState("details"); // "details" | "otp" | "success"
  const [formData, setFormData] = useState(null);

  return (
    <AuthLayout quote="Stand out from the stack. Every keyword counts.">
      <div className="flex-1 flex items-center">
        <AnimatePresence mode="wait">
          {step === "details" && (
            <StepDetails
              key="details"
              onNext={(data) => { setFormData(data); setStep("otp"); }}
            />
          )}
          {step === "otp" && (
            <StepOTP
              key="otp"
              formData={formData}
              onSuccess={() => setStep("success")}
              onBack={() => setStep("details")}
            />
          )}
          {step === "success" && (
            <StepSuccess
              key="success"
              firstName={formData?.name?.split(" ")[0] || "there"}
            />
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
