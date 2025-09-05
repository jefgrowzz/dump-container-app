"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initial?: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthModal({
  open,
  onClose,
  initial = "login",
  onSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initial);
  const router = useRouter();

  useEffect(() => {
    if (open) setActiveTab(initial);
  }, [open, initial]);

  const handleRedirect = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return;
    }

    if (data?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/containers");
    }
  };

  const handleSuccess = async () => {
    await handleRedirect(); // redirect immediately
    onSuccess?.();          // optional callback
    onClose();              // close modal
  };

  return (
    <Transition appear show={!!open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-70"
          leave="ease-in duration-200"
          leaveFrom="opacity-70"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-gradient-to-b from-gray-900/95 to-gray-900 rounded-2xl shadow-xl p-6 space-y-6 text-gray-100 ring-1 ring-white/5">
              <Dialog.Title className="text-2xl font-bold text-center">
                {activeTab === "login" ? "Welcome back" : "Create an account"}
              </Dialog.Title>

              <div className="flex justify-center space-x-4 border-b border-gray-700 pb-2 mb-2">
                <button
                  type="button"
                  className={`pb-2 px-3 font-semibold transition-colors ${
                    activeTab === "login"
                      ? "border-b-2 border-green-400 text-green-400"
                      : "text-gray-400 hover:text-green-300"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={`pb-2 px-3 font-semibold transition-colors ${
                    activeTab === "register"
                      ? "border-b-2 border-green-400 text-green-400"
                      : "text-gray-400 hover:text-green-300"
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
              </div>

              <div>
                {activeTab === "login" ? (
                  <LoginForm onSuccess={handleSuccess} />
                ) : (
                  <RegisterForm onSuccess={handleSuccess} />
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-2 py-2 text-gray-300 hover:text-green-400 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

// ---------------- Login Form ----------------
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-400">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-gradient-to-r from-green-400 to-green-500 text-gray-900 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 transform hover:scale-[1.01] transition"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

// ---------------- Register Form ----------------
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "client", // auto role assignment
        },
      },
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-400">{error}</div>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-gradient-to-r from-green-400 to-green-500 text-gray-900 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 transform hover:scale-[1.01] transition"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
