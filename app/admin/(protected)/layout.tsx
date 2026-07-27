import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  return <AdminShell session={session}>{children}</AdminShell>;
}

