import { Link } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";

export interface LookCardData {
  id: string;
  slug: string;
  title: string | null;
  image_url: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
  ai_analysis?: { style_tags?: string[] | null; lip_category?: string | null } | null;
}

export function LookCard({ look, index = 0 }: { look: LookCardData; index?: number }) {
  const heights = ["h-72", "h-96", "h-80", "h-[26rem]", "h-72", "h-[22rem]"];
  const h = heights[index % heights.length];
  return (
    <Link
      to="/look/$slug"
      params={{ slug: look.slug }}
      className="group relative block break-inside-avoid rounded-2xl overflow-hidden shadow-soft bg-card mb-4 transition-transform hover:-translate-y-1 hover:shadow-glow"
    >
      <div className={`relative ${h} overflow-hidden bg-secondary`}>
        <img
          src={look.image_url}
          alt={look.title || "Beauty look"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 glass rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-4 w-4 text-[var(--primary)]" />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 text-[var(--petal)] shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-sm leading-tight truncate">{look.title || "Untitled Look"}</h3>
            {look.profiles?.display_name && (
              <p className="text-xs text-muted-foreground truncate">by {look.profiles.display_name}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
