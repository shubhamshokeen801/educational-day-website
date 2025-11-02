import React from "react";
import { motion } from "framer-motion";

const munData = [
  {
    id: 1,
    title: "AIPPM",
    desc: "Deliberate on pressing global security concerns and conflicts with world leaders.",
    image: "/aippm.png",
  },
  {
    id: 2,
    title: "WHO",
    desc: "Discuss global health crises, vaccines, and medical ethics in international contexts.",
    image: "/who.png",
  },
  {
    id: 3,
    title: "IP",
    desc: "Engage in debates addressing global economics, peacekeeping, and sustainability.",
    image: "/images/unga.jpg",
  },
];

const MunSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-6 text-center">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-12"
        >
          MUN
        </motion.h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {munData.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-indigo-100"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-40 h-40 flex m-auto "
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{item.desc}</p>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-300">
                  Coming Soon
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MunSection;
