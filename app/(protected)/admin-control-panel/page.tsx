import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/AdminPanel";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminControlPanelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen py-12 px-5">
      <div className="mb-12 flex justify-between items-center">
        <Link href="/dashboard" className="font-mono text-dim hover:text-ink text-sm uppercase tracking-widest transition-colors">
          ← Volver al Dashboard
        </Link>
        <div className="flex items-center gap-6">
          <Eyebrow className="hidden md:block">LA BOLSA · PANEL ADMIN</Eyebrow>
          <div className="flex items-center gap-4 border border-hair2 rounded-full px-4 py-1 bg-raise">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <Eyebrow className="text-ink">{user?.email}</Eyebrow>
          </div>
          <LogoutButton />
        </div>
      </div>
      
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
