import { Leaf02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/75 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-lg font-semibold">
          <HugeiconsIcon icon={Leaf02Icon} className="size-5 text-primary" />
          <span>Matcha Tracker</span>
        </a>
        {/* <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            About
          </Button>
        </div> */}
      </div>
    </header>
  );
}
