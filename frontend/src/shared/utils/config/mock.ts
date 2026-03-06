/**
 * Mock data and helper functions using Prisma types
 */
// import {
//   Order as PrismaOrder,
//   User as PrismaUser,
//   Prisma as _Prisma,
// } from "@/infrastructure/database/lib/generated/prisma";

// TODO: Replace with actual Prisma types when database is integrated
export interface PrismaOrder {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prisma {
  // Add Prisma types as needed
}

// Extended types for UI components with computed fields
export interface OrderWithDetails extends Omit<PrismaOrder, "user"> {
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  products?: { name: string; quantity: number; price: number }[];
}

// Re-export Prisma types for convenience
export type { PrismaOrder as Order, PrismaUser as User };

/**
 * Legacy mock data - kept for backward compatibility
 */
export interface MockOrder {
  id: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
    initials: string;
  };
  date: string;
  products: { name: string; quantity: number; price: number }[];
  status: string;
  total: string;
}

/**
 * Products mock data
 */
export interface ProductData {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  status: string;
  image: string;
  stock: number;
  popular?: boolean;
  benefits?: string[];
  imageUrl?: string;
}

export function generateUserInitials(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  // Special case: if it's just punctuation and spaces, return all non-space chars
  if (/^[^\w]*$/.test(trimmed)) {
    return trimmed.replace(/\s+/g, "");
  }

  // Split by spaces, then further split hyphenated words
  const words = trimmed.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  // For each word, handle hyphens and apostrophes differently
  const allInitials = [];

  for (const word of words) {
    if (word.includes("-")) {
      // Split hyphenated words like "Jean-Claude" into "J" and "C"
      const hyphenatedParts = word.split("-").filter((part) => part.length > 0);
      for (const part of hyphenatedParts) {
        const cleanPart = part.replace(/^[^\w]+/, ""); // Remove leading punctuation
        if (cleanPart.length > 0) {
          allInitials.push(cleanPart[0]);
        } else if (part.length > 0) {
          allInitials.push(part[0]);
        }
      }
    } else {
      // For words with apostrophes like "O'Connor", treat as single word
      const cleanWord = word.replace(/^[^\w]+/, ""); // Remove leading punctuation
      if (cleanWord.length > 0) {
        allInitials.push(cleanWord[0]);
      } else if (word.length > 0) {
        allInitials.push(word[0]);
      }
    }
  }

  return allInitials.join("").toUpperCase();
}
