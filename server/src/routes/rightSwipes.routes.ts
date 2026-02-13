import { Router } from "express";
import { logRightSwipe } from "../controllers/rightSwipes.controller";

const router = Router();
router.post("/", logRightSwipe);

export default router;
