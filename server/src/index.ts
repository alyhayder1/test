import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { initGeo } from "./services/geo.service";

(async () => {
  await connectDb();
  await initGeo();
  const app = createApp();
  app.listen(env.port, "0.0.0.0", () => console.log(`Server on :${env.port}`));
})();