// app/assessments/diabetes/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import { Button } from "@/components/Button";
import Input from "@/components/Input";
import LoadingButton from "@/components/LoadingButton";
import DashboardHeader from "@/components/DashboardHeader";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider"; // CORRECTED IMPORT: Changed useAuth to useSupabaseAuth

interface FormData {
  gender: string;
  age: number | "";
  hypertension: number | "";
  heart_disease: number | "";
  smoking_history: string;
  bmi: number | "";
  HbA1c_level: number | "";
  blood_glucose_level: number | "";
}

export default function DiabetesAssessmentPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth(); // CORRECTED USAGE: Using useSupabaseAuth
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    age: "",
    hypertension: "",
    heart_disease: "",
    smoking_history: "",
    bmi: "",
    HbA1c_level: "",
    blood_glucose_level: "",
  });
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    prediction: number;
    probability: number;
    category: string;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "age" ||
        name === "bmi" ||
        name === "HbA1c_level" ||
        name === "blood_glucose_level"
          ? parseFloat(value) || ""
          : name === "hypertension" || name === "heart_disease"
            ? parseInt(value) || ""
            : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    const requiredFields: (keyof FormData)[] = [
      "gender",
      "age",
      "hypertension",
      "heart_disease",
      "smoking_history",
      "bmi",
      "HbA1c_level",
      "blood_glucose_level",
    ];

    for (const field of requiredFields) {
      if (
        formData[field] === "" ||
        formData[field] === null ||
        (typeof formData[field] === "number" &&
          isNaN(formData[field] as number))
      ) {
        setError(`Please fill in the '${field}' field.`);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/diabetes-predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "An unexpected error occurred during prediction."
        );
        return;
      }

      setPredictionResult(data);
    } catch (err) {
      console.error("Failed to submit form:", err);
      setError("Network error or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col flex-grow min-h-0"
    >
      {user && <DashboardHeader user={user} />}

      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Diabetes Risk Assessment
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Provide your health information to get a diabetes risk prediction.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., 35"
              required
            />

            <div>
              <label
                htmlFor="hypertension"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hypertension
              </label>
              <select
                id="hypertension"
                name="hypertension"
                value={formData.hypertension}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="heart_disease"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Heart Disease
              </label>
              <select
                id="heart_disease"
                name="heart_disease"
                value={formData.heart_disease}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="smoking_history"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Smoking History
              </label>
              <select
                id="smoking_history"
                name="smoking_history"
                value={formData.smoking_history}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Status</option>
                <option value="never">Never</option>
                <option value="No Info">No Info</option>
                <option value="current">Current</option>
                <option value="former">Former</option>
                <option value="ever">Ever</option>
                <option value="not current">Not Current</option>
              </select>
            </div>

            <Input
              label="BMI"
              type="number"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              placeholder="e.g., 25.5"
              step="0.01"
              required
            />

            <Input
              label="HbA1c Level (%)"
              type="number"
              name="HbA1c_level"
              value={formData.HbA1c_level}
              onChange={handleChange}
              placeholder="e.g., 5.7"
              step="0.1"
              required
            />

            <Input
              label="Blood Glucose Level (mg/dL)"
              type="number"
              name="blood_glucose_level"
              value={formData.blood_glucose_level}
              onChange={handleChange}
              placeholder="e.g., 140"
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <LoadingButton type="submit" loading={loading} className="w-full">
              Get Prediction
            </LoadingButton>
          </form>

          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-6 p-4 rounded-lg text-center ${
                predictionResult.category === "High Risk"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : predictionResult.category === "Medium Risk"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              <h3 className="font-semibold text-lg">Prediction Result:</h3>
              <p className="text-xl font-bold">{predictionResult.category}</p>
              <p>Risk Score: {predictionResult.probability.toFixed(4)}</p>
              <p className="text-sm mt-2">
                This prediction is based on the provided data and our model's
                assessment. Please consult a healthcare professional for
                diagnosis and personalized advice.
              </p>
              <Button onClick={() => router.push("/account")} className="mt-4">
                Back to Dashboard
              </Button>
            </motion.div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
