// Server-free profile types + labels, safe to import from Client Components.
export type IdStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Profile {
  fullName: string | null;
  legalName: string | null;
  avatarUrl: string | null;
  idStatus: IdStatus;
  phone: string | null;
  bio: string | null;
}

export const ID_STATUS_LABEL: Record<IdStatus, string> = {
  unverified: "Ej verifierad",
  pending: "Under granskning",
  verified: "Verifierad",
  rejected: "Avvisad",
};
