import * as React from "react";
import { cn } from "@/lib/utils";
type BadgeVariant = "default" | "secondary" | "outline" | "muted";

interface BadgeOptions {
  className?: string;
  variant?: BadgeVariant;
}

function badgeVariants({ className, variant = "default" }: BadgeOptions = {}): string {
  return cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    getVariantClass(variant),
    className,
  );
}

function getVariantClass(variant: BadgeVariant): string {
  switch (variant) {
    case "default":
      return "border-transparent bg-primary text-primary-foreground hover:bg-primary/90";
    case "secondary":
      return "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
    case "outline":
      return "border-border bg-transparent text-foreground hover:bg-muted";
    case "muted":
      return "border-transparent bg-muted text-muted-foreground";
  }

  const exhaustiveCheck: never = variant;
  return exhaustiveCheck;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps): React.ReactElement {
  return <span className={badgeVariants({ className, variant })} {...props} />;
}

export { Badge, badgeVariants };
