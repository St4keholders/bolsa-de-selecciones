import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "custom";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", fullWidth = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-mono uppercase tracking-widest font-medium transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-ink text-canvas py-4 px-6",
      secondary: "border border-hair2 text-ink hover:bg-raise py-3 px-6",
      danger: "border border-danger text-danger bg-canvas hover:bg-danger hover:text-canvas py-3 px-6",
      ghost: "text-dim hover:text-ink py-2 px-4",
      custom: "",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
