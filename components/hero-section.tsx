import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="bg-white text-center py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Headings */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Celebrate Learning, Innovation, and Growth
        </h1>

        <h2 className="text-4xl md:text-5xl font-extrabold text-blue-600 mt-3">
          Educational Day 2025
        </h2>

        {/* Description */}
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Join us for a day of inspiration, knowledge-sharing, and creativity.
          Discover how education empowers the future through collaboration and ideas.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#events"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-lg font-medium shadow-md hover:bg-blue-700 transition"
          >
            Explore Events 🚀
          </a>

          <a
            href="#register"
            className="px-8 py-3 border border-gray-300 text-gray-800 rounded-xl text-lg font-medium hover:bg-gray-100 transition"
          >
            Register Now
          </a>
        </div>

        {/* Sponsor/Partner Logos Image */}
        <div className="mt-16">
          <img
            src="/incubations-B2_MaBFr.png"
            alt="Event Sponsors and Partners"
            className="mx-auto max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
