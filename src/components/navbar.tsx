import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth-client";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-background/70 backdrop-blur transition-all duration-500 ${
        isScrolled ? "border-b" : ""
      }`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-sm md:text-lg font-semibold">
          <span className="text-sprout-500">❯ </span>
          <span className="hover:text-sprout-500 transition-colors">matchadrop.fyi</span>
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/my-favourites">My Favourites</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
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
