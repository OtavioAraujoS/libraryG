import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Library, Gamepad2 } from "lucide-react";

export function HeroBanner({ totalGames }: { totalGames: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 sm:px-10 sm:py-20">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, #650000, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #490000, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-start gap-5">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Gamepad2 className="h-3.5 w-3.5 text-primary" />
          Sua coleção, um só lugar
        </div>

        <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Toda a sua biblioteca de jogos,{" "}
          <span className="text-primary">finalmente reunida</span>.
        </h1>

        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          Steam, Epic Games e GOG centralizados em um único painel — sem
          precisar abrir três launchers pra lembrar o que você já tem.
        </p>

        <div className="mt-2 flex items-center gap-4">
          <Button
            size="lg"
            className="gap-2"
            nativeButton={false}
            render={<Link href="/library" />}
          >
            <Library className="h-4 w-4" />
            Ver minha biblioteca
          </Button>

          {totalGames > 0 && (
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{totalGames}</strong> jogos
              catalogados
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
