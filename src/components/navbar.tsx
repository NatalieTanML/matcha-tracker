import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth-client";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          {/* <img src="/logo192.png" alt="matcha-drop.sh icon" className="h-8 w-auto" /> */}
          <span className="text-sprout-500">❯ </span>
          <span className="hover:text-sprout-500 transition-colors">matcha-drop.sh</span>
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
