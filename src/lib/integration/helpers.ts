export function requireEnvVars<T extends string>(...names: T[]): Record<T, string> {
  const missing = names.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    const varsText = missing.join(" e ");
    const verb = missing.length > 1 ? "configurados" : "configurado";
    throw new Error(`${varsText} não ${verb} no .env`);
  }

  return names.reduce((acc, name) => {
    acc[name] = process.env[name]!;
    return acc;
  }, {} as Record<T, string>);
}

export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<R | null>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    for (const result of batchResults) {
      if (result !== null) {
        results.push(result as R);
      }
    }
  }

  return results;
}
