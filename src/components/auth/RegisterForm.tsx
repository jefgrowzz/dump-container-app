import { supabase } from "@/lib/supabaseClient";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSubmitting(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    setError(error.message);
    setSubmitting(false);
  } else {
    onSuccess();
  }
};
