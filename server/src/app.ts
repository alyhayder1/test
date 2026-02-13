import express from "express";
import path from "path";
import cors from "cors";
import pagesRoutes from "./routes/pages.routes";
import visitsRoutes from "./routes/visits.routes";
import rightSwipesRoutes from "./routes/rightSwipes.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type, Accept");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use("/uploads", express.static(path.resolve("uploads")));
  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json());
  
  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/pages", pagesRoutes);
  app.use("/api/visits", visitsRoutes);
  app.use("/api/right-swipes", rightSwipesRoutes);
  app.set("trust proxy", true);
  app.use(errorHandler);
  return app;
}