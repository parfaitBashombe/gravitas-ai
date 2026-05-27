import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";

const REGEN_COOLDOWN_SECONDS = 60;

export const generatePlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId, force = false } = req.body;

  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
  });

  if (!profile) {
    res
      .status(404)
      .json({ error: "User profile not found. Complete onboarding first." });
    return;
  }

  const latestPlan = await prisma.training_plans.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  // Return cached plan if it was generated after the last profile update
  if (!force && latestPlan && latestPlan.created_at >= profile.updated_at) {
    res.json({
      id: latestPlan.id,
      version: latestPlan.version,
      createdAt: latestPlan.created_at,
      planJson: latestPlan.plan_json,
      planText: latestPlan.plan_text,
    });
    return;
  }

  // Enforce a cooldown on explicit regeneration to avoid hammering the AI API
  if (force && latestPlan) {
    const ageSeconds = (Date.now() - latestPlan.created_at.getTime()) / 1000;
    if (ageSeconds < REGEN_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(REGEN_COOLDOWN_SECONDS - ageSeconds);
      res.status(429).json({
        error: `Please wait ${waitSeconds} second${waitSeconds !== 1 ? "s" : ""} before regenerating.`,
      });
      return;
    }
  }

  const nextVersion = latestPlan ? latestPlan.version + 1 : 1;

  let planJson;
  try {
    planJson = await generateTrainingPlan(profile);
  } catch (error: any) {
    console.error("AI generation failed:", error?.message || error);
    res.status(503).json({
      error:
        "Training plan generation is temporarily unavailable. Please try again shortly.",
    });
    return;
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

  res.status(201).json({
    id: newPlan.id,
    version: newPlan.version,
    createdAt: newPlan.created_at,
    planJson: newPlan.plan_json,
    planText: newPlan.plan_text,
  });
};

export const getCurrentPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.query as { userId: string };

  const plan = await prisma.training_plans.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  if (!plan) {
    res.status(404).json({ error: "No plan found" });
    return;
  }

  res.json({
    id: plan.id,
    userId: plan.user_id,
    planJson: plan.plan_json,
    planText: plan.plan_text,
    version: plan.version,
    createdAt: plan.created_at,
  });
};
