const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "https://topplussrevisions.top";

exports.handler = async (event) => {
  try {
    // Extract material ID from path: /material/UUID-slug
    const path = event.path || "";
    const match = path.match(/\/material\/([a-f0-9-]{36})/);
    
    if (!match) {
      return {
        statusCode: 302,
        headers: { Location: BASE_URL },
      };
    }

    const materialId = match[1];

    // Fetch material from Supabase
    const { data: material, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id", materialId)
      .single();

    if (error || !material) {
      return {
        statusCode: 302,
        headers: { Location: BASE_URL },
      };
    }

    const title = `${material.title} — ${material.subject} ${material.level} | Toppluss Revisions`;
    const description = material.description
      ? `${material.description} Download ${material.title} for ${material.level} ${material.subject} on Toppluss Revisions Kenya.`
      : `Download ${material.title} for ${material.level} ${material.subject}. ${material.system} revision material. KCSE and CBC Kenya. Subscribe from KSh 50/week.`;
    const slug = material.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const canonicalUrl = `${BASE_URL}/material/${material.id}-${slug}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${material.title}, ${material.subject} ${material.level}, ${material.type} Kenya, ${material.system} ${material.level} ${material.subject}, KCSE revision Kenya, CBC revision materials" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Toppluss Revisions" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <script>
    // Redirect to React app with this material open
    window.location.href = "/?material=${material.id}";
  </script>
</head>
<body>
  <!-- SEO Content for Google -->
  <div>
    <h1>${material.title}</h1>
    <h2>${material.subject} ${material.level} — ${material.type}</h2>
    <p><strong>Curriculum:</strong> ${material.system}</p>
    <p><strong>Level:</strong> ${material.level}</p>
    <p><strong>Subject:</strong> ${material.subject}</p>
    <p><strong>Type:</strong> ${material.type}</p>
    ${material.description ? `<p>${material.description}</p>` : ""}
    <p>Download ${material.title} on Toppluss Revisions — Kenya's #1 revision platform for KCSE and CBC students. Access notes, past papers, marking schemes and revision materials. Subscribe from KSh 50 per week via M-Pesa.</p>
    <p><a href="${BASE_URL}">Visit Toppluss Revisions</a> | WhatsApp: +254 755 803 149</p>
  </div>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=3600",
      },
      body: html,
    };
  } catch (err) {
    console.error("Material SEO error:", err);
    return {
      statusCode: 302,
      headers: { Location: BASE_URL },
    };
  }
};
