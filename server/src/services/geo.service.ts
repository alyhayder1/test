import * as maxmind from "maxmind";
import path from "path";

let reader: any = null;

export async function initGeo() {
  const dbPath = path.join(process.cwd(), "geo", "GeoLite2-City.mmdb");
  reader = await maxmind.open(dbPath);
  console.log("🌍 GeoLite2 loaded");
}

export function lookupGeo(ip: string) {
  if (!reader || !ip) return undefined;

  try {
    const res: any = reader.get(ip);
    if (!res) return undefined;

    return {
      country: res.country?.names?.en,
      region: res.subdivisions?.[0]?.names?.en,
      city: res.city?.names?.en,
      lat: res.location?.latitude,
      lon: res.location?.longitude,
    };
  } catch {
    return undefined;
  }
}
