"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileState {
  status: "idle" | "success" | "error";
  message?: string;
}

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

/**
 * Never trust `file.name` or `file.type` — both are attacker-controlled. A file
 * called `x.html` sent as `text/html` would otherwise be stored verbatim in the
 * public avatars bucket and served as a live page from a trusted domain, and a
 * name like `a.png/../../victim/avatar.png` would escape the owner's folder.
 * Sniff the magic bytes instead and derive both the type and the extension.
 */
const SIGNATURES = [
  { mime: "image/jpeg", ext: "jpg", test: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b: Uint8Array) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b: Uint8Array) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    mime: "application/pdf",
    ext: "pdf",
    test: (b: Uint8Array) =>
      b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
] as const;

async function sniff(file: File, allowed: readonly string[]) {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const match = SIGNATURES.find((s) => allowed.includes(s.mime) && s.test(head));
  return match ?? null;
}

/** Shared guard: size, real content type, and a safe storage path. */
async function checkUpload(formData: FormData, allowed: readonly string[], label: string) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: `Välj ${label}.` } as const;
  }
  if (file.size > MAX_BYTES) {
    return { error: "Filen är för stor (max 6 MB)." } as const;
  }
  const kind = await sniff(file, allowed);
  if (!kind) {
    return { error: "Filformatet stöds inte. Använd JPG, PNG, WEBP eller PDF." } as const;
  }
  return { file, kind } as const;
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

  const checked = await checkUpload(formData, ["image/jpeg", "image/png", "image/webp"], "en bildfil");
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

  const checked = await checkUpload(
    formData,
    ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    "en bild eller PDF av din legitimation",
  );
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
