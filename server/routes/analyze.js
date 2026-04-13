/**
 * Analyze Route
 * POST /api/analyze
 * Protected — requires JWT
 * Accepts multipart/form-data: { resume: File, job_description: string }
 * Proxies to the Python ML microservice and returns results.
 */

const router = require("express").Router();
const multer = require("multer");
const FormData = require("form-data");
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));
const authMiddleware = require("../middleware/auth");

// Store resume only in memory (never write to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted."), false);
    }
  },
});

router.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Resume PDF is required." });
      }

      const { job_description } = req.body;
      if (!job_description || job_description.trim().length < 50) {
        return res.status(400).json({
          error: "Job description is too short (minimum 50 characters).",
        });
      }

      // Build multipart form to forward to ML service
      const form = new FormData();
      form.append("resume", req.file.buffer, {
        filename: req.file.originalname,
        contentType: "application/pdf",
      });
      form.append("job_description", job_description.trim());

      const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
      const mlResponse = await fetch(`${mlUrl}/analyze`, {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      });

      if (!mlResponse.ok) {
        const err = await mlResponse.json().catch(() => ({}));
        return res.status(mlResponse.status).json({
          error: err.detail || "Analysis service error.",
        });
      }

      const data = await mlResponse.json();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
