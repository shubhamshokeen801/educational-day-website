// components/MunSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Award, ArrowRight, Calendar, Users2, Globe2, Sparkles, IndianRupee, Scroll, Speaker, Soup, FileBadge, Trophy , UserStar  } from "lucide-react";
interface MUNEvent {
  id: string;
  name: string;
  description: string;
  event_datetime: string;
  registration_open: boolean;
  image_url?: string;
  registration_fee: number;
  slug?: string;
}

// Function to generate slug from event name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const MunSection = () => {
  const [munEvents, setMunEvents] = useState<MUNEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMUNEvents() {
      try {
        const res = await fetch('/api/mun/events');
        const data = await res.json();
        
        if (res.ok) {
          // Add slug to each event
          const eventsWithSlug = data.map((event: MUNEvent) => ({
            ...event,
            slug: generateSlug(event.name)
          }));
          setMunEvents(eventsWithSlug);
        } else {
          setError(data.error || 'Failed to load MUN events');
        }
      } catch (err) {
        setError('Failed to load MUN events');
        console.error('Error fetching MUN events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMUNEvents();
  }, []);

  // Get icon and color based on event slug/name
  const getEventStyle = (slug: string) => {
    const slugLower = slug.toLowerCase();
    if (slugLower.includes('aippm')) {
      return {
        icon: Users2,
        color: 'from-blue-500 to-blue-600',
        bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
      };
    } else if (slugLower.includes('who')) {
      return {
        icon: Globe2,
        color: 'from-emerald-500 to-emerald-600',
        bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20'
      };
    } else if (slugLower.includes('ip') || slugLower.includes('press')) {
      return {
        icon: Scroll,
        color: 'from-violet-500 to-violet-600',
        bgGradient: 'from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20'
      };
    }
    // Default
    return {
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    };
  };

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
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900" id="mun">
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
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900" id="mun">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="border-red-400 border-2 rounded-lg inline-block px-4 py-2 mb-4">
            <p className="text-red-600 text-xl font-bold">BVICAM MUN Events are Postponed.</p>
            </div>
            <h2 className="text-3xl sm:text-4xl py-2 lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              BVICAM MUN 2025
            </h2>

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

        {/* Perks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 mb-6"
            >
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                    MUN Perks
                  </h3>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <FileBadge className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        Certification for All Participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        Exclusive Delegate Kits
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Soup className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        Exquisite Meals and Refreshments
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Speaker className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        Two Days DJ Socials
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        Trophies and Attractive Cash Prizes for the Winners
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <UserStar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        Delegate Under Experienced Chair Person
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

        {/* Event Cards */}
        {munEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {munEvents.map((event, index) => {
                const eventDate = new Date(event.event_datetime);
                const formattedDate = eventDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
                const eventStyle = getEventStyle(event.slug || '');
                const EventIcon = eventStyle.icon;

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
                        <div className="bg-green-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                          Open
                        </div>
                      </div>
                    )}

                    {!event.registration_open && (
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                        <div className="bg-gray-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                          Closed
                        </div>
                      </div>
                    )}

                    {/* Event Image */}
                    <div className={`relative w-full h-48 sm:h-56 bg-gradient-to-br ${eventStyle.bgGradient} overflow-hidden`}>
                      <img
                        src={event.image_url || "https://placehold.co/600x400?text=MUN+Event"}
                        alt={event.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Event Icon Badge */}
                      <div className={`absolute bottom-3 left-3 bg-gradient-to-r ${eventStyle.color} p-3 rounded-xl shadow-lg`}>
                        <EventIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-800 dark:text-neutral-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {event.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                        {event.description || "Join this prestigious MUN event"}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            12 and 13 Nov 2025
                          </span>
                        </div>
                        
                        {event.registration_fee && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            Registration Fee:
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              ₹{event.registration_fee}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">
                            MUN Event
                          </span>
                        </div>

                        {event.registration_open ? (
                          <Link
                            href={`/mun/${event.slug}/register`}
                            className="group/btn relative px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-1.5 sm:gap-2"
                          >
                            Register
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-400 dark:bg-gray-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl cursor-not-allowed opacity-60"
                          >
                            Closed
                          </button>
                        )}
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
                Check back soon for exciting MUN events!
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