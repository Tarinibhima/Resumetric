import { Link } from "react-router-dom";

/**
 * Split-panel auth layout:
 * Left  — branding / quote
 * Right — form content
 */
export default function AuthLayout({ children, quote }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      {/* ── Left panel ──────────────────────────────────── */}
      <div className="hidden md:flex md:w-2/5 bg-ink flex-col justify-between p-12">
        <Link to="/" className="font-display text-2xl text-paper tracking-tightest">
          Resumetric
        </Link>

        <div>
          <p className="font-display text-3xl text-paper/90 leading-snug italic mb-4">
            "{quote}"
          </p>
          <p className="font-mono text-xs text-paper/40 uppercase tracking-widest">
            — AI-powered career tools
          </p>
        </div>

        <p className="font-mono text-xs text-paper/30">
          © {new Date().getFullYear()} Resumetric
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-16 md:px-16 lg:px-24">
        {/* Mobile logo */}
        <Link
          to="/"
          className="font-display text-xl text-ink tracking-tightest mb-12 md:hidden"
        >
          Resumetric
        </Link>
        {children}
      </div>
    </div>
  );
}
