import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, Upload, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — GabriellaAI" }] }),
  component: AdminPage,
});

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_inr: number;
  image_url: string | null;
  affiliate_url: string | null;
  retailer_url: string;
  retailer_name: string;
};

const EMPTY: Omit<Product, "id"> = {
  name: "",
  brand: "",
  category: "fragrances",
  price_inr: 0,
  image_url: "",
  affiliate_url: "",
  retailer_url: "",
  retailer_name: "",
};

function AdminPage() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id,name,brand,category,price_inr,image_url,affiliate_url,retailer_url,retailer_name")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10); // 10 years
      if (sErr) throw sErr;
      setForm((f) => ({ ...f, image_url: signed.signedUrl }));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name || !form.brand) {
      toast.error("Name and brand are required");
      return;
    }
    const payload = {
      ...form,
      price_inr: Number(form.price_inr) || 0,
      retailer_url: form.retailer_url || form.affiliate_url || "",
      retailer_name: form.retailer_name || form.brand,
    };
    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Product added");
    }
    setForm(EMPTY);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  function handleEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price_inr: p.price_inr,
      image_url: p.image_url ?? "",
      affiliate_url: p.affiliate_url ?? "",
      retailer_url: p.retailer_url,
      retailer_name: p.retailer_name,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl mb-2">Admin access required</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your account doesn't have admin permissions. Ask a workspace owner to grant you the
            <code className="mx-1 px-1.5 py-0.5 rounded bg-muted">admin</code> role in the
            <code className="mx-1 px-1.5 py-0.5 rounded bg-muted">user_roles</code> table.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <header>
          <h1 className="font-display text-3xl md:text-4xl">Product Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the catalog powering the Explore page.
          </p>
        </header>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl mb-4">{editingId ? "Edit product" : "Add product"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="fragrances">Fragrances</option>
                <option value="skincare">Skincare</option>
                <option value="beauty">Beauty</option>
                <option value="fashion">Fashion</option>
              </select>
            </div>
            <div>
              <Label>Price (INR)</Label>
              <Input
                type="number"
                value={form.price_inr}
                onChange={(e) => setForm({ ...form, price_inr: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Retailer name</Label>
              <Input
                value={form.retailer_name}
                onChange={(e) => setForm({ ...form, retailer_name: e.target.value })}
                placeholder="e.g. SKINN, Dot & Key, AJIO"
              />
            </div>
            <div>
              <Label>Affiliate URL</Label>
              <Input
                value={form.affiliate_url ?? ""}
                onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
                placeholder="https://bilty.co/..."
              />
            </div>
            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <Textarea
                rows={2}
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="Paste an image URL or upload below"
              />
              <div className="flex items-center gap-3 mt-2">
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("img-upload")?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  Upload image
                </Button>
                {form.image_url && (
                  <img src={form.image_url} alt="" className="h-12 w-12 rounded object-cover border" />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" />
              {editingId ? "Update product" : "Add product"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY); }}>
                Cancel
              </Button>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl mb-4">Catalog ({products.length})</h2>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet. Add one above.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <article key={p.id} className="rounded-xl border bg-card p-4 flex gap-3">
                  <div className="h-20 w-20 rounded bg-muted overflow-hidden flex-shrink-0">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {p.brand} · {p.category}
                    </p>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">{p.name}</h3>
                    <p className="font-display text-sm mt-1">₹{p.price_inr}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEdit(p)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
