import { SpinnerIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return <SpinnerIcon className={cn("size-4 animate-spin", className)} weight="bold" {...props} />;
}

export { Spinner };
