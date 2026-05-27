import { useState } from "react";
import { RedirectToSignIn, SignedIn } from "@neondatabase/neon-js/auth/react";
import { useAuth } from "../context/auth-context";
import { PillSelect } from "../components/ui/pill-select";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { UserProfile } from "../types";
import { useNavigate } from "react-router-dom";
import { GenerationLoader } from "../components/ui/generation-loader";
import { Galaxy } from "../components/ui/galaxy";
import { CursorGlow } from "../components/ui/hero-particles";

const TOTAL_STEPS = 4;

const stepMeta = [
  {
    label: "What's your primary goal?",
    sub: "Choose the outcome you're training towards.",
  },
  {
    label: "Your experience & style",
    sub: "We'll adjust intensity and structure to match.",
  },
  {
    label: "Your schedule",
    sub: "How often and how long do you want to train?",
  },
  {
    label: "Anything to note?",
    sub: "Optional — helps us plan around limitations.",
  },
];

const Onboarding = () => {
  const { user, profile, saveProfile, generatePlan } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    goal: profile?.goal || "bulk",
    experience: profile?.experience || "intermediate",
    daysPerWeek: String(profile?.daysPerWeek || "4"),
    sessionLength: String(profile?.sessionLength || "60"),
    equipment: profile?.equipment || "full_gym",
    injuries: profile?.injuries || "",
    preferredSplit: profile?.preferredSplit || "upper_lower",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setIsGenerating(true);

    const payload: Omit<UserProfile, "userId" | "updatedAt"> = {
      goal: formData.goal as UserProfile["goal"],
      experience: formData.experience as UserProfile["experience"],
      daysPerWeek: Number(formData.daysPerWeek),
      sessionLength: Number(formData.sessionLength),
      equipment: formData.equipment as UserProfile["equipment"],
      injuries: formData.injuries || undefined,
      preferredSplit: formData.preferredSplit as UserProfile["preferredSplit"],
    };

    try {
      await saveProfile(payload);
      await generatePlan();
      navigate("/profile", { replace: true });
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!user) return <RedirectToSignIn />;

  const isUpdating = !!profile;

  return (
    <SignedIn>
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 pt-16 pb-6">
        <Galaxy />
        <CursorGlow />

        <div className="relative z-10 max-w-lg w-full animate-fade-up">
          {isGenerating ? (
            <div className="bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl p-10">
              <GenerationLoader />
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-8 justify-center">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-8 bg-accent"
                        : i < step
                          ? "w-4 bg-accent/50"
                          : "w-4 bg-border"
                    }`}
                  />
                ))}
              </div>

              {/* Step header */}
              <div className="mb-5 text-center">
                <p className="text-xs text-muted tracking-widest uppercase mb-2">
                  Step {step + 1} of {TOTAL_STEPS}
                </p>
                <h1 className="text-2xl font-bold mb-1">
                  {stepMeta[step].label}
                </h1>
                <p className="text-muted text-sm">{stepMeta[step].sub}</p>
              </div>

              {/* Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                    {error}
                  </div>
                )}

                {step === 0 && (
                  <PillSelect
                    label="Primary goal"
                    options={goalOptions}
                    value={formData.goal}
                    onChange={(v) => set("goal", v)}
                    cols={5}
                  />
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <PillSelect
                      label="Experience level"
                      options={experienceOptions}
                      value={formData.experience}
                      onChange={(v) => set("experience", v)}
                      cols={3}
                    />
                    <PillSelect
                      label="Training split"
                      options={splitOptions}
                      value={formData.preferredSplit}
                      onChange={(v) => set("preferredSplit", v)}
                      cols={2}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <PillSelect
                        label="Days per week"
                        options={daysOptions}
                        value={formData.daysPerWeek}
                        onChange={(v) => set("daysPerWeek", v)}
                        cols={5}
                      />
                      <PillSelect
                        label="Session length"
                        options={sessionOptions}
                        value={formData.sessionLength}
                        onChange={(v) => set("sessionLength", v)}
                        cols={2}
                      />
                    </div>
                    <PillSelect
                      label="Equipment access"
                      options={equipmentOptions}
                      value={formData.equipment}
                      onChange={(v) => set("equipment", v)}
                      cols={3}
                    />
                  </div>
                )}

                {step === 3 && (
                  <Textarea
                    id="injuries"
                    label="Injuries or limitations"
                    placeholder="e.g. lower back pain, bad shoulder, knee issues…"
                    rows={4}
                    value={formData.injuries}
                    onChange={(e) => set("injuries", e.target.value)}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-4">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2 shrink-0"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    type="button"
                    className="flex-1 gap-2"
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="flex-1 gap-2"
                    onClick={handleSubmit}
                    disabled={isGenerating}
                  >
                    {isUpdating ? "Update & Regenerate" : "Generate My Plan"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </SignedIn>
  );
};

export default Onboarding;

const goalOptions = [
  { value: "bulk", label: "Bulk" },
  { value: "cut", label: "Cut" },
  { value: "recomp", label: "Recomp" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
];

const experienceOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const daysOptions = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
];

const sessionOptions = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
];

const equipmentOptions = [
  { value: "full_gym", label: "Full Gym" },
  { value: "home", label: "Home Gym" },
  { value: "dumbbells", label: "Dumbbells Only" },
];

const splitOptions = [
  { value: "full_body", label: "Full Body" },
  { value: "upper_lower", label: "Upper / Lower" },
  { value: "ppl", label: "Push / Pull / Legs" },
  { value: "custom", label: "AI Decides" },
];
