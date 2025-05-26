// components/DashboardHeader.tsx
"use client";

import { User } from "@supabase/supabase-js";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import { useRouter } from "next/navigation";
import LoadingButton from "./LoadingButton";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import UserAvatar from "./UserAvatar"; // Reusing UserAvatar for consistency

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { supabase } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("Signed out successfully!");
      router.push("/");
    } catch (err: any) {
      console.error("Error signing out:", err.message);
      toast.error(`Failed to sign out: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    // Outer container for the dashboard header - styled like a section
    <div className="w-full mb-8">
      {" "}
      {/* mb-8 for spacing below the header */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* User Greeting and Info */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          {" "}
          {/* Adjusted spacing and responsiveness */}
          <UserAvatar user={user} /> {/* Use UserAvatar here */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white flex-shrink-0">
            Hello,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {displayName}!
            </span>
          </h2>
        </div>

        {/* Sign Out Button */}
        <LoadingButton
          onClick={handleSignOut}
          loading={loading}
          className="px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap"
        >
          <ArrowRightEndOnRectangleIcon className="w-5 h-5 mr-1" />
          Sign Out
        </LoadingButton>
      </div>
    </div>
  );
}
