// app/mun/[slug]/register/page.tsx
import { createServerClientInstance } from "@/app/lib/supabaseServerClient";
import MUNRegisterFormClient from "./MUNRegisterFormClient";
import { Calendar, XCircle, Info, Sparkles, Globe2 } from "lucide-react";

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default async function MUNRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const supabase = await createServerClientInstance();

  // Fetch all MUN events since slug is not in database
  const { data: munEvents, error: fetchError } = await supabase
    .from("mun_events")
    .select("*");

  if (fetchError) {
    console.error("Error fetching MUN events:", fetchError);
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-800 p-8 sm:p-12 max-w-md text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Error Loading Event</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{fetchError.message}</p>
        </div>
      </div>
    );
  }

  // Find the event by matching slug
  const munEvent = munEvents?.find(event => generateSlug(event.name) === slug);

  if (!munEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-800 p-8 sm:p-12 max-w-md text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-3">MUN Event Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            The MUN event "{slug}" doesn't exist or has been removed.
          </p>
          <a 
            href="/#mun" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Browse MUN Events
          </a>
        </div>
      </div>
    );
  }

  const eventDate = new Date(munEvent.event_datetime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Event Header Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8 sm:mb-12">
          {/* Hero Image */}
          <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
            <img
              src={munEvent.image_url || "https://placehold.co/1200x400?text=MUN+Event"}
              alt={munEvent.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            {/* MUN Badge */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
              <div className="bg-purple-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
                <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                MUN Event
              </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-xs sm:text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                  Model United Nations
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                {munEvent.name}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-3xl line-clamp-2">
                {munEvent.description}
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Date */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500 p-2 sm:p-2.5 rounded-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Date & Time</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  {eventDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {eventDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {/* Registration Fee */}
              {munEvent.registration_fee && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 sm:p-5 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500 p-2 sm:p-2.5 rounded-xl">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Fee</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                    ₹{munEvent.registration_fee}
                  </p>
                </div>
              )}
            </div>

            {/* Rules */}
            {munEvent.rules && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-5 sm:p-6 lg:p-7 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500 p-2 sm:p-2.5 rounded-xl">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                    Rules & Guidelines
                  </h3>
                </div>
                <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-amber-200 dark:border-amber-700">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {munEvent.rules}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Registration Form */}
          <MUNRegisterFormClient munEvent={munEvent} />
        </div>
      </div>
    </div>
  );
}