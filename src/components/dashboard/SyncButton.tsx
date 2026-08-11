"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    const toastId = toast.loading("Sincronizando bibliotecas...");

    try {
      const res = await fetch("/api/sync/all", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao sincronizar plataformas.");
      }

      toast.success("Sincronização concluída com sucesso!", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Falha ao sincronizar.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleSync}
      disabled={loading}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Sincronizando..." : "Sincronizar agora"}
    </Button>
  );
}
