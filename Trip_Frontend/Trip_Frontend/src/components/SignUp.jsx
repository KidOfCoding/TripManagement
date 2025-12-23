import { useState } from "react";
import api from "../api/axios";

export default function Signup({ onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSignup = async () => {
    console.log(form);
    
    try {
      await api.post("/auth/register", form);
      alert("Account created successfully. Please login.");
      onSwitch(); // go to login
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="bg-white rounded-xl p-8 w-[420px]">
        <h2 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign up to get started
        </p>

        <input
          className="w-full border rounded-lg px-4 py-2 mb-4"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="w-full border rounded-lg px-4 py-2 mb-4"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full border rounded-lg px-4 py-2 mb-6"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Sign Up
        </button>

        <p
          onClick={onSwitch}
          className="text-center mt-4 text-sm text-blue-600 cursor-pointer"
        >
          Already have an account? Sign In
        </p>
      </div>
    </div>
  );
}
