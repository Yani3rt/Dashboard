import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.69rem] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[hsl(var(--primary))/0.2] text-[hsl(var(--primary))]",
        secondary: "border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        outline: "text-[hsl(var(--foreground))]",
        success: "border-transparent bg-[hsl(var(--success))/0.2] text-[hsl(var(--success))]",
        info: "border-transparent bg-[hsl(var(--info))/0.2] text-[hsl(var(--info))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
