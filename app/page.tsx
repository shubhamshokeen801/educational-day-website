"use client";

import Hero from "@/components/hero-section";
import EventCard from "@/components/event-card";
import FAQ from "@/components/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <EventCard />
      <FAQ/>
      <main className="pt-20">
        {/* Other homepage sections or routed children can go here */}
      </main>
    </>
  );
}
