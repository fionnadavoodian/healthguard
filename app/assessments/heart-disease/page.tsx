"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
// Assuming Card, Input, LoadingButton are correctly imported from your components directory
import Card from "@/components/Card";
import { Button } from "@/components/Button"; // Assuming Button is also a component
import Input from "@/components/Input";
import LoadingButton from "@/components/LoadingButton";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "@/types/supabase";

// Define the new FormData interface for Cardiovascular Disease Assessment
interface CardioFormData {
  gender: "Female" | "Male" | "Other" | "";
  age: number | ""; // Age in years (will be converted to days for backend)
  height: number | ""; // Height in cm
  weight: number | ""; // Weight in kg
  ap_hi: number | ""; // Systolic blood pressure
  ap_lo: number | ""; // Diastolic blood pressure
  cholesterol: 1 | 2 | 3 | ""; // 1: normal, 2: above normal, 3: well above normal
  gluc: 1 | 2 | 3 | ""; // 1: normal, 2: above normal, 3: well above normal
  smoke: 0 | 1 | ""; // binary
  alco: 0 | 1 | ""; // binary
  active: 0 | 1 | ""; // binary
}

// Define the PredictionResult interface for Cardiovascular Disease
interface PredictionResult {
  prediction: 0 | 1; // 0: No CVD, 1: CVD
  probability_of_heart_disease: number; // Probability of having CVD
  category: string; // "Low Risk", "Medium Risk", "High Risk"
  message?: string;
}

