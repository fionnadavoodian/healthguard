'use client';
import { useEffect, useState } from 'react';

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }

    // Length check
    if (password.length > 8) score++;
    if (password.length > 12) score++;

    // Complexity checks
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(Math.min(score, 4));
  }, [password]);

  const strengthText = [
    'Very Weak',
    'Weak',
    'Moderate',
    'Strong',
    'Very Strong'
  ][strength];

  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ][strength];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password Strength: {strengthText}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full ${strengthColor}`}
          style={{ width: `${(strength / 4) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;