"use client";
import { motion } from "framer-motion";
import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";
import { ArrowLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center text-sm font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Return
      </Link>
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
          <div className="h-2 bg-gradient-to-r from-pink-500 to-indigo-500 dark:from-purple-700 dark:to-blue-800" />{" "}
          {/* Made dark gradient more distinct */}
          <div className="p-8 space-y-6">
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 dark:from-indigo-700 dark:to-blue-700 flex items-center justify-center shadow-md">
                {" "}
                {/* Made dark gradient more distinct */}
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Sign in to access your dashboard
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuthForm type="login" />
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
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
