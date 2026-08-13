/**
 * Server-only helper for encrypting/decrypting BYOK API keys at rest.
 *
 * Keys are encrypted with AES-256-GCM using a server-side secret
 * (BYOK_ENC_KEY). Encrypted values are tagged with a `v1:` prefix so old
 * plaintext rows (legacy data) keep working and newly encrypted rows are
 * unambiguous.
 *
 * SECURITY: never import this file into a client component. It relies on
 * Node's `crypto` module and a secret that must stay server-only.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { byokEncKey } from "./env";

const PREFIX = "v1:";
const ALGO = "aes-256-gcm";

function hasKey(): boolean {
  return Boolean(byokEncKey);
}

/** Derive a 32-byte key from the configured secret (SHA-256). */
function derivedKey(): Buffer {
  return createHash("sha256").update(byokEncKey).digest();
}

/**
 * Encrypt a plaintext secret. Returns the tagged ciphertext, or the input
 * unchanged when no BYOK_ENC_KEY is configured (fallback, keeps dev flows
 * working exactly as before).
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return plaintext;
  if (!hasKey()) return plaintext;

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, derivedKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

/**
 * Decrypt a tagged ciphertext. Returns:
 *  - the original ciphertext if it was never encrypted (legacy plaintext)
 *  - the raw value again if no secret is configured or decryption fails, so a
 *    misconfiguration can never brick a user's stored key.
 */
export function decryptSecret(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value;
  if (!hasKey()) return value;

  try {
    const [ivB64, tagB64, dataB64] = value.slice(PREFIX.length).split(".");
    if (!ivB64 || !tagB64 || !dataB64) return value;

    const decipher = createDecipheriv(ALGO, derivedKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return value;
  }
}