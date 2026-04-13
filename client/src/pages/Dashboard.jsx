import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, API } from "../hooks/useAuth";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Score ring ───────────────────────────────────────────
function ScoreRing({ score }) {
  const color =
    score >= 70 ? "#059669" : score >= 45 ? "#D97706" : "#DC2626";
  const data = [{ value: score }, { value: 100 - score }];

  return (
    <div className="relative w-40 h-40 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="100%"
          barSize={10}
          data={[{ value: score, fill: color }, { value: 100 - score, fill: "#E8E6E1" }]}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={5} background={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? color : "#E8E6E1"} />
            ))}
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-4xl tracking-tightest"
          style={{ color }}
        >
          {score}
        </span>
        <span className="font-mono text-[10px] text-ink-muted uppercase tracking-widest">
          ATS Score
        </span>
      </div>
    </div>
  );
}

// ─── Keyword pill ─────────────────────────────────────────
function Pill({ word, variant }) {
  const styles =
    variant === "matched"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";
  return (
    <span
      className={`inline-block border text-xs px-2.5 py-1 rounded-sm font-mono ${styles}`}
    >
      {word}
    </span>
  );
}

// ─── Drop zone ────────────────────────────────────────────
function DropZone({ file, onFile }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-sm py-10 px-6 cursor-pointer transition-colors duration-200 ${
        dragging
          ? "border-ink bg-paper-warm"
          : "border-paper-border hover:border-ink-muted"
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ink-muted" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      {file ? (
        <p className="text-sm text-ink font-medium">{file.name}</p>
      ) : (
        <>
          <p className="text-sm text-ink-muted">
            Drop your <span className="text-ink font-medium">PDF resume</span> here
          </p>
          <p className="text-xs text-ink-muted/60">or click to browse · max 5 MB</p>
        </>
      )}
    </label>
  );
}

// ─── Main Dashboard ───────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();

  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = useCallback(async () => {
    if (!file) { setError("Please upload a PDF resume."); return; }
    if (jd.trim().length < 50) { setError("Job description must be at least 50 characters."); return; }

    setError("");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jd.trim());

    try {
      const { data } = await API.post("/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [file, jd]);

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Top nav ────────────────────────────────────── */}
      <nav className="border-b border-paper-border px-8 py-4 flex items-center justify-between bg-paper/90 backdrop-blur-sm sticky top-0 z-40">
        <span className="font-display text-xl tracking-tightest text-ink">
          Resumetric
        </span>
        <div className="flex items-center gap-6">
          {/* Social links — small text above account name */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-3">
              <a href="https://github.com/Tarinibhima" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] text-ink-muted hover:text-ink transition-colors tracking-wide">
                GitHub
              </a>
              <span className="text-ink-muted/30 text-[10px]">·</span>
              <a href="https://www.linkedin.com/in/tarini-bhima/" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] text-ink-muted hover:text-ink transition-colors tracking-wide">
                LinkedIn
              </a>
              <span className="text-ink-muted/30 text-[10px]">·</span>
              <a href="https://instagram.com/tarini56" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] text-ink-muted hover:text-ink transition-colors tracking-wide">
                @tarini56
              </a>
            </div>
            <span className="text-xs text-ink-muted">{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="font-display text-4xl tracking-tightest text-ink">
            Hello, {user?.name?.split(" ")[0]}.
          </h1>
        </motion.div>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-paper-border rounded-sm p-8 mb-6 shadow-sm"
        >
          <h2 className="font-display text-2xl text-ink tracking-tighter mb-6">
            Analyze resume
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
                01 — Upload resume (PDF)
              </p>
              <DropZone file={file} onFile={setFile} />
            </div>

            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
                02 — Paste job description
              </p>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={7}
                placeholder="Paste the full job description here…"
                className="w-full bg-paper border border-paper-border rounded-sm px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-ink transition-colors resize-none font-sans leading-relaxed"
              />
              <p className="text-xs text-ink-muted/60 mt-1">
                {jd.length} / 10 000 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-ink text-paper py-3.5 rounded-sm text-sm font-medium hover:bg-ink-soft disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10"/>
                  </svg>
                  Analyzing…
                </>
              ) : (
                "Run analysis →"
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Score card */}
              <div className="bg-white border border-paper-border rounded-sm p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <ScoreRing score={result.ats_score} />
                  <div className="flex-1">
                    <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-2">
                      ATS compatibility
                    </p>
                    <p className="font-display text-3xl tracking-tighter text-ink mb-3">
                      {result.ats_score >= 70
                        ? "Strong match"
                        : result.ats_score >= 45
                        ? "Moderate match"
                        : "Needs improvement"}
                    </p>
                    <p className="text-sm text-ink-muted leading-relaxed max-w-md">
                      Your resume matched{" "}
                      <strong className="text-ink">
                        {result.matched_keywords.length}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-ink">
                        {result.jd_keyword_count}
                      </strong>{" "}
                      keywords extracted from the job description.
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-4 text-center">
                      {[
                        { label: "Score", val: `${result.ats_score}%` },
                        { label: "Matched", val: result.matched_keywords.length },
                        { label: "Missing", val: result.missing_keywords.length },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-paper-warm rounded-sm py-3 px-2">
                          <p className="font-display text-2xl tracking-tighter text-ink">
                            {val}
                          </p>
                          <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords split */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Matched */}
                <div className="bg-white border border-paper-border rounded-sm p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <p className="font-mono text-xs text-ink-muted uppercase tracking-widest">
                      Matched keywords ({result.matched_keywords.length})
                    </p>
                  </div>
                  {result.matched_keywords.length === 0 ? (
                    <p className="text-sm text-ink-muted italic">None found.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.matched_keywords.map((w) => (
                        <Pill key={w} word={w} variant="matched" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing */}
                <div className="bg-white border border-paper-border rounded-sm p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <p className="font-mono text-xs text-ink-muted uppercase tracking-widest">
                      Missing keywords ({result.missing_keywords.length})
                    </p>
                  </div>
                  {result.missing_keywords.length === 0 ? (
                    <p className="text-sm text-emerald-700 font-medium">
                      🎉 No missing keywords — excellent match!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((w) => (
                        <Pill key={w} word={w} variant="missing" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              {result.missing_keywords.length > 0 && (
                <div className="bg-accent-muted border border-accent/20 rounded-sm p-6">
                  <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">
                    Tip
                  </p>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    Incorporate the missing keywords naturally into your experience
                    bullets, skills section, or summary to increase your ATS score.
                    Avoid keyword stuffing — context matters.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
