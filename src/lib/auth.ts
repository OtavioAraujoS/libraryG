import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function isAuthorized(req: NextRequest, routeName: string): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return true;

  const authHeader = req.headers.get("authorization");
  const authorized = authHeader === `Bearer ${secret}`;

  if (!authorized) {
    logger.warn(`Tentativa de acesso não autorizada na rota [${routeName}]`);
  }

  return authorized;
}
