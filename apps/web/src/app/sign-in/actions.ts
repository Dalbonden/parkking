"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthState {
  status: "idle" | "error";
  message?: string;
}

export async function signInWithEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Fyll i e-post och lösenord." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Inloggning kräver Supabase-konfiguration." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Fel e-post eller lösenord." };

  redirect("/dashboard");
}

export async function signUpWithEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!email || password.length < 6) {
    return { status: "error", message: "Ange e-post och ett lösenord på minst 6 tecken." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Registrering kräver Supabase-konfiguration." };

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });
  // Ignore "already registered" so existing users can just sign in below.
  if (signUpError && !/already|registered/i.test(signUpError.message)) {
    return { status: "error", message: signUpError.message };
  }

  // Users are auto-confirmed (see migration 0002) so this establishes a session.
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { status: "error", message: signInError.message };

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
