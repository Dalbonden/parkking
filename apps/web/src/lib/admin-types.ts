// Server-free types shared by the admin server code, its server actions, and
// the client queue component. Must not import server-only modules (next/headers)
// or the client bundle would break — same rule as profile-types.ts.

import type { Category } from "./types";

export interface AdminActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export interface PendingListing {
  id: string;
  title: string;
  category: Category;
  city: string;
  area: string;
  pricePerMonth: number;
  description: string | null;
  consentVerified: boolean;
  createdAt: string;
  hostName: string | null;
  hostLegalName: string | null;
  hostIdStatus: string;
}

export interface PendingIdentity {
  userId: string;
  fullName: string | null;
  legalName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  /** Short-lived signed URL to the private ID document, or null. */
  docUrl: string | null;
  createdAt: string;
}

export interface ModerationQueue {
  listings: PendingListing[];
  identities: PendingIdentity[];
}
