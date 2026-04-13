/**
 * Auth Routes
 * POST /api/auth/send-otp    — generate & email a 6-digit OTP
 * POST /api/auth/verify-otp  — validate the OTP (does NOT create account)
 * POST /api/auth/register    — create account (call after verify-otp)
 * POST /api/auth/login
 * GET  /api/auth/me  (protected)
 */

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const otpStore = require("../config/otpStore");
const { sendOTPEmail } = require("../config/mailer");

// ─── Rate limiter: 5 attempts / 15 min ──────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Token factory ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── OTP rate limiter: 3 sends / 15 min per IP ──────────────────────────────
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many OTP requests. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── POST /send-otp ──────────────────────────────────────────────────────────
router.post(
  "/send-otp",
  otpLimiter,
  [
    body("email").trim().isEmail().normalizeEmail().withMessage("Invalid email address."),
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, name } = req.body;

      // Check email not already registered
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email is already registered." });
      }

      // Generate 6-digit OTP
      const code = String(Math.floor(100000 + Math.random() * 900000));
      otpStore.set(email, code);

      // Send email
      await sendOTPEmail(email, name.split(" ")[0], code);

      res.json({ message: "Verification code sent to your email." });
    } catch (err) {
      console.error("OTP send error:", err.message);
      next(err);
    }
  }
);

// ─── POST /verify-otp ────────────────────────────────────────────────────────
router.post(
  "/verify-otp",
  [
    body("email").trim().isEmail().normalizeEmail().withMessage("Invalid email."),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, otp } = req.body;
    const valid = otpStore.verify(email, otp);

    if (!valid) {
      return res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    }

    // Mark email as verified for this session (register route will trust it)
    // We re-store a special "verified" marker so register can check it
    otpStore.set(`verified:${email}`, "1");

    res.json({ message: "Email verified." });
  }
);

// ─── POST /register ─────────────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("Name must be 2–80 characters."),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email address."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;

      // ✅ check OTP verified
      const verified = otpStore.verify(`verified:${email}`, "1");
      if (!verified) {
        return res.status(403).json({
          error: "Email not verified. Please complete OTP verification first.",
        });
      }

      // ✅ check if already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email is already registered." });
      }

      // ✅ create user ONLY AFTER OTP
      const user = await User.create({
        name,
        email,
        password,
      });

      // ✅ generate token
      const token = signToken(user._id);

      // ✅ cleanup OTP flag

      // ✅ response
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email address."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // Always fetch password (select: false by default)
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.correctPassword(password))) {
        // Generic message prevents user enumeration
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = signToken(user._id);

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /me ─────────────────────────────────────────────────────────────────
router.get("/me", authMiddleware, (req, res) => {
  const { _id: id, name, email } = req.user;
  res.json({ user: { id, name, email } });
});

module.exports = router;
