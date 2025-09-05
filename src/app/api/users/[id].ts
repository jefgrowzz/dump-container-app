import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const { name, email, role } = req.body;
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({ name, email, role })
        .eq("id", id)
        .select("id, name, email, role");

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data[0]);
    }

    if (req.method === "DELETE") {
      const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: "User deleted" });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
