'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/app/lib/supabaseClient';
import { AuthButton } from './auth-button';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '#hero', title: 'Home' },
  { href: '#about', title: 'Schedule' },
  { href: '#gallery', title: 'Events' },
  { href: '#speakers', title: 'Coordinators' },
  { href: '#guidelines', title: 'FAQ' },
];

export function Navbar({
  onToggleTheme,
  isDark,
}: {
  onToggleTheme?: () => void;
  isDark?: boolean;
}) {
  const supabase = createClient();
  const [hovered, setHovered] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // Fetch current user + role
  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role) setRole(profile.role);
      }
    };

    getSession();

    // Keep in sync with Supabase auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setRole(null);
      else getSession();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <motion.nav
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="inset-x-0 mx-auto h-20 flex w-screen items-center justify-around border px-3 py-2 sm:px-4 z-50 shadow-lg
      bg-white/80 border-gray-200 text-neutral-800 backdrop-blur-md
      dark:bg-black/80 dark:border-gray-700/30 dark:text-neutral-100"
    >
      {/* Logo */}
      <Link href={'/'}>
        <Image
          className="h-11 w-15 md:w-15"
          src="/bvicam.png"
          height={40}
          width={40}
          alt="BVICAM Logo"
        />
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            className="relative px-3 py-1 text-sm font-medium transition-colors duration-200
              text-neutral-700 hover:text-blue-500
              dark:text-neutral-300 dark:hover:text-blue-300"
            href={item.href}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === idx && (
              <motion.span
                layoutId="hovered-span"
                className="absolute inset-0 rounded-2xl bg-neutral-100 dark:bg-neutral-800"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.title}</span>
          </Link>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex gap-3 items-center">
        {/* Show admin dashboard if user is admin */}
        {role === 'admin' && (
          <Link href="/admin/dashboard">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Admin Dashboard
            </Button>
          </Link>
        )}

        {/* Auth Button */}
        <AuthButton user={user} />

        {/* Theme toggle */}
        <motion.button
          aria-label="Toggle theme"
          onClick={onToggleTheme}
          className="ml-2 p-2 rounded-full border border-transparent bg-neutral-100 hover:bg-neutral-200 transition-colors shadow
            dark:bg-neutral-900 dark:hover:bg-neutral-800"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-blue-900" />
          )}
        </motion.button>
      </div>
    </motion.nav>
  );
}
