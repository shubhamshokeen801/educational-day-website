// components/poc-contacts.tsx
"use client";

import { Phone, Mail, User } from "lucide-react";

interface POC {
  name: string;
  phone?: string;
  email?: string;
}

interface EventContact {
  eventName: string;
  pocs: POC[];
}

const eventContacts: EventContact[] = [
  {
    eventName: "Rangmanch",
    pocs: [{ name: "Add Name", phone: "9999999999" }],
  },
  {
    eventName: "Code Avengers",
    pocs: [{ name: "Add Name", phone: "9999999999" }],
  },
  // add one entry per event
];

export default function POCContacts() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8" id="contacts">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 text-gray-900 dark:text-gray-100">
          Event Point of Contacts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {eventContacts.map((ec) => (
            <div
              key={ec.eventName}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm"
            >
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-3">
                {ec.eventName}
              </h3>
              <div className="space-y-2">
                {ec.pocs.map((poc, i) => (
                  <div key={i} className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span>{poc.name}</span>
                    </div>
                    {poc.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <a href={`tel:${poc.phone}`} className="hover:underline">{poc.phone}</a>
                      </div>
                    )}
                    {poc.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <a href={`mailto:${poc.email}`} className="hover:underline break-all">{poc.email}</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}