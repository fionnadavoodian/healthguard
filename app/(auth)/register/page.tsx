"use client";
import { motion } from "framer-motion";
import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";

export default function RegisterPage() {
  const { user, session } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined && session !== undefined) {
      if (user) {
        router.replace("/account");
      }
    }
  }, [user, session, router]);

  if (user !== undefined && session !== undefined && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center text-sm font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Return
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

          <div className="p-8">
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

            <AuthForm type="register" />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
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

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            By registering, you agree to our{" "}
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
