// components/DashboardHeader.tsx
"use client";

import { User } from "@supabase/supabase-js";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider"; // Keep this import for User context (user.email, user.user_metadata)
// Removed useRouter, LoadingButton, useState, toast, ArrowRightEndOnRectangleIcon
// as the sign-out functionality remains removed from this component.
import UserAvatar from "./UserAvatar"; // Keep this for displaying the avatar

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  // The displayName calculation is needed here as the greeting is kept.
  const { session } = useSupabaseAuth(); // Needed to access user.email from session if user data isn't fully propagated via user prop
  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    // Outer container for the dashboard header - styled like a section
    <div className="w-full mb-8">
      {" "}
      {/* mb-8 for spacing below the header */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* User Greeting and Info - KEPT and restored */}
        <div className="flex items-center space-x-3 mx-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white flex-shrink-0">
            Hello,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {displayName}!
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
}
