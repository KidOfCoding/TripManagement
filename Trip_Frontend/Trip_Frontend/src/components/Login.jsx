import { useState } from "react";
import api from "../api/axios";

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (error) {
      console.error(error); // Using the error variable to avoid unused vars
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="bg-white rounded-xl p-8 w-[420px]">
        <h2 className="text-2xl font-bold text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your account
        </p>

        <input
          className="w-full border rounded-lg px-4 py-2 mb-4"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border rounded-lg px-4 py-2 mb-6"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Sign In
        </button>

        <p
          onClick={onSwitch}
          className="text-center mt-4 text-sm text-blue-600 cursor-pointer"
        >
          Don’t have an account? Sign Up
        </p>
      </div>
    </div>
  );
}
