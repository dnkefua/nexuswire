import { AdminGate } from "@/components/AdminGate";

/**
 * Gates all /admin/* routes behind admin verification. The UI gate is for UX —
 * the underlying admin data (articles, sources) is public-read, and all
 * mutations are independently protected server-side via requireAdmin().
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
