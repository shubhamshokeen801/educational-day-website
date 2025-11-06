"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { Calendar, Users, User, ArrowRight, Sparkles, DollarSign } from "lucide-react";

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_team_event: boolean;
  max_team_size: number | null;
  min_team_size: number | null;
  registration_open: boolean;
  image_url?: string;
  is_mun_event?: string | null;
  slug?: string;
  is_paid: boolean;
  registration_fee: number | null;
}

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
        /* .order("start_date", { ascending: true }); */

      if (error) setError(error.message);
      else {
        const filtered = (data || []).filter(
          (e: Event) => !e.is_mun_event || e.is_mun_event === "false"
        );
        setEvents(filtered);
      }
      
      setLoading(false);
    }

    fetchEvents();
  }, [supabase]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center py-20 sm:py-32">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        </div>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg font-medium text-gray-600">Loading amazing events...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center py-20 sm:py-32">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 max-w-md">
          <p className="text-red-600 font-semibold text-base sm:text-lg">Error loading events</p>
          <p className="text-red-500 text-sm sm:text-base mt-2">{error}</p>
        </div>
      </div>
    );

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900" id="events">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full mb-4 sm:mb-6">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">Upcoming Events</span>
          </div>
          <h2 className="text-3xl sm:text-4xl py-2 lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Discover Learning Opportunities
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
            Join Tech Fest Events to Elevate Your Skills and Knowledge
          </p>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        <AnimatePresence>
          {events.map((event, index) => {
            const eventSlug = event.slug || createSlug(event.name);
            
            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all duration-300"
              >
                {/* Status Badge */}
                {event.registration_open && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                    <div className="bg-green-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                      Open
                    </div>
                  </div>
                )}

                {/* Event Image */}
                <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 overflow-hidden">
                  <img
                    src={event.image_url || "https://placehold.co/600x400?text=Event+Image"}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Event Info */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-800 dark:text-neutral-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {event.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-5 line-clamp-2">
                    {event.description || "Join us for an exciting learning experience!"}
                  </p>

                  {/* Registration Fee */}
                  {event.is_paid && event.registration_fee && (
                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-sm font-bold text-green-700 dark:text-green-300">
                          ₹{event.registration_fee}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400">Registration Fee</span>
                      </div>
                    </div>
                  )}

                  {!event.is_paid && (
                    <div className="mb-4 pb-4 ">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                          Free Event
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {event.is_team_event ? (
                        <>
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                            Team Event
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                          <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                            Solo Event
                          </span>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/events/${eventSlug}/register`}
                      className="relative px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-1.5 sm:gap-2"
                    >
                      Register
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {events.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 sm:py-20"
        >
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Events Available</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Check back soon for exciting upcoming events!
            </p>
          </div>
        </motion.div>
      )}
    </section>
  );
}