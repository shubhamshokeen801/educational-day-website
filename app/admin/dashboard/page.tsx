// app/admin/dashboard/page.tsx
import Link from "next/link";
import { createServerClientInstance } from "@/app/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Authentication check
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // ✅ Role check
  if (!profile || profile.role !== "admin") redirect("/");

  // ✅ Fetch events
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-red-600">Error loading events: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/events/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Create Event
          </Button>
        </Link>
      </div>

      {/* Event List */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events?.length ? (
          events.map((event) => (
            <div
              key={event.id}
              className="p-4 border rounded-lg shadow-sm bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-lg font-semibold mb-2">{event.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                    {event.description || "No description available."}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-sm">
                    Status:{" "}
                    {event.registration_open ? (
                      <span className="text-green-600 font-medium">
                        Registration Open
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Closed</span>
                    )}
                  </p>

                  {/* ✅ Manage Registrations Button */}
                  <Link href={`/admin/events/${event.id}`}>
                    <Button
                      variant="outline"
                      className="w-full text-sm hover:bg-blue-50 dark:hover:bg-neutral-800"
                    >
                      Manage Registrations
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No events found.
          </p>
        )}
      </div>
    </main>
  );
}
