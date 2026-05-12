import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 数据库已从 Supabase 迁移到本地 SQLite，此检查仅作参考
export const hasDatabase = true;

export const FAMILY_SURNAME = process.env.NEXT_PUBLIC_FAMILY_SURNAME || "刘";
