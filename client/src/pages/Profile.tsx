import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Loader2, RefreshCcw, TrendingUp } from "lucide-react";
import { PlanDisplay } from "../components/plan/plan-display";
import { GenerationLoader } from "../components/ui/generation-loader";
import { Galaxy } from "../components/ui/galaxy";
import { CursorGlow } from "../components/ui/hero-particles";

const Profile = () => {
  const { user, isLoading, isDataReady, plan, generatePlan } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");

  useEffect(() => {
    document.body.style.overflow = isRegenerating ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isRegenerating]);

  if (!isLoading && !isDataReady) return null;
  if (!user && !isLoading) return <Navigate to="/auth/sign-in" replace />;
  if (!isDataReady) return null;
  if (!plan) return <Navigate to="/onboarding" replace />;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleRegenerate = async () => {
    setRegenError("");
    setIsRegenerating(true);
    try {
      await generatePlan({ force: true });
    } catch (err) {
      setRegenError(
        err instanceof Error ? err.message : "Failed to regenerate",
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Primary galaxy — upper right */}
      <Galaxy x={0.72} y={0.22} />
      {/* Secondary galaxy — lower left, smaller and dimmer */}
      <Galaxy x={0.18} y={0.78} scale={0.6} opacity={0.55} drawBackground={false} />
      <CursorGlow />

      {isRegenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-10">
            <GenerationLoader title="Rebuilding your plan" />
          </div>
        </div>
      )}

      <div className="relative z-10 pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">

          {regenError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
              {regenError}
            </div>
          )}

          {/* ── Hero header ──────────────────────────────── */}
          <div className="animate-fade-up mb-8">
            <p className="text-xs text-accent uppercase tracking-[0.2em] font-medium mb-3">
              Your Program
            </p>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-4xl font-bold leading-tight tracking-tight mb-3">
                  {plan.overview.split}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-accent/15 border border-accent/25 text-accent px-3 py-1 rounded-full">
                    {plan.overview.goal}
                  </span>
                  <span className="text-xs text-muted/60">·</span>
                  <span className="text-xs text-muted">
                    {plan.overview.frequency}
                  </span>
                  <span className="text-xs text-muted/60">·</span>
                  <span className="text-xs text-muted">
                    {formatDate(plan.createdAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="shrink-0 flex items-center gap-2 text-xs text-muted hover:text-foreground border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCcw className="w-3.5 h-3.5" />
                )}
                Regenerate
              </button>
            </div>
          </div>

          {/* ── Stats bar ────────────────────────────────── */}
          <div
            className="animate-fade-up bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden mb-6"
            style={{ animationDelay: "60ms" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06]">
              {[
                { label: "Goal", value: plan.overview.goal },
                { label: "Frequency", value: plan.overview.frequency },
                { label: "Split", value: plan.overview.split },
                { label: "Version", value: `v${plan.version}` },
              ].map(({ label, value }) => (
                <div key={label} className="px-5 py-4">
                  <p className="text-[10px] text-muted uppercase tracking-widest mb-1.5">
                    {label}
                  </p>
                  <p className="text-sm font-semibold leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Program notes ────────────────────────────── */}
          <div
            className="animate-fade-up mb-8"
            style={{ animationDelay: "120ms" }}
          >
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <p className="text-[10px] text-muted uppercase tracking-widest mb-3">
                Coach Notes
              </p>
              <p className="text-sm text-muted/80 leading-relaxed">
                {plan.overview.notes}
              </p>
            </div>
          </div>

          {/* ── Weekly schedule ──────────────────────────── */}
          <div
            className="animate-fade-up mb-8"
            style={{ animationDelay: "180ms" }}
          >
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="text-lg font-semibold">Weekly Schedule</h2>
              <span className="text-xs text-muted">
                {plan.weeklySchedule.length} training days
              </span>
            </div>
            <PlanDisplay weeklySchedule={plan.weeklySchedule} />
          </div>

          {/* ── Progression strategy ─────────────────────── */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <p className="text-[10px] text-muted uppercase tracking-widest">
                  Progression Strategy
                </p>
              </div>
              <p className="text-sm text-muted/80 leading-relaxed">
                {plan.progression}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
