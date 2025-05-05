'use client';
import { signIn } from 'next-auth/react';
import {Button} from '@/components/Button';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SocialButtons() {
  const handleOAuthSignIn = (provider: string) => () => {
    signIn(provider, { callbackUrl: '/account' });
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="secondary" 
        onClick={handleOAuthSignIn('google')}
        className="w-full flex items-center justify-center gap-2"
      >
        <FaGoogle className="text-red-500" />
        Continue with Google
      </Button>
      <Button 
        variant="secondary" 
        onClick={handleOAuthSignIn('github')}
        className="w-full flex items-center justify-center gap-2"
      >
        <FaGithub />
        Continue with GitHub
      </Button>
    </div>
  );
}