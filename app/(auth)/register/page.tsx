'use client';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';
import { FaUserPlus } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react'; // You can use HeroIcons, Lucide, etc.

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 relative">
      {/* Return Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Return
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Registration Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Gradient Header */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

          <div className="p-8">
            {/* Header with Icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-md mb-4">
                <FaUserPlus className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
                Create Account
              </h1>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Join our community today
              </p>
            </div>

            {/* Auth Form */}
            <AuthForm type="register" />

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            By registering, you agree to our{' '}
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
