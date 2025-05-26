"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import { Button } from "@/components/Button";
import Input from "@/components/Input";
import LoadingButton from "@/components/LoadingButton";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "@/types/supabase";
type ProfilesTable = Database["public"]["Tables"]["profiles"]["Row"];

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
  const { user } = useSupabaseAuth();
  const supabase = createClientComponentClient<Database>();

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
  const [profileLoading, setProfileLoading] = useState(true);
  const [predictionResult, setPredictionResult] = useState<{
    prediction: number;
    probability: number;
    category: string;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setProfileLoading(true);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("gender, date_of_birth, bmi")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setError("Failed to load profile data.");
          } else if (data) {
            const profileData: Partial<FormData> = {};

            if (data.gender) {
              profileData.gender = data.gender;
            }

            if (data.date_of_birth) {
              const birthDate = new Date(data.date_of_birth);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              profileData.age = age;
            }

            if (data.bmi) {
              profileData.bmi = data.bmi;
            }

            setFormData((prev) => ({
              ...prev,
              ...profileData,
            }));
          }
        } catch (err) {
          console.error("Unexpected error fetching profile:", err);
          setError("An unexpected error occurred while loading profile.");
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

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
            ? parseInt(value, 10)
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

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Loading profile data...
        </p>
        {/* You can add a spinner here if you have one */}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col flex-grow min-h-0"
    >
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-6">
          {" "}
          {/* Removed space-y-6 from Card to manage spacing with gap-y */}
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
            {" "}
            {/* Added mb-4 for heading spacing */}
            Diabetes Risk Assessment
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            {" "}
            {/* Added mb-6 for paragraph spacing */}
            Provide your health information to get a diabetes risk prediction.
          </p>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
          >
            {/* Gender */}
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
                disabled={!!formData.gender}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  !!formData.gender
                    ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Age */}
            <Input
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., 35"
              required
              readOnly={!!formData.age}
              className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                !!formData.age
                  ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  : ""
              }`}
            />

            {/* Hypertension */}
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {/* Heart Disease */}
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {/* Smoking History */}
            <div className="md:col-span-2">
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              >
                <option value="">Select Status</option>
                <option value="never">Never smoked</option>
                <option value="No Info">
                  No information available (often treated as never)
                </option>
                <option value="current">Currently smokes</option>
                <option value="former">Used to smoke, but quit</option>
                <option value="ever">
                  Has smoked at some point (current or former)
                </option>
                <option value="not current">
                  Does not currently smoke (includes never and former)
                </option>
              </select>
            </div>

            {/* BMI */}
            <Input
              label="BMI"
              type="number"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              placeholder="e.g., 25.5"
              step="0.01"
              required
              readOnly={!!formData.bmi}
              className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                !!formData.bmi
                  ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  : ""
              }`}
            />

            {/* HbA1c Level */}
            <Input
              label="HbA1c Level (%)"
              type="number"
              name="HbA1c_level"
              value={formData.HbA1c_level}
              onChange={handleChange}
              placeholder="e.g., 5.7"
              step="0.1"
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />

            {/* Blood Glucose Level */}
            <Input
              label="Blood Glucose Level (mg/dL)"
              type="number"
              name="blood_glucose_level"
              value={formData.blood_glucose_level}
              onChange={handleChange}
              placeholder="e.g., 140"
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />

            {error && (
              <p className="text-red-500 text-sm text-center col-span-full">
                {error}
              </p>
            )}

            <LoadingButton
              type="submit"
              loading={loading}
              // Ensured full width and project blue color
              className="w-full h-12 col-span-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
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
