"use client";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Hero from "@/components/hero-section";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <main className="pt-20">
        {/* Other homepage sections or routed children can go here */}
      </main>
      <Footer />
    </>
  );
}
