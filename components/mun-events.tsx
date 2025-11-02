"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { Award, Users, ArrowRight, Sparkles } from "lucide-react";

interface MUNEvent {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_open: boolean;
  image_url?: string;
  registration_fee: number;
}

const MunSection = () => {
  const [munEvents, setMunEvents] = useState<MUNEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMUNEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_mun_event", "true")
        .order("start_date", { ascending: true });

      if (error) setError(error.message);
      else setMunEvents(data || []);
      
      setLoading(false);
    }

    fetchMUNEvents();
  }, [supabase]);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gradient-to-b from-indigo-50 via-purple-50 to-white dark:from-neutral-950 dark:via-purple-950/20 dark:to-neutral-900">
        <div className="flex flex-col justify-center items-center py-12 sm:py-16">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400">Loading MUN events...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 bg-gradient-to-b from-indigo-50 via-purple-50 to-white dark:from-neutral-950 dark:via-purple-950/20 dark:to-neutral-900">
        <div className="flex flex-col justify-center items-center py-12 sm:py-16">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 sm:p-8 max-w-md">
            <p className="text-red-600 dark:text-red-400 font-semibold text-base sm:text-lg">Error loading MUN events</p>
            <p className="text-red-500 dark:text-red-400 text-sm sm:text-base mt-2">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 via-purple-50 to-white dark:from-neutral-950 dark:via-purple-950/20 dark:to-neutral-900" id="mun">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4 sm:mb-6">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">Model United Nations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl py-2 lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              MUN
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Engage in diplomatic discussions and develop leadership skills
            </p>
          </motion.div>
        </div>

        {/* MUN Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence>
            {munEvents.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl border border-purple-100 dark:border-purple-800/50 overflow-hidden flex flex-col transition-all duration-300"
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
                <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden">
                  <img
                    src={event.image_url || "https://placehold.co/600x400?text=MUN+Committee"}
                    alt={event.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Event Info */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-800 dark:text-neutral-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {event.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-5 line-clamp-3">
                    {event.description || "Join this prestigious MUN committee"}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href={`/events/${event.id}/register`}
                      className="relative px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-1.5 sm:gap-2"
                    >
                      Register
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {munEvents.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-md mx-auto border border-purple-200 dark:border-purple-700">
              <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-purple-400 mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No MUN Events Available</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Check back soon for exciting MUN committees!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MunSection;