// BABA AI GENERATOR VIDEO PRO V8 — FREE VERSION (NO API KEY)
// Deploy this file as a Cloudflare Worker.
// Tidak perlu tambah secret apa pun — pakai Pollinations.ai (gratis, publik, tanpa key).
// Setelah deploy, copy URL Worker-nya ke "AI Backend URL" di aplikasi GitHub Pages.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json", ...cors }
  });
}

function cleanJson(text) {
  text = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  return JSON.parse(text.slice(a, b + 1));
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Text generation lewat Pollinations (endpoint OpenAI-compatible, tanpa key)
async function pollinationsText(prompt) {
  const r = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const text = await r.text();
  if (!r.ok) throw new Error("Text API error: " + text);
  const data = JSON.parse(text);
  const out = data.choices?.[0]?.message?.content;
  if (!out) throw new Error("Text API returned no content.");
  return out;
}

// Image generation lewat Pollinations, tanpa key
async function pollinationsImage(prompt) {
  const seed = Math.floor(Math.random() * 1e9);
  const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt)
    + "?width=1024&height=1536&nologo=true&seed=" + seed;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Image API error: " + r.status);
  const contentType = r.headers.get("content-type") || "image/jpeg";
  const buf = await r.arrayBuffer();
  const base64 = arrayBufferToBase64(buf);
  return "data:" + contentType + ";base64," + base64;
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response("", { status: 204, headers: cors });
    const url = new URL(request.url);
    if (request.method !== "POST") return json({ ok: true, message: "BABA V8 backend online (free, no API key)" });

    try {
      const body = await request.json();

      if (url.pathname === "/story") {
        const count = Math.min(15, Math.max(1, Number(body.sceneCount || 10)));
        const topic = String(body.topic || "").slice(0, 1200);
        const style = String(body.style || "cinematic realistic").slice(0, 120);
        const prompt = `Create a coherent short-video storyboard for this exact idea: "${topic}".
Return ONLY valid JSON in this shape:
{"scenes":[{"number":1,"title":"...","narration":"...","imagePrompt":"..."}]}
Create exactly ${count} scenes.
CRITICAL RULE: the main subject and action from the idea "${topic}" must be literally described in EVERY single imagePrompt, word for word where possible — do not drift into unrelated subjects, characters, or animals.
Every scene must visibly depict the same main subject/character in the same style and environment.
Narration must be different and advance the story, but imagePrompt must never lose the original subject.
Image prompts must be concrete and scene-specific, not generic.
Visual style: ${style}.
Vertical 9:16. No text, no captions, no logos, no watermark.
Do not introduce new unrelated characters, animals, or objects not implied by the idea "${topic}".`;
        const out = await pollinationsText(prompt);
        const data = cleanJson(out);
        return json(data);
      }

      if (url.pathname === "/image") {
        const rawPrompt = String(body.prompt || "").slice(0, 2000);
        const topic = String(body.topic || "").slice(0, 300);
        if (!rawPrompt && !topic) return json({ error: "Missing prompt" }, 400);
        // Paksa subjek utama (topic) selalu ada di depan prompt gambar,
        // jadi walau story generator melenceng, gambar tetap fokus ke ide asli.
        const finalPrompt = topic ? `${topic}. ${rawPrompt}` : rawPrompt;
        const image = await pollinationsImage(finalPrompt);
        return json({ image });
      }

      return json({ error: "Unknown endpoint" }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  }
};
