"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-xs font-mono uppercase tracking-widest font-medium text-dim hover:text-ink transition-colors neumo-small md:bg-transparent md:shadow-none md:border-0 md:rounded-none"
    >
      <LogOut className="w-3 h-3 md:w-4 md:h-4" />
      <span>Salir</span>
    </button>
  );
}
