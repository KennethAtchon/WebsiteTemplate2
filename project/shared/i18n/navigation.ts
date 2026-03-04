// With localePrefix: 'never', we don't need locale-aware navigation
// Just re-export standard Next.js navigation
export { default as Link } from "next/link";
export { redirect } from "next/navigation";
export { usePathname, useRouter } from "next/navigation";
