import { NextResponse } from "next/server";
import { createServerClientInstance } from "@/app/lib/supabaseServerClient";

export async function POST(req: Request) {
  const formData = await req.formData();
  const eventId = formData.get("eventId") as string;

  const supabase = await createServerClientInstance();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { error } = await supabase
    .from("events")
    .update({ registration_open: false })
    .eq("id", eventId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect("/admin/dashboard");
}
