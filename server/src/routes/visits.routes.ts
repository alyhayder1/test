import { Router } from "express";
import { trackVisit } from "../controllers/visits.controller";

const router = Router();
router.post("/", trackVisit);

export default router;
