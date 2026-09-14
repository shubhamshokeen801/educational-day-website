"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Users,
  Trophy,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StaticEvent {
  id: string;
  date: string;
  time: string;
  activity: string;
  venue: string;
  category: "MUN" | "Tech Fest";
}

interface EventScheduleProps {
  /** Set to true to display the "Coming Soon" fallback banner */
  isComingSoon?: boolean;
}

const staticEvents: StaticEvent[] = [
  // MUN Events
  {
    id: "mun-1",
    date: "12th Nov",
    time: "12:30 PM - 1:00 PM",
    activity: "Lunch",
    venue: "Cafeteria",
    category: "MUN",
  },
  {
    id: "mun-2",
    date: "12th Nov",
    time: "1:30 PM - 2:00 PM",
    activity: "Inauguration Ceremony",
    venue: "Delphi Hall",
    category: "MUN",
  },
  {
    id: "mun-3",
    date: "12th Nov",
    time: "2:00 PM - 4:00 PM",
    activity: "Session 1",
    venue: "AIPPM - Prasar Kendra, WHO - Seminar Hall, IP - Delphi Hall",
    category: "MUN",
  },
  {
    id: "mun-4",
    date: "12th Nov",
    time: "4:00 PM - 4:15 PM",
    activity: "Refreshment",
    venue: "Reception Area",
    category: "MUN",
  },
  {
    id: "mun-5",
    date: "12th Nov",
    time: "4:15 PM - 6:00 PM",
    activity: "Session 2",
    venue: "AIPPM - Prasar Kendra, WHO - Seminar Hall, IP - Delphi Hall",
    category: "MUN",
  },
  {
    id: "mun-6",
    date: "12th Nov",
    time: "6:00 PM - 6:30 PM",
    activity: "DJ",
    venue: "Ground",
    category: "MUN",
  },
  {
    id: "mun-7",
    date: "13th Nov",
    time: "12:30 PM - 1:30 PM",
    activity: "Lunch",
    venue: "Cafeteria",
    category: "MUN",
  },
  {
    id: "mun-8",
    date: "13th Nov",
    time: "1:30 PM - 3:30 PM",
    activity: "Session 1",
    venue: "AIPPM - Prasar Kendra, WHO - Seminar Hall, IP - Delphi Hall",
    category: "MUN",
  },
  {
    id: "mun-9",
    date: "13th Nov",
    time: "3:30 PM - 3:45 PM",
    activity: "Refreshment",
    venue: "Reception Area",
    category: "MUN",
  },
  {
    id: "mun-10",
    date: "13th Nov",
    time: "3:45 PM - 5:30 PM",
    activity: "Session 2",
    venue: "AIPPM - Prasar Kendra, WHO - Seminar Hall, IP - Delphi Hall",
    category: "MUN",
  },
  {
    id: "mun-11",
    date: "13th Nov",
    time: "5:30 PM - 6:00 PM",
    activity: "Closing Ceremony",
    venue: "Delphi Hall",
    category: "MUN",
  },
  {
    id: "mun-12",
    date: "13th Nov",
    time: "6:00 PM - 6:30 PM",
    activity: "DJ",
    venue: "Ground",
    category: "MUN",
  },
  // Tech Media Fest Events
  {
    id: "tech-1",
    date: "12th Nov",
    time: "9:00 AM",
    activity: "Volleyball",
    venue: "Ground",
    category: "Tech Fest",
  },
  {
    id: "tech-2",
    date: "12th Nov",
    time: "11:30 AM",
    activity: "Rangmanch",
    venue: "Auditorium",
    category: "Tech Fest",
  },
  {
    id: "tech-3",
    date: "12th Nov",
    time: "1:30 PM",
    activity: "Code Avengers",
    venue: "Computer Lab",
    category: "Tech Fest",
  },
  {
    id: "tech-4",
    date: "13th Nov",
    time: "10:00 AM",
    activity: "Tug of War",
    venue: "Ground",
    category: "Tech Fest",
  },
  {
    id: "tech-5",
    date: "13th Nov",
    time: "3:30 PM",
    activity: "Fandango",
    venue: "Auditorium",
    category: "Tech Fest",
  },
];

