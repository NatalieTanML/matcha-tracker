import { ListIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import type { Session } from "@/lib/auth-client";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop navigation items (smaller buttons)
  const desktopNavItems = session ? (
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
  );

  // Mobile navigation items (full width, larger touch targets)
  const mobileNavItems = session ? (
    <div className="flex flex-col overflow-y-auto min-h-0 flex-1 ">
      <Link to="/my-favourites" className="w-full py-4 px-8" onClick={() => setMobileMenuOpen(false)}>
        My Favourites
      </Link>
      <Link to="/profile" className="w-full py-4 px-8" onClick={() => setMobileMenuOpen(false)}>
        Profile
      </Link>
    </div>
  ) : (
    <div className="flex flex-col overflow-y-auto min-h-0 flex-1">
      <Link to="/login" className="w-full py-4 px-8" onClick={() => setMobileMenuOpen(false)}>
        Sign in
      </Link>
      <Link to="/register" className="w-full py-4 px-8" onClick={() => setMobileMenuOpen(false)}>
        Register
      </Link>
    </div>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-background/70 backdrop-blur transition-all duration-500 ${
          isScrolled ? "border-b" : ""
        }`}
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-sm md:text-lg font-semibold shrink-0">
            <span className="text-sprout-500">❯ </span>
            <span className="hover:text-sprout-500 transition-colors">matchadrop.fyi</span>
          </Link>

          {/* Desktop Navigation - visible on md and up */}
          <div className="hidden md:flex items-center gap-2 shrink-0">{desktopNavItems}</div>

          {/* Mobile Hamburger Menu - visible on small screens */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <ListIcon size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" showCloseButton={false}>
                <div className="flex flex-col h-full">
                  <SheetHeader className="gap-0 p-8 flex flex-row items-center justify-between font-semibold">
                    <div>
                      <span className="text-sprout-500">❯ </span>
                      <span>matchadrop.fyi</span>
                    </div>

                    {/* <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Close menu">
                        <XIcon size={24} />
                      </Button>
                    </SheetClose> */}
                  </SheetHeader>
                  {mobileNavItems}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
