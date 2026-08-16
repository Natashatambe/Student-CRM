import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeStatus(status) {
  if (!status) return "Enquiry";
  const s = String(status).trim().toLowerCase();
  if (s === "active") return "Active";
  if (s === "pending") return "Pending";
  if (s === "inactive") return "Inactive";
  if (s === "enquiry" || s === "enquired") return "Enquiry";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

