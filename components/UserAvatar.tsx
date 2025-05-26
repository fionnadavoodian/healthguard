// components/UserAvatar.tsx
"use client";
import { User } from "@supabase/supabase-js";
import { UserCircleIcon } from "@heroicons/react/24/outline"; // Import generic user icon

interface UserAvatarProps {
  user: User | null;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
          <UserCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />{" "}
          {/* Generic icon */}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300">Guest</span>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {initials}
          </span>
        )}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {displayName}
      </span>
    </div>
  );
}
