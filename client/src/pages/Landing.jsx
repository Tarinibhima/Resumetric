import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

// ─── Fade-up animation preset ────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

// ─── Section observer wrapper ─────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// ─── How-it-works step ───────────────────────────────────
function Step({ num, title, body, delay }) {
  return (
    <Reveal delay={delay} className="flex gap-6 items-start">
      <span className="font-mono text-xs text-ink-muted mt-1 select-none w-6 shrink-0">
        {String(num).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-display text-xl text-ink mb-1">{title}</h3>
        <p className="text-ink-muted text-sm leading-relaxed">{body}</p>
      </div>
    </Reveal>
  );
}

// ─── Footer icon link ────────────────────────────────────
function FooterLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-ink-muted hover:text-ink transition-colors duration-200"
    >
      {children}
    </a>
  );
}

export default function Landing() {
  const [heroHovered, setHeroHovered] = useState(false);
  // Track cursor position relative to the hero heading for the inner-cursor colour effect
  const heroRef = useRef(null);

  useEffect(() => {
    const cursor = document.getElementById("cursor");
    if (!cursor) return;
    const enlarge = () => cursor.classList.add("cursor--enlarged");
    const shrink = () => cursor.classList.remove("cursor--enlarged");
    const els = document.querySelectorAll("a, button, [data-cursor-enlarge]");
    els.forEach((el) => {
      el.addEventListener("mouseenter", enlarge);
      el.addEventListener("mouseleave", shrink);
    });
    return () => {
      els.forEach((el) => {
        el.removeEventListener("mouseenter", enlarge);
        el.removeEventListener("mouseleave", shrink);
      });
    };
  }, []);

  // When hovering hero heading: make cursor a colour-filled circle
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    if (!cursor) return;
    if (heroHovered) {
      cursor.style.background = "rgba(26,86,219,0.18)";
      cursor.style.border = "1.5px solid #1A56DB";
      cursor.style.width = "72px";
      cursor.style.height = "72px";
      cursor.style.mixBlendMode = "normal";
    } else {
      cursor.style.background = "";
      cursor.style.border = "";
      cursor.style.width = "";
      cursor.style.height = "";
      cursor.style.mixBlendMode = "multiply";
    }
  }, [heroHovered]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-5 bg-paper/90 backdrop-blur-sm border-b border-paper-border">
        <span className="font-display text-xl tracking-tightest text-ink">
          Resumetric
        </span>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/signin"
            className="text-ink-muted hover:text-ink transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="bg-ink text-paper px-4 py-2 rounded-sm hover:bg-ink-soft transition-colors duration-200 text-sm font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="pt-36 pb-32 px-8 max-w-5xl mx-auto w-full">
        <motion.p
          className="font-mono text-xs text-ink-muted tracking-widest uppercase mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          AI-Powered Resume Analysis
        </motion.p>

        <motion.h1
          ref={heroRef}
          data-cursor-enlarge
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
          className="font-display text-[clamp(3.5rem,9vw,7.5rem)] leading-[1.0] tracking-tightest text-balance mb-8 select-none transition-colors duration-300 cursor-none"
          style={{ color: heroHovered ? "#1A56DB" : "#0A0A0A" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          whileHover={{ scale: 1.025 }}
        >
          We analyze.
          <br />
          <span
            className="italic transition-colors duration-300"
            style={{ color: heroHovered ? "#4B7BF5" : "#6B6B6B" }}
          >
            You optimize.
          </span>
        </motion.h1>

        <motion.p
          className="text-ink-muted text-lg max-w-md leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          Upload your resume, paste a job description, and get an instant ATS
          compatibility score with keyword-level feedback.
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            to="/signup"
            className="bg-ink text-paper px-6 py-3 rounded-sm text-sm font-medium hover:bg-ink-soft transition-colors duration-200"
          >
            Analyze my resume
          </Link>
          <a
            href="#how"
            className="text-sm text-ink-muted hover:text-ink transition-colors duration-200"
          >
            See how it works ↓
          </a>
        </motion.div>
      </section>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="border-t border-paper-border mx-8" />

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how" className="py-28 px-8 max-w-5xl mx-auto w-full">
        <Reveal className="mb-4">
          <p className="font-mono text-xs text-ink-muted tracking-widest uppercase">
            Process
          </p>
        </Reveal>

        {/* Glitch caption — only here */}
        <Reveal delay={0.1} className="mb-16">
          <h2
            className="glitch font-display text-[clamp(2.5rem,6vw,5rem)] tracking-tightest text-ink leading-tight"
            data-text="How It Works"
          >
            How It Works
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 border-t border-paper-border pt-12">
          <Step
            num={1}
            title="Upload Resume"
            body="Drop your PDF resume. We extract every keyword, skill, and phrase using advanced NLP."
            delay={0.0}
          />
          <Step
            num={2}
            title="Paste Job Description"
            body="Paste the target role's description. Our model identifies what the hiring system expects."
            delay={0.12}
          />
          <Step
            num={3}
            title="Get ATS Score"
            body="Receive a precise match percentage, matched keywords, and a prioritised list of gaps to fill."
            delay={0.24}
          />
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────── */}
      <section className="border-t border-paper-border bg-paper-warm">
        <div className="max-w-5xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <Reveal>
            <p className="font-display text-3xl md:text-4xl tracking-tighter text-ink">
              Ready to stand out?
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/signup"
              className="bg-ink text-paper px-8 py-4 rounded-sm text-sm font-medium hover:bg-ink-soft transition-colors duration-200 whitespace-nowrap"
            >
              Start for free →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-paper-border px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm text-ink-muted">
            Resumetric © {new Date().getFullYear()}
          </span>

          <div className="flex items-center gap-5">
            {/* GitHub */}
            <FooterLink href="https://github.com/Tarinibhima" label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </FooterLink>

            {/* LinkedIn */}
            <FooterLink href="https://www.linkedin.com/in/tarini-bhima/" label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </FooterLink>

            {/* Instagram */}
            <FooterLink href="https://instagram.com/tarini56" label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </FooterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
