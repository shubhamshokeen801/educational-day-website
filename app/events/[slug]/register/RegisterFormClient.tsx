'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabaseClient';
import { Users, User, Plus, LogIn, Calendar, Award, Phone } from 'lucide-react';
import { RegisterAuthButton } from '@/components/RegisterAuthButton';

export default function RegisterFormClient({ event }: { event: any }) {
  const router = useRouter();
  const supabase = createClient();

  // Determine if this is a team event based on min_team_size
  const isTeamEvent = event.is_team_event || (event.min_team_size && event.min_team_size > 1);
  const isSoloAllowed = !event.min_team_size || event.min_team_size <= 1;

  const [mode, setMode] = useState<'solo' | 'team' | null>(null);
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [generatedTeamCode, setGeneratedTeamCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showMessage = (text: string, type: 'error' | 'success' = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const validatePhone = (phone: string) => {
    // Basic validation: 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const copyToClipboard = async () => {
    if (generatedTeamCode) {
      try {
        await navigator.clipboard.writeText(generatedTeamCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        showMessage('Failed to copy code', 'error');
      }
    }
  };

  const handleSolo = async () => {
    if (!phoneNumber.trim()) return showMessage('Please enter your phone number.');
    if (!validatePhone(phoneNumber)) return showMessage('Please enter a valid 10-digit phone number.');
    
    try {
      setLoading(true);
      const res = await fetch('/api/register/solo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: event.id,
          phoneNumber: phoneNumber.replace(/\s/g, '')
        }),
      });

      const data = await res.json();
      if (!res.ok) return showMessage(data.error || 'Error while registering solo.');

      showMessage('Solo registration successful!', 'success');
      router.push(`/events/${event.id}/payment?reg=${data.registration.id}`);
    } catch (err) {
      showMessage('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return showMessage('Please enter a valid team name.');
    if (!phoneNumber.trim()) return showMessage('Please enter your phone number.');
    if (!validatePhone(phoneNumber)) return showMessage('Please enter a valid 10-digit phone number.');
    
    try {
      setLoading(true);
      const res = await fetch('/api/team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: event.id, 
          teamName,
          phoneNumber: phoneNumber.replace(/\s/g, '')
        }),
      });

      const data = await res.json();
      if (!res.ok) return showMessage(data.error || 'Error creating team.');

      // Store the generated team code
      setGeneratedTeamCode(data.team.team_code);
      showMessage('Team created successfully!', 'success');
      
      // Don't redirect immediately - let user see the code
    } catch (err) {
      showMessage('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return showMessage('Please enter a team code.');
    if (!phoneNumber.trim()) return showMessage('Please enter your phone number.');
    if (!validatePhone(phoneNumber)) return showMessage('Please enter a valid 10-digit phone number.');
    
    try {
      setLoading(true);
      const res = await fetch('/api/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teamCode: joinCode,
          phoneNumber: phoneNumber.replace(/\s/g, '')
        }),
      });

      const data = await res.json();
      if (!res.ok) return showMessage(data.error || 'Error joining team.');

      showMessage('Joined team successfully!', 'success');
      router.push(`/events/${event.id}`);
    } catch (err) {
      showMessage('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-bold">Event Registration</h2>
            <p className="text-sm sm:text-base text-white/90 mt-1">Join the learning experience</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="text-lg sm:text-2xl font-semibold mb-2">{event.name}</h3>
          <p className="text-sm sm:text-base text-white/80">Secure your spot in this educational journey</p>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {isTeamEvent ? (
          <>
            {/* Mode Selection - Only show if solo is allowed */}
            {isSoloAllowed && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b border-gray-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Choose Registration Type</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setMode('solo')}
                  className={`relative flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                    mode === 'solo'
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-xl ${mode === 'solo' ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                    <User className={`w-5 h-5 sm:w-6 sm:h-6 ${mode === 'solo' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-semibold text-sm sm:text-base ${mode === 'solo' ? 'text-indigo-700' : 'text-gray-700'}`}>
                      Solo Registration
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Participate individually</p>
                  </div>
                  {mode === 'solo' && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setMode('team')}
                  className={`relative flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                    mode === 'team'
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-xl ${mode === 'team' ? 'bg-purple-500' : 'bg-gray-200'}`}>
                    <Users className={`w-5 h-5 sm:w-6 sm:h-6 ${mode === 'team' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-semibold text-sm sm:text-base ${mode === 'team' ? 'text-purple-700' : 'text-gray-700'}`}>
                      Team Registration
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Collaborate with peers</p>
                  </div>
                  {mode === 'team' && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
            )}

            {/* Team Size Info Banner */}
            {event.min_team_size && event.min_team_size > 1 && (
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Users className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    Team Event: Minimum {event.min_team_size} members required
                    {event.max_team_size && ` (Max: ${event.max_team_size})`}
                  </p>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="p-4 sm:p-8">
              {!mode && isSoloAllowed && (
                <div className="text-center py-8 sm:py-12">
                  <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">Select a registration type above to continue</p>
                </div>
              )}

              {/* SOLO MODE */}
              {mode === 'solo' && isSoloAllowed && (
                <div className="animate-fadeIn">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6">
                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Individual Participation</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Register as a solo participant and showcase your individual skills
                    </p>
                    
                    {/* Phone Number Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input  
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          maxLength={10}
                          className="w-full pl-10! border-2 border-indigo-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none text-sm sm:text-base text-gray-900 bg-white transition-all"
                        />
                      </div>
                    </div>

                    <RegisterAuthButton 
                      eventId={event.id}
                      onProceed={handleSolo}
                      buttonType="solo"
                      loading={loading}
                    />
                  </div>
                </div>
              )}

              {/* TEAM MODE - Show by default if solo not allowed */}
              {(mode === 'team' || !isSoloAllowed) && (
                <div className="animate-fadeIn space-y-4 sm:space-y-6">
                  {/* Team-Only Event Notice */}
                  {!isSoloAllowed && !generatedTeamCode && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-1">Team-Only Event</h4>
                          <p className="text-sm text-purple-700">
                            This event requires team participation. You can either create a new team or join an existing one using a team code.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Code Success Display */}
                  {generatedTeamCode && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-green-200">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          Team Created Successfully!
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6">
                          Share this code with your team members to let them join
                        </p>
                        
                        {/* Team Code Display */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 border-2 border-green-300">
                          <p className="text-sm text-gray-600 mb-2">Your Team Code:</p>
                          <div className="flex items-center justify-center gap-3">
                            <code className="text-3xl sm:text-4xl font-bold text-green-600 tracking-wider">
                              {generatedTeamCode}
                            </code>
                          </div>
                        </div>

                        {/* Copy Button */}
                        <button
                          onClick={copyToClipboard}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 mb-3 flex items-center justify-center gap-2"
                        >
                          {copiedCode ? (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Team Code
                            </>
                          )}
                        </button>

                        {/* Continue Button */}
                        <button
                          onClick={() => router.push('/profile')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Go to Profile
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Create Team Form - Hide after successful creation */}
                  {!generatedTeamCode && (
                    <>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 border-purple-100">
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div className="bg-purple-500 p-2 sm:p-2.5 rounded-xl">
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base sm:text-lg text-gray-800">Create New Team</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Become a team leader</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        placeholder="Enter your team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full border-2 border-purple-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 focus:outline-none text-sm sm:text-base text-gray-900 bg-white transition-all"
                      />
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-purple-400" />
                        </div>
                        <input
                          type="tel"
                          placeholder="Your phone number (10 digits)"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          maxLength={10}
                          className="w-full pl-12 sm:pl-14 border-2 border-purple-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 focus:outline-none text-sm sm:text-base text-gray-900 bg-white transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4">
                      <RegisterAuthButton 
                        eventId={event.id}
                        onProceed={handleCreateTeam}
                        buttonType="create-team"
                        loading={loading}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">OR</span>
                    </div>
                  </div>

                  {/* Join Team */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 border-green-100">
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div className="bg-green-500 p-2 sm:p-2.5 rounded-xl">
                        <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base sm:text-lg text-gray-800">Join Existing Team</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Have a team code?</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        placeholder="Enter team code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="w-full border-2 border-green-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-4 focus:ring-green-200 focus:border-green-400 focus:outline-none text-sm sm:text-base text-gray-900 bg-white transition-all"
                      />
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-green-400" />
                        </div>
                        <input
                          type="tel"
                          placeholder="Your phone number (10 digits)"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          maxLength={10}
                          className="w-full pl-12 sm:pl-14 border-2 border-green-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-4 focus:ring-green-200 focus:border-green-400 focus:outline-none text-sm sm:text-base text-gray-900 bg-white transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4">
                      <RegisterAuthButton 
                        eventId={event.id}
                        onProceed={handleJoinTeam}
                        buttonType="join-team"
                        loading={loading}
                      />
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // SOLO-ONLY EVENT
          <div className="p-6 sm:p-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-indigo-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800">Solo Event Registration</h4>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Individual participation only</p>
                </div>
              </div>
              
              {/* Phone Number Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={10}
                    className="w-full pl-10! border-2 border-indigo-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none text-sm sm:text-base text-gray-900 bg-white transition-all"
                  />
                </div>
              </div>

              <RegisterAuthButton 
                eventId={event.id}
                onProceed={handleSolo}
                buttonType="solo"
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Message feedback */}
      {message && (
        <div className={`mt-4 sm:mt-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg animate-slideIn ${
          message.type === 'error' 
            ? 'bg-red-50 border-2 border-red-200' 
            : 'bg-green-50 border-2 border-green-200'
        }`}>
          <p className={`text-center text-sm sm:text-base font-semibold ${
            message.type === 'error' ? 'text-red-700' : 'text-green-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}