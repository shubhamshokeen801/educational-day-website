"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <section className="bg-black w-full flex items-center justify-between overflow-hidden text-white">
      <div className="relative z-10 w-full rounded-t-lg bg-gradient-to-blue from-gray-800 via-gray-900 to-black p-4 text-white shadow-lg">
        <div className="mx-auto flex flex-col items-start justify-between">
          <div className="flex w-full items-center justify-center">
            <p className="mt-4 text-center text-4xl leading-relaxed font-bold text-gray-400 md:text-5xl">
              {" "}
              Bhartiya Yuva Manch
            </p>
          </div>
          <div className="mx-auto flex w-full flex-col items-start justify-between gap-4 md:w-1/2">
            <ul className="flex w-full justify-center gap-5 underline">
              <li>
                <Link
                  href="#about"
                  className="text-gray-400 hover:text-gray-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#schedule"
                  className="text-gray-400 hover:text-gray-200"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="#speakers"
                  className="text-gray-400 hover:text-gray-200"
                >
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Bharati Vidyapeeth&apos;s Institute of Computer Applications and Management */}
          <div className="w-full py-2 text-gray-400">
            <p className="text-center">
              BVICAM, A-4, Paschim Vihar, Opp. Paschim Vihar (East) Metro
              Station, Rohtak Road, New Delhi, Delhi 110063
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-between py-4 text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} BVICAM. All Rights Reserved.
            </p>

            <p className="text-gray-400 flex gap-3">
              Designed and Developed by{" "}

                <a
                href="https://www.linkedin.com/in/shubham-shokeen-425b2b30a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                className="text-gray-400 underline hover:text-gray-300 px-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                  Shubham Shokeen
              </a>

                <a
                href="https://www.linkedin.com/in/rudraksh-dev?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                className="text-gray-400 underline hover:text-gray-300 px-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                  Rudraksh Sharma
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          <p className="text-2xl font-medium">Contact Us:</p>
          <p className="text-base font-medium">
          </p>
        </div>
      </div>
    </section>
  );
};

export default Footer;