import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function isAuthorized(req: NextRequest, routeName: string): boolean {
  const secret = process.env.SYNC_SECRET;

  if (!secret) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  const secFetchSite = req.headers.get("sec-fetch-site");
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return true;
  }

  if (
    origin &&
    host &&
    (origin.includes(host) || host.includes(origin.replace(/^https?:\/\//, "")))
  ) {
    return true;
  }

  logger.warn(`Tentativa de acesso não autorizada na rota [${routeName}]`);
  return false;
}
