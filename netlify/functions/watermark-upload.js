// netlify/functions/watermark-upload.js
// 1. Compresses the PDF (removes metadata, flattens, optimizes)
// 2. Watermarks every page with one centered diagonal www.topplussrevisions.com
// 3. Uploads to Supabase Storage
// 4. Saves material record to Supabase DB

const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "materials";
const WATERMARK_TEXT = "www.topplussrevisions.com";

async function compressAndWatermark(pdfBytes) {
  // Load original PDF
  const pdfDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
  });

  // ── Compression ──────────────────────────────────────────
  // Create a brand new PDF document
  const compressed = await PDFDocument.create();

  // Copy all pages into the new clean document
  const pageIndices = pdfDoc.getPageIndices();
  const copiedPages = await compressed.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => compressed.addPage(page));

  // Strip all metadata (reduces file size)
  compressed.setTitle("");
  compressed.setAuthor("");
  compressed.setSubject("");
  compressed.setKeywords([]);
  compressed.setProducer("");
  compressed.setCreator("");

  // ── Watermark ─────────────────────────────────────────────
  const font = await compressed.embedFont(StandardFonts.HelveticaBold);
  const pages = compressed.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.048;
    const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, fontSize);

    // ONE watermark — centered diagonally on the page
    const x = (width - textWidth) / 2;
    const y = height / 2;

    page.drawText(WATERMARK_TEXT, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.22,
      rotate: degrees(-28),
    });
  }

  // Save with compression options
  const savedBytes = await compressed.save({
    useObjectStreams: true,   // compresses object streams
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  return savedBytes;
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
    const originalBytes = Buffer.from(fileBase64, "base64");
    const originalSize = originalBytes.length;

    // 2. Compress + Watermark
    const processedBytes = await compressAndWatermark(originalBytes);
    const processedSize = processedBytes.length;

    const savedPercent = Math.round((1 - processedSize / originalSize) * 100);

    // 3. Build storage path
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${metadata.system}/${metadata.level}/${metadata.subject}/${Date.now()}_${safeName}`;

    // 4. Upload compressed + watermarked PDF to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, processedBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);
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
        originalSizeKB: Math.round(originalSize / 1024),
        processedSizeKB: Math.round(processedSize / 1024),
        savedPercent: savedPercent > 0 ? savedPercent : 0,
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
