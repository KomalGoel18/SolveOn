import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import codeExecutionRoutes from "./routes/codeExecutionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

/* 🚨 FAIL FAST if Mongo URI missing */
if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined");
}

const app = express();

/* ✅ SAFE CORS (no domain chasing) */
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

/* ✅ CONNECT MONGODB (clean, modern) */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/code", codeExecutionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SolveOn Backend" });
});
