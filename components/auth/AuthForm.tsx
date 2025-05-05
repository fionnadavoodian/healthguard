'use client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../Button';
import Input from '../Input';
import PasswordStrengthMeter from '../PasswordStrengthMeter';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type FormData = {
  email: string;
  password: string;
  name?: string;
};

export default function AuthForm({ type }: { type: 'login' | 'register' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (type === 'login') {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });
      
        if (result?.error) {
          toast.error('Invalid email or password');
          return;
        }
      
        toast.success('Signed in successfully!');
        router.push('/'); // ✅ go to main page
      } else {
        // Registration logic
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || 'Registration failed');
          return;
        }
      
        toast.success('Account created! Logging in...');
      
        const loginResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });
      
        if (loginResult?.error) {
          toast.warning('Account created but login failed.');
          return;
        }
      
        router.push('/'); 
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
      {type === 'register' && (
        <Input
          label="Full Name"
          type="text"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          error={errors.name?.message}
          autoComplete="name"
        />
      )}

      <Input
        label="Email Address"
        type="email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address',
          },
        })}
        error={errors.email?.message}
        autoComplete="email"
      />

<div className="space-y-2 relative">
  <div className="flex justify-end">
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      className="text-gray-600 dark:text-gray-300 hover:text-gray-900"
    >
      {showPassword ? (
        <EyeSlashIcon className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
    </button>
  </div>

  <Input
    label="Password"
    type={showPassword ? 'text' : 'password'}
    {...register('password', {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters',
      },
    })}
    error={errors.password?.message}
    autoComplete={type === 'login' ? 'current-password' : 'new-password'}
  />
</div>


      {type === 'register' && password && (
        <PasswordStrengthMeter password={password} />
      )}

      {type === 'login' && (
        <div className="flex items-center justify-end">
          <a
            href="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Forgot password?
          </a>
        </div>
      )}

      <Button
        type="submit"
        className="w-full py-3 mt-6"
        disabled={loading}
        aria-disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {type === 'login' ? 'Signing in...' : 'Creating account...'}
          </span>
        ) : type === 'login' ? (
          'Sign In'
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}
