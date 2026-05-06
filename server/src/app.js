import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import aliasRoutes from "./routes/aliasRoutes.js";
import statementRoutes from "./routes/statementRoutes.js";
import comparisonRoutes from "./routes/comparisonRoutes.js";
import merchantRoutes from "./routes/merchantRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "PayTrace" });
});

app.use("/api/auth", authRoutes);
app.use("/api/aliases", aliasRoutes);
app.use("/api/statements", statementRoutes);
app.use("/api/comparison", comparisonRoutes);
app.use("/api/merchants", merchantRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

