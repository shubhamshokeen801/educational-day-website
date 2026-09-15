// components/RegisterAuthButton.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/app/lib/supabaseClient';
import { LogIn, UserPlus, Users, Plus, Globe2 } from 'lucide-react';

interface RegisterAuthButtonProps {
  eventId: string;
  onProceed: () => void;
  buttonType: 'solo' | 'create-team' | 'join-team';
  loading?: boolean;
  className?: string;
  isMunEvent?: boolean;
  user: any; // now passed down from the page, instead of self-fetched
}

export function RegisterAuthButton({ 
  eventId, 
  onProceed, 
  buttonType,
  loading: externalLoading = false,
  className = '',
  isMunEvent = false,
  user,
}: RegisterAuthButtonProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // No more useEffect + getUser() here. Two instances of this component
  // render simultaneously on team-only event pages (Create Team + Join
  // Team) — each used to fire its own auth.getUser() call on mount.
  // Both now read from the single user already resolved by the page.

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      const currentUrl = `${pathname}${window.location.search}`;
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(currentUrl)}` 
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (isMunEvent) {
      return {
        icon: <Globe2 className="w-5 h-5" />,
        text: 'Complete MUN Registration',
        gradient: 'from-purple-600 via-pink-600 to-indigo-600'
      };
    }

    switch (buttonType) {
      case 'solo':
        return {
          icon: <UserPlus className="w-5 h-5" />,
          text: 'Proceed with Solo Registration',
          gradient: 'from-indigo-600 to-purple-600'
        };
      case 'create-team':
        return {
          icon: <Plus className="w-5 h-5" />,
          text: 'Create Team & Lead',
          gradient: 'from-purple-600 to-pink-600'
        };
      case 'join-team':
        return {
          icon: <Users className="w-5 h-5" />,
          text: 'Join Team',
          gradient: 'from-green-600 to-emerald-600'
        };
    }
  };

  const config = getButtonConfig();
  const isLoading = loading || externalLoading;

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        } ${className}`}
      >
        <span className="flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5" />
          {isMunEvent ? 'Sign In to Register for MUN' : 'Sign In to Register'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onProceed}
      disabled={isLoading}
      className={`w-full bg-gradient-to-r ${config.gradient} text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {config.icon}
          {config.text}
        </span>
      )}
    </button>
  );
}