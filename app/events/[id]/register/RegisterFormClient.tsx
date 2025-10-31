'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabaseClient';

export default function RegisterFormClient({ event }: { event: any }) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'solo' | 'team' | null>(null);
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Helper to show feedback messages
  const showMessage = (text: string, type: 'error' | 'success' = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // SOLO REGISTRATION
  const handleSolo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/register/solo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
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

  // CREATE TEAM
  const handleCreateTeam = async () => {
    if (!teamName.trim()) return showMessage('Please enter a valid team name.');
    try {
      setLoading(true);
      const res = await fetch('/api/team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, teamName }),
      });

      const data = await res.json();
      if (!res.ok) return showMessage(data.error || 'Error creating team.');

      showMessage('Team created successfully!', 'success');
      router.push(`/events/${event.id}/team/${data.team.team_code}?reg=${data.registration.id}`);
    } catch (err) {
      showMessage('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // JOIN TEAM
  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return showMessage('Please enter a team code.');
    try {
      setLoading(true);
      const res = await fetch('/api/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode: joinCode }),
      });

      const data = await res.json();
      if (!res.ok) return showMessage(data.error || 'Error joining team.');

      showMessage('Joined team successfully!', 'success');
      router.push('/');
    } catch (err) {
      showMessage('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Register for <span className="text-blue-600">{event.name}</span>
      </h3>

      {/* Select mode */}
      {event.is_team_event ? (
        <>
          <div className="flex items-center gap-6 mb-4 text-black">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                className="accent-blue-600"
                onChange={() => setMode('solo')}
              />
              <span>Solo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                className="accent-blue-600"
                onChange={() => setMode('team')}
              />
              <span>Team</span>
            </label>
          </div>

          {!mode && (
            <p className="text-sm text-gray-500 mb-4">Please select a registration type.</p>
          )}

          {/* SOLO MODE */}
          {mode === 'solo' && (
            <div className="mt-4">
              <button
                onClick={handleSolo}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Proceed with Solo Registration'}
              </button>
            </div>
          )}

          {/* TEAM MODE */}
          {mode === 'team' && (
            <div className="mt-6 space-y-6">
              <div className="border rounded-xl p-4 bg-gray-50">
                <h4 className="font-semibold mb-2 text-gray-800">Create a New Team</h4>
                <input
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm text-gray-900"
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={loading}
                  className={`mt-3 w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Team (Leader)'}
                </button>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50">
                <h4 className="font-semibold mb-2 text-gray-800">Join an Existing Team</h4>
                <input
                  placeholder="Enter team code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm text-gray-900"
                />
                <button
                  onClick={handleJoinTeam}
                  disabled={loading}
                  className={`mt-3 w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // SOLO-ONLY EVENT
        <div className="mt-4">
          <button
            onClick={handleSolo}
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Register (Solo)'}
          </button>
        </div>
      )}

      {/* Message feedback */}
      {message && (
        <p
          className={`mt-5 text-center text-sm font-medium ${
            message.type === 'error' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
