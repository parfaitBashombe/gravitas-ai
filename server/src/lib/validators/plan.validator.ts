import { z } from "zod";

export const generatePlanSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  force: z.boolean().optional().default(false),
});

export const getPlanSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});
