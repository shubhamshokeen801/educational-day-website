import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageCircle, Sparkles } from "lucide-react";

export const FAQ = () => {
  const faqData = [
    {
      id: "1",
      question: "What languages can I use to participate?",
      answer: "You can participate in both English and Hindi. There is no language barrier.",
    },
    {
      id: "2",
      question: "Who can take part in the competition?",
      answer: "Anyone! Whether you are an open college student, a school student, or a student of any other college, you are welcome to participate.",
    },
    {
      id: "3",
      question: "What is the age requirement?",
      answer: "Participants must be between 15 and 25 years old.",
    },
    {
      id: "4",
      question: "Do I need any special qualifications to join?",
      answer: "No special qualifications are required. All you need is enthusiasm and interest!",
    },
    {
      id: "5",
      question: "How can I register for the competition?",
      answer: 'You can register by clicking on the "Register Now" button on our website and filling out the form.',
    },
  ];

  return (
    <section
      className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
      id="faq"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 right-10 w-48 h-48 md:w-80 md:h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-56 h-56 md:w-96 md:h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid items-start gap-8 md:gap-12 lg:gap-16 lg:grid-cols-2">
          {/* Left Section - Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:sticky lg:top-24"
          >
            {/* Decorative Icon */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-xl">
                  <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Find answers to common questions about our Educational Day event. Still have questions? We're here to help!
              </p>
            </div>

            {/* Contact Card */}
            {/* <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    Still Need Help?
                  </h3>
                  <p className="text-sm sm:text-base text-blue-100 mb-4">
                    Our team is ready to assist you with any questions
                  </p>
                  <a
                    href="mailto:summer-school@bvicam.in"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-50 transition-colors"
                  >
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="break-all">summer-school@bvicam.in</span>
                  </a>
                </div>
              </div>
            </div> */}
          </motion.div>

          {/* Right Section - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <Accordion
              type="single"
              collapsible
              defaultValue="1"
              className="space-y-4"
            >
              {faqData.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <AccordionItem
                    value={faq.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 px-4 sm:px-6 md:px-8 py-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <AccordionTrigger className="py-4 sm:py-5 md:py-6 text-left  hover:no-underline text-sm sm:text-base md:text-lg text-gray-700 dark:text-white">
                      <span className="pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-4 sm:pb-5 md:pb-6 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {Array.isArray(faq.answer) ? (
                        <ul className="list-inside list-disc space-y-2">
                          {faq.answer.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{faq.answer}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};