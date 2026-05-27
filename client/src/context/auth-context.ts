import { createContext, useContext } from "react";
import type { TrainingPlan, User, UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: Omit<UserProfile, "userId" | "updatedAt"> | null;
  plan: TrainingPlan | null;
  isLoading: boolean;
  isDataReady: boolean;
  saveProfile: (
    profile: Omit<UserProfile, "userId" | "updatedAt">,
  ) => Promise<void>;
  generatePlan: (options?: { force?: boolean }) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
