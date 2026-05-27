import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "./auth-context";
import { authClient } from "../lib/auth";
import type { TrainingPlan, User, UserProfile } from "../types";
import { api } from "../lib/api";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [neonUser, setNeonUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [profile, setProfile] = useState<Omit<
    UserProfile,
    "userId" | "updatedAt"
  > | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshData = useCallback(async () => {
    const userId = neonUser?.id;

    if (isRefreshingRef.current) return;
    if (!userId) { setIsDataReady(true); return; }

    isRefreshingRef.current = true;

    try {
      // Fetch both profile and plan in parallel
      const [profileRes, planData] = await Promise.all([
        api.getProfile(userId).catch(() => null),
        api.getCurrentPlan(userId).catch(() => null),
      ]);

      if (profileRes?.profile) {
        setProfile({
          goal: profileRes.profile.goal,
          experience: profileRes.profile.experience,
          daysPerWeek: profileRes.profile.daysPerWeek,
          sessionLength: profileRes.profile.sessionLength,
          equipment: profileRes.profile.equipment,
          injuries: profileRes.profile.injuries,
          preferredSplit: profileRes.profile.preferredSplit,
        });
      } else {
        setProfile(null);
      }

      if (!planData) {
        setPlan(null);
        return;
      }

      setPlan({
        id: planData.id,
        userId: planData.userId,
        overview: planData.planJson.overview,
        weeklySchedule: planData.planJson.weeklySchedule,
        progression: planData.planJson.progression,
        version: planData.version,
        createdAt: planData.createdAt,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setProfile(null);
      setPlan(null);
    } finally {
      isRefreshingRef.current = false;
      setIsDataReady(true);
    }
  }, [neonUser?.id]);

  useEffect(() => {
    void loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!neonUser?.id) {
      setPlan(null);
      return;
    }

    void refreshData();
  }, [isLoading, neonUser?.id, refreshData]);

  const loadUser = async () => {
    try {
      const result = await authClient.getSession();
      const sessionUser = result?.data?.user;

      if (!sessionUser) {
        setNeonUser(null);
        return;
      }

      const mappedUser: User = {
        id: sessionUser.id,
        email: sessionUser.email,
        createdAt:
          sessionUser.createdAt instanceof Date
            ? sessionUser.createdAt.toISOString()
            : String(sessionUser.createdAt),
      };

      setNeonUser(mappedUser);
    } catch (err) {
      console.error("Error loading user:", err);
      setNeonUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlan = useCallback(
    async (options?: { force?: boolean }) => {
      if (!neonUser?.id) {
        throw new Error("User must be authenticated to generate plan");
      }
      await api.generatePlan(neonUser.id, options);
      await refreshData();
    },
    [neonUser?.id, refreshData],
  );

  const saveProfile = useCallback(
    async (profileData: Omit<UserProfile, "userId" | "updatedAt">) => {
      if (!neonUser?.id) {
        throw new Error("User must be authenticated to save profile");
      }

      await api.saveProfile(neonUser.id, profileData);
      await refreshData();
    },
    [neonUser?.id, refreshData],
  );

  return (
    <AuthContext.Provider
      value={{
        user: neonUser,
        profile,
        isLoading,
        isDataReady,
        saveProfile,
        generatePlan,
        refreshData,
        plan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
