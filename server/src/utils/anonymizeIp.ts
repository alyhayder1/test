export function anonymizeIp(ip: string) {
  if (!ip) return "";
  if (ip.includes(".")) {
    const p = ip.split(".");
    return p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.0` : ip;
  }
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::";
  return ip;
}
