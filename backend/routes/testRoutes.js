// backend/routes/testRoutes.js
import express from "express";
import { runTests } from "../controllers/testController.js";
const router = express.Router();

router.post("/run", runTests);

// optional quick test route for judge0 health
router.get("/ping", (req, res) => res.json({ ok: true }));

export default router;
