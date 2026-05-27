import { z } from "zod";

export const saveProfileSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  goal: z.enum(["bulk", "cut", "recomp", "strength", "endurance"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(2).max(6),
  sessionLength: z.number().int().min(15).max(120),
  equipment: z.enum(["full_gym", "home", "dumbbells"]),
  injuries: z.string().max(500).nullable().optional(),
  preferredSplit: z.enum(["full_body", "upper_lower", "ppl", "custom"]),
});

export const getProfileSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});
