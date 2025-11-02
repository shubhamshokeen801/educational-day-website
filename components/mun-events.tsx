"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { Award, ArrowRight, Calendar, MapPin, Users2, Globe2, Scroll, Sparkles } from "lucide-react";

interface MUNEvent {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_open: boolean;
  image_url?: string;
  registration_fee: number;
  slug?: string;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
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
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900" id="mun">
        <div className="flex flex-col justify-center items-center py-12 sm:py-16">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Globe2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400">Loading MUN events...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <div className="flex flex-col justify-center items-center py-12 sm:py-16">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 sm:p-8 max-w-md">
            <p className="text-red-600 dark:text-red-400 font-semibold text-base sm:text-lg">Error loading MUN events</p>
            <p className="text-red-500 dark:text-red-400 text-sm sm:text-base mt-2">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const committees = [
    {
      name: "AIPPM",
      fullName: "All India Political Parties Meet",
      agenda: "Broadcasting Services (Regulation) Bill - media freedom and public discourse",
      icon: Users2,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "WHO",
      fullName: "World Health Organization",
      agenda: "Medical malpractice and inadequate healthcare services",
      icon: Globe2,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      name: "IP",
      fullName: "International Press",
      agenda: "Documenting, questioning, and reporting every move",
      icon: Scroll,
      color: "from-violet-500 to-violet-600"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900" id="mun">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
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
              BVICAM MUN 2025
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6">
              Step into the world of diplomacy, debate, and dialogue at our flagship TechMedia Fest
            </p>
            
            {/* <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">12th & 13th November 2025</span>
              </div>
              
              <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">BVICAM, Paschim Vihar</span>
              </div>
            </div> */}

            {/* Marquee Text */}
            <div className="relative overflow-hidden py-3 mb-6">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="mx-6 text-base sm:text-lg font-bold text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text">
                    🌍 Diplomacy • 🎯 Debate • 💬 Dialogue • ✨ Leadership
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Committees */}
        {/* <div className="mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Three Dynamic Committees</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Choose your arena of impact</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {committees.map((committee, index) => (
              <motion.div
                key={committee.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${committee.color} mb-4`}>
                  <committee.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{committee.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">{committee.fullName}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold text-gray-900 dark:text-white">Agenda:</span> {committee.agenda}
                </p>
              </motion.div>
            ))}
          </div>
        </div> */}

        {/* Info Banner */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 sm:p-8 mb-16 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                For Seasoned MUNers & First-Timers Alike
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                This is your chance to voice your opinions, sharpen your diplomacy, and make your mark on the global stage
              </p>
            </div>
          </div>
        </motion.div> */}

        {/* Event Cards */}
        {munEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {munEvents.map((event, index) => {
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
                    <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden">
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

                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-5 line-clamp-2">
                        {event.description || "Join this prestigious MUN committee"}
                      </p>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">
                            MUN Event
                          </span>
                        </div>

                        <Link
                          href={`/events/${eventSlug}/register`}
                          className="relative px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-1.5 sm:gap-2"
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
        )}

        {/* Empty State */}
        {munEvents.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
              <Globe2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No MUN Events Available</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Check back soon for exciting MUN committees!
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default MunSection;