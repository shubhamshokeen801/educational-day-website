"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/app/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function AuthButton({ user: initialUser }: { user?: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<any>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const hasWelcomed = useRef(false);

  useEffect(() => {
    async function loadUser() {
      if (initialUser) {
        setUser(initialUser);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session?.user ?? null);

          if (!hasWelcomed.current) {
            hasWelcomed.current = true;
            toast.success(
              `Welcome, ${session?.user?.user_metadata?.full_name || "User"}!`
            );
          }

          router.refresh();
        } else if (event === "SIGNED_OUT") {
          hasWelcomed.current = false;
          setUser(null);
          toast("You've been logged out.", { description: "Come back soon!" });
          router.refresh();
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [router, supabase, initialUser]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      toast.loading("Redirecting to Google...");

      // Get current page path and search params
      const currentUrl = `${pathname}${window.location.search}`;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            location.origin
          }/api/auth/callback?next=${encodeURIComponent(currentUrl)}`,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Try again.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success("Successfully logged out.");
      setUser(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled className="bg-gray-500 text-white">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
      </Button>
    );
  }

  if (user) {
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    return (
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <Button
            variant="outline"
            className="cursor-pointer text-indigo-600 hover:bg-linear-to-b from-blue-600 to-indigo-700 hover:text-white transition-all duration-300 ease-linear">
            <UserCircle className="w-4 h-4" />
            Profile
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          disabled={loading}
          variant="destructive"
          className="text-white hidden md:flex cursor-pointer">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging out...
            </>
          ) : (
            <>
              {" "}
              <LogOut className="w-4 h-4" /> Logout
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      disabled={loading}
      className="cursor-pointer bg-linear-to-b from-blue-600 to-indigo-700 text-white hover:text-pink-500 transition-all duration-300 ease-linear">
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...
        </>
      ) : (
        <>Login with Google</>
      )}
    </Button>
  );
}
