"use client";

import Hero from "@/components/hero-section";
import EventCard from "@/components/event-card";
import { FAQ } from "@/components/faq";
import MunEventsSection from "@/components/mun-events"
import EventSchedule from "@/components/eventSchedule";
import POCContacts from "@/components/poc-contacts";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* <MunEventsSection/> */}
      <EventCard />
      {/* <POCContacts /> */}
      <EventSchedule />
      <FAQ/>
      <main className="pt-20">
      </main>
    </>
  );
}
