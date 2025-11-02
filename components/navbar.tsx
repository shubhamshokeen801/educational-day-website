'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon, Menu, X, GraduationCap, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/app/lib/supabaseClient';
import { AuthButton } from './auth-button';
import { Button } from '@/components/ui/button';

const navItems: { href: string; title: string; highlight?: boolean }[] = [
  { href: '/#home', title: 'Home' },
  { href: '/#schedule', title: 'Schedule' },
  { href: '/#events', title: 'Events' },
  { href: '/#mun', title: 'MUN'}, 
  { href: '/#schedule', title: 'Coordinators' },
  { href: '/#faq', title: 'FAQ' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setRole(null);
      else getSession();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 inset-x-0 mx-auto h-16 md:h-20 flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 z-50 shadow-md
        bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
        dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900"
      >
        {/* Logo and Title */}
        <Link href={'/'} className="flex items-center gap-2 md:gap-3 group">
          <Image
            className="h-16 w-25 md:h-17 md:w-30 ring-2"
            src="/bvicamLogo-CoQwK6Lh.png"
            height={150}
            width={150}
            alt="BVICAM Logo"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg
              ${item.highlight
                  ? 'bg-white text-blue-700 hover:bg-gray-100 shadow-md'
                  : 'text-white/90 hover:text-white'
                }`}
            >
              {hovered === idx && !item.highlight && (
                <motion.span
                  layoutId="hovered-span"
                  className="absolute inset-0 rounded-lg bg-white/20 backdrop-blur-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.title}</span>
            </Link>

          ))}
        </div>

        {/* Right Controls */}
        <div className="flex gap-2 md:gap-3 items-center">
          {/* Admin Dashboard - Hidden on mobile */}
          {role === 'admin' && (
            <Link href="/admin" className="hidden md:block">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold text-sm cursor-pointer">
                Admin
              </Button>
            </Link>
          )}

          {/* Auth Button - Hidden on mobile */}
          <div className="hidden md:block">
            <AuthButton user={user} />
          </div>

          <motion.button
            aria-label="Toggle mobile menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2  rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-16 md:top-20 right-0 bottom-0 w-72 bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex flex-col p-6 space-y-6">
                {/* Navigation Links */}
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                    Navigation
                  </h3>
                  {navItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onMouseEnter={() => setHovered(idx)}
                      onMouseLeave={() => setHovered(null)}
                      className={`relative  py-2 text-sm font-medium transition-all duration-200 rounded-lg
                        ${item.highlight
                          ? 'bg-white text-blue-700 hover:bg-gray-100 shadow-md'
                          : 'text-white/90 hover:text-white'
                        }`}
                    >
                      {hovered === idx && !item.highlight && (
                        <motion.span
                          layoutId="hovered-span"
                          className="absolute inset-0 rounded-lg bg-white/20 backdrop-blur-sm"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.title}</span>
                    </Link>

                  ))}


                {/* User Actions */}
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                    Account
                  </h3>

                  {user && (
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-[90%] mb-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                        <UserCircle className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                  )}

                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-[90%] bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}

                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
}