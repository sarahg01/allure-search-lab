import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { LookCard } from "@/components/LookCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Search, Camera, MapPin, Palette } from "lucide-react";
import { getRecentLooks } from "@/lib/looks.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GabriellaAI — Discover The Beauty Behind Every Look" },
      { name: "description", content: "Upload any makeup look and get AI analysis, product recommendations, and nearby beauty stores in seconds." },
    ],
  }),
  component: Index,
});

const popular = ["Glam Makeup", "Bridal", "Korean Makeup", "Soft Glam", "Party", "Nude Lipstick"];

function Index() {
  const fetchLooks = useServerFn(getRecentLooks);
  const { data: looks = [], isLoading } = useQuery({ queryKey: ["recent-looks"], queryFn: () => fetchLooks() });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-[var(--petal)]" />
            AI-Powered Beauty Discovery
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-medium leading-[1.05] mb-5">
            Discover The Beauty<br />
            <span className="gradient-text italic">Behind Every Look</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Upload any makeup inspiration — Pinterest, celebrity, bridal — and get instant AI analysis, product picks across every budget, and nearby beauty stores.
          </p>

          <div className="max-w-2xl mx-auto mb-4">
            <div className="glass rounded-full p-2 flex items-center gap-2 shadow-soft">
              <Search className="h-5 w-5 text-muted-foreground ml-3" />
              <input
                placeholder="Search looks, products, brands..."
                className="flex-1 bg-transparent outline-none text-sm py-2"
              />
              <Button asChild className="rounded-full bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0 px-6">
                <Link to="/upload"><Upload className="h-4 w-4 mr-1.5" />Upload Look</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {popular.map((p) => (
              <span key={p} className="text-xs px-3 py-1 rounded-full bg-white/60 border border-white/80 text-muted-foreground hover:text-foreground cursor-pointer transition">
                {p}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
              <Link to="/feed">Explore Looks</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/upload"><Camera className="h-4 w-4 mr-1.5" />Upload a Look</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, title: "AI Makeup Analysis", desc: "Vision AI estimates skin tone, lip, blush, eyeshadow and foundation from any image." },
            { icon: Palette, title: "Budget Shopping", desc: "Curated picks from budget to premium with direct links to Nykaa, Tira, Sephora & more." },
            { icon: MapPin, title: "Nearby Stores", desc: "Find beauty stores and cosmetic shops around you in seconds, with directions." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl glass p-6 shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--petal)] to-[var(--primary)] flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Feed */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Trending Looks</h2>
            <p className="text-sm text-muted-foreground mt-1">Discoveries from the GabriellaAI community</p>
          </div>
          <Link to="/feed" className="text-sm text-[var(--primary)] font-medium hover:underline">See all →</Link>
        </div>

        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4 rounded-2xl bg-secondary animate-pulse" style={{ height: `${200 + (i % 4) * 60}px` }} />
            ))}
          </div>
        ) : looks.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass">
            <Sparkles className="h-10 w-10 mx-auto text-[var(--petal)] mb-2" />
            <p className="text-muted-foreground mb-4">Be the first to share a look</p>
            <Button asChild className="bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0">
              <Link to="/upload">Upload First Look</Link>
            </Button>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {looks.map((l, i) => <LookCard key={l.id} look={l as any} index={i} />)}
          </div>
        )}
      </section>

      <footer className="border-t bg-white/40 py-8 text-center text-xs text-muted-foreground">
        <p>GabriellaAI · AI analysis is an estimate based on visual characteristics and may not represent the exact products used.</p>
      </footer>
    </div>
  );
}
