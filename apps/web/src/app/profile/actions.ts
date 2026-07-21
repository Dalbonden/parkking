"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkUpload, IMAGE_MIME, ID_DOC_MIME } from "@/lib/uploads";

export interface ProfileState {
  status: "idle" | "success" | "error";
  message?: string;
}

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

  // Length caps mirror the CHECK constraints in migration 0008 so the user gets
  // a clean form instead of a database error.
  const field = (name: string, max: number) =>
    String(formData.get(name) ?? "").trim().slice(0, max) || null;

  const patch = {
    full_name: field("fullName", 120),
    legal_name: field("legalName", 120),
    phone: field("phone", 32),
    bio: field("bio", 1000),
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

  const checked = await checkUpload(formData, IMAGE_MIME, "en bildfil");
  if ("error" in checked) return { status: "error", message: checked.error };
  const { file, kind } = checked;

  const path = `${user.id}/avatar.${kind.ext}`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: kind.mime });
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

  const checked = await checkUpload(formData, ID_DOC_MIME, "en bild eller PDF av din legitimation");
  if ("error" in checked) return { status: "error", message: checked.error };
  const { file, kind } = checked;

  const path = `${user.id}/id-document.${kind.ext}`;
  const { error: upErr } = await supabase.storage
    .from("id-documents")
    .upload(path, file, { upsert: true, contentType: kind.mime });
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
