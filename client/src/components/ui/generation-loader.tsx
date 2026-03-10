import React, { useState, useEffect } from "react";
import { Loader2, Check, Circle } from "lucide-react";

interface GenerationLoaderProps {
  title?: string;
  className?: string;
}

const loadingSteps = [
  "Analyzing your fitness goals...",
  "Evaluating your experience level...",
  "Selecting the best training split...",
  "Calibrating exercise volume and intensity...",
  "Building your weekly schedule...",
  "Finalizing progression strategy...",
  "Almost ready...",
];

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({
  title = "Creating your Plan",
  className = "",
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev === loadingSteps.length - 1) return prev;
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Loader2 className="w-12 h-12 text-accent mb-6 animate-spin" />
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      <div className="flex flex-col items-start space-y-3 w-full max-w-sm mx-auto pl-4">
        {loadingSteps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 transition-opacity duration-500 ${
                isPending ? "opacity-30" : "opacity-100"
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
              <span
                className={`text-sm md:text-base ${
                  isCurrent ? "font-semibold text-foreground" : "text-muted"
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
