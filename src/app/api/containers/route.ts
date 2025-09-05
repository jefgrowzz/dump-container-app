// app/api/containers/upload-and-create/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString();
    const size = form.get("size")?.toString();
    const location = form.get("location")?.toString() ?? "";
    const address = form.get("address")?.toString();
    const available_date = form.get("available_date")?.toString() ?? "";
    const priceRaw = form.get("price");
    const price = priceRaw != null ? Number(priceRaw.toString()) : null;
    const is_available_raw = form.get("is_available");
    const is_available = is_available_raw != null ? (is_available_raw.toString() === "true") : undefined;

    // Basic validation (require fields that your DB requires)
    if (!title || !location || !available_date || price == null || is_available === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle file upload (if supplied)
    let image_url = "";
    const file = form.get("image") as File | null;
    if (file && file.size) {
      const ext = (file.name || "img").split(".").pop();
      const filePath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      // file.arrayBuffer() -> convert to Uint8Array for supabase storage
      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await supabaseAdmin.storage
        .from("containers")
        .upload(filePath, new Uint8Array(buffer), { upsert: false });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
      }

      const { data: pub } = supabaseAdmin.storage.from("containers").getPublicUrl(filePath);
      image_url = (pub && (pub as any).publicUrl) || "";
    }

    const insertObj: any = {
      title,
      location,
      available_date,
      price,
      is_available,
    };

    if (description !== undefined) insertObj.description = description;
    if (size !== undefined) insertObj.size = size;
    if (address !== undefined) insertObj.address = address;
    if (image_url) insertObj.image_url = image_url;

    const { data, error } = await supabaseAdmin
      .from("containers")
      .insert([insertObj])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("upload-and-create error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
