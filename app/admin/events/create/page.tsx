// app/admin/events/create/page.tsx
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/app/lib/supabaseServerClient";
import CreateEventForm from "./CreateEventForm";

export default async function AdminCreateEventPage() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🚫 Redirect if not logged in
  if (!user) redirect("/");

  // ✅ Fetch role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // 🚫 Redirect if not admin
  if (!profile || profile.role !== "admin") redirect("/");

  return <CreateEventForm />;
}
