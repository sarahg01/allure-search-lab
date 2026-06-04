import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { LookCard } from "@/components/LookCard";
import { getRecentLooks } from "@/lib/looks.functions";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Trending · GabriellaAI" }] }),
  component: Feed,
});

function Feed() {
  const fn = useServerFn(getRecentLooks);
  const { data = [], isLoading } = useQuery({ queryKey: ["feed"], queryFn: () => fn() });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-4xl mb-6">Trending Looks</h1>
        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4 rounded-2xl bg-secondary animate-pulse" style={{ height: `${200 + (i % 4) * 60}px` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No looks yet — be the first to upload!</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {data.map((l, i) => <LookCard key={l.id} look={l as any} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
