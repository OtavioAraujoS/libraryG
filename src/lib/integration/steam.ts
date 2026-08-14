import axios from "axios";
import type { NormalizedGame } from "@/types/game";
import {
  SteamResponseSchema,
  SteamFamilyGroupForUserResponseSchema,
  SteamSharedLibraryResponseSchema,
  SteamPlayerSummariesResponseSchema,
} from "@/types/steam";
import { requireEnvVars } from "@/lib/integration/helpers";
import { logger } from "@/lib/logger";

const STEAM_API_BASE = "https://api.steampowered.com";

export async function fetchSteamMemberNames(
  steamIds: string[],
  apiKey?: string,
): Promise<Record<string, string>> {
  if (!apiKey || steamIds.length === 0) return {};

  try {
    const { data } = await axios.get(
      `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: {
          key: apiKey,
          steamids: steamIds.join(","),
        },
      },
    );

    const parsed = SteamPlayerSummariesResponseSchema.safeParse(data);
    if (!parsed.success) return {};

    const nameMap: Record<string, string> = {};
    for (const player of parsed.data.response.players ?? []) {
      nameMap[player.steamid] = player.personaname;
    }
    return nameMap;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Falha ao buscar resumos de jogadores da Steam: ${message}`);
    return {};
  }
}

export async function fetchSteamFamilyGroup(
  accessToken: string,
): Promise<{ familyGroupId: string; memberSteamIds: string[] } | null> {
  try {
    const { data } = await axios.get(
      `${STEAM_API_BASE}/IFamilyGroupsService/GetFamilyGroupForUser/v1/`,
      {
        params: {
          access_token: accessToken,
          include_family_group_response: true,
        },
      },
    );

    const parsed = SteamFamilyGroupForUserResponseSchema.safeParse(data);
    if (!parsed.success) {
      logger.warn("Resposta inesperada de GetFamilyGroupForUser", parsed.error);
      return null;
    }

    const familyGroupId = String(
      parsed.data.response.family_group?.family_groupid ??
        parsed.data.response.family_groupid ??
        "",
    );

    const memberSteamIds = (
      parsed.data.response.family_group?.members ?? []
    ).map((m) => String(m.steamid));

    if (!familyGroupId) return null;

    return { familyGroupId, memberSteamIds };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Falha ao buscar grupo familiar da Steam: ${message}`);
    return null;
  }
}

export async function fetchSteamFamilyLibrary(
  accessToken: string,
  familyGroupId?: string,
  mySteamId?: string,
  apiKey?: string,
): Promise<NormalizedGame[]> {
  let resolvedGroupId = familyGroupId;
  let memberSteamIds: string[] = [];

  if (!resolvedGroupId) {
    const groupInfo = await fetchSteamFamilyGroup(accessToken);
    if (groupInfo) {
      resolvedGroupId = groupInfo.familyGroupId;
      memberSteamIds = groupInfo.memberSteamIds;
    }
  }

  if (!resolvedGroupId) {
    throw new Error(
      "Não foi possível identificar o ID do grupo familiar da Steam",
    );
  }

  const { data } = await axios.get(
    `${STEAM_API_BASE}/IFamilyGroupsService/GetSharedLibraryApps/v1/`,
    {
      params: {
        access_token: accessToken,
        family_groupid: resolvedGroupId,
        include_own: true,
        include_excluded: false,
        include_non_games: false,
      },
    },
  );

  const parsed = SteamSharedLibraryResponseSchema.safeParse(data);
  if (!parsed.success) {
    logger.error("Resposta inesperada de GetSharedLibraryApps", parsed.error);
    throw new Error("Falha ao validar biblioteca compartilhada da família");
  }

  const apps = (parsed.data.response.apps ?? []).filter(
    (app) => app.exclude_reason === undefined || app.exclude_reason === 0,
  );

  const appOwnerIds = apps.flatMap((app) => (app.owner_steamids ?? []).map(String));
  const allSteamIds = Array.from(new Set([...memberSteamIds, ...appOwnerIds]));
  const memberNames = await fetchSteamMemberNames(allSteamIds, apiKey);

  return apps.map((app): NormalizedGame => {
    const ownerIds = (app.owner_steamids ?? []).map(String);
    const isOwner = mySteamId ? ownerIds.includes(mySteamId) : false;
    const primaryOwnerId = isOwner ? mySteamId : ownerIds[0];
    const ownerName =
      (primaryOwnerId ? memberNames[primaryOwnerId] : undefined) ||
      (isOwner ? "Otávio" : undefined);

    return {
      title: app.name || `App ${app.appid}`,
      externalId: String(app.appid),
      platform: "STEAM",
      coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${app.appid}/library_600x900.jpg`,
      bannerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${app.appid}/header.jpg`,
      playtimeMinutes: app.playtime_forever ?? 0,
      lastPlayedAt: app.rtime_last_played
        ? new Date(app.rtime_last_played * 1000)
        : undefined,
      isShared: !isOwner,
      ownerSteamIds: ownerIds,
      ownerSteamId: primaryOwnerId,
      ownerName,
    };
  });
}

export async function fetchSteamLibrary(): Promise<NormalizedGame[]> {
  const accessToken = process.env.STEAM_ACCESS_TOKEN;
  const familyGroupId = process.env.STEAM_FAMILY_GROUP_ID;
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (accessToken) {
    try {
      logger.info(
        "Iniciando sincronização da Família Steam via IFamilyGroupsService...",
      );
      return await fetchSteamFamilyLibrary(
        accessToken,
        familyGroupId,
        steamId,
        apiKey,
      );
    } catch (familyError: unknown) {
      const message =
        familyError instanceof Error ? familyError.message : String(familyError);
      logger.warn(
        `Falha na sincronização da Família Steam (${message}). Executando fallback para biblioteca pessoal...`,
      );
    }
  }

  const { STEAM_API_KEY: resolvedApiKey, STEAM_ID: resolvedSteamId } =
    requireEnvVars("STEAM_API_KEY", "STEAM_ID");

  try {
    const { data } = await axios.get(
      `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/`,
      {
        params: {
          key: resolvedApiKey,
          steamid: resolvedSteamId,
          include_appinfo: true,
          include_played_free_games: true,
          format: "json",
        },
      },
    );

    const parsed = SteamResponseSchema.safeParse(data);

    if (!parsed.success) {
      logger.error("Resposta inesperada da Steam API", parsed.error);
      throw new Error("Falha ao validar dados da Steam API");
    }

    const games = parsed.data.response.games ?? [];

    return games.map(
      (game): NormalizedGame => ({
        title: game.name,
        externalId: String(game.appid),
        platform: "STEAM",
        coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
        bannerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
        playtimeMinutes: game.playtime_forever,
        playtime2WeeksMinutes: game.playtime_2weeks,
        lastPlayedAt: game.rtime_last_played
          ? new Date(game.rtime_last_played * 1000)
          : undefined,
        isShared: false,
        ownerSteamId: resolvedSteamId,
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Falha ao buscar biblioteca real da Steam API", message);
    throw error;
  }
}
