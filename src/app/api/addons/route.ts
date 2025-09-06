import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(req: NextRequest) {
  try {
    // Get available add-ons
    const { data: addons, error } = await supabaseAdmin
      .from("addons")
      .select("*")
      .eq("is_available", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching addons:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(addons || [], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching addons:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, unit, is_available = true } = body;

    // Validate required fields
    if (!name || !price || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate price
    if (price <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
    }

    // Create addon
    const { data: addon, error } = await supabaseAdmin
      .from("addons")
      .insert([{
        name,
        description,
        price,
        unit,
        is_available
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating addon:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(addon, { status: 201 });
  } catch (err: any) {
    console.error("Error creating addon:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
