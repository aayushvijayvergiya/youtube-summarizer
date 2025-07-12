"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { apiService } from "@/service/apiService";

interface FormData {
  name: string;
  username: string;
  email?: string;
  password: string;
}

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { login } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const toggleMode = () => {
    setIsSignup((prev) => !prev);
    reset();
    setError("");
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (isSignup) {
        await apiService.post("/auth/signup", {
          username: data.username,
          email: data.email,
          password: data.password,
          name: data.name,
        });
        toast.success("Signup successful! Please signin.");
        toggleMode();
      } else {
        const res = await apiService.post<{ access_token: string }>(
          "/auth/signin",
          {
            username: data.username,
            password: data.password,
          }
        );
        toast.success("Signin successful!");
        await login(res.access_token); // Update the context with the token
        router.push("/summary");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError((err as Error).message || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
      console.error(err);
      toast.error("An error occurred during authentication");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isSignup ? "Signup" : "Signin"}
      </h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="text"
          {...register("username", { required: "Username is required" })}
          placeholder="Username"
          className="border p-2 rounded"
        />
        {errors.username && (
          <p className="text-red-500">{errors.username.message}</p>
        )}
        {isSignup && (
          <>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              placeholder="Full Name"
              className="border p-2 rounded"
            />
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="Email"
              className="border p-2 rounded"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </>
        )}
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
          })}
          placeholder="Password"
          className="border p-2 rounded"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          {isSignup ? "Signup" : "Signin"}
        </button>
      </form>
      <div className="text-center mt-4">
        <button
          onClick={toggleMode}
          className="text-blue-500 underline cursor-pointer"
        >
          {isSignup
            ? "Already have an account? Signin"
            : "Don't have an account? Signup"}
        </button>
      </div>
    </div>
  );
}
