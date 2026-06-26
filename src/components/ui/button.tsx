import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-[background,transform,color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--fg)] text-[var(--bg)] shadow-sm hover:-translate-y-0.5",
        variant === "secondary" &&
          "border border-[var(--border)] bg-[var(--panel)] text-[var(--fg)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface)]",
        variant === "ghost" &&
          "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]",
        variant === "danger" &&
          "text-[var(--danger-text)] hover:bg-[var(--danger-soft)]",
        size === "icon" && "size-10 px-0",
        className,
      )}
      {...props}
    />
  );
}
