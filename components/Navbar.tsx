// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import DarkModeToggle from "./DarkModeToggle";
import LoadingButton from "./LoadingButton";
import { toast } from "react-hot-toast";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { session, supabase, user } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (error) {
        throw error;
      }
      router.push("/");
      toast.success("Signed out successfully!");
    } catch (err: any) {
      console.error("Error signing out:", err.message);
      toast.error(`Failed to sign out: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-white/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 h-[var(--navbar-height)] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Adjusted px and py for mobile */}
        {/* Left Side: Logo and Brand Name */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="#home" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {" "}
              {/* Reduced size */}
              HG
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {" "}
              {/* Reduced font size */}
              HealthGuard Pro
            </span>
          </Link>
        </div>
        {/* Right Side: Icons and Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {" "}
          {/* Adjusted gap */}
          {/* Always visible theme toggle */}
          <DarkModeToggle />
          {/* User Avatar (only when signed in, on desktop) */}
          {session && (
            <Link href="/account" className="cursor-pointer hidden sm:block">
              <UserAvatar user={user} />
            </Link>
          )}
          {/* Desktop Auth Buttons (hidden on mobile) */}
          {!session ? (
            <div className="hidden sm:flex gap-2">
              {" "}
              {/* Reduced gap */}
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-md transition-all text-sm"
              >
                Get Started
              </Link>
            </div>
          ) : (
            // Sign Out Button for Desktop
            <LoadingButton
              loading={loading}
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors items-center text-sm font-medium whitespace-nowrap hidden sm:flex" // Removed 'flex' here
            >
              <ArrowRightEndOnRectangleIcon className="w-5 h-5 mr-1" />
              Sign Out
            </LoadingButton>
          )}
          {/* Mobile Hamburger/Close Button */}
          <button
            className="sm:hidden p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" /* Reduced padding */
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> /* Reduced size */
            ) : (
              <Bars3Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> /* Reduced size */
            )}
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay (Off-canvas or dropdown menu) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-[var(--navbar-height)] left-0 w-full bg-white dark:bg-gray-900 shadow-lg py-4 px-6 z-40">
          <div className="flex flex-col space-y-3 text-base">
            <Link
              href="/account"
              className="block text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Health Panel
            </Link>
            <a
              href="#aboutUs"
              className="block text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="#resources"
              className="block text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resources
            </a>
            {session ? (
              // Sign Out Button for Mobile Menu
              <LoadingButton
                loading={loading}
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              >
                Sign Out
              </LoadingButton>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
