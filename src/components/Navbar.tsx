import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-white/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--petal)] to-[var(--primary)] shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-tight">GabriellaAI</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Beauty Discovery</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
            <Link to="/feed" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Trending</Link>
            <Link to="/explore" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
            <Link to="/admin" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button asChild size="sm" className="bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0 shadow-soft hover:opacity-90">
                  <Link to="/upload"><Upload className="h-4 w-4 mr-1.5" />Upload Look</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={async () => { await signOut(); router.invalidate(); }} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth"><User className="h-4 w-4 mr-1.5" />Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0 shadow-soft hover:opacity-90">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
