"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Database,
  Key,
  RefreshCw,
  Terminal,
  Zap,
} from "lucide-react";

interface SetupGuideCardProps {
  error?: string | null;
  errorCode?: string | null;
  errorHint?: string | null;
  onRetry: () => void | Promise<void>;
}

export function SetupGuideCard({
  error,
  errorCode,
  errorHint,
  onRetry,
}: Readonly<SetupGuideCardProps>) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const isDbInitError =
    errorCode === "DATABASE_NOT_INITIALIZED" ||
    (error &&
      (error.toLowerCase().includes("banco") ||
        error.toLowerCase().includes("table") ||
        error.toLowerCase().includes("sqlite")));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-card p-6 shadow-sm sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, #f59e0b, transparent 70%)",
        }}
      />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {isDbInitError
                  ? "Inicialização do Banco de Dados Necessária"
                  : "Configuração do Painel Pendente"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {error ||
                  "Siga os passos abaixo para concluir a configuração inicial e visualizar suas métricas."}
              </p>
              {errorHint && (
                <p className="mt-2 text-xs font-medium text-amber-500/90">
                  💡 Dica: {errorHint}
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="shrink-0 gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Verificando..." : "Tentar novamente"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Database className="h-4 w-4" />
                PASSO 1: BANCO DE DADOS
              </div>
              <h3 className="text-sm font-medium text-foreground">
                Sincronizar Schema Local
              </h3>
              <p className="text-xs text-muted-foreground">
                Cria as tabelas SQLite locais (`dev.db`) automaticamente pelo
                Prisma.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/60 px-3 py-2">
              <code className="text-xs font-mono text-foreground">
                npx prisma db push
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard("npx prisma db push", 1)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copiar comando"
              >
                {copiedIndex === 1 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Key className="h-4 w-4" />
                PASSO 2: CONFIGURAR .ENV
              </div>
              <h3 className="text-sm font-medium text-foreground">
                Copiar Variáveis de Ambiente
              </h3>
              <p className="text-xs text-muted-foreground">
                Crie seu arquivo <code className="font-mono">.env</code> a
                partir do modelo <code className="font-mono">.env.example</code>
                .
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/60 px-3 py-2">
              <code className="text-xs font-mono text-foreground">
                cp .env.example .env
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard("cp .env.example .env", 2)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copiar comando"
              >
                {copiedIndex === 2 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Zap className="h-4 w-4" />
                PASSO 3: SINCRONIZAR
              </div>
              <h3 className="text-sm font-medium text-foreground">
                Importar Coleção de Jogos
              </h3>
              <p className="text-xs text-muted-foreground">
                Adicione suas credenciais no{" "}
                <code className="font-mono">.env</code> e clique em
                &quot;Sincronizar agora&quot;.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/60 px-3 py-2">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Terminal className="h-3.5 w-3.5" />
                Pronto para usar
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-500">
                Automático
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
