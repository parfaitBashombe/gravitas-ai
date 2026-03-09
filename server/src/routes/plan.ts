import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const userId =
      typeof req.body?.userId === "string" ? req.body.userId.trim() : "";

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json({
        error: "User profile not found. Complete onboarding first.",
      });
    }

    const latestPlan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      select: { version: true },
    });

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;

    let planJson;
    try {
      planJson = await generateTrainingPlan(profile);
    } catch (error: any) {
      // AI lib should keep the detailed log; keep route log short
      console.error("AI generation failed:", error?.message || error);

      return res.status(503).json({
        error:
          "Training plan generation is temporarily unavailable. Please try again shortly.",
      });
    }

    const planText = JSON.stringify(planJson, null, 2);

    const newPlan = await prisma.training_plans.create({
      data: {
        user_id: userId,
        plan_json: planJson,
        plan_text: planText,
        version: nextVersion,
      },
    });

    return res.status(201).json({
      id: newPlan.id,
      version: newPlan.version,
      createdAt: newPlan.created_at,
      planJson: newPlan.plan_json,
      planText: newPlan.plan_text,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
});

router.get("/current", async (req: Request, res: Response) => {
  try {
    const userId =
      typeof req.query.userId === "string" ? req.query.userId.trim() : "";

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const plan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!plan) {
      return res.status(404).json({ error: "No plan found" });
    }

    return res.json({
      id: plan.id,
      userId: plan.user_id,
      planJson: plan.plan_json,
      planText: plan.plan_text,
      version: plan.version,
      createdAt: plan.created_at,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return res.status(500).json({ error: "Failed to fetch plan" });
  }
});

export default router;
