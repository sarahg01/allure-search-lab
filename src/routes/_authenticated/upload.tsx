import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createAndAnalyzeLook } from "@/lib/looks.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({ meta: [{ title: "Upload Look · GabriellaAI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState<"" | "uploading" | "analyzing">("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const analyze = useServerFn(createAndAnalyzeLook);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("Max file size 10 MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { toast.error("JPG, PNG, or WEBP only"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file || !user) return;
    setBusy("uploading");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("looks").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      setBusy("analyzing");
      const result = await analyze({ data: { storagePath: path, title: title || undefined, description: description || undefined } });
      toast.success("Look analyzed!");
      navigate({ to: "/look/$slug", params: { slug: result.slug } });
    } catch (e) {
      toast.error((e as Error).message);
      setBusy("");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs mb-3">
            <Sparkles className="h-3 w-3 text-[var(--petal)]" /> AI Analysis
          </div>
          <h1 className="font-display text-4xl mb-2">Upload a Look</h1>
          <p className="text-muted-foreground text-sm">Selfie, Pinterest screenshot, celebrity photo — we'll analyze it.</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 shadow-soft space-y-5">
          <label className="block">
            <div className={`relative aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition ${preview ? "border-transparent" : "border-[var(--petal)] bg-[var(--blush)]/40 hover:bg-[var(--blush)]/70"}`}>
              {preview ? (
                <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <UploadCloud className="h-10 w-10 mx-auto text-[var(--petal)] mb-2" />
                  <p className="font-medium text-sm">Click to upload</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · max 10 MB</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0] || null)} />
          </label>

          <div>
            <Label htmlFor="title" className="text-xs">Title (optional)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Soft glam bridal" maxLength={120} className="rounded-xl" />
          </div>

          <div>
            <Label htmlFor="desc" className="text-xs">Description (optional)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about this look..." maxLength={800} className="rounded-xl" />
          </div>

          <Button onClick={submit} disabled={!file || !!busy} className="w-full rounded-full bg-gradient-to-r from-[var(--petal)] to-[var(--primary)] text-white border-0 h-12">
            {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{busy === "uploading" ? "Uploading…" : "AI is analyzing…"}</> : <><Sparkles className="h-4 w-4 mr-2" />Analyze with AI</>}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">AI analysis is an estimate based on visual characteristics.</p>
        </div>
      </div>
    </div>
  );
}
