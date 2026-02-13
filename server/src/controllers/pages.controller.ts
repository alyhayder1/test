import crypto from "crypto";
import { Page } from "../models/Page";

function makeSlug() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export async function createPage(req: any, res: any) {
  const slug = makeSlug();
  const files = req.files as { photo?: Express.Multer.File[]; audio?: Express.Multer.File[] };

  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;

  const photoFile = files?.photo?.[0];
  const audioFile = files?.audio?.[0];

  const photoUrl = photoFile ? `${baseUrl}/uploads/${photoFile.filename}` : "";
  const audioUrl = audioFile ? `${baseUrl}/uploads/${audioFile.filename}` : "";


  const page = await Page.create({
    slug,
    name: req.body.name,
    age: Number(req.body.age),
    city: req.body.city,
    bio: req.body.bio,
    photoUrl,
    audioUrl,
  });

  res.json({ slug: page.slug });
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
}

export async function getPage(req: any, res: any) {
  const page = await Page.findOne({ slug: req.params.slug }).lean();
  if (!page) return res.status(404).json({ message: "Not found" });
  res.json(page);
}
