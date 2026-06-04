import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { makeSlug } from "./slug";

const AnalyzeInput = z.object({
  storagePath: z.string().min(1).max(500),
  title: z.string().max(120).optional(),
  description: z.string().max(800).optional(),
});

type VisionAnalysis = {
  skin_tone: string; skin_tone_confidence: number;
  undertone: string; undertone_confidence: number;
  lip_category: string; lip_color: string; lip_confidence: number;
  blush_category: string; blush_color: string; blush_confidence: number;
  eyeshadow_category: string; eyeshadow_color: string; eyeshadow_confidence: number;
  foundation_category: string; foundation_finish: string; foundation_confidence: number;
  style_tags: string[];
  description: string;
};

async function callOpenAIVision(imageUrl: string): Promise<VisionAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const systemPrompt = `You are GabriellaAI, an expert beauty and makeup analyst. Analyze the makeup look in the image and return a strict JSON object describing the most likely makeup characteristics. Always include confidence scores between 0 and 1. Use accessible category names (e.g. "Matte Nude Lipstick", "Peach Cream Blush", "Warm Brown Eyeshadow", "Natural Dewy Finish"). For colors, use simple descriptive names like "soft pink", "berry", "warm brown". Never claim exact products.`;

  const userPrompt = `Analyze this image and respond with ONLY a JSON object (no markdown) matching this TypeScript type:
{
  skin_tone: string,            // e.g. "Fair", "Light", "Medium", "Tan", "Deep"
  skin_tone_confidence: number,
  undertone: string,            // "Warm" | "Cool" | "Neutral" | "Olive"
  undertone_confidence: number,
  lip_category: string,         // e.g. "Matte Nude Lipstick"
  lip_color: string,            // e.g. "soft pink"
  lip_confidence: number,
  blush_category: string,
  blush_color: string,
  blush_confidence: number,
  eyeshadow_category: string,
  eyeshadow_color: string,
  eyeshadow_confidence: number,
  foundation_category: string,  // e.g. "Light Coverage Foundation"
  foundation_finish: string,    // e.g. "Natural Dewy Finish"
  foundation_confidence: number,
  style_tags: string[],         // e.g. ["soft glam", "bridal", "natural"]
  description: string           // 1-2 sentence summary of the look
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
          ],
        },
      ],
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI Vision error ${res.status}: ${txt.slice(0, 400)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");
  return JSON.parse(content) as VisionAnalysis;
}

export const createAndAnalyzeLook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Get signed URL for the uploaded file (private bucket, long TTL)
    const { data: signed, error: signErr } = await supabase
      .storage.from("looks")
      .createSignedUrl(data.storagePath, 60 * 60 * 24 * 365);
    if (signErr || !signed) throw new Error(signErr?.message || "Could not access uploaded image");
    const imageUrl = signed.signedUrl;

    // 2. Insert look
    const slug = makeSlug(data.title);
    const { data: look, error: lookErr } = await supabase
      .from("looks")
      .insert({
        user_id: userId,
        slug,
        title: data.title || "Untitled Look",
        description: data.description || null,
        image_url: imageUrl,
        storage_path: data.storagePath,
      })
      .select()
      .single();
    if (lookErr || !look) throw new Error(lookErr?.message || "Failed to save look");

    // 3. Call OpenAI Vision
    let analysis: VisionAnalysis;
    try {
      analysis = await callOpenAIVision(imageUrl);
    } catch (e) {
      // Look stays; analysis can be retried later
      throw new Error(`AI analysis failed: ${(e as Error).message}`);
    }

    // 4. Save analysis
    await supabase.from("ai_analysis").insert({
      look_id: look.id,
      skin_tone: analysis.skin_tone,
      skin_tone_confidence: analysis.skin_tone_confidence,
      undertone: analysis.undertone,
      undertone_confidence: analysis.undertone_confidence,
      lip_category: analysis.lip_category,
      lip_color: analysis.lip_color,
      lip_confidence: analysis.lip_confidence,
      blush_category: analysis.blush_category,
      blush_color: analysis.blush_color,
      blush_confidence: analysis.blush_confidence,
      eyeshadow_category: analysis.eyeshadow_category,
      eyeshadow_color: analysis.eyeshadow_color,
      eyeshadow_confidence: analysis.eyeshadow_confidence,
      foundation_category: analysis.foundation_category,
      foundation_finish: analysis.foundation_finish,
      foundation_confidence: analysis.foundation_confidence,
      style_tags: analysis.style_tags,
      raw_json: analysis,
    });

    // 5. Match products by category keywords
    const categories = [analysis.lip_category, analysis.blush_category, analysis.eyeshadow_category, analysis.foundation_category];
    const keywords = categories
      .filter(Boolean)
      .flatMap((c) => c.toLowerCase().split(/\s+/))
      .filter((w) => ["lipstick", "blush", "eyeshadow", "foundation", "lip", "eye"].includes(w));
    const wanted = new Set<string>();
    for (const k of keywords) {
      if (k.includes("lip")) wanted.add("Lipstick");
      if (k.includes("blush")) wanted.add("Blush");
      if (k.includes("eye")) wanted.add("Eyeshadow");
      if (k.includes("foundation")) wanted.add("Foundation");
    }
    if (wanted.size > 0) {
      const { data: matches } = await supabase
        .from("products")
        .select("id, category, price_inr")
        .in("category", Array.from(wanted));
      if (matches && matches.length > 0) {
        const rows = matches.slice(0, 24).map((p) => ({
          look_id: look.id,
          product_id: p.id,
          match_confidence: 0.7,
          reason: `Matches ${p.category} from analysis`,
        }));
        await supabase.from("look_products").insert(rows);
      }
    }

    return { slug, lookId: look.id };
  });

const SlugInput = z.object({ slug: z.string().min(1).max(100) });

export const getLookBySlug = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => SlugInput.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: look, error } = await supabaseAdmin
      .from("looks")
      .select(`
        id, slug, title, description, image_url, created_at, user_id,
        ai_analysis(*),
        profiles:user_id(username, display_name, avatar_url),
        look_products(match_confidence, reason, products(*))
      `)
      .eq("slug", data.slug)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return look;
  });

export const getRecentLooks = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("looks")
      .select("id, slug, title, image_url, created_at, profiles:user_id(display_name, avatar_url), ai_analysis(style_tags, lip_category)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);
    return data || [];
  });
