import { cookies } from "next/headers";
import { getRole } from "@/lib/rbac";
import { RoleSwitcher } from "@/components/RoleSwitcher";

export const metadata = { title: "Role switcher · Page Studio" };

export default async function RolesPage() {
  const role = getRole((await cookies()).get("role")?.value);

  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Role switcher</h1>
        <p className="text-sm text-muted-foreground">
          Simulated identity for RBAC. The selected role is stored in a cookie and
          enforced server-side: viewers are redirected away from the studio, and the
          publish endpoint rejects anyone who is not a publisher — even via a direct
          request. UI is never the security boundary.
        </p>
      </div>
      <RoleSwitcher current={role} />
    </main>
  );
}
