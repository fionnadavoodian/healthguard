// components/DashboardPanel.tsx
"use client";

import { User } from "@supabase/supabase-js";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
import React from "react"; // <--- Make sure React is imported for Fragments

interface DashboardPanelProps {
  user: User;
}

// Helper to calculate BMI and categorize it
const calculateBMI = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm) return { value: null, category: "N/A" };
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 18.5 && bmi < 24.9) category = "Normal weight";
  else if (bmi >= 25 && bmi < 29.9) category = "Overweight";
  else if (bmi >= 30) category = "Obese";
  return { value: parseFloat(bmi.toFixed(2)), category };
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

// Define your assessments and their metadata keys for completion tracking
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
  // Add other assessments here with unique icons
];

export default function DashboardPanel({ user }: DashboardPanelProps) {
  const userDateOfBirth = user.user_metadata?.date_of_birth;
  const userGender = user.user_metadata?.gender;
  const userWeight = user.user_metadata?.weight;
  const userHeight = user.user_metadata?.height;
  const userCommonDiseases = user.user_metadata?.common_diseases || [];

  const userAge = calculateAge(userDateOfBirth);
  const { value: bmiValue, category: bmiCategory } = calculateBMI(
    userWeight,
    userHeight
  );

  // Calculate assessment completion progress
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

  // Example BMI Chart Data (for BarChart visualization of categories)
  const bmiChartCategories = [
    { name: "Underweight", min: 0, max: 18.5, color: "#FFC107" },
    { name: "Normal weight", min: 18.5, max: 24.9, color: "#4CAF50" },
    { name: "Overweight", min: 25, max: 29.9, color: "#FF9800" },
    { name: "Obese", min: 30, max: Infinity, color: "#F44336" },
  ];

  const currentBmiData = bmiChartCategories.map((cat) => ({
    name: cat.name,
    range: `${cat.min}${cat.max === Infinity ? "+" : `-${cat.max}`}`,
    isCurrent:
      bmiValue !== null &&
      bmiValue >= cat.min &&
      (cat.max === Infinity || bmiValue < cat.max)
        ? bmiValue
        : 0,
    color: cat.color,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col flex-grow min-h-0"
    >
      {/* Dashboard Header acting as a Navbar */}
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
        {/* User Profile Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center justify-between min-h-0"
        >
          <div>
            <div className="w-16 h-16 rounded-full bg-indigo-500 dark:bg-indigo-700 flex items-center justify-center text-white text-2xl font-semibold mb-3 shadow-lg">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.name || "User"}
                  className="w-full h-full rounded-full object-cover"
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
              {userDateOfBirth && (
                <p className="flex items-center justify-center">
                  <CalendarIcon className="w-3 h-3 mr-0.5" /> DOB:{" "}
                  {userDateOfBirth}
                </p>
              )}
              {userAge && <p>Age: {userAge} years</p>}
              {userGender && (
                <p className="flex items-center justify-center">
                  <IdentificationIcon className="w-3 h-3 mr-0.5" /> Gender:{" "}
                  {userGender}
                </p>
              )}
              {userWeight && userHeight && (
                <p>
                  Weight: {userWeight} kg, Height: {userHeight} cm
                </p>
              )}
              {userCommonDiseases.length > 0 &&
              userCommonDiseases[0] !== "None" ? (
                <p>Common Diseases: {userCommonDiseases.join(", ")}</p>
              ) : (
                <p>No common diseases reported.</p>
              )}
            </div>
          </div>
          <Link
            href="/account/edit-profile"
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center text-xs"
          >
            <AcademicCapIcon className="w-3.5 h-3.5 mr-0.5" /> Edit Profile
            Details
          </Link>
        </motion.div>

        {/* BMI Diagram Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-0"
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Your BMI
          </h2>
          {bmiValue !== null ? (
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

              <ResponsiveContainer width="100%" height={80}>
                <BarChart
                  data={currentBmiData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} kg/m²`,
                      props.payload.name,
                    ]}
                  />
                  <Bar dataKey="isCurrent" fill="#8884d8" maxBarSize={10}>
                    {currentBmiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Based on your weight and height.
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              Please update your profile with weight and height to calculate
              your BMI.
            </p>
          )}
        </motion.div>

        {/* Assessment Progress Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-2xl shadow-xl border border-blue-400 dark:border-indigo-700 flex flex-col items-center justify-center relative overflow-hidden min-h-0"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(/abstract-pattern.svg)" }}
          ></div>
          <h2 className="text-lg font-semibold mb-3 text-white z-10">
            Assessment Progress
          </h2>
          <ResponsiveContainer width="80%" height={100}>
            <PieChart>
              <Pie
                data={progressChartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={1}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                labelLine={false}
              >
                {progressChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-white"
              >
                {completionPercentage.toFixed(0)}%
              </text>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-sm font-medium text-white mt-1 z-10">
            {completedAssessmentsCount} of {totalAssessments} Assessments
            Completed
          </p>
        </motion.div>

        {/* Assessments List Section (Full Width) */}
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
                  href={`/assessments/${assessment.id}`}
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
