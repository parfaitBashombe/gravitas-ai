import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const saveProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    userId,
    goal,
    experience,
    daysPerWeek,
    sessionLength,
    equipment,
    injuries,
    preferredSplit,
  } = req.body;

  await prisma.user_profiles.upsert({
    where: { user_id: userId },
    update: {
      goal,
      experience,
      days_per_week: daysPerWeek,
      session_length: sessionLength,
      equipment,
      injuries: injuries || null,
      preferred_split: preferredSplit,
      updated_at: new Date(),
    },
    create: {
      user_id: userId,
      goal,
      experience,
      days_per_week: daysPerWeek,
      session_length: sessionLength,
      equipment,
      injuries: injuries || null,
      preferred_split: preferredSplit,
    },
  });

  res.json({ success: true });
};

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.query as { userId: string };

  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
  });

  if (!profile) {
    res.json({ profile: null });
    return;
  }

  res.json({
    profile: {
      userId: profile.user_id,
      goal: profile.goal,
      experience: profile.experience,
      daysPerWeek: profile.days_per_week,
      sessionLength: profile.session_length,
      equipment: profile.equipment,
      injuries: profile.injuries,
      preferredSplit: profile.preferred_split,
      updatedAt: profile.updated_at,
    },
  });
};