export default function EventSchedule({ isComingSoon = true }: EventScheduleProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const munEvents = staticEvents.filter((e) => e.category === "MUN");
  const techEvents = staticEvents.filter((e) => e.category === "Tech Fest");

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-neutral-950 dark:via-purple-950/10 dark:to-neutral-950"
      id="schedule"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4 sm:mb-6">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">
              Event Timeline
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-2 sm:mb-4">
            {isComingSoon ? "Schedule Coming Soon" : "Event Schedule"}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {isComingSoon
              ? "We are finalizing the event line-up and venue assignments. Check back soon for the complete itinerary!"
              : "Plan your participation with our comprehensive event timeline"}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Conditional View: Coming Soon State vs Full Schedule */}
        {isComingSoon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 rounded-3xl bg-white/70 dark:bg-neutral-900/70 border border-purple-200/60 dark:border-purple-900/40 backdrop-blur-md shadow-xl text-center max-w-2xl mx-auto"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 p-1.5 bg-yellow-400 rounded-full text-neutral-900 shadow">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Stay Tuned!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Session timings, room slots, and competition brackets are currently being organized.
            </p>

            {/* <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-4 py-2 rounded-full border border-purple-300/40 dark:border-purple-800/40">
              Dates: 12th – 13th November
            </div> */}
          </motion.div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">
                        Venue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {/* Tech Media Fest Section */}
                    <tr className="bg-gradient-to-r from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30">
                      <td colSpan={3} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                          <span className="text-lg font-bold text-pink-900 dark:text-pink-100">
                            Tech Media Fest Schedule
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Day 1 Heading */}
                    <tr className="bg-pink-50 dark:bg-pink-950/50">
                      <td colSpan={3} className="px-6 py-3">
                        <span className="text-base font-bold text-pink-700 dark:text-pink-300">
                          Day 1 - 12 November
                        </span>
                      </td>
                    </tr>
                    {techEvents
                      .filter((e) => e.date === "12th Nov")
                      .map((event, i) => (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (munEvents.length + i) * 0.05 }}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                              <span>{event.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {event.activity}
                            </p>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{event.venue || "—"}</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}

                    {/* Day 2 Heading */}
                    <tr className="bg-pink-50 dark:bg-pink-950/50">
                      <td colSpan={3} className="px-6 py-3">
                        <span className="text-base font-bold text-pink-700 dark:text-pink-300">
                          Day 2 - 13 November
                        </span>
                      </td>
                    </tr>
                    {techEvents
                      .filter((e) => e.date === "13th Nov")
                      .map((event, i) => (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              (munEvents.length +
                                techEvents.filter((e) => e.date === "12th Nov")
                                  .length +
                                i) *
                              0.05,
                          }}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                              <span>{event.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {event.activity}
                            </p>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{event.venue || "—"}</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-8">
              {/* MUN Mobile Cards */}
              <div>
                <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                    MUN Schedule
                  </h3>
                </div>
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-4">
                    {munEvents.map((event, i) => {
                      const isExpanded = expandedEvent === event.id;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0"
                          style={{ width: "280px" }}
                        >
                          <div
                            onClick={() =>
                              setExpandedEvent(isExpanded ? null : event.id)
                            }
                            className="p-5 cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
                                  {event.activity}
                                </h4>
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-2 shrink-0"
                              >
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </motion.div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {event.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {event.time}
                                </span>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/20 px-3 py-2 rounded-lg">
                                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {event.venue || "Venue TBA"}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tech Media Fest Mobile Cards */}
              <div>
                <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30 p-4 rounded-xl">
                  <Trophy className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  <h3 className="text-lg font-bold text-pink-900 dark:text-pink-100">
                    Tech Media Fest Schedule
                  </h3>
                </div>
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-4">
                    {techEvents.map((event, i) => {
                      const isExpanded = expandedEvent === event.id;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0"
                          style={{ width: "280px" }}
                        >
                          <div
                            onClick={() =>
                              setExpandedEvent(isExpanded ? null : event.id)
                            }
                            className="p-5 cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
                                  {event.activity}
                                </h4>
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-2 shrink-0"
                              >
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </motion.div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {event.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {event.time}
                                </span>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/20 px-3 py-2 rounded-lg">
                                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {event.venue || "Venue TBA"}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}