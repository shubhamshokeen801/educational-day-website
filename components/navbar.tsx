"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, UserCircle } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { createClient } from "@/app/lib/supabaseClient";
import { AuthButton } from "./auth-button";
import { Button } from "@/components/ui/button";

const navItems: { href: string; title: string; highlight?: boolean }[] = [
  { href: "/#home", title: "Home" },
  { href: "/#schedule", title: "Schedule" },
  { href: "/#events", title: "Events" },
  { href: "/#mun", title: "MUN" },
  { href: "/#faq", title: "FAQ" },
];

export function Navbar() {
  const supabase = createClient();
  const [hovered, setHovered] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch current user + role
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 mt-4 h-16 flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 z-50 rounded-full mx-auto transition-all duration-300 ease-linear ${
          isScrolled
            ? "max-w-[90%] bg-white dark:bg-gray-900 shadow-md"
            : "max-w-[95%] bg-transparent"
        }`}>
        {/* Logo and Title */}
        <Link href={"/"} className="flex items-center gap-2 md:gap-3 group">
          <Image
            className="h-16 w-25 md:h-17 md:w-30 ring-2"
            src="/bvicamLogo-CoQwK6Lh.png"
            height={150}
            width={150}
            alt="BVICAM Logo"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <LayoutGroup id="navbar-desktop">
          <div
            className="hidden lg:flex items-center space-x-1 cursor-pointer"
            onMouseLeave={() => setHovered(null)}>
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onMouseEnter={() => setHovered(idx)}
                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                  item.highlight
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
                    : isScrolled
                    ? "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                }`}>
                {hovered === idx && !item.highlight && (
                  <motion.span
                    layoutId="nav-hover-highlight"
                    className={`absolute inset-0 rounded-lg ${
                      isScrolled
                        ? "bg-indigo-50 dark:bg-indigo-900/30"
                        : "bg-white/20 backdrop-blur-sm"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{item.title}</span>
              </Link>
            ))}
          </div>
        </LayoutGroup>

        {/* Right Controls */}
        <div className="flex gap-2 md:gap-3 items-center">
          {/* Admin Dashboard - Hidden on mobile */}
          {role === "admin" && (
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
            className={`lg:hidden p-2 rounded-lg transition-colors border ${
              isScrolled
                ? "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20"
            }`}
            whileTap={{ scale: 0.9 }}>
            {mobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isScrolled ? "text-indigo-600 dark:text-indigo-400" : "text-white"
                }`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  isScrolled ? "text-indigo-600 dark:text-indigo-400" : "text-white"
                }`}
              />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu - Dropdown Style */}
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

            {/* Dropdown Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-20 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 lg:hidden overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                {/* Navigation Links */}
                <div className="space-y-1 mb-4">
                  <h3 className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Navigation
                  </h3>
                  {navItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg ${
                        item.highlight
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
                          : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300"
                      }`}>
                      {item.title}
                    </Link>
                  ))}
                </div>

                {/* User Actions */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <h3 className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Account
                  </h3>

                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full mb-2 justify-start bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md">
                          <UserCircle className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>

                      {role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold shadow-md">
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <div className="w-full">
                      <AuthButton user={null} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}