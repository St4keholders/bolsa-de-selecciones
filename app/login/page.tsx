"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LogoMundial } from "@/components/icons/LogoMundial";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas relative">
      {/* ← VOLVER */}
      <Link
        href="/"
        className="absolute top-6 left-6 font-mono text-dim hover:text-ink text-xs uppercase tracking-widest transition-colors"
      >
        ← Volver
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center flex flex-col items-center">
          <LogoMundial size={80} className="mb-6" />
          <h1 className="text-display font-display text-4xl font-semibold tracking-tight text-ink">
            Bienvenido de vuelta
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-8">
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@ejemplo.com"
            required
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="mt-4 flex flex-col gap-4">
            {error && (
              <div className="border-l-2 border-danger pl-3 text-danger font-sans text-sm">
                {error}
              </div>
            )}
            
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Iniciando..." : "Ingresar"}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center flex flex-col gap-2">
          <p className="font-sans text-dim text-sm">
            ¿Primera vez? Recibes 5 cartas de bienvenida al registrarte.
          </p>
          <Link href="/register" className="font-mono text-dim hover:text-ink text-sm uppercase tracking-widest transition-colors">
            Crear una cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
