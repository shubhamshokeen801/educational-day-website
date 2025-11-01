import { createServerClientInstance } from "@/app/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import RegistrationsTable from "./RegistrationsTable";

// Define expected structure for type safety
interface RegistrationRow {
  id: string;
  payment_status: string;
  registered_at: string;
  user_id: string | null;
  team_id: string | null;
  users?: { name: string; email: string } | { name: string; email: string }[];
  teams?: { team_name: string; team_code: string } | { team_name: string; team_code: string }[];
}

interface TeamMember {
  team_id: string;
  users: { name: string; email: string };
}

export default async function EventRegistrationsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createServerClientInstance();

  // Check user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Check admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") redirect("/");

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("id, name, is_team_event")
    .eq("id", id)
    .maybeSingle();

  if (!event) return <div className="p-8">Event not found</div>;

  // Fetch registrations with joined user/team data
  const { data: registrations, error } = await supabase
    .from("registration")
    .select(
      `
      id,
      payment_status,
      registered_at,
      user_id,
      team_id,
      users:user_id (name, email),
      teams:team_id (team_name, team_code)
    `
    )
    .eq("event_id", id)
    .order("registered_at", { ascending: false });

  if (error) {
    console.error(error);
    return <div className="p-8">Error loading registrations</div>;
  }

  const typedRegistrations = registrations as unknown as RegistrationRow[];

  // Pre-fetch team members
  const teamIds = typedRegistrations
    ?.filter((r) => r.team_id)
    .map((r) => r.team_id);

  let teamMembersMap: Record<string, TeamMember["users"][]> = {};

  if (teamIds?.length) {
    const { data: members } = await supabase
      .from("team_members")
      .select("team_id, users:user_id(name, email)")
      .in("team_id", teamIds);

    const typedMembers = members as unknown as TeamMember[];

    teamMembersMap =
      typedMembers?.reduce((acc, m) => {
        acc[m.team_id] = acc[m.team_id] || [];
        acc[m.team_id].push(m.users);
        return acc;
      }, {} as Record<string, TeamMember["users"][]>) ?? {};
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Registrations – {event.name}
      </h1>

      <RegistrationsTable 
        registrations={typedRegistrations}
        teamMembersMap={teamMembersMap}
      />
    </main>
  );
}