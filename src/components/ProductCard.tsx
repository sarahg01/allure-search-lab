import { ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  shade: string | null;
  finish: string | null;
  price_inr: number;
  image_url: string | null;
  retailer_url: string;
  retailer_name: string;
}

export function ProductCard({ product }: { product: Product }) {
  const tier = product.price_inr < 800 ? "Budget" : product.price_inr < 2500 ? "Mid Range" : "Premium";
  const tierColor =
    tier === "Budget" ? "bg-emerald-100 text-emerald-700"
    : tier === "Mid Range" ? "bg-amber-100 text-amber-700"
    : "bg-[var(--accent)] text-[var(--accent-foreground)]";

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden shadow-soft hover:shadow-glow transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierColor}`}>
          {tier}
        </span>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h4 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h4>
        </div>
        {product.shade && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Tag className="h-3 w-3" />
            <span>{product.shade}</span>
          </div>
        )}
        <div className="flex items-end justify-between pt-1">
          <p className="font-display text-lg">₹{product.price_inr.toLocaleString("en-IN")}</p>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
            <a href={product.retailer_url} target="_blank" rel="noopener noreferrer">
              {product.retailer_name}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