export default function CardioAssessmentPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const supabase = createClientComponentClient<Database>();

  const [formData, setFormData] = useState<CardioFormData>({
    gender: "",
    age: "",
    height: "",
    weight: "",
    ap_hi: "",
    ap_lo: "",
    cholesterol: "",
    gluc: "",
    smoke: "",
    alco: "",
    active: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("gender, date_of_birth, height, weight")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          setError("Failed to load profile data.");
        } else if (data) {
          const profileData: Partial<CardioFormData> = {};

          if (data.gender) {
            // Ensure gender matches expected types
            const normalizedGender =
              data.gender.charAt(0).toUpperCase() +
              data.gender.slice(1).toLowerCase();
            if (["Male", "Female", "Other"].includes(normalizedGender)) {
              profileData.gender = normalizedGender as
                | "Male"
                | "Female"
                | "Other";
            }
          }

          if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--;
            }
            profileData.age = calculatedAge;
          }

          if (data.height !== null && data.height !== undefined) {
            profileData.height = data.height;
          }
          if (data.weight !== null && data.weight !== undefined) {
            profileData.weight = data.weight;
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
    };

    fetchProfile();
  }, [user, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || ""
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
              ? 1
              : 0
            : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    const requiredFields: (keyof CardioFormData)[] = [
      "gender",
      "age",
      "height",
      "weight",
      "ap_hi",
      "ap_lo",
      "cholesterol",
      "gluc",
      "smoke",
      "alco",
      "active",
    ];
    for (const field of requiredFields) {
      if (
        formData[field] === "" ||
        formData[field] === null ||
        (typeof formData[field] === "number" &&
          isNaN(formData[field] as number))
      ) {
        setError(`Please fill in the '${field.replace(/_/g, " ")}' field.`);
        setLoading(false);
        return;
      }
    }

    try {
      // Map gender string to numerical value: Female = 1, Male = 2 (common for this dataset)
      // If "Other" is selected, default to Female's value (1) or handle as per backend's expectation
      let genderValue: number | null = null;
      if (formData.gender === "Female") {
        genderValue = 1;
      } else if (formData.gender === "Male") {
        genderValue = 2;
      } else {
        // If "Other" or empty, default to 1 (Female) to avoid null if backend expects 1 or 2
        genderValue = 1;
      }

      const dataToSend = {
        ...formData,
        gender: genderValue, // Send the mapped numerical gender
        age: Math.floor(Number(formData.age) * 365.25), // Convert age from years to days and ensure it's an integer
        height: Number(formData.height),
        weight: Number(formData.weight),
        ap_hi: Number(formData.ap_hi),
        ap_lo: Number(formData.ap_lo),
        cholesterol: Number(formData.cholesterol),
        gluc: Number(formData.gluc),
        smoke: Number(formData.smoke),
        alco: Number(formData.alco),
        active: Number(formData.active),
      };

      // Ensure all fields are numbers and not null/empty for the backend
      // This loop catches any remaining non-numeric or empty values after initial checks and conversions
      for (const key in dataToSend) {
        const value = dataToSend[key as keyof typeof dataToSend];
        if (
          value === null ||
          value === null ||
          (typeof value === "number" && isNaN(value))
        ) {
          setError(
            `Invalid or missing value for field: ${key.replace(/_/g, " ")}. Please ensure all fields are valid.`
          );
          setLoading(false);
          return;
        }
      }

      const response = await fetch("http://localhost:8000/heart-disease", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data: PredictionResult = await response.json();

      if (!response.ok) {
        // If backend returns a 422, it often includes details in `data.detail`
        const backendErrorDetail = (data as any)?.detail
          ? Array.isArray((data as any).detail)
            ? (data as any).detail
                .map((d: any) => `${d.loc?.join(".")} - ${d.msg}`)
                .join("\n")
            : (data as any).detail
          : JSON.stringify(data);

        setError(
          `Prediction failed (Status: ${response.status}). Details: ${backendErrorDetail}`
        );
        setLoading(false);
        return;
      }

      if (
        data &&
        data.prediction !== undefined &&
        data.probability_of_heart_disease !== undefined
      ) {
        const prediction = data.prediction;
        const probability = data.probability_of_heart_disease;
        let category = "Low Risk";

        if (prediction === 1) {
          // Assuming 1 means CVD is present
          category = "High Risk";
        } else if (probability >= 0.5) {
          // Adjust threshold as needed for Medium Risk
          category = "Medium Risk";
        }

        setPredictionResult({
          prediction,
          probability_of_heart_disease: probability,
          category,
          message: data.message,
        });
      } else {
        setError("Prediction data from the server is incomplete.");
      }
    } catch (err: any) {
      console.error("Frontend: Error during fetch operation:", err);
      setError(
        err.message ||
          "Network error or server unavailable. Please check your connection or if the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
        <p className="text-lg">Loading profile data...</p>
      </div>
    );
  }

  // Common Tailwind classes for select elements
  const selectClasses = `mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900 placeholder-gray-400`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-grow min-h-0
                 bg-gray-50 text-gray-900"
    >
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 space-y-6 shadow-xl rounded-lg bg-white">
          <h1 className="text-3xl font-extrabold text-center text-gray-900">
            Cardiovascular Disease Risk Assessment
          </h1>
          <p className="text-center text-gray-600 text-lg">
            Provide your health information to get a cardiovascular disease risk
            prediction.
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
          >
            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={!!formData.gender} // Disable if fetched from profile
                className={`${selectClasses} ${
                  !!formData.gender ? "bg-gray-100 cursor-not-allowed" : ""
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
              label="Age (Years)"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., 35"
              required
              readOnly={!!formData.age} // Read-only if fetched from profile
              className={`${
                !!formData.age ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            {/* Height */}
            <Input
              label="Height (cm)"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g., 170"
              step="1"
              required
              readOnly={!!formData.height} // Read-only if fetched from profile
              className={`${
                !!formData.height ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            {/* Weight */}
            <Input
              label="Weight (kg)"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g., 70.5"
              step="0.1"
              required
              readOnly={!!formData.weight} // Read-only if fetched from profile
              className={`${
                !!formData.weight ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            {/* Systolic Blood Pressure */}
            <Input
              label="Systolic BP (ap_hi)"
              type="number"
              name="ap_hi"
              value={formData.ap_hi}
              onChange={handleChange}
              placeholder="e.g., 120"
              required
            />

            {/* Diastolic Blood Pressure */}
            <Input
              label="Diastolic BP (ap_lo)"
              type="number"
              name="ap_lo"
              value={formData.ap_lo}
              onChange={handleChange}
              placeholder="e.g., 80"
              required
            />

            {/* Cholesterol */}
            <div>
              <label
                htmlFor="cholesterol"
                className="block text-sm font-medium text-gray-700"
              >
                Cholesterol
              </label>
              <select
                id="cholesterol"
                name="cholesterol"
                value={formData.cholesterol}
                onChange={handleChange}
                required
                className={selectClasses}
              >
                <option value="">Select Level</option>
                <option value={1}>Normal</option>
                <option value={2}>Above Normal</option>
                <option value={3}>Well Above Normal</option>
              </select>
            </div>

            {/* Glucose */}
            <div>
              <label
                htmlFor="gluc"
                className="block text-sm font-medium text-gray-700"
              >
                Glucose
              </label>
              <select
                id="gluc"
                name="gluc"
                value={formData.gluc}
                onChange={handleChange}
                required
                className={selectClasses}
              >
                <option value="">Select Level</option>
                <option value={1}>Normal</option>
                <option value={2}>Above Normal</option>
                <option value={3}>Well Above Normal</option>
              </select>
            </div>

            {/* Smoking */}
            <div>
              <label
                htmlFor="smoke"
                className="block text-sm font-medium text-gray-700"
              >
                Smoking
              </label>
              <select
                id="smoke"
                name="smoke"
                value={formData.smoke}
                onChange={handleChange}
                required
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {/* Alcohol Intake */}
            <div>
              <label
                htmlFor="alco"
                className="block text-sm font-medium text-gray-700"
              >
                Alcohol Intake
              </label>
              <select
                id="alco"
                name="alco"
                value={formData.alco}
                onChange={handleChange}
                required
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {/* Physical Activity */}
            <div>
              <label
                htmlFor="active"
                className="block text-sm font-medium text-gray-700"
              >
                Physical Activity
              </label>
              <select
                id="active"
                name="active"
                value={formData.active}
                onChange={handleChange}
                required
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center col-span-full">
                {error}
              </p>
            )}

            <LoadingButton
              type="submit"
              loading={loading}
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
                  ? "bg-red-100 text-red-800"
                  : predictionResult.category === "Medium Risk"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              <h3 className="font-semibold text-lg">Prediction Result:</h3>
              <p className="text-xl font-bold">{predictionResult.category}</p>
              <p>
                Probability of CVD:{" "}
                {(
                  Number(predictionResult.probability_of_heart_disease) * 100
                ).toFixed(2)}
                %
              </p>
              <p className="text-sm mt-2">
                This prediction is based on the provided data and our model's
                assessment. Please consult a healthcare professional for
                diagnosis and personalized advice.
              </p>
              {/* Assuming Button component exists and works with router.push */}
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
