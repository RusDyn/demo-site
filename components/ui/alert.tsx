import * as React from "react";
import { cn } from "@/lib/utils";
type AlertVariant = "default" | "info" | "destructive";

interface AlertOptions {
  className?: string;
  variant?: AlertVariant;
}

function alertVariants({ className, variant = "default" }: AlertOptions = {}): string {
  return cn(
    "relative w-full rounded-lg border border-border/80 bg-background/95 p-4 text-sm text-foreground shadow-sm [&>svg+div]:translate-y-[-1px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-muted-foreground",
    getVariantClass(variant),
    className,
  );
}

function getVariantClass(variant: AlertVariant): string {
  switch (variant) {
    case "default":
      return "bg-background/95 text-foreground";
    case "info":
      return "border-primary/40 bg-primary/10 text-foreground [&>svg]:text-primary";
    case "destructive":
      return "border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive [&>svg+div]:text-destructive";
  }

  const exhaustiveCheck: never = variant;
  return exhaustiveCheck;
}

type AlertProps = React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant };

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = "default", ...props }, ref) => (
  <div ref={ref} role="alert" className={alertVariants({ className, variant })} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h5>
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle, alertVariants };
