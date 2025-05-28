"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "@/components/Input";
import { Button } from "@/components/Button";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AuthFormProps = {
  type: "login" | "register";
};

type FormData = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { supabase } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch } = useForm<FormData>();

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setErrors({});
    setLoading(true);

    try {
      const schema = type === "login" ? loginSchema : registerSchema;
      schema.parse(data); // validate manually

      if (type === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;
        toast.success("Logged in successfully!");
        router.push("/account");
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.name },
          },
        });

        if (error) throw error;
        toast.success("Registration successful! Check your email.");
        router.push("/login");
      }
    } catch (err: any) {
      if (err?.errors) {
        // Zod validation errors
        const newErrors: Record<string, string> = {};
        for (const issue of err.errors) {
          newErrors[issue.path[0]] = issue.message;
        }
        setErrors(newErrors);
      } else {
        toast.error(err.message || "Unexpected error");
        console.error("Auth error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {type === "register" && (
        <Input
          label="Name"
          id="name"
          type="text"
          {...register("name")}
          error={errors.name}
          disabled={loading}
        />
      )}
      <Input
        label="Email Address"
        id="email"
        type="email"
        {...register("email")}
        error={errors.email}
        disabled={loading}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        {...register("password")}
        error={errors.password}
        disabled={loading}
      />
      {type === "register" && password && (
        <PasswordStrengthMeter password={password} />
      )}
      {type === "register" && (
        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword}
          disabled={loading}
        />
      )}
      <Button type="submit" className="w-full" isLoading={loading}>
        {type === "login" ? "Sign In" : "Register"}
      </Button>
    </form>
  );
}
