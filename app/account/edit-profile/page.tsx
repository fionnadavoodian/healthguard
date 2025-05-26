// app/account/edit-profile/page.tsx
"use client";

import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import InitialMedicalInfoForm from "@/components/InitialMedicalInfoForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PencilSquareIcon,
  UserCircleIcon,
  CalendarIcon,
  IdentificationIcon,
  ScaleIcon,
  HeartIcon,
  SparklesIcon, // Added for insight icon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// Helper to calculate age from Date of Birth
const calculateAge = (dobString: string) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// --- NEW HELPER FUNCTIONS FOR BMI ---
const getBmiCategory = (bmi: number | null) => {
  if (bmi === null)
    return {
      category: "N/A",
      insight: "Please enter your weight and height to calculate BMI.",
    };
  if (bmi < 18.5)
    return {
      category: "Underweight",
      insight:
        "You might be underweight. Consult a healthcare professional for advice on gaining weight healthily.",
    };
  if (bmi >= 18.5 && bmi <= 24.9)
    return {
      category: "Normal weight",
      insight:
        "You are in a healthy weight range. Keep up the good work and maintain your healthy lifestyle!",
    };
  if (bmi >= 25 && bmi <= 29.9)
    return {
      category: "Overweight",
      insight:
        "You are in the overweight range. Consider incorporating more physical activity and a balanced diet.",
    };
  if (bmi >= 30)
    return {
      category: "Obese",
      insight:
        "You are in the obese range. It's recommended to consult a doctor to discuss a personalized health and weight management plan.",
    };
  return { category: "N/A", insight: "Invalid BMI value." };
};

const getBmiColorClass = (bmi: number | null) => {
  if (bmi === null) return "text-gray-500 border-gray-500";
  if (bmi < 18.5)
    return "text-blue-500 border-blue-500 dark:text-blue-400 dark:border-blue-400";
  if (bmi >= 18.5 && bmi <= 24.9)
    return "text-green-500 border-green-500 dark:text-green-400 dark:border-green-400";
  if (bmi >= 25 && bmi <= 29.9)
    return "text-yellow-500 border-yellow-500 dark:text-yellow-400 dark:border-yellow-400";
  if (bmi >= 30)
    return "text-red-500 border-red-500 dark:text-red-400 dark:border-red-400";
  return "text-gray-500 border-gray-500 dark:text-gray-400 dark:border-gray-400";
};

// Function to calculate the percentage for the circle fill.
const calculateBmiPercentageForCircle = (bmi: number | null) => {
  if (bmi === null) return 0;
  const minBmiForVisual = 15; // Represents very underweight
  const maxBmiForVisual = 40; // Represents severely obese

  const clampedBmi = Math.max(minBmiForVisual, Math.min(maxBmiForVisual, bmi));
  return (
    ((clampedBmi - minBmiForVisual) / (maxBmiForVisual - minBmiForVisual)) * 100
  );
};
// --- END NEW HELPER FUNCTIONS ---

export default function EditProfilePage() {
  const { user, session, supabase } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user !== undefined && session !== undefined) {
      if (!user) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    }
  }, [user, session, router]);

  const handleInfoSaved = () => {
    setIsEditing(false); // Switch back to view mode after saving
    router.refresh(); // Refresh the page to get the latest user data
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height))]">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Loading profile...
        </p>
      </div>
    );
  }

  // Extract user metadata for display
  const userDateOfBirth = user.user_metadata?.date_of_birth;
  const userGender = user.user_metadata?.gender;
  const userWeight = user.user_metadata?.weight;
  const userHeight = user.user_metadata?.height;
  const userCommonDiseases = user.user_metadata?.common_diseases || [];
  const userAvatarUrl = user.user_metadata?.avatar_url;
  const userAge = calculateAge(userDateOfBirth);
  // Get BMI directly from user_metadata (assuming it's stored there now)
  const userBmi = user.user_metadata?.bmi;
  const { category: bmiCategory, insight: bmiInsight } =
    getBmiCategory(userBmi);
  const bmiColorClass = getBmiColorClass(userBmi);
  const bmiCirclePercentage = calculateBmiPercentageForCircle(userBmi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-center min-h-[calc(100vh-var(--navbar-height))] px-4 py-4 md:px-6 ${isEditing ? "py-0" : "md:py-6"}`}
    >
      {isEditing ? (
        <div className="w-full max-w-4xl">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white text-center flex justify-center items-center rounded-t-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-0">
              Edit Your Health Profile
            </h2>
          </div>
          <InitialMedicalInfoForm
            user={user}
            supabase={supabase}
            onInfoSaved={handleInfoSaved}
            isEditMode={true}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white text-center flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              Your Health Profile
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Edit Profile"
            >
              <PencilSquareIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Read-only info in view mode */}
          <div className="p-4 sm:p-6 space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 border-4 border-indigo-400 dark:border-indigo-600 shadow-md overflow-hidden">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-10 h-10" />
                )}
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                {user.user_metadata?.name ||
                  user.email?.split("@")[0] ||
                  "User"}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-1.5">
                <UserCircleIcon className="w-4.5 h-4.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />{" "}
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <p>
                  <span className="font-semibold flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    Date of Birth:
                  </span>{" "}
                  {userDateOfBirth || "N/A"}
                </p>
                <p>
                  <span className="font-semibold flex items-center">
                    <IdentificationIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    Gender:
                  </span>{" "}
                  {userGender || "N/A"}
                </p>
                <p>
                  <span className="font-semibold flex items-center">
                    <ScaleIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    Weight:
                  </span>{" "}
                  {userWeight ? `${userWeight} kg` : "N/A"}
                </p>
                <p>
                  <span className="font-semibold flex items-center">
                    <ScaleIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    Height:
                  </span>{" "}
                  {userHeight ? `${userHeight} cm` : "N/A"}
                </p>
                <p>
                  <span className="font-semibold flex items-center">
                    <HeartIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    Age:
                  </span>{" "}
                  {userAge ? `${userAge} years` : "N/A"}
                </p>
              </div>
            </div>

            {/* BMI Section - Enhanced UI */}
            <div className="space-y-3 pt-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-1.5">
                <ScaleIcon className="w-4.5 h-4.5 mr-1.5 text-purple-500 dark:text-purple-400" />{" "}
                Body Mass Index (BMI)
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-gray-300 dark:text-gray-700"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="32"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className={`transition-all duration-700 ${bmiColorClass}`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={
                        2 * Math.PI * 32 -
                        (bmiCirclePercentage / 100) * (2 * Math.PI * 32)
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="32"
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`font-bold text-lg ${bmiColorClass.split(" ")[0]}`}
                    >
                      {userBmi !== null ? userBmi.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    Category:{" "}
                    <span className={`${bmiColorClass.split(" ")[0]}`}>
                      {bmiCategory}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start mt-1">
                    <SparklesIcon className="w-4 h-4 mr-1 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
                    <span className="italic">{bmiInsight}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-1.5">
                <HeartIcon className="w-4.5 h-4.5 mr-1.5 text-red-500 dark:text-red-400" />
                Common Health Conditions
              </h3>
              <ul className="list-disc list-inside text-sm pl-2">
                {userCommonDiseases.length > 0 &&
                userCommonDiseases[0] !== "None" ? (
                  userCommonDiseases.map((disease: string, index: number) => (
                    <li key={index}>{disease}</li>
                  ))
                ) : (
                  <li>No common diseases reported.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
