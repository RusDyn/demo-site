import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case "default":
      return "bg-primary text-primary-foreground shadow hover:bg-primary/90";
    case "secondary":
      return "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90";
    case "outline":
      return "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
    case "ghost":
      return "hover:bg-accent hover:text-accent-foreground";
    case "destructive":
      return "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90";
    case "link":
      return "text-primary underline-offset-4 hover:underline";
  }

  const exhaustiveCheck: never = variant;
  return exhaustiveCheck;
}

function getSizeClasses(size: ButtonSize): string {
  switch (size) {
    case "default":
      return "h-9 px-4 py-2";
    case "sm":
      return "h-8 rounded-md px-3 text-xs";
    case "lg":
      return "h-10 rounded-md px-8";
    case "icon":
      return "h-9 w-9";
  }

  const exhaustiveCheck: never = size;
  return exhaustiveCheck;
}

interface ButtonStyleOptions {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function buttonVariants({ className, variant = "default", size = "default" }: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    getVariantClasses(variant),
    getSizeClasses(size),
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={buttonVariants({ className, variant, size })} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
