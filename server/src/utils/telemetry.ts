import crypto from "crypto";

export function anonymizeIp(ip: string) {
  if (!ip) return "";
  if (ip.includes(".")) {
    const p = ip.split(".");
    return p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.0` : ip;
  }
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::";
  return ip;
}

export function visitorHash(anonymizedIp: string, userAgent: string, salt: string) {
  return crypto
    .createHash("sha256")
    .update(`${anonymizedIp}|${userAgent}|${salt}`)
    .digest("hex");
}

export function guessDevice(ua: string) {
  const u = (ua || "").toLowerCase();
  const isTablet = /ipad|tablet/.test(u);
  const isMobile = !isTablet && /mobi|android|iphone/.test(u);
  const isDesktop = !isMobile && !isTablet;
  return { isMobile, isTablet, isDesktop };
}
