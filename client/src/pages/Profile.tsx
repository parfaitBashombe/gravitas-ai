import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Card } from "../components/ui/card";
import {
  Calendar,
  Dumbbell,
  Loader2,
  RefreshCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { PlanDisplay } from "../components/plan/plan-display";
import { GenerationLoader } from "../components/ui/generation-loader";

const Profile = () => {
  const { user, isLoading, plan, generatePlan } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (isRegenerating) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isRegenerating]);

  if (!user && !isLoading) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!plan) {
    return <Navigate to="/onboarding" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await generatePlan();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      {/* Full-page overlay while regenerating */}
      {isRegenerating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <GenerationLoader title="Regenerating your Plan" />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Training Plan</h1>
            <p className="text-muted">
              Version {plan.version} • Created {formatDate(plan.createdAt)}
            </p>
          </div>

          <Button
            variant="secondary"
            className="gap-2"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            {isRegenerating ? "Regenerating…" : "Regenerate Plan"}
          </Button>
        </div>

        {/* rest of the JSX unchanged */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Goal</p>
              <p className="font-medium text-sm">{plan.overview.goal}</p>
            </div>
          </Card>
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Frequency</p>
              <p className="font-medium text-sm">{plan.overview.frequency}</p>
            </div>
          </Card>
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Split</p>
              <p className="font-medium text-sm">{plan.overview.split}</p>
            </div>
          </Card>
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Version</p>
              <p className="font-medium text-sm">{plan.version}</p>
            </div>
          </Card>
        </div>

        <Card variant="bordered" className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Program Notes</h2>
          <p className="text-muted text-sm leading-relaxed">
            {plan.overview.notes}
          </p>
        </Card>

        <h2 className="font-semibold text-xl mb-4">Weekly Schedule</h2>
        <PlanDisplay weeklySchedule={plan.weeklySchedule} />

        <Card variant="bordered" className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Progression Strategy</h2>
          <p className="text-muted text-sm leading-relaxed">
            {plan.progression}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
