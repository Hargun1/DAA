import { Router } from "express";
import {
  getDashboard,
  listStatements,
  uploadStatement
} from "../controllers/statementController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../utils/upload.js";

const router = Router();

router.use(protect);
router.get("/", listStatements);
router.post("/upload", upload.single("statement"), uploadStatement);
router.get("/latest/dashboard", getDashboard);
router.get("/:statementId/dashboard", getDashboard);

export default router;

