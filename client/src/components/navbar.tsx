import { Dumbbell, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/auth-context";
import { UserButton } from "@neondatabase/neon-js/auth/react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <Dumbbell className="w-6 h-6 text-accent" />
            <span className="font-semibold text-lg">Gravitas AI</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/onboarding">
                  <Button variant="ghost" size="sm">
                    Profile Settings
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    My Plan
                  </Button>
                </Link>
                <UserButton className="bg-accent" />
              </>
            ) : (
              <>
                <Link to="/auth/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>

          <button
            className="sm:hidden text-foreground p-1"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <div
        onClick={() => setMenuOpen(false)}
        className={`sm:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-lg transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`sm:hidden fixed top-0 right-0 h-full w-[80vw] z-60 bg-background border-l border-border shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <Link
            to="/"
            className="flex items-center gap-2 text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            <Dumbbell className="w-5 h-5 text-accent" />
            <span className="font-semibold">Gravitas AI</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-foreground p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 py-6 flex-1">
          {user ? (
            <>
              <Link to="/onboarding" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-base h-12"
                >
                  Profile Settings
                </Button>
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-base h-12"
                >
                  My Plan
                </Button>
              </Link>
              <div className="px-3 py-2">
                <UserButton className="bg-accent" />
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/sign-in" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-base h-12"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full h-12 text-base mt-2">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
