// app/assessments/gastric-cancer/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import { Button } from "@/components/Button";
import Input from "@/components/Input";

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
  const { register, handleSubmit, watch } = useForm<GastricCancerFormData>();
  const [result, setResult] = useState<{
    score_percentage: number;
    risk_category: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const smoking = watch("smoking");

  const onSubmit = async (data: GastricCancerFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Normalize smoking fields before submission
    const cleanedData = {
      ...data,
      pack_years_smoking: data.smoking ? data.pack_years_smoking : "never",
    };

    try {
      const res = await fetch("http://localhost:8000/gastric-risk", {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col flex-grow min-h-0"
    >
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Gastric Cancer Risk Assessment
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Please provide the following information to assess your gastric
            cancer risk.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
          >
            <Input
              label="Age"
              type="number"
              placeholder="e.g., 45"
              {...register("age", { required: true, valueAsNumber: true })}
              disabled={loading}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="education"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4 md:col-span-2">
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
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:checked:bg-blue-500"
                  />
                  <label
                    htmlFor={field}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
                  >
                    {field.replaceAll("_", " ")}
                  </label>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4 md:col-span-2">
              Lifestyle Factors
            </h3>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="smoking"
                  type="checkbox"
                  {...register("smoking")}
                  disabled={loading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:checked:bg-blue-500"
                />
                <label
                  htmlFor="smoking"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Smoking
                </label>
              </div>

              {smoking && (
                <div className="col-span-full sm:col-span-1">
                  <label
                    htmlFor="pack_years_smoking"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    <option value="current smoker">Current Smoker</option>
                  </select>
                </div>
              )}

              {["low_veg_fruit", "high_salt_intake", "high_nitrate"].map(
                (field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <input
                      id={field}
                      type="checkbox"
                      {...register(field as keyof GastricCancerFormData)}
                      disabled={loading}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:checked:bg-blue-500"
                    />
                    <label
                      htmlFor={field}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
                    >
                      {field.replaceAll("_", " ")}
                    </label>
                  </div>
                )
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="family_history"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Family History of Gastric Cancer
              </label>
              <select
                id="family_history"
                {...register("family_history", { required: true })}
                disabled={loading}
                className={selectClasses}
              >
                <option value="">Select Family History</option>
                <option value="non-relative">No close relatives</option>
                <option value="second-degree">Second-degree relative</option>
                <option value="first-degree">First-degree relative</option>
              </select>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center col-span-full whitespace-pre-line">
                {error}
              </p>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-12 col-span-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Get Assessment
            </Button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-6 p-4 rounded-lg text-center ${
                result.risk_category === "High Risk"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : result.risk_category === "Medium Risk"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              <h3 className="font-semibold text-lg">Assessment Result:</h3>
              <p className="text-xl font-bold">{result.risk_category}</p>
              <p>Risk Score: {result.score_percentage.toFixed(2)}%</p>
              <p className="text-sm mt-2">
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
