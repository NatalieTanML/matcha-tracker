import { Leaf02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth-client";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/75 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <HugeiconsIcon icon={Leaf02Icon} className="size-5 text-primary" />
          <span>Matcha Tracker</span>
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">Profile</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
