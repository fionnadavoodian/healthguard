// components/DashboardHeader.tsx
"use client";

import { User } from "@supabase/supabase-js";
// import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider"; // No longer needed for sign out
// import { useRouter } from "next/navigation"; // No longer needed for sign out
// import LoadingButton from "./LoadingButton"; // No longer needed for sign out
// import { useState } from "react"; // No longer needed for sign out
// import toast from "react-hot-toast"; // No longer needed for sign out
// import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline"; // No longer needed for sign out
import UserAvatar from "./UserAvatar"; // Reusing UserAvatar for consistency

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  // const { supabase } = useSupabaseAuth(); // Removed
  // const router = useRouter(); // Removed
  // const [loading, setLoading] = useState(false); // Removed

  // const handleSignOut = async () => { // Removed
  //   if (loading) return;

  //   try {
  //     setLoading(true);
  //     const { error } = await supabase.auth.signOut();
  //     if (error) {
  //       throw error;
  //     }
  //     toast.success("Signed out successfully!");
  //     router.push("/");
  //   } catch (err: any) {
  //     console.error("Error signing out:", err.message);
  //     toast.error(`Failed to sign out: ${err.message || "Please try again."}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
