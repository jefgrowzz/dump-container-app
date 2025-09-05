// app/api/containers/upload-and-create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: NextRequest) {
  try {
    // NextRequest supports formData() in Node/Edge environments
    const form = await req.formData();
    const title = form.get("title")?.toString() ?? "";
    // ... grab other fields
    const file = form.get("image") as File | null;

    let imageUrl = "";
    if (file && file.size) {
      const bucket = "containers";
      const ext = (file.name || "img").split(".").pop();
      const filePath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const blob = await file.arrayBuffer();
      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, new Uint8Array(blob), { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
      imageUrl = publicData.publicUrl;
    }

    // now insert with supabaseAdmin (same code as above)
    const insertObj: any = { title, location: "", /* etc */ image_url: imageUrl };

    const { data, error } = await supabaseAdmin.from("containers").insert([insertObj]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("upload-and-create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
