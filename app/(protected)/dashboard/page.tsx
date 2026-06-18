import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { MatchNotifier } from "@/components/MatchNotifier";
import { DashboardTabs } from "@/components/DashboardTabs";
import { PartnerBanner } from "@/components/PartnerBanner";

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
      <PartnerBanner userId={user.id} />

      <main className="flex-1 flex flex-col">
        <DashboardTabs userId={user.id} />
      </main>
    </div>
  );
}

