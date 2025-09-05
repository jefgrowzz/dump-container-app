// src/app/api/containers/[id]/route.ts
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // destructure here
) {
  try {
    // await the params object before using properties
    const { id } = await params;

    const supabase = createClient();

    const { error } = await supabase
      .from("containers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting container:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error("Unexpected delete error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
