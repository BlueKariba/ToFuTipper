import { getAdminSession } from "@/lib/admin";
import AdminClient from "@/app/components/AdminClient";
import AdminLogin from "@/app/components/AdminLogin";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLogin />;
  }

  return <AdminClient />;
}
