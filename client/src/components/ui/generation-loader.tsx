import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface GenerationLoaderProps {
  title?: string;
  className?: string;
}

const loadingSteps = [
  "Analyzing your fitness profile…",
  "Selecting the optimal training split…",
  "Programming exercise volume and intensity…",
  "Building your weekly schedule…",
  "Writing progression guidelines…",
  "Finalizing your plan…",
];

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({
  title = "Building your plan",
  className = "",
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex gap-1.5 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold mb-8 text-center">{title}</h2>

      <div className="space-y-3 w-full max-w-xs">
        {loadingSteps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isPending ? "opacity-20" : "opacity-100"
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
              ) : (
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    isCurrent ? "bg-accent animate-pulse" : "bg-muted"
                  }`}
                />
              )}
              <span
                className={`text-sm ${
                  isCurrent
                    ? "text-foreground font-medium"
                    : isCompleted
                      ? "text-muted"
                      : "text-muted"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
