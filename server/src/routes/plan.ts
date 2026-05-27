import { Router } from "express";
import { generatePlan, getCurrentPlan } from "../controllers/plan.controller";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/error";
import {
  generatePlanSchema,
  getPlanSchema,
} from "../lib/validators/plan.validator";

const router = Router();

router.post(
  "/generate",
  validate(generatePlanSchema),
  asyncHandler(generatePlan),
);
router.get(
  "/current",
  validate(getPlanSchema, "query"),
  asyncHandler(getCurrentPlan),
);

export default router;
