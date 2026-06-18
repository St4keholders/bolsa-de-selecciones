import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full">
        <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2">
          {label}
        </label>
        <input
          ref={ref}
          className={`border-b border-hair2 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-ink placeholder-dim2 ${
            error ? "border-danger focus:border-danger" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-danger text-xs mt-2 border-l-2 border-danger pl-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
