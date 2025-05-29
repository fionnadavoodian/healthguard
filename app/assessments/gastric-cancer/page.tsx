"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface GastricCancerFormData {
  hpylori: boolean | "";
  atrophic_gastritis: boolean | "";
  peptic_ulcer: boolean | "";
  gastric_surgery: boolean | "";
  pernicious_anemia: boolean | "";
  family_history: "non-relative" | "second-degree" | "first-degree" | "";
  age: number | "";
  gender: "male" | "female" | "";
  education: "literacy" | "elementary" | "secondary" | "high educational" | "";
  smoking: boolean | "";
  pack_years_smoking: "never" | "ex-smoker" | "current smoker" | "";
  low_veg_fruit: boolean | "";
  high_salt_intake: boolean | "";
  high_nitrate: boolean | "";
}

const selectClasses =
  "mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

export default function GastricCancerForm() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const supabase = createClientComponentClient<Database>();

  // Initialize form with react-hook-form, defaultValues as empty
  const {
    register,
    handleSubmit,
    watch,
    reset, // to reset form values when profile loads
    formState: { errors },
  } = useForm<GastricCancerFormData>({
    defaultValues: {
      hpylori: false,
      atrophic_gastritis: false,
      peptic_ulcer: false,
      gastric_surgery: false,
      pernicious_anemia: false,
      family_history: "",
      age: "",
      gender: "",
      education: "",
      smoking: false,
      pack_years_smoking: "",
      low_veg_fruit: false,
      high_salt_intake: false,
      high_nitrate: false,
    },
  });

  const smoking = watch("smoking");

  const [result, setResult] = useState<{
    score_percentage: number;
    risk_category: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("gender, date_of_birth")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setError("Failed to load profile data.");
        } else if (data) {
          let age = "";
          if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--;
            }
            age = calculatedAge.toString();
          }

          // Reset form with fetched data to prefill fields
          reset({
            age: age ? Number(age) : "",
            gender:
              data.gender &&
              (data.gender.toLowerCase() === "male" ||
                data.gender.toLowerCase() === "female")
                ? (data.gender.toLowerCase() as "male" | "female")
                : "",
            hpylori: false,
            atrophic_gastritis: false,
            peptic_ulcer: false,
            gastric_surgery: false,
            pernicious_anemia: false,
            family_history: "",
            education: "",
            smoking: false,
            pack_years_smoking: "",
            low_veg_fruit: false,
            high_salt_intake: false,
            high_nitrate: false,
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        setError("An unexpected error occurred while loading profile.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase, reset]);

  const onSubmit = async (data: GastricCancerFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const cleanedData = {
      ...data,
      pack_years_smoking: data.smoking ? data.pack_years_smoking : "never",
    };

    try {
      const res = await fetch("http://localhost:8000/gastric-cancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const json = await res.json();

      if (!res.ok) {
        let errorMessage = "An unexpected error occurred during prediction.";

        if (Array.isArray(json.detail)) {
          errorMessage = json.detail
            .map((e: any) => `${e.loc?.join(".")}: ${e.msg}`)
            .join("\n");
        } else if (typeof json.detail === "string") {
          errorMessage = json.detail;
        } else if (json.message) {
          errorMessage = json.message;
        }

        setError(errorMessage);
        return;
      }

      setResult(json);
    } catch (err) {
      console.error("Error submitting gastric cancer data", err);
      setError("Network error or server unavailable. Please try again.");
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
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-grow min-h-0
                 bg-gray-50 text-gray-900"
    >
      <div className="flex-grow flex items-center justify-center p-4">
        <Card
          className="w-full max-w-2xl p-8 space-y-6 shadow-xl rounded-lg bg-white" // Reduced space-y for tighter layout
        >
          <h1 className="text-3xl font-extrabold text-center text-gray-900">
            Gastric Cancer Risk Assessment
          </h1>
          <p className="text-center text-gray-600 text-lg">
            Please provide the following information to assess your gastric
            cancer risk.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6" // Reduced gap-y for tighter form fields
          >
            <Input
              label="Age"
              type="number"
              placeholder="e.g., 45"
              {...register("age", { required: true, valueAsNumber: true })}
              disabled={loading}
              className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm p-3
                         focus:ring-blue-600 focus:border-blue-600"
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">Age is required.</p>
            )}

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                {...register("gender", { required: true })}
                disabled={loading}
                className={selectClasses}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">Gender is required.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="education"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Education Level
              </label>
              <select
                id="education"
                {...register("education", { required: true })}
                disabled={loading}
                className={selectClasses}
              >
                <option value="">Select Education Level</option>
                <option value="literacy">Literacy</option>
                <option value="elementary">Elementary</option>
                <option value="secondary">Secondary</option>
                <option value="high educational">High Educational</option>
              </select>
              {errors.education && (
                <p className="text-red-500 text-sm">
                  Education level is required.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="family_history"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Family History
              </label>
              <select
                id="family_history"
                {...register("family_history", { required: true })}
                disabled={loading}
                className={selectClasses}
              >
                <option value="">Select Family History</option>
                <option value="non-relative">Non-relative</option>
                <option value="second-degree">Second-degree</option>
                <option value="first-degree">First-degree</option>
              </select>
              {errors.family_history && (
                <p className="text-red-500 text-sm">
                  Family history is required.
                </p>
              )}
            </div>

            <h3
              className="text-xl font-semibold text-gray-800 mt-4 md:col-span-2" // Adjusted mt for tighter spacing
            >
              Medical History
            </h3>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                "hpylori",
                "atrophic_gastritis",
                "peptic_ulcer",
                "gastric_surgery",
                "pernicious_anemia",
              ].map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <input
                    id={field}
                    type="checkbox"
                    {...register(field as keyof GastricCancerFormData)}
                    disabled={loading}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={field}
                    className="text-base font-medium text-gray-700 capitalize"
                  >
                    {field.replaceAll("_", " ")}
                  </label>
                </div>
              ))}
            </div>

            <h3
              className="text-xl font-semibold text-gray-800 mt-4 md:col-span-2" // Adjusted mt for tighter spacing
            >
              Lifestyle Factors
            </h3>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="smoking"
                  type="checkbox"
                  {...register("smoking")}
                  disabled={loading}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="smoking"
                  className="text-base font-medium text-gray-700"
                >
                  Smoking
                </label>
              </div>

              {smoking && (
                <div className="col-span-full sm:col-span-1">
                  <label
                    htmlFor="pack_years_smoking"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Smoking History
                  </label>
                  <select
                    id="pack_years_smoking"
                    {...register("pack_years_smoking", { required: smoking })}
                    disabled={loading}
                    className={selectClasses}
                  >
                    <option value="">Select Smoking Status</option>
                    <option value="never">Never</option>
                    <option value="ex-smoker">Ex-smoker</option>
                    <option value="current smoker">Current smoker</option>
                  </select>
                  {errors.pack_years_smoking && (
                    <p className="text-red-500 text-sm">
                      Please specify smoking history.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  id="low_veg_fruit"
                  type="checkbox"
                  {...register("low_veg_fruit")}
                  disabled={loading}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="low_veg_fruit"
                  className="text-base font-medium text-gray-700"
                >
                  Low Vegetable/Fruit Intake
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="high_salt_intake"
                  type="checkbox"
                  {...register("high_salt_intake")}
                  disabled={loading}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="high_salt_intake"
                  className="text-base font-medium text-gray-700"
                >
                  High Salt Intake
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="high_nitrate"
                  type="checkbox"
                  {...register("high_nitrate")}
                  disabled={loading}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="high_nitrate"
                  className="text-base font-medium text-gray-700"
                >
                  High Nitrate Intake
                </label>
              </div>
            </div>

            {error && (
              <div
                className="mt-4 text-center whitespace-pre-wrap p-3 rounded-md border
                              bg-red-50 text-red-600 border-red-200"
              >
                {error}
              </div>
            )}

            <div className="md:col-span-2 flex justify-center mt-4">
              {" "}
              {/* Adjusted mt for tighter spacing */}
              <LoadingButton
                loading={loading}
                type="submit"
                className="w-full h-14 col-span-full font-bold text-lg py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 hover:opacity-90
                           bg-blue-600 text-white focus:ring-blue-500 hover:bg-blue-700"
              >
                Get Assessment
              </LoadingButton>
            </div>
          </form>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-8 p-6 rounded-lg text-center shadow-md ${
                result.risk_category.toLowerCase() === "high risk"
                  ? "bg-red-100 text-red-800"
                  : result.risk_category.toLowerCase() === "medium risk"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              <h3 className="font-bold text-xl mb-2 text-gray-900">
                Assessment Result:
              </h3>
              <p className="text-2xl font-extrabold mb-1 text-blue-600">
                {result.risk_category}
              </p>
              <p className="text-lg text-gray-800">
                Risk Score: {result.score_percentage.toFixed(2)}%
              </p>
              <p className="text-sm mt-4 text-gray-600">
                This assessment provides a risk estimate. Please consult a
                healthcare professional for diagnosis and personalized advice.
              </p>
            </motion.div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
