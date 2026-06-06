import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Beauty Products — GabriellaAI" },
      {
        name: "description",
        content:
          "Shop curated fragrances, skincare, beauty and fashion picks from SKINN, Dot & Key, Tira and AJIO.",
      },
      { property: "og:title", content: "Explore Beauty Products — GabriellaAI" },
      { property: "og:description", content: "Curated beauty edit: fragrances, skincare, makeup and fashion." },
    ],
  }),
  component: ExplorePage,
});

type Product = {
  id: string;
  brand: string;
  name: string;
  price_inr: number;
  image_url: string | null;
  affiliate_url: string | null;
  retailer_url: string;
  retailer_name: string;
  category: string;
};

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  fragrances: { label: "Fragrances", emoji: "🌸" },
  skincare: { label: "Skincare", emoji: "✨" },
  beauty: { label: "Beauty", emoji: "💄" },
  fashion: { label: "Fashion", emoji: "👗" },
};

function ExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("fragrances");

  useEffect(() => {
    supabase
      .from("products")
      .select("id,brand,name,price_inr,image_url,affiliate_url,retailer_url,retailer_name,category")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Product[]> = {};
    for (const p of products) {
      const key = p.category?.toLowerCase() ?? "other";
      (g[key] ||= []).push(p);
    }
    return g;
  }, [products]);

  const categories = Object.keys(grouped).length
    ? Object.keys(grouped)
    : Object.keys(CATEGORY_META);
  const current = grouped[active] ?? [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-5 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-[var(--petal)]" />
            Curated Beauty Edit
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.05] mb-4">
            Explore <span className="gradient-text italic">beauty products</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Handpicked fragrances, skincare, makeup and fashion finds — every product researched, considered and linked to a trusted retailer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((key) => {
            const meta = CATEGORY_META[key] ?? { label: key, emoji: "✨" };
            const count = grouped[key]?.length ?? 0;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active === key
                    ? "bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white shadow-soft"
                    : "bg-white/60 border border-white/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-1.5">{meta.emoji}</span>
                {meta.label}
                <span className="ml-2 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : current.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {current.map((p) => {
              const href = p.affiliate_url || p.retailer_url;
              return (
                <article
                  key={p.id}
                  className="group rounded-2xl border bg-card overflow-hidden shadow-soft hover:shadow-glow transition-shadow flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-foreground">
                      {p.retailer_name}
                    </span>
                  </div>
                  <div className="p-3 space-y-2 flex-1 flex flex-col">
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand}</p>
                      <h3 className="font-medium text-sm leading-tight line-clamp-2 mt-0.5">{p.name}</h3>
                    </div>
                    <div className="flex items-end justify-between pt-1">
                      <p className="font-display text-lg">₹{p.price_inr.toLocaleString("en-IN")}</p>
                      {href && (
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                          <a href={href} target="_blank" rel="noopener noreferrer sponsored">
                            Buy
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-10 max-w-2xl mx-auto">
          Disclaimer: GabriellaAI is an affiliate of SKINN, Dot & Key, Tira and AJIO. We may earn a small commission if you purchase through our links — at no extra cost to you.
        </p>

        <div className="text-center mt-8">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">← Back home</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
