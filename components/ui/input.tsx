import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  maxLength?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, maxLength, ...props }, ref) => {
  return (
    <input
      type={type}
      maxLength={maxLength}
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-[hsl(var(--control))] px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-[hsl(var(--control-strong))] focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
