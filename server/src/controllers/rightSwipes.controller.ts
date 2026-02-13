import { RightSwipe } from "../models/RightSwipe";
import { anonymizeIp, visitorHash, guessDevice } from "../utils/telemetry";
import { env } from "../config/env";
import { lookupGeo } from "../services/geo.service";

export async function logRightSwipe(req: any, res: any) {
  const slug = req.body?.slug;
  if (!slug) return res.status(400).json({ message: "slug required" });

  const ua = String(req.headers["user-agent"] || "");
  const acceptLanguage = String(req.headers["accept-language"] || "");
  const referrer = String(req.headers["referer"] || "");

  const rawIp = String(req.ip || "");
  const ip = anonymizeIp(rawIp);
  const ipHash = visitorHash(ip, ua, env.visitorSalt);

  const device = guessDevice(ua);

  // geo is optional for now; you can fill it later (MaxMind / API)
  const geo = lookupGeo(rawIp);

  await RightSwipe.create({
    slug,
    ip,
    ipHash,
    userAgent: ua,
    acceptLanguage,
    referrer,
    device,
    geo,
  });

  res.json({ ok: true });
}
