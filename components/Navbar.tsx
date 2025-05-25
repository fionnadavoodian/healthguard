"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState } from "react";
import UserAvatar from "./UserAvatar";
import DarkModeToggle from "./DarkModeToggle";
import LoadingButton from "./LoadingButton";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await signOut({ redirect: false });
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/");
      toast.success("Signed out successfully!");
    } catch (err) {
      console.error("Error signing out:", err);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Side: Logo and Brand Name */}
        <div className="flex items-center gap-4">
          <Link href="#home" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              HG
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
              HealthGuard Pro
            </span>
          </Link>
        </div>

        {/* Center: Extra Navigation Links */}
        <div className="flex flex-wrap gap-4 items-center justify-center text-sm text-gray-600 dark:text-gray-300">
          <Link
            href="/account"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Health Panel
          </Link>
          <a
            href="#aboutUs"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            About Us
          </a>
          <a
            href="#resources"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Resources
          </a>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <LoadingButton
                loading={loading}
                onClick={handleSignOut}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-transparent gap-2 px-2 py-1"
              >
                Sign Out
              </LoadingButton>
              <UserAvatar user={session.user} />
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-md transition-all"
              >
                Get Started
              </Link>
              <DarkModeToggle />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
