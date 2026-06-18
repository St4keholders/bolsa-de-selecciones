import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BackgroundMundialista from "@/components/BackgroundMundialista";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <BackgroundMundialista />
      <div className="w-full max-w-none mx-auto min-h-screen relative z-10 px-4 xl:px-8">
        {children}
      </div>
    </>
  );
}
