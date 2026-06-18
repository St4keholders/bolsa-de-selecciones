import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { MatchNotifier } from "@/components/MatchNotifier";
import { DashboardTabs } from "@/components/DashboardTabs";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MatchNotifier />
      <Header userId={user.id} />
      
      {/* Top sticky link to brackets */}
      <div className="w-full bg-[var(--color-mundial-lime)] text-ink flex justify-center py-3 relative z-40 border-b-[3px] border-ink shadow-hard mb-4">
        <Link href="/llaves" className="font-mono text-sm uppercase tracking-widest hover:translate-y-[-2px] transition-all font-bold">
          VER LLAVES DEL TORNEO →
        </Link>
      </div>

      <main className="flex-1 flex flex-col">
        <DashboardTabs userId={user.id} />
      </main>
    </div>
  );
}
