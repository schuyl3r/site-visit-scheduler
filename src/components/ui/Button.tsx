import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "default" | "accent" | "danger" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  active?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-surface-2 border-border text-foreground hover:bg-border",
  accent: "bg-accent/15 border-accent/40 text-accent hover:bg-accent/25",
  danger: "bg-danger/10 border-danger/40 text-danger hover:bg-danger/20",
  ghost: "bg-transparent border-transparent text-muted hover:text-foreground",
};

const ACTIVE_VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-accent border-accent text-accent-foreground",
  accent: "bg-accent border-accent text-accent-foreground",
  danger: "bg-danger border-danger text-background",
  ghost: "bg-accent/20 text-accent border-transparent",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", active, className = "", ...props },
  ref,
) {
  const variantClass = active ? ACTIVE_VARIANTS[variant] : VARIANTS[variant];
  return <button ref={ref} className={`${BASE} ${variantClass} ${className}`} {...props} />;
});
