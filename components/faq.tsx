"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    id: "1",
    question: "What languages can I use to participate?",
    answer:
      'You can participate in both English and Hindi. There is no language barrier.',
  },
  {
    id: "2",
    question: "Who can take part in the competition?",
    answer:
      "Anyone! Whether you are an open college student, a school student, or a student of any other college, you are welcome to participate.",
  },
  {
    id: "3",
    question: "What is the age requirement?",
    answer: 'Participants must be between 15 and 25 years old.',
  },
  {
    id: "4",
    question: "Do I need any special qualifications to join?",
    answer:
      "No special qualifications are required. All you need is enthusiasm and interest!",
  },
  {
    id: "5",
    question: "How can I register for the competition?",
    answer:
      "You can register by clicking on the “Register Now” button on our website and filling out the form.",
  },
];

export default function FAQ() {
  return (
    <section className="relative bg-background w-full py-10 md:py-16 lg:py-20 overflow-hidden" id="faq">
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="grid items-start gap-8 md:gap-12 lg:grid-cols-2">

          <div className="space-y-6">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-linear-to-br from-pink-500 via-purple-500 to-blue-500">
              <div className="h-8 w-8 rounded-lg bg-white opacity-90"></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Frequently asked questions
              </h2>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground h-auto p-0 font-normal"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Still need help? Contact us: summer-school@bvicam.in
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Accordion
              type="single"
              collapsible
              defaultValue="1"
              className="space-y-4"
            >
              {faqData.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-border bg-card rounded-lg border px-4 py-2 md:px-6"
                >
                  <AccordionTrigger className="text-foreground py-4 text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-0 pb-4">
                    {Array.isArray(faq.answer) ? (
                      <ul className="list-inside list-disc space-y-1">
                        {faq.answer.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{faq.answer}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}