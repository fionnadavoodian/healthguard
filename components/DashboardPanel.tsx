// components/DashboardPanel.tsx
"use client";

import { User } from "@supabase/supabase-js";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  HeartIcon,
  ScaleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  CalendarIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import DashboardHeader from "./DashboardHeader";
import React from "react";

interface DashboardPanelProps {
  user: User | null; // Allow user to be null
}

// Helper to calculate BMI and categorize it
const calculateBMI = (weightKg: number, heightCm: number) => {
  // Ensure weightKg and heightCm are positive numbers before calculation
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0)
    return { value: null, category: "N/A", insight: "" };

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Explicitly check for NaN after calculation and return null if it's NaN
  if (isNaN(bmi)) {
    return { value: null, category: "N/A", insight: "" };
  }

  let category = "";
  let insight = "";
  if (bmi < 18.5) {
    category = "Underweight";
    insight = "Consider consulting a doctor for healthy weight gain.";
  } else if (bmi >= 18.5 && bmi < 24.9) {
    category = "Normal weight";
    insight = "Maintain your healthy lifestyle!";
  } else if (bmi >= 25 && bmi < 29.9) {
    category = "Overweight";
    insight = "Focus on healthy eating and exercise.";
  } else if (bmi >= 30) {
    category = "Obese";
    insight =
      "It's recommended to consult a healthcare professional for guidance.";
  }
  return { value: parseFloat(bmi.toFixed(2)), category, insight };
};

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

const ASSESSMENTS_INFO = [
  {
    id: "gastric-cancer",
    title: "Gastric Cancer Assessment",
    completedFlag: "gastric_cancer_completed",
    icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
  },
  {
    id: "diabetes",
    title: "Diabetes Assessment",
    completedFlag: "diabetes_completed",
    icon: <ScaleIcon className="w-5 h-5" />,
  },
  {
    id: "heart-disease",
    title: "Heart Disease Assessment",
    completedFlag: "heart_disease_completed",
    icon: <HeartIcon className="w-5 h-5" />,
  },
];

