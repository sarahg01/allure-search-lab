import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Navigation, Loader2, Star } from "lucide-react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { google: any; initGmaps?: () => void; }
}

type Store = {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: { location: { lat: () => number; lng: () => number } };
  opening_hours?: { open_now?: boolean };
  formatted_phone_number?: string;
  distance?: number;
};

const KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

async function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.google?.maps) return;
  if (!KEY) throw new Error("Google Maps key not configured");
  return new Promise((resolve, reject) => {
    if (document.getElementById("gmaps-script")) {
      const check = setInterval(() => { if (window.google?.maps) { clearInterval(check); resolve(); } }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error("Maps load timeout")); }, 10000);
      return;
    }
    window.initGmaps = () => resolve();
    const s = document.createElement("script");
    s.id = "gmaps-script";
    const trackParam = TRACKING ? `&channel=${TRACKING}` : "";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&loading=async&callback=initGmaps${trackParam}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

export function StoreFinder() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [stores, setStores] = useState<Store[]>([]);
  const [radius, setRadius] = useState(5000);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const findStores = async () => {
    setStatus("locating");
    setError("");
    if (!navigator.geolocation) { setStatus("error"); setError("Geolocation not supported by your browser."); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setStatus("loading");
        try {
          await loadMaps();
          const map = new window.google.maps.Map(mapRef.current!, {
            center: p, zoom: 13, disableDefaultUI: true, zoomControl: true,
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
          });
          new window.google.maps.Marker({ position: p, map, title: "You are here",
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#e88aab", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 } });
          const svc = new window.google.maps.places.PlacesService(map);
          svc.nearbySearch(
            { location: p, radius, keyword: "beauty store cosmetics makeup", type: "store" },
            (results, statusCode) => {
              if (statusCode !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
                setStatus("error"); setError("No beauty stores found in this radius. Try a wider radius."); return;
              }
              const withDist = results.map((r) => ({
                ...(r as unknown as Store),
                distance: distanceKm(p, { lat: r.geometry!.location!.lat(), lng: r.geometry!.location!.lng() }),
              })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
              setStores(withDist);
              withDist.slice(0, 20).forEach((s) => {
                new window.google.maps.Marker({
                  position: { lat: s.geometry.location.lat(), lng: s.geometry.location.lng() },
                  map, title: s.name,
                });
              });
              setStatus("ready");
            },
          );
        } catch (e) { setStatus("error"); setError((e as Error).message); }
      },
      (err) => {
        setStatus("error");
        setError(err.code === err.PERMISSION_DENIED
          ? "Location permission denied. Please allow location access to find nearby beauty stores."
          : "Could not get your location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => { if (userPos && status === "ready") findStores(); /* re-find on radius change */ }, [radius]);

  if (!KEY) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Maps are not configured for this environment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === "idle" && (
        <div className="rounded-2xl border bg-gradient-to-br from-[var(--blush)] to-white p-8 text-center shadow-soft">
          <MapPin className="h-10 w-10 mx-auto text-[var(--petal)] mb-3" />
          <h3 className="font-display text-xl mb-1">Find Nearby Beauty Stores</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Allow location access to discover beauty stores, cosmetic shops, and makeup retailers around you.
          </p>
          <Button onClick={findStores} className="bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0 shadow-soft">
            <MapPin className="h-4 w-4 mr-2" />Find Stores Near Me
          </Button>
        </div>
      )}

      {(status === "locating" || status === "loading") && (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-[var(--petal)] mb-2" />
          <p className="text-sm text-muted-foreground">
            {status === "locating" ? "Getting your location…" : "Finding beauty stores near you…"}
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button onClick={findStores} variant="outline" size="sm">Try Again</Button>
        </div>
      )}

      <div className={status === "ready" ? "block" : "hidden"}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm font-medium">
            {stores.length} stores within {radius / 1000} km
          </p>
          <div className="flex gap-1">
            {[5000, 10000, 20000].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={radius === r ? "default" : "outline"}
                className={radius === r ? "bg-[var(--primary)] text-white" : ""}
                onClick={() => setRadius(r)}
              >
                {r / 1000} km
              </Button>
            ))}
          </div>
        </div>

        <div ref={mapRef} className="w-full h-72 md:h-96 rounded-2xl border overflow-hidden shadow-soft mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stores.slice(0, 12).map((s) => {
            const lat = s.geometry.location.lat(), lng = s.geometry.location.lng();
            return (
              <div key={s.place_id} className="rounded-xl border bg-card p-4 shadow-soft">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="font-medium text-sm leading-tight">{s.name}</h4>
                  {s.distance !== undefined && (
                    <span className="text-xs whitespace-nowrap text-muted-foreground">{s.distance.toFixed(1)} km</span>
                  )}
                </div>
                {s.vicinity && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{s.vicinity}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  {s.rating && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{s.rating}</span>}
                  {s.opening_hours?.open_now !== undefined && (
                    <span className={s.opening_hours.open_now ? "text-emerald-600" : "text-red-500"}>
                      {s.opening_hours.open_now ? "Open" : "Closed"}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs flex-1">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-3 w-3 mr-1" />Directions
                    </a>
                  </Button>
                  {s.formatted_phone_number && (
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                      <a href={`tel:${s.formatted_phone_number}`}><Phone className="h-3 w-3" /></a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
