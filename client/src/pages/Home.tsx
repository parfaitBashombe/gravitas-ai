import { Link, Navigate } from "react-router-dom";
import { ArrowRight, BarChart2, Calendar, Dumbbell, RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/auth-context";
import { CursorGlow, HeroParticles } from "../components/ui/hero-particles";

const Home = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) return <Navigate to="/profile" replace />;

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-32 px-6">
        <HeroParticles />
        <CursorGlow />

        {/* Subtle vignette so content stays readable */}
        <div className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center] from-transparent via-transparent to-background/60" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-xs text-muted tracking-widest uppercase mb-5">
            AI-powered training
          </p>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-7">
            Training built
            <br />
            <span className="text-accent">around you.</span>
          </h1>

          <p className="text-lg text-muted max-w-lg mb-10 leading-relaxed">
            Answer a few questions. Get a complete, AI-designed training
            program — tailored to your goals, schedule, and equipment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/onboarding">
              <Button size="lg" className="gap-2 font-semibold">
                Build my plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted tracking-widest uppercase mb-14">
            How it works
          </p>

          <div className="grid md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((step) => (
              <div key={step.number}>
                <span className="text-6xl font-bold text-accent/20 block mb-5 leading-none">
                  {step.number}
                </span>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What your plan includes ───────────────────────────── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted tracking-widest uppercase mb-4">
            What you get
          </p>
          <h2 className="text-3xl font-bold mb-14 max-w-sm">
            A complete program, not a list of exercises.
          </h2>

          <div className="grid md:grid-cols-2 gap-px bg-border">
            {planIncludes.map((item) => (
              <div key={item.title} className="bg-background p-8 group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Goals ────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted tracking-widest uppercase mb-14">
            Every goal, covered
          </p>

          <div className="divide-y divide-border">
            {goals.map((goal, i) => (
              <div
                key={goal.name}
                className="flex items-start gap-6 py-5 group"
              >
                <span className="text-xs text-muted/50 w-6 shrink-0 mt-0.5 tabular-nums">
                  0{i + 1}
                </span>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-8">
                  <h3 className="font-semibold sm:w-32 shrink-0">{goal.name}</h3>
                  <p className="text-muted text-sm">{goal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ready to stop guessing?</h2>
            <p className="text-muted text-sm">
              Sign up free. Your plan is ready in under a minute.
            </p>
          </div>
          <Link to="/auth/sign-up" className="shrink-0">
            <Button size="lg" className="gap-2 font-semibold">
              Get started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

const steps = [
  {
    number: "01",
    title: "Tell us about yourself",
    description:
      "Share your goals, experience level, available equipment, and how many days per week you can train.",
  },
  {
    number: "02",
    title: "AI builds your plan",
    description:
      "Our AI designs a complete weekly program — every set, rep, rest period, and RPE target included.",
  },
  {
    number: "03",
    title: "Train and progress",
    description:
      "Follow your plan, then regenerate whenever your goals change, your schedule shifts, or you're ready for more.",
  },
];

const planIncludes = [
  {
    icon: Calendar,
    title: "Full weekly schedule",
    description:
      "A structured day-by-day training calendar with clearly defined focus areas — not just a random exercise list.",
  },
  {
    icon: Dumbbell,
    title: "Precise exercise prescription",
    description:
      "Sets, reps, rest periods, and RPE targets for every movement. Plus alternative exercises for each one.",
  },
  {
    icon: BarChart2,
    title: "Progressive overload strategy",
    description:
      "A clear roadmap for increasing intensity over time so you keep making progress week after week.",
  },
  {
    icon: RefreshCcw,
    title: "Regenerate at any time",
    description:
      "Update your profile and get a brand new, versioned plan instantly — as your goals or schedule evolve.",
  },
];

const goals = [
  {
    name: "Bulk",
    description: "Build muscle and gain size through progressive overload and caloric surplus.",
  },
  {
    name: "Cut",
    description: "Lose body fat while preserving as much muscle mass as possible.",
  },
  {
    name: "Recomposition",
    description: "Simultaneously build muscle and reduce body fat — the best of both worlds.",
  },
  {
    name: "Strength",
    description: "Maximize your one-rep maxes on key lifts through targeted strength programming.",
  },
  {
    name: "Endurance",
    description: "Improve cardiovascular fitness, stamina, and aerobic capacity.",
  },
];
