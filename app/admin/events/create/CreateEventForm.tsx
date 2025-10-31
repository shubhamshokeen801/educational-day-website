"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreateEventForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_team_event: false,
    min_team_size: 1,
    max_team_size: 1,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg(data.error || "Error creating event");
      return;
    }

    setMsg("Event created successfully!");
    setTimeout(() => router.push("/admin/dashboard"), 1000);
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Event Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-4">
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            required
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_team_event}
            onChange={(e) =>
              setForm({ ...form, is_team_event: e.target.checked })
            }
          />
          Team Event?
        </label>

        {form.is_team_event && (
          <div className="flex gap-4">
            <input
              type="number"
              className="border p-2 rounded w-full"
              placeholder="Min team size"
              value={form.min_team_size}
              onChange={(e) =>
                setForm({ ...form, min_team_size: +e.target.value })
              }
            />
            <input
              type="number"
              className="border p-2 rounded w-full"
              placeholder="Max team size"
              value={form.max_team_size}
              onChange={(e) =>
                setForm({ ...form, max_team_size: +e.target.value })
              }
            />
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </Button>

        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </main>
  );
}
