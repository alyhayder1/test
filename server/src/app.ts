import express from "express";
import path from "path";
import cors from "cors";
import pagesRoutes from "./routes/pages.routes";
import visitsRoutes from "./routes/visits.routes";
import rightSwipesRoutes from "./routes/rightSwipes.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/pages", pagesRoutes);
  app.use("/api/visits", visitsRoutes);
  app.use("/api/right-swipes", rightSwipesRoutes);

  app.use(errorHandler);
  return app;
}