import {
  ChevronDown,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/auth-context";
import { authClient } from "../lib/auth";
import { useState, useEffect, useRef } from "react";

// ── Nav link ─────────────────────────────────────────────────────────────────

const NavLink = ({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors px-1 py-0.5
        ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent rounded-full" />
      )}
    </Link>
  );
};

// ── Profile dropdown (desktop) ────────────────────────────────────────────────

const ProfileDropdown = ({ email }: { email: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await authClient.signOut();
    navigate("/", { replace: true });
  };

  const initial = email[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all duration-150 group"
      >
        <Avatar initial={initial} size="sm" />
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted group-hover:text-foreground transition-all duration-200 ${
            open ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-150 origin-top-right z-50
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* User header */}
        <div className="px-4 pt-4 pb-3 border-b border-border flex items-center gap-3">
          <Avatar initial={initial} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Account</p>
            <p className="text-xs text-muted truncate">{email}</p>
          </div>
        </div>

        {/* Links */}
        <div className="p-1.5">
          <DropdownLink to="/profile" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setOpen(false)}>
            My Plan
          </DropdownLink>
          <DropdownLink to="/onboarding" icon={<Settings className="w-4 h-4" />} onClick={() => setOpen(false)}>
            Settings
          </DropdownLink>
        </div>

        {/* Sign out */}
        <div className="p-1.5 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ initial, size }: { initial: string; size: "sm" | "md" }) => (
  <div
    className={`rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-semibold shrink-0
      ${size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"}`}
  >
    {initial}
  </div>
);

const DropdownLink = ({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-background transition-colors"
  >
    {icon}
    {children}
  </Link>
);

// ── Navbar ────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await authClient.signOut();
    navigate("/", { replace: true });
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200
          ${scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent backdrop-blur-sm"
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Dumbbell className="w-4 h-4 text-accent" />
            </div>
            <span className="font-semibold text-base tracking-tight">
              Gravitas<span className="text-accent">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <NavLink to="/profile">My Plan</NavLink>
                <NavLink to="/onboarding">Settings</NavLink>
                <ProfileDropdown email={user.email} />
              </>
            ) : (
              <>
                <NavLink to="/auth/sign-in">Sign in</NavLink>
                <Link to="/auth/sign-up">
                  <Button size="sm" className="font-semibold">Get started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-card"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 z-50 flex flex-col
          bg-card border-l border-border shadow-2xl
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
              <Dumbbell className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-semibold text-sm">
              Gravitas<span className="text-accent">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-background"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {user ? (
            <>
              <DrawerLink
                to="/profile"
                icon={<LayoutDashboard className="w-4 h-4" />}
                onClick={() => setMenuOpen(false)}
              >
                My Plan
              </DrawerLink>
              <DrawerLink
                to="/onboarding"
                icon={<Settings className="w-4 h-4" />}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </DrawerLink>
            </>
          ) : (
            <>
              <DrawerLink to="/auth/sign-in" onClick={() => setMenuOpen(false)}>
                Sign in
              </DrawerLink>
              <Link
                to="/auth/sign-up"
                onClick={() => setMenuOpen(false)}
                className="mt-2"
              >
                <Button className="w-full font-semibold">Get started</Button>
              </Link>
            </>
          )}
        </nav>

        {/* User footer */}
        {user && (
          <div className="p-4 border-t border-border shrink-0">
            <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl">
              <Avatar initial={initial} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const DrawerLink = ({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-colors
        ${active
          ? "bg-accent/10 text-accent"
          : "text-muted hover:text-foreground hover:bg-background"
        }`}
    >
      {icon && <span className={active ? "text-accent" : ""}>{icon}</span>}
      {children}
    </Link>
  );
};

export default Navbar;
