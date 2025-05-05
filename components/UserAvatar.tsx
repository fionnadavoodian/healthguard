// components/UserAvatar.tsx
'use client';
import { User } from 'next-auth';

interface UserAvatarProps {
  user: User;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-full h-full rounded-full"
          />
        ) : (
          <span className="text-sm font-medium">
            {user.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300">{user.name}</span>
    </div>
  );
}
