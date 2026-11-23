import type { Role } from "./types";

// Centralized role-based capability checks.
export const canManageDocuments = (role: Role): boolean =>
  role === "admin" || role === "hr";

export const canManageUsers = (role: Role): boolean => role === "admin";

export const canViewAllAudit = (role: Role): boolean => role === "admin";
