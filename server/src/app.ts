import express from "express";
import path from "path";
import cors from "cors";
import pagesRoutes from "./routes/pages.routes";
import visitsRoutes from "./routes/visits.routes";
import rightSwipesRoutes from "./routes/rightSwipes.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
      etag: false,
      lastModified: true,
      maxAge: 0,
      setHeaders(res, filePath) {
        // Avoid Safari “blank until refresh” caching quirks
        res.setHeader("Cache-Control", "no-store");

        // Ensure correct content types for audio (helps iOS)
        if (filePath.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
        if (filePath.endsWith(".m4a")) res.setHeader("Content-Type", "audio/mp4");
        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
        if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");

        // Some clients/tunnels behave better with this
        res.setHeader("Accept-Ranges", "bytes");
      },
    })
  );
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