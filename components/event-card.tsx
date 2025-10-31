"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/app/lib/supabaseClient";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_team_event: boolean;
  max_team_size: number | null;
  min_team_size: number | null;
}

export default function EventCard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) setError(error.message);
      else setEvents(data || []);
      setLoading(false);
    }

    fetchEvents();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8" id="events">
      <h2 className="text-3xl font-bold text-center mb-8">Events</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-100">
                  {event.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                  {event.description || "No description provided."}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <p>
                    <span className="font-semibold">Start:</span>{" "}
                    {new Date(event.start_date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">End:</span>{" "}
                    {new Date(event.end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-auto pt-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      event.is_team_event
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                    }`}
                  >
                    {event.is_team_event ? "Team Event" : "Solo Event"}
                  </span>

                  <Link
                    href={`/events/${event.id}/register`}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full transition"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
