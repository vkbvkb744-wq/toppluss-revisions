const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "https://www.topplussrevisions.com";

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/browse", priority: "0.9", changefreq: "daily" },
];

exports.handler = async () => {
  try {
    const { data: materials, error } = await supabase
      .from("materials")
      .select("id, title, slug, updated_at, system, level, subject, type")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const staticEntries = STATIC_PAGES.map(
      (p) => `\n  <url>\n    <loc>${BASE_URL}${p.url}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    ).join("");

    const materialEntries = (materials || []).map((m) => {
      const slug = m.slug || m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const lastmod = m.updated_at
        ? new Date(m.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      return `\n  <url>\n    <loc>${BASE_URL}/material/${m.id}-${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${materialEntries}\n</urlset>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
      body: sitemap,
    };
  } catch (err) {
    console.error("Sitemap error:", err);
    return { statusCode: 500, body: "Error generating sitemap" };
  }
};
