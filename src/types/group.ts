export interface FamilyMemberGroupItem {
  ownerName: string | null;
  ownerSteamId: string | null;
  isShared: boolean;
  _count: { _all: number };
}
