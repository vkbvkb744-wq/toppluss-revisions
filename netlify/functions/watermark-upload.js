// netlify/functions/watermark-upload.js
// Receives: { fileBase64, fileName, metadata: { title, system, level, subject, type } }
// 1. Watermarks every page with www.topplussrevisions.com (diagonal, repeated)
// 2. Uploads watermarked PDF to Supabase Storage
// 3. Saves material record to Supabase DB
// 4. Returns { success, materialId, publicUrl }

const { PDFDocument, rgb, degrees } = require("pdf-lib");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use service role for server-side uploads
);

const BUCKET = "materials";
const WATERMARK_TEXT = "www.topplussrevisions.com";

async function addWatermark(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Embed a standard font
  const { StandardFonts } = require("pdf-lib");
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.045; // ~4.5% of smaller dimension
    const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, fontSize);

    // Draw watermark multiple times across the page in a grid pattern
    const cols = 3;
    const rows = 4;
    const colStep = width / cols;
    const rowStep = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = colStep * c + colStep * 0.1;
        const y = rowStep * r + rowStep * 0.3;

        page.drawText(WATERMARK_TEXT, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.55, 0.55, 0.55),
          opacity: 0.18,
          rotate: degrees(-28),
        });
      }
    }
  }

  return await pdfDoc.save();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { fileBase64, fileName, metadata } = body;

  if (!fileBase64 || !fileName || !metadata) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
  }

  try {
    // 1. Decode base64 PDF
    const pdfBytes = Buffer.from(fileBase64, "base64");

    // 2. Watermark
    const watermarkedBytes = await addWatermark(pdfBytes);

    // 3. Build storage path
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${metadata.system}/${metadata.level}/${metadata.subject}/${Date.now()}_${safeName}`;

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, watermarkedBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 5. Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // 6. Insert material record into DB
    const { data: material, error: dbError } = await supabase
      .from("materials")
      .insert([
        {
          title: metadata.title,
          system: metadata.system,
          level: metadata.level,
          subject: metadata.subject,
          type: metadata.type,
          file_url: publicUrl,
          storage_path: storagePath,
          pages: metadata.pages || null,
          downloads: 0,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        materialId: material.id,
        publicUrl,
        title: material.title,
      }),
    };
  } catch (err) {
    console.error("watermark-upload error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Upload failed" }),
    };
  }
};