export default function DashboardPanel({ user }: DashboardPanelProps) {
  if (!user) {
    return null;
  }

  const userDateOfBirth = user.user_metadata?.date_of_birth;
  const userGender = user.user_metadata?.gender;
  const userWeight = parseFloat(user.user_metadata?.weight) || 0;
  const userHeight = parseFloat(user.user_metadata?.height) || 0;
  const userCommonDiseases = user.user_metadata?.common_diseases || [];

  const userAge = calculateAge(userDateOfBirth);
  const {
    value: bmiValue,
    category: bmiCategory,
    insight: bmiInsight,
  } = calculateBMI(userWeight, userHeight);

  const completedAssessmentsCount = ASSESSMENTS_INFO.filter(
    (assessment) => user.user_metadata?.[assessment.completedFlag] === true
  ).length;
  const totalAssessments = ASSESSMENTS_INFO.length;
  const completionPercentage =
    totalAssessments > 0
      ? (completedAssessmentsCount / totalAssessments) * 100
      : 0;

  const progressChartData = [
    { name: "Completed", value: completionPercentage, color: "#4CAF50" },
    { name: "Remaining", value: 100 - completionPercentage, color: "#E0E0E0" },
  ];

  const PIE_COLORS = ["#4CAF50", "#E0E0E0"];

  // Determine the color class for the BMI status bar
  let bmiColorClass = "bg-gray-400"; // Default
  if (bmiCategory === "Underweight") {
    bmiColorClass = "bg-yellow-500";
  } else if (bmiCategory === "Normal weight") {
    bmiColorClass = "bg-green-500";
  } else if (bmiCategory === "Overweight") {
    bmiColorClass = "bg-orange-500";
  } else if (bmiCategory === "Obese") {
    bmiColorClass = "bg-red-500";
  }

  // BMI category thresholds as percentages of a max BMI (e.g., 40 or 50 for visualization)
  // Let's assume a max visual BMI of 40 for percentage calculation for these lines
  const maxBmiForVisualization = 40;
  const underweightThreshold = (18.5 / maxBmiForVisualization) * 100;
  const normalWeightThreshold = (24.9 / maxBmiForVisualization) * 100; // End of normal, start of overweight
  const overweightThreshold = (29.9 / maxBmiForVisualization) * 100; // End of overweight, start of obese

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col flex-grow min-h-0"
    >
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
        <motion.div
          // Removed whileHover={{ scale: 1.01 }} to stop bouncing
          className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center justify-between min-h-0"
        >
          {/* Adjusted for better vertical alignment */}
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="w-16 h-16 rounded-full bg-indigo-500 dark:bg-indigo-700 flex items-center justify-center text-white text-2xl font-semibold mb-3 shadow-lg overflow-hidden flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
              Your Profile
            </h2>
            <div className="space-y-0.5 text-gray-700 dark:text-gray-300 text-xs">
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <Link
            href="/account/edit-profile"
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center text-xs"
          >
            <AcademicCapIcon className="w-3.5 h-3.5 mr-0.5" /> View and Edit
          </Link>
        </motion.div>

        <motion.div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-0">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Your BMI
          </h2>
          {bmiValue !== null /* Conditionally render the BMI content */ ? (
            <>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                {bmiValue}
              </p>
              <p
                className={`text-sm font-bold ${
                  bmiCategory === "Underweight"
                    ? "text-yellow-600"
                    : bmiCategory === "Normal weight"
                      ? "text-green-600"
                      : bmiCategory === "Overweight"
                        ? "text-orange-600"
                        : bmiCategory === "Obese"
                          ? "text-red-600"
                          : "text-gray-600"
                }`}
              >
                {bmiCategory}
              </p>
              {userWeight > 0 &&
                userHeight > 0 && ( // Only display if weight and height are valid numbers
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Weight: {userWeight} kg, Height: {userHeight} cm
                  </p>
                )}
              {bmiInsight && (
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 italic text-center max-w-[200px]">
                  "{bmiInsight}"
                </p>
              )}
              {/* Custom BMI Status Bar with Borderlines */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-3 relative overflow-hidden">
                <div
                  className={`h-full rounded-full ${bmiColorClass}`}
                  style={{
                    width: `${Math.min(100, (bmiValue / maxBmiForVisualization) * 100)}%`,
                  }}
                ></div>
                {/* Borderlines for BMI categories */}
                {bmiValue !== null && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-500 dark:bg-gray-400"
                      style={{ left: `${underweightThreshold}%` }}
                    ></div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-500 dark:bg-gray-400"
                      style={{ left: `${normalWeightThreshold}%` }}
                    ></div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-500 dark:bg-gray-400"
                      style={{ left: `${overweightThreshold}%` }}
                    ></div>
                  </>
                )}
              </div>
              {/* Subtitles for BMI categories - Simplified for no overlap */}
              <div className="w-full flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1 px-1">
                <span className="flex-1 text-left">Underweight</span>
                <span className="flex-1 text-center">Normal</span>
                <span className="flex-1 text-center">Overweight</span>
                <span className="flex-1 text-right">Obese</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              Please update your profile with weight and height to calculate
              your BMI.
            </p>
          )}
        </motion.div>

        <motion.div className="relative lg:col-span-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-2xl border border-blue-400 dark:border-indigo-700 flex flex-col items-center justify-center min-h-0 overflow-hidden">
          {/* Subtle background shimmer overlay */}
          <div className="absolute inset-0  rounded-2xl pointer-events-none"></div>

          <h2 className="text-xl font-semibold mb-4 z-10">
            Assessment Progress
          </h2>

          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: 120 }}
          >
            <ResponsiveContainer width="80%" height={120}>
              <PieChart>
                <Pie
                  data={progressChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {progressChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    color: "#333",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                  formatter={(value: number) => `${value.toFixed(0)}%`}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-2xl font-extrabold"
                >
                  {completionPercentage.toFixed(0)}%
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm font-medium light:text-gray-400 mt-2 z-10">
            {completedAssessmentsCount} of {totalAssessments} Assessments
            Completed
          </p>
        </motion.div>

        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex-grow min-h-0 overflow-auto">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
            Your Health Assessments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ASSESSMENTS_INFO.map((assessment) => (
              <motion.div
                key={assessment.id}
                whileHover={{ y: -1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm flex flex-col items-start space-y-1 transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <div className="text-blue-600 dark:text-blue-400">
                    {assessment.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    {assessment.title}
                  </h3>
                </div>
                {user.user_metadata?.[assessment.completedFlag] ? (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircleIcon className="w-3 h-3 mr-0.5" /> Completed
                  </p>
                ) : (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                    <ExclamationCircleIcon className="w-3 h-3 mr-0.5" /> Pending
                  </p>
                )}
                <Link
                  href={`/assessments/${assessment.id === "diabetes" ? "diabetes" : assessment.id}`} // This is the modified line
                  className="mt-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-xs font-medium self-end"
                >
                  {user.user_metadata?.[assessment.completedFlag]
                    ? "View/Update"
                    : "Start Assessment"}
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
            Click on an assessment card to provide detailed medical information
            and receive specialized insights.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
