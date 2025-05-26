// components/auth/AuthForm.tsx
"use client";

import { useForm, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { supabase } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(type === "login" ? loginSchema : registerSchema),
  });

  const password = watch("password");

  const registerErrors = errors as FieldErrors<RegisterFormData>;

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setLoading(true);
    try {
      if (type === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast.success("Logged in successfully!");
        router.push("/account");
      } else {
        const registerData = data as RegisterFormData;
        const { error } = await supabase.auth.signUp({
          email: registerData.email,
          password: registerData.password,
          options: {
            data: {
              name: registerData.name,
            },
          },
        });
        if (error) throw error;
        toast.success(
          "Registration successful! Please check your email for confirmation."
        );
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      console.error("Auth error:", error);
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
          error={registerErrors.name?.message}
          disabled={loading}
        />
      )}
      <Input
        label="Email Address"
        id="email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        disabled={loading}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
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
          error={registerErrors.confirmPassword?.message}
          disabled={loading}
        />
      )}
      <Button type="submit" className="w-full" isLoading={loading}>
        {type === "login" ? "Sign In" : "Register"}
      </Button>
    </form>
  );
}
