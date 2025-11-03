"use client";
import React from "react";
import { motion } from "framer-motion";
import LightRays from "./LightRays";
import { ArrowRight, Calendar } from "lucide-react";

// Hero Component
export const Hero: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden pt-16 md:pt-20"
      id="home">
      <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
        <LightRays
          raysOrigin="top-center-offset"
          raysColor="#5dfeca"
          raysSpeed={0.5}
          lightSpread={0.9}
          rayLength={1.4}
          followMouse={true}
          mouseInfluence={0.02}
          noiseAmount={0.0}
          distortion={0.01}
        />
      </div>
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-20 md:py-12 lg:py-12">
        <div className="text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-3xl md:text-xl lg:text-xl xl:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6 px-2">
            Celebrate Learning,
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Innovation & Growth
            </span>
          </motion.h1>

          {/* Subheading with Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-8">
            {/* <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" /> */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400">
              Tech Media Fest 2025 <br /> and <br /> Education Day 2025
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Join us for a day of inspiration, knowledge-sharing, and creativity.
            Discover how education empowers the future through collaboration and
            innovative ideas.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 w-full sm:gap-6 md:gap-8 mt-5 sm:mt-10 md:mt-7 px-4">
            <div className="flex items-center justify-center w-60 gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl shadow-md">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Event Dates
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  12 and 13 Nov 2025
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 sm:mt-2 md:mt-8">
            <a
              href="#events"
              className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <span>Explore Events</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Sponsor/Partner Logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 sm:mt-16 md:mt-8 px-4">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-3 md:mb-0">
              Supported By
            </p>
            <div className="relative max-w-5xl mx-auto">
              <img
                src="/incubations-B2_MaBFr.png"
                alt="Event Sponsors and Partners"
                className="mx-auto w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
