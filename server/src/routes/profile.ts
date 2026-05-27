import { Router } from "express";
import { saveProfile, getProfile } from "../controllers/profile.controller";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/error";
import {
  saveProfileSchema,
  getProfileSchema,
} from "../lib/validators/profile.validator";

const router = Router();

router.post("/", validate(saveProfileSchema), asyncHandler(saveProfile));
router.get(
  "/",
  validate(getProfileSchema, "query"),
  asyncHandler(getProfile),
);

export default router;
