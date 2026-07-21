// Shared, trust-nothing file validation for uploads. Never trust `file.name` or
// `file.type` — both are attacker-controlled. We sniff the magic bytes and
// derive the real type + extension, so a file called `x.html` sent as
// `text/html` can't land in a public bucket, and a crafted name can't escape
// the owner's folder.

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6 MB

export interface SniffedFile {
  mime: string;
  ext: string;
}

const SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    mime: "application/pdf",
    ext: "pdf",
    test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
];

export async function sniffUpload(
  file: File,
  allowed: readonly string[],
): Promise<SniffedFile | null> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const match = SIGNATURES.find((s) => allowed.includes(s.mime) && s.test(head));
  return match ? { mime: match.mime, ext: match.ext } : null;
}

/** Validate size + real content type. Returns the file and its sniffed kind. */
export async function checkUpload(
  formData: FormData,
  allowed: readonly string[],
  chooseLabel: string,
  field = "file",
): Promise<{ error: string } | { file: File; kind: SniffedFile }> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return { error: `Välj ${chooseLabel}.` };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Filen är för stor (max 6 MB)." };
  const kind = await sniffUpload(file, allowed);
  if (!kind) return { error: "Filformatet stöds inte. Använd JPG, PNG, WEBP eller PDF." };
  return { file, kind };
}

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ID_DOC_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
