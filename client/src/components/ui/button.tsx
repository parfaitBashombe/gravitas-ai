import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-colors rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      primary:
        "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]",
      secondary:
        "bg-card text-foreground border border-border hover:bg-border",
      ghost: "text-muted hover:text-foreground hover:bg-card",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
