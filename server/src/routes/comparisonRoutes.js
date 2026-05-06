import { Router } from "express";
import { getComparisonMetrics } from "../controllers/comparisonController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/:statementId", getComparisonMetrics);

export default router;

