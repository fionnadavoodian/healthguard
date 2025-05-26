// components/InitialMedicalInfoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import LoadingButton from "./LoadingButton";
import Input from "./Input";
import { HeartIcon, UserIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { parseISO, differenceInYears } from "date-fns";
import { motion } from "framer-motion";

interface InitialMedicalInfoFormProps {
  user: User;
  supabase: SupabaseClient;
  onInfoSaved: () => void;
  isEditMode?: boolean;
}

interface FormData {
  date_of_birth: string;
  gender: string;
  weight: string;
  height: string;
  common_diseases: string[];
  avatar_url: string;
}

const COMMON_DISEASES = [
  "Hypertension",
  "Diabetes Type 2",
  "Asthma",
  "Arthritis",
  "Migraine",
  "Allergies",
  "None",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const calculateBMI = (weightKg: number | string, heightCm: number | string) => {
  const parsedWeight = Number(weightKg);
  const parsedHeight = Number(heightCm);
  if (
    !parsedWeight ||
    !parsedHeight ||
    parsedWeight <= 0 ||
    parsedHeight <= 0
  ) {
    return null;
  }
  const heightM = parsedHeight / 100;
  const bmi = parsedWeight / (heightM * heightM);
  return parseFloat(bmi.toFixed(2));
};

export default function InitialMedicalInfoForm({
  user,
  supabase,
  onInfoSaved,
  isEditMode = false,
}: InitialMedicalInfoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    date_of_birth: "",
    gender: "",
    weight: "",
    height: "",
    common_diseases: [],
    avatar_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    date_of_birth?: string;
    gender?: string;
    weight?: string;
    height?: string;
    common_diseases?: string;
    avatar?: string;
  }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(
          "Error fetching profile:",
          JSON.stringify(error, null, 2)
        );
        toast.error("Failed to load profile data.");
      } else if (data) {
        setFormData({
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          common_diseases: Array.isArray(data.common_diseases)
            ? data.common_diseases
            : [],
          avatar_url: data.avatar_url || "",
        });
        setAvatarPreview(data.avatar_url || null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user.id, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setFormData((prev) => {
      let updatedData = { ...prev, [name]: value };

      if (name === "common_diseases") {
        const currentDiseases = Array.isArray(prev.common_diseases)
          ? prev.common_diseases
          : [];
        if (checked) {
          if (value === "None") {
            updatedData.common_diseases = ["None"];
          } else {
            updatedData.common_diseases = [
              ...currentDiseases.filter((d: string) => d !== "None"),
              value,
            ];
          }
        } else {
          updatedData.common_diseases = currentDiseases.filter(
            (d: string) => d !== value
          );
        }
      }
      return updatedData;
    });

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof newErrors];
        return newErrors;
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, avatar: undefined }));
    } else {
      setAvatarFile(null);
      setAvatarPreview(formData.avatar_url || null);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return formData.avatar_url;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      setLoading(true);
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        avatar: error.message || "Failed to upload avatar",
      }));
      toast.error(
        `Avatar upload failed: ${error.message || "Please try again."}`
      );
      return null;
    } finally {
      // setLoading(false) is handled in handleSubmit's finally block
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
      isValid = false;
    } else {
      const dob = parseISO(formData.date_of_birth);
      const age = differenceInYears(new Date(), dob);
      if (age < 1 || age > 120) {
        newErrors.date_of_birth =
          "Please enter a valid date of birth (age between 1-120)";
        isValid = false;
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = "Please enter a valid weight in kg";
      isValid = false;
    }
    if (isNaN(Number(formData.height)) || Number(formData.height) <= 0) {
      newErrors.height = "Please enter a valid height in cm";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit called!");
    e.preventDefault();

    const formIsValid = validateForm();
    console.log("Form Validation Result:", formIsValid);

    if (!formIsValid) {
      toast.error("Please correct the form errors.");
      console.log("Validation failed, returning.");
      return;
    }

    setLoading(true);
    console.log("Loading set to true.");
    let newAvatarUrl: string | null = formData.avatar_url;

    if (avatarFile) {
      console.log("Avatar file detected, attempting upload.");
      newAvatarUrl = await uploadAvatar();
      console.log("Avatar upload result:", newAvatarUrl ? "Success" : "Failed");
      if (!newAvatarUrl) {
        setLoading(false);
        console.log("Avatar upload failed, returning.");
        return;
      }
    }

    const calculatedBmi = calculateBMI(formData.weight, formData.height);
    console.log("BMI calculated:", calculatedBmi);

    try {
      const profileDataToSave = {
        id: user.id,
        email: user.email || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        common_diseases: formData.common_diseases,
        avatar_url: newAvatarUrl,
        has_initial_medical_info: true,
      };

      console.log("Attempting profiles upsert with data:", profileDataToSave);
      const { error } = await supabase
        .from("profiles")
        .upsert(profileDataToSave, { onConflict: "id" });

      if (error) {
        console.error("Supabase profiles upsert error:", error);
        throw error;
      }
      console.log("Profiles upsert successful.");

      console.log("Attempting user metadata update...");
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          weight: Number(formData.weight),
          height: Number(formData.height),
          common_diseases: formData.common_diseases,
          avatar_url: newAvatarUrl,
          has_initial_medical_info: true,
          bmi: calculatedBmi, // Ensure your user_metadata schema in Supabase allows for 'bmi'
        },
      });

      if (userUpdateError) {
        console.error("Supabase user metadata update error:", userUpdateError);
        throw userUpdateError;
      }
      console.log("User metadata update successful.");

      toast.success("Basic medical information saved successfully!");
      onInfoSaved();
      console.log("onInfoSaved called.");
    } catch (err: any) {
      console.error("Caught error during save process:", err);
      toast.error(`Failed to save info: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
      console.log("Loading set to false (finally block).");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-center min-h-[calc(100vh-var(--navbar-height))] px-4 md:px-6 ${isEditMode ? "py-0" : "py-4 md:py-6"}`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl overflow-hidden transform transition-all duration-300 ${isEditMode ? "" : "hover:shadow-3xl"}`}
      >
        {!isEditMode && (
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              Complete Your Health Profile
            </h2>
            <p className="text-sm sm:text-base opacity-90">
              Just a few details to unlock personalized health insights.
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          <div className="flex flex-col items-center gap-2 mb-2">
            <label htmlFor="avatar-upload" className="relative cursor-pointer">
              {avatarPreview || formData.avatar_url ? (
                <img
                  src={avatarPreview || formData.avatar_url}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover border-3 border-indigo-400 dark:border-indigo-600 shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    setAvatarPreview(null);
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 border-3 border-indigo-400 dark:border-indigo-600 shadow-md">
                  <PhotoIcon className="w-8 h-8" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-1.5 text-white shadow-md">
                <PhotoIcon className="w-3.5 h-3.5" />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={loading}
              />
            </label>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Click to upload avatar (optional)
            </span>
            {errors.avatar && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.avatar}
              </p>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-1.5">
              <UserIcon className="w-4.5 h-4.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />{" "}
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Date of Birth"
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                error={errors.date_of_birth}
                disabled={loading}
              />
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                    errors.gender
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select your gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.gender}
                  </p>
                )}
              </div>
              <Input
                label="Weight (kg)"
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 70.5"
                error={errors.weight}
                disabled={loading}
              />
              <Input
                label="Height (cm)"
                id="height"
                name="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 175.0"
                error={errors.height}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-1.5">
              <HeartIcon className="w-4.5 h-4.5 mr-1.5 text-red-500 dark:text-red-400" />
              Common Health Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 bg-gray-50">
              {COMMON_DISEASES.map((disease) => (
                <label
                  key={disease}
                  className="flex items-center text-gray-700 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    name="common_diseases"
                    value={disease}
                    checked={formData.common_diseases.includes(disease)}
                    onChange={handleChange}
                    className="form-checkbox h-3.5 w-3.5 text-indigo-600 transition duration-150 ease-in-out dark:bg-gray-800 dark:border-gray-500 rounded focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <span className="ml-1.5 text-xs text-gray-700 dark:text-white">
                    {disease}
                  </span>
                </label>
              ))}
            </div>
            {errors.common_diseases && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.common_diseases}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-3 gap-2">
            {isEditMode && (
              <button
                type="button"
                onClick={() => onInfoSaved()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
            <LoadingButton
              type="submit"
              loading={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-6 py-2.5 rounded-lg text-base font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Save My Profile
            </LoadingButton>
          </div>
        </form>{" "}
      </div>
    </motion.div>
  );
}
