"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileState {
  status: "idle" | "success" | "error";
  message?: string;
}

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Kräver Supabase-konfiguration." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Logga in först." };

  const patch = {
    full_name: String(formData.get("fullName") ?? "").trim() || null,
    legal_name: String(formData.get("legalName") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
  };

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/profile");
  return { status: "success", message: "Profilen är sparad." };
}

export async function uploadAvatar(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Kräver Supabase-konfiguration." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Logga in först." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Välj en bildfil." };
  }
  if (file.size > MAX_BYTES) return { status: "error", message: "Bilden är för stor (max 6 MB)." };

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${user.id}/avatar.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (upErr) return { status: "error", message: `Kunde inte ladda upp: ${upErr.message}` };

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust on re-upload
  await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { status: "success", message: "Profilbilden är uppdaterad." };
}

export async function uploadIdDocument(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Kräver Supabase-konfiguration." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Logga in först." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Välj en bild eller PDF av din legitimation." };
  }
  if (file.size > MAX_BYTES) return { status: "error", message: "Filen är för stor (max 6 MB)." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/id-document.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("id-documents")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (upErr) return { status: "error", message: `Kunde inte ladda upp: ${upErr.message}` };

  const { error } = await supabase
    .from("profiles")
    .update({ id_document_path: path, id_status: "pending" })
    .eq("id", user.id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: "Tack! Din legitimation är inskickad och granskas.",
  };
}
