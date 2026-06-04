import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard, type Product } from "@/components/ProductCard";
import { StoreFinder } from "@/components/StoreFinder";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { getLookBySlug } from "@/lib/looks.functions";

export const Route = createFileRoute("/look/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Look · GabriellaAI` }, { name: "description", content: `Beauty look ${params.slug}` }] }),
  component: LookPage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Look not found</div>,
});

function Confidence({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return null;
  return <span className="text-xs text-muted-foreground">{Math.round(pct * 100)}% confidence</span>;
}

function LookPage() {
  const { slug } = Route.useParams();
  const fetchLook = useServerFn(getLookBySlug);
  const { data: look, isLoading } = useQuery({ queryKey: ["look", slug], queryFn: () => fetchLook({ data: { slug } }) });
  const [maxBudget, setMaxBudget] = useState<number>(10000);
  const [showStores, setShowStores] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-[var(--petal)]" /></div>
      </div>
    );
  }
  if (!look) throw notFound();

  const ai = (look as any).ai_analysis;
  const products: Array<{ products: Product; match_confidence: number }> = ((look as any).look_products || []).filter((lp: any) => lp.products && lp.products.price_inr <= maxBudget);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl overflow-hidden shadow-soft bg-secondary aspect-[4/5]">
            <img src={look.image_url} alt={look.title || "look"} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
              <Sparkles className="h-3 w-3 text-[var(--petal)]" /> AI-Analyzed Look
            </div>
            <h1 className="font-display text-4xl">{look.title || "Untitled Look"}</h1>
            {look.description && <p className="text-muted-foreground">{look.description}</p>}
            {(look as any).profiles?.display_name && (
              <p className="text-sm text-muted-foreground">by {(look as any).profiles.display_name}</p>
            )}
            {ai?.style_tags && (
              <div className="flex flex-wrap gap-1.5">
                {ai.style_tags.map((t: string) => <span key={t} className="text-xs px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {ai && (
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-display text-2xl mb-4">AI Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Skin Tone", val: ai.skin_tone, conf: ai.skin_tone_confidence },
                { label: "Undertone", val: ai.undertone, conf: ai.undertone_confidence },
                { label: "Lips", val: `${ai.lip_category || ""}${ai.lip_color ? ` · ${ai.lip_color}` : ""}`, conf: ai.lip_confidence },
                { label: "Blush", val: `${ai.blush_category || ""}${ai.blush_color ? ` · ${ai.blush_color}` : ""}`, conf: ai.blush_confidence },
                { label: "Eyeshadow", val: `${ai.eyeshadow_category || ""}${ai.eyeshadow_color ? ` · ${ai.eyeshadow_color}` : ""}`, conf: ai.eyeshadow_confidence },
                { label: "Foundation", val: `${ai.foundation_category || ""}${ai.foundation_finish ? ` · ${ai.foundation_finish}` : ""}`, conf: ai.foundation_confidence },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl bg-white/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                  <p className="font-medium text-sm leading-tight mt-0.5">{row.val || "—"}</p>
                  <Confidence pct={row.conf} />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 italic">
              AI analysis is an estimate based on visual characteristics and may not represent the exact products used.
            </p>
          </section>
        )}

        {/* Products */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-2xl">Shop the Look</h2>
              <p className="text-sm text-muted-foreground">Curated picks with direct retailer links</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">Max ₹{maxBudget.toLocaleString("en-IN")}</label>
              <input type="range" min={300} max={10000} step={100} value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))} className="accent-[var(--primary)]" />
            </div>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No matching products in this budget.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((lp, i) => <ProductCard key={i} product={lp.products} />)}
            </div>
          )}
        </section>

        {/* Store finder */}
        <section>
          <h2 className="font-display text-2xl mb-4">Nearby Beauty Stores</h2>
          {showStores ? <StoreFinder /> : (
            <Button onClick={() => setShowStores(true)} className="bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0 rounded-full">
              Find Nearby Beauty Stores
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
