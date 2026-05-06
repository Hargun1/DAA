import { Router } from "express";
import { createAlias, listAliases } from "../controllers/aliasController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", listAliases);
router.post("/", createAlias);

export default router;

