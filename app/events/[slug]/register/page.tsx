import { createServerClientInstance } from "@/app/lib/supabaseServerClient";
import RegisterFormClient from "./RegisterFormClient";
import { Calendar, Users, User, XCircle, Info, Sparkles, DollarSign } from "lucide-react";

// Helper function to create URL-friendly slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const supabase = await createServerClientInstance();

  // Fetch all events and find the matching one by generated slug
  const { data: allEvents, error: fetchError } = await supabase
    .from("events")
    .select("*");

  if (fetchError) {
    console.error("Error fetching events:", fetchError);
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

  // Find event by matching generated slug
  const event = allEvents?.find(e => {
    const eventSlug = e.slug || createSlug(e.name);
    return eventSlug === slug;
  });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-800 p-8 sm:p-12 max-w-md text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Event Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            The event "{slug}" doesn't exist or has been removed.
          </p>
          <a 
            href="/#events" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Browse Events
          </a>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Event Header Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8 sm:mb-12">
          {/* Hero Image with Overlay */}
          <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
            <img
              src={event.image_url || "https://placehold.co/1200x400?text=Event+Banner"}
              alt={event.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            {/* Floating Badges */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col gap-2 sm:gap-3">
              {event.is_team_event ? (
                <div className="bg-blue-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Team Event
                </div>
              ) : (
                <div className="bg-purple-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Solo Event
                </div>
              )}
              
              {/* Fee Badge */}
              {event.is_paid && event.registration_fee ? (
                <div className="bg-green-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ₹{event.registration_fee}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  FREE
                </div>
              )}
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-xs sm:text-sm font-semibold text-yellow-400 uppercase tracking-wider">Featured Event</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                {event.name}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-3xl line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Start Date */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 sm:p-5 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-500 p-2 sm:p-2.5 rounded-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Date</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  {startDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {startDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {/* Registration Fee */}
              {event.is_paid && event.registration_fee && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 sm:p-5 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500 p-2 sm:p-2.5 rounded-xl">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Registration Fee</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                    ₹{event.registration_fee}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.is_team_event ? 'Per Team' : 'Per Person'}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Notice for Paid Events */}
            {event.is_paid && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Payment Required
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      After registration, you will need to upload payment proof to complete your registration. 
                      Payment details will be provided after you submit the registration form.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rules Section */}
            {event.rules && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-5 sm:p-6 lg:p-7 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="bg-amber-500 p-2 sm:p-2.5 rounded-xl">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">Rules & Guidelines</h3>
                </div>
                <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-amber-200 dark:border-amber-700">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {event.rules}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Registration Form */}
          <RegisterFormClient event={event} />
        </div>
      </div>
    </div>
  );
}