import { Router } from "express";
import { createPage, getPage } from "../controllers/pages.controller";
import { upload } from "../middleware/upload";

const router = Router();
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  createPage
);
router.get("/:slug", getPage);

export default router;
