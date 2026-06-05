import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Beauty Products — GabriellaAI" },
      { name: "description", content: "Shop curated fragrances, skincare, beauty and fashion picks from SKINN, Dot & Key, Tira and AJIO." },
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
  price: string;
  image: string;
  url: string;
  retailer: string;
};

type Category = { key: string; label: string; emoji: string; products: Product[] };

const CATEGORIES: Category[] = [
  {
    key: "fragrances",
    label: "Fragrances",
    emoji: "🌸",
    products: [
      { id: "f1", brand: "SKINN by Titan", name: "Celeste EDP 100ml", price: "₹2,795", image: "https://gabrilla.buzz/wp111.PNG", url: "https://bilty.co/WDZVYx", retailer: "SKINN" },
      { id: "f2", brand: "SKINN by Titan", name: "Raw EDP 100ml — Men", price: "₹2,795", image: "https://gabrilla.buzz/wp222.PNG", url: "https://bilty.co/ZX9rPI", retailer: "SKINN" },
      { id: "f3", brand: "SKINN by Titan", name: "Noura Floret EDP", price: "₹3,295", image: "https://gabrilla.buzz/wp333.PNG", url: "https://bilty.co/iR6304", retailer: "SKINN" },
      { id: "f4", brand: "SKINN by Titan", name: "Nova for Men 100ml", price: "₹3,095", image: "https://gabrilla.buzz/wp444.PNG", url: "https://bilty.co/laqNCW", retailer: "SKINN" },
      { id: "f5", brand: "SKINN by Titan", name: "Celeste 100ml for Women", price: "₹2,795", image: "https://gabrilla.buzz/ip.PNG", url: "https://bilty.co/WDZVYx", retailer: "SKINN" },
      { id: "f6", brand: "SKINN by Titan", name: "Noura Nectar EDP for her 100ml", price: "₹2,801", image: "https://gabrilla.buzz/ip2.PNG", url: "https://bilty.co/HIkjXT", retailer: "SKINN" },
      { id: "f7", brand: "SKINN by Titan", name: "Celeste Beyond 100ml EDP", price: "₹2,895", image: "https://gabrilla.buzz/ip3.PNG", url: "https://bilty.co/C9YRV7", retailer: "SKINN" },
    ],
  },
  {
    key: "skincare",
    label: "Skincare",
    emoji: "✨",
    products: [
      { id: "s1", brand: "Dot & Key", name: "Vitamin C+E SPF 50+ PA++++", price: "₹595", image: "https://gabrilla.buzz/d1.PNG", url: "https://bilty.co/UjxQHA", retailer: "Dot & Key" },
      { id: "s2", brand: "Dot & Key", name: "Waterlight Gel Moisturiser", price: "₹495", image: "https://gabrilla.buzz/d2.PNG", url: "https://bilty.co/6s0QZd", retailer: "Dot & Key" },
      { id: "s3", brand: "Dot & Key", name: "10% Vitamin C+E Serum", price: "₹695", image: "https://gabrilla.buzz/d3.PNG", url: "https://bilty.co/Iuiwh5", retailer: "Dot & Key" },
      { id: "s4", brand: "Dot & Key", name: "Strawberry 10% Niacinamide Serum", price: "₹599", image: "https://gabrilla.buzz/d4.PNG", url: "https://bilty.co/Jzdtow", retailer: "Dot & Key" },
      { id: "s5", brand: "Dot & Key", name: "Watermelon Cooling Sunscreen SPF 50+", price: "₹595", image: "https://gabrilla.buzz/dk2.PNG", url: "https://bilty.co/J2gEAU", retailer: "Dot & Key" },
      { id: "s6", brand: "Dot & Key", name: "Dragon Fruit Bounce Sunscreen SPF 50+", price: "₹445", image: "https://gabrilla.buzz/dk3.PNG", url: "https://bilty.co/HCbS2U", retailer: "Dot & Key" },
      { id: "s7", brand: "Dot & Key", name: "Strawberry Dew Tinted Sunscreen SPF 50+", price: "₹549", image: "https://gabrilla.buzz/dk4.PNG", url: "https://bilty.co/XhSpBx", retailer: "Dot & Key" },
      { id: "s8", brand: "Dot & Key", name: "Barrier Repair Sunscreen SPF 50+", price: "₹595", image: "https://gabrilla.buzz/dk5.PNG", url: "https://bilty.co/FwfDhI", retailer: "Dot & Key" },
    ],
  },
  {
    key: "beauty",
    label: "Beauty",
    emoji: "💄",
    products: [
      { id: "b1", brand: "Akind", name: "Take A Shine Lip Gloss Oil — Hydrating", price: "₹387", image: "https://gabrilla.buzz/t11.PNG", url: "https://bilty.co/k8Mwv5", retailer: "Tira" },
      { id: "b2", brand: "Swiss Beauty", name: "Bold Matt Lip Liner — Choco Nude", price: "₹65", image: "https://gabrilla.buzz/t22.PNG", url: "https://bilty.co/d85ESt", retailer: "Tira" },
      { id: "b3", brand: "Etude", name: "Dear Darling Water Gel Tint — Pomegranate Ade", price: "₹405", image: "https://gabrilla.buzz/t33.PNG", url: "https://bilty.co/L3Wht1", retailer: "Tira" },
      { id: "b4", brand: "HYUE", name: "Hydra Matte Liquid Lipstick — Biscotti Hottie", price: "₹469", image: "https://gabrilla.buzz/t44.PNG", url: "https://bilty.co/qdMVBf", retailer: "Tira" },
    ],
  },
  {
    key: "fashion",
    label: "Fashion",
    emoji: "👗",
    products: [
      { id: "a1", brand: "LULU & SKY", name: "Women Halter-Neck Bodycon Dress", price: "₹232", image: "https://gabrilla.buzz/a111.PNG", url: "https://ajiio.co/w9DZ1J?", retailer: "AJIO" },
      { id: "a2", brand: "SAM", name: "Bodycon Dress with Cutouts", price: "₹234", image: "https://gabrilla.buzz/a222.PNG", url: "https://ajiio.co/k94PR8?", retailer: "AJIO" },
      { id: "a3", brand: "KETCH", name: "Women Floral Print Ruched Bodycon Dress", price: "₹240", image: "https://gabrilla.buzz/a333.PNG", url: "https://ajiio.co/CrtmnR?", retailer: "AJIO" },
      { id: "a4", brand: "FOUNDRY", name: "Women Ruched Bodycon Dress", price: "₹269", image: "https://gabrilla.buzz/a444.PNG", url: "https://ajiio.co/Ca8umO?", retailer: "AJIO" },
    ],
  },
];

function ExplorePage() {
  const [active, setActive] = useState<string>("fragrances");
  const current = CATEGORIES.find((c) => c.key === active)!;

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
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === c.key
                  ? "bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white shadow-soft"
                  : "bg-white/60 border border-white/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.label}
              <span className="ml-2 text-xs opacity-70">{c.products.length}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {current.products.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl border bg-card overflow-hidden shadow-soft hover:shadow-glow transition-shadow flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-foreground">
                  {p.retailer}
                </span>
              </div>
              <div className="p-3 space-y-2 flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand}</p>
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 mt-0.5">{p.name}</h3>
                </div>
                <div className="flex items-end justify-between pt-1">
                  <p className="font-display text-lg">{p.price}</p>
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                    <a href={p.url} target="_blank" rel="noopener noreferrer sponsored">
                      Buy
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

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
