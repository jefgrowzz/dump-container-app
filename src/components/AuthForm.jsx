import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthForm({ isRegister, setIsRegister, closeModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (isRegister) {
      // Register user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Create profile with default role "client"
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, email: data.user.email, role: "client" }]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      alert("Registration successful! Check your email for confirmation.");
    } else {
      // Login user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Fetch user role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user role:", profileError);
        setError("Could not determine user role.");
        return;
      }

      // Redirect based on role
      if (profileData.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/containers";
      }

      closeModal();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 border rounded-lg text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {isRegister && (
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 border rounded-lg text-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      )}
      <button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold"
      >
        {isRegister ? "Register" : "Login"}
      </button>
    </form>
  );
}
