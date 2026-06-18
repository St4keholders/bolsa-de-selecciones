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
      className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-widest font-medium text-dim hover:text-ink transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>Salir</span>
    </button>
  );
}
