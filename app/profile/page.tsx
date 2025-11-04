'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabaseClient';
import {
  User,
  Mail,
  Calendar,
  Users,
  Trophy,
  Phone,
  Shield,
  LogOut,
  Loader2,
  UserCircle,
  CreditCard,
  Award,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [soloRegistrations, setSoloRegistrations] = useState<any[]>([]);
  const [teamMemberships, setTeamMemberships] = useState<any[]>([]);
  const [munRegistrations, setMunRegistrations] = useState<any[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Fetch profile data from API
      const res = await fetch('/api/profile');
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        throw new Error(data.error || 'Failed to load profile');
      }

      setUser(data.user);
      setSoloRegistrations(data.soloRegistrations || []);
      setTeamMemberships(data.teamMemberships || []);
      setMunRegistrations(data.munRegistrations || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handlePaymentUpload = async (registrationId: string, isMun: boolean = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only image files (JPEG, PNG, WebP) are allowed');
        return;
      }

      try {
        setUploadingFor(registrationId);
        setUploadProgress({ ...uploadProgress, [registrationId]: 0 });

        const formData = new FormData();
        formData.append('registrationId', registrationId);
        formData.append('paymentProof', file);

        const endpoint = isMun ? '/api/mun/payment' : '/api/events/payment';
        
        setUploadProgress({ ...uploadProgress, [registrationId]: 50 });

        const res = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to upload payment proof');
        }

        setUploadProgress({ ...uploadProgress, [registrationId]: 100 });
        
        alert(data.message || 'Payment proof uploaded successfully!');
        
        // Reload profile to reflect updated payment status
        await loadProfile();
      } catch (error: any) {
        console.error('Error uploading payment:', error);
        alert(error.message || 'Failed to upload payment proof');
      } finally {
        setUploadingFor(null);
        setUploadProgress({ ...uploadProgress, [registrationId]: 0 });
      }
    };

    input.click();
  };

  const getPaymentStatusBadge = (status: string | null | undefined, registrationId?: string, isMun: boolean = false, eventIsPaid: boolean = true) => {
    // Don't show anything for free events
    if (!eventIsPaid) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Free Event
        </span>
      );
    }

    switch (status) {
      case 'approved':
      case 'verified':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Payment Verified
          </span>
        );
      case 'pending':
        return (
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Payment Pending
            </span>
            {registrationId && (
              <button
                onClick={() => handlePaymentUpload(registrationId, isMun)}
                disabled={uploadingFor === registrationId}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFor === registrationId ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    Upload Payment
                  </>
                )}
              </button>
            )}
          </div>
        );
      case 'rejected':
        return (
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Payment Rejected
            </span>
            {registrationId && (
              <button
                onClick={() => handlePaymentUpload(registrationId, isMun)}
                disabled={uploadingFor === registrationId}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFor === registrationId ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    Re-upload Payment
                  </>
                )}
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> No Payment
            </span>
            {registrationId && (
              <button
                onClick={() => handlePaymentUpload(registrationId, isMun)}
                disabled={uploadingFor === registrationId}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFor === registrationId ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    Upload Payment
                  </>
                )}
              </button>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const totalRegistrations = soloRegistrations.length + teamMemberships.length + munRegistrations.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 pt-25 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-6xl mx-auto">
        {/* HEADER CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* AVATAR */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-indigo-500 shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-indigo-500 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white dark:border-gray-800">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* USER INFO */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {displayName}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                  {totalRegistrations} Events Registered
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                  {teamMemberships.length} Team{teamMemberships.length !== 1 ? 's' : ''}
                </span>
                {munRegistrations.length > 0 && (
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium">
                    {munRegistrations.length} MUN Event{munRegistrations.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="sm:self-start px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* SOLO REGISTRATIONS */}
        {soloRegistrations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Solo Registrations
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {soloRegistrations.map((reg: any) => (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {reg.events?.name}
                    </h3>
                    {getPaymentStatusBadge(reg.payment_status, reg.id, false, reg.events?.is_paid)}
                  </div>
                  {reg.events?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {reg.events.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>
                        {new Date(reg.events?.start_date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {reg.events?.is_paid && reg.events?.registration_fee && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CreditCard className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">Fee: ₹{reg.events.registration_fee}</span>
                      </div>
                    )}
                    {reg.phone_number && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-indigo-500" />
                        <span>{reg.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MUN REGISTRATIONS */}
        {munRegistrations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-500 p-2 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                MUN Registrations
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {munRegistrations.map((reg: any) => (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {reg.mun_events?.name}
                    </h3>
                    {getPaymentStatusBadge(reg.payment_status, reg.id, true, reg.mun_events?.is_paid)}
                  </div>
                  {reg.mun_events?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {reg.mun_events.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-pink-500" />
                      <span>
                        {new Date(reg.mun_events?.event_datetime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {reg.mun_events?.registration_fee && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CreditCard className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">Fee: ₹{reg.mun_events.registration_fee}</span>
                      </div>
                    )}
                    {reg.phone_number && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-pink-500" />
                        <span>{reg.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEAM REGISTRATIONS */}
        {teamMemberships.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Team Registrations
              </h2>
            </div>
            <div className="grid gap-6">
              {teamMemberships.map((tm: any) => {
                const isLeader = tm.role === 'leader';
                const teamReg = tm.registration;
                
                return (
                  <div
                    key={tm.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-5 h-5 text-purple-500" />
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {tm.teams?.team_name}
                          </h3>
                          {isLeader && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs font-medium">
                              Leader
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Event:</span>
                            <span>{tm.teams?.events?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Team Code:</span>
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {tm.teams?.team_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span>
                              {new Date(tm.teams?.events?.start_date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {tm.teams?.events?.is_paid && tm.teams?.events?.registration_fee && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">Fee: ₹{tm.teams?.events?.registration_fee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isLeader && teamReg && getPaymentStatusBadge(teamReg.payment_status, teamReg.id, false, tm.teams?.events?.is_paid)}
                      {!isLeader && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 self-start">
                          Team Member
                        </span>
                      )}
                    </div>

                    {/* TEAM MEMBERS */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Members ({tm.all_members?.length || 0})
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {tm.all_members?.map((member: any) => (
                          <div
                            key={member.id}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {member.users?.name?.[0] ||
                                  member.users?.email?.[0]?.toUpperCase() ||
                                  'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {member.users?.name ||
                                      member.users?.email?.split('@')[0]}
                                  </p>
                                  {member.role === 'leader' && (
                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs font-medium">
                                      Leader
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {member.users?.email}
                                </p>
                                {member.phone_number && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {member.phone_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {totalRegistrations === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Registrations Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't registered for any events. Start exploring!
            </p>
            <button
              onClick={() => router.push('/#events')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}