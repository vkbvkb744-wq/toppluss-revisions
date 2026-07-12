import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = "https://hwgluelnbzhfhekarcwh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Z2x1ZWxuYnpoZmhla2FyY3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzk0OTEsImV4cCI6MjA5MjcxNTQ5MX0.cwO4mRTHu1JAx3mTxwrpTrj952JW6C5bDXpVU3KxyNw";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const match = url.pathname.match(
    /^\/material\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );

  const response = await context.next();

  if (!match) {
    return response;
  }

  const materialId = match[1];

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/materials?id=eq.${materialId}&select=title,subject,level,system,description`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const data = await apiRes.json();
    if (!data || !data[0]) {
      return response;
    }

    const material = data[0];
    const pageTitle = `${material.title} - ${material.subject || ""} ${material.level || ""} ${material.system || ""} | Toppluss Revisions`.replace(/\s+/g, " ").trim();
    const pageDescription = (material.description || `Download ${material.title} - free revision material on Toppluss Revisions.`).slice(0, 160);

    let html = await response.text();

    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);

    if (html.includes('name="description"')) {
      html = html.replace(
        /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
        `<meta name="description" content="${escapeHtml(pageDescription)}" />`
      );
    } else {
      html = html.replace(
        "</title>",
        `</title>\n<meta name="description" content="${escapeHtml(pageDescription)}" />`
      );
    }

    return new Response(html, {
      status: response.status,
      headers: response.headers,
    });
  } catch (err) {
    return response;
  }
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const config = { path: "/material/*" };
