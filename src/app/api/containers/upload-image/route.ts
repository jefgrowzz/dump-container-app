// app/api/containers/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const ext = (file.name || "img").split(".").pop();
    const filePath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Convert file to Uint8Array for Supabase storage
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("containers")
      .upload(filePath, new Uint8Array(buffer), { upsert: false });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage.from("containers").getPublicUrl(filePath);
    const image_url = (pub && (pub as any).publicUrl) || "";

    return NextResponse.json({ image_url }, { status: 200 });
  } catch (err: any) {
    console.error("Image upload error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
