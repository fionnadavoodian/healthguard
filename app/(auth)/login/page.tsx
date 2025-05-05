'use client';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftIcon } from 'lucide-react'; // Import icon
import { useState } from 'react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Link
        href="/"
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Return
      </Link>
      {/* Main Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative"
      >
      

        <motion.div
          variants={itemVariants}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="h-2 bg-gradient-to-r from-pink-500 to-indigo-500" />

          <div className="p-8 space-y-6">
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-8 h-8 text-white"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Sign in to access your dashboard
              </p>
            </motion.div>

            {/* Auth Form */}
            <motion.div variants={itemVariants}>
              <AuthForm type="login" />
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="pt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
