type LogLevel = "info" | "warn" | "error";

function formatContext(context: unknown): unknown {
  if (context instanceof Error) {
    return {
      name: context.name,
      message: context.message,
      stack: context.stack,
      ...(context as unknown as Record<string, unknown>),
    };
  }
  return context;
}

function log(level: LogLevel, message: string, context?: unknown): void {
  const formattedContext =
    context !== undefined ? formatContext(context) : undefined;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(formattedContext !== undefined ? { context: formattedContext } : {}),
  };

  if (level === "error") {
    process.stderr.write(JSON.stringify(entry) + "\n");
  } else {
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}

export const logger = {
  info: (message: string, context?: unknown) => log("info", message, context),
  warn: (message: string, context?: unknown) => log("warn", message, context),
  error: (message: string, context?: unknown) => log("error", message, context),
};
