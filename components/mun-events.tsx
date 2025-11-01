import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // keep this if you have it, else replace with a <button>

const MunEventsSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* LEFT: Text content */}
        <div className="text-center md:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
          >
            MUN Events
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-xl text-gray-600 text-lg mb-8"
          >
            Experience the excitement of Model United Nations! Join us for
            insightful discussions, debates, and resolutions that inspire
            leadership, diplomacy, and global awareness.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-md hover:from-indigo-700 hover:to-purple-700 transition duration-300"
            >
              Explore More
            </Button>
          </motion.div>
        </div>

        {/* RIGHT: MUN Events Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300 p-6 text-left">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3">
              Upcoming MUN 2025
            </h3>
            <p className="text-gray-600 mb-4">
              Dive into global diplomacy and tackle pressing international
              issues. Participate as delegates, represent nations, and engage
              in impactful debates.
            </p>
            <ul className="text-gray-700 mb-4 list-disc list-inside text-sm">
              <li>📅 Date: November 12–13, 2025</li>
              <li>📍 Venue: BVICAM Campus, New Delhi</li>
            </ul>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl transition-colors duration-300">
              Register Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MunEventsSection;
