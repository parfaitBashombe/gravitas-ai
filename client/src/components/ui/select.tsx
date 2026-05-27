import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  id?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select = ({
  label,
  error,
  id,
  options,
  value,
  onChange,
  placeholder = "Select…",
  className = "",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full px-4 py-2.5 bg-card border rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer text-sm
            ${isOpen ? "border-accent" : "border-border hover:border-muted"}`}
        >
          <span className={selectedOption ? "text-foreground" : "text-muted"}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-card border border-border rounded-xl overflow-hidden shadow-2xl"
            style={{ animation: "dropdown-in 0.14s ease both" }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer
                  ${option.value === value ? "text-accent" : "text-foreground"}`}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="w-3.5 h-3.5 shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};

Select.displayName = "Select";
