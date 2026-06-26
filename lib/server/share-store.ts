import "server-only";

import { randomUUID } from "crypto";

export type SharePrivacy = {
  showBudget: boolean;
  showExactTimes: boolean;
  showExactLocation: boolean;
  showMap: boolean;
  showThumbnail: boolean;
};

export type ShareLinkRecord = {
  token: string;
  tripId: string;
  publicUrl: string;
  privacy: SharePrivacy;
  createdAt: string;
  disabledAt?: string;
};

const globalForShare = globalThis as typeof globalThis & {
  __roamoryShareLinks?: Map<string, ShareLinkRecord>;
};

const shareLinks =
  globalForShare.__roamoryShareLinks ??
  new Map<string, ShareLinkRecord>();

globalForShare.__roamoryShareLinks = shareLinks;

export function createShareLink({
  origin,
  tripId,
  privacy
}: {
  origin: string;
  tripId: string;
  privacy: SharePrivacy;
}) {
  const token = randomUUID().replaceAll("-", "");
  const record: ShareLinkRecord = {
    token,
    tripId,
    publicUrl: `${origin}/share/${token}`,
    privacy,
    createdAt: new Date().toISOString()
  };

  shareLinks.set(token, record);
  return record;
}

export function getShareLink(token: string) {
  const record = shareLinks.get(token);
  if (!record || record.disabledAt) return null;
  return record;
}

export function disableShareLink(token: string) {
  const record = shareLinks.get(token);
  if (!record || record.disabledAt) return null;
  const nextRecord: ShareLinkRecord = {
    ...record,
    disabledAt: new Date().toISOString()
  };
  shareLinks.set(token, nextRecord);
  return nextRecord;
}
