/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { authClient } from "../lib/auth";
import type { UserProfile } from "../types";
import { api } from "../lib/api";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [neonUser, setNeonUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const result = await authClient.getSession();
      setNeonUser(result?.data?.user ?? null);
    } catch (err) {
      console.error(err);
      setNeonUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (
    profileData: Omit<UserProfile, "userId" | "updatedAt">,
  ) => {
    if (!neonUser) {
      throw new Error("User must be authenticated to save profile");
    }
    await api.saveProfile(neonUser.id, profileData);
    // await refreshData();
  };

  return (
    <AuthContext.Provider value={{ user: neonUser, isLoading, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
