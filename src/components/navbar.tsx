import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth-client";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur" style={{ backdropFilter: "blur(8px)" }}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          {/* <img src="/logo192.png" alt="matchadrop.fyi icon" className="h-8 w-auto" /> */}
          <span className="text-sprout-500">❯ </span>
          <span className="hover:text-sprout-500 transition-colors">matchadrop.fyi</span>
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
