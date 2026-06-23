import { CSSProperties, ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  title?: string;
}

export function Badge({ children, style, className = "", title }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${className}`}
      style={style}
      title={title}
    >
      {children}
    </span>
  );
}
