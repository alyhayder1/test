import crypto from "crypto";
import { Visit } from "../models/Visit";
import { anonymizeIp } from "../utils/anonymizeIp";
import { env } from "../config/env";

export async function trackVisit(req: any, res: any) {
  const ua = String(req.headers["user-agent"] || "");
  const acceptLanguage = String(req.headers["accept-language"] || "");
  const referrer = String(req.headers["referer"] || "");
  const rawIp = String(req.ip || "");
  const ip = anonymizeIp(rawIp);

  const ipHash = crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${env.visitorSalt}`)
    .digest("hex");

  const visit = await Visit.create({
    slug: req.body.slug,
    path: req.body.path || "",
    ip,
    ipHash,
    userAgent: ua,
    acceptLanguage,
    referrer,
  });

  res.json({ visitId: visit._id });
}
