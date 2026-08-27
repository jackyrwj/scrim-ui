/**
 * Generating a licence key.
 *
 * The key is the entire account system — there is no password to reset and no
 * login to recover — so it has to survive being read off a phone screen,
 * retyped from a printed invoice, and pasted with a stray space on either
 * end. That is what the alphabet below is for: I, L, O, U, 0 and 1 are gone,
 * which removes every pair a human confuses. Sixteen characters from a
 * thirty-character alphabet is about 78 bits, far past guessing.
 *
 * Server only — node:crypto, and nothing should be minting keys in a browser.
 */

import { randomInt } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const GROUPS = 4;
const GROUP_LENGTH = 4;

export const KEY_PREFIX = "SCRIM";

export function generateLicenseKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUPS; g++) {
    let group = "";
    /* randomInt, not Math.random — this value is the only thing standing
       between a stranger and the paid source. */
    for (let c = 0; c < GROUP_LENGTH; c++) group += ALPHABET[randomInt(ALPHABET.length)];
    groups.push(group);
  }
  return [KEY_PREFIX, ...groups].join("-");
}

/**
 * The single spelling of a key, used before both storage and lookup.
 *
 * Called on every path that touches a key so that "scrim-abcd…" typed in
 * lowercase, or pasted with a trailing newline out of an email client, is the
 * same key as the one the webhook wrote. Anything that normalises on write
 * but not on read is a support ticket waiting to be filed.
 */
export function normalizeKey(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().toUpperCase();
}
