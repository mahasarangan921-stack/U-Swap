import { customAlphabet } from "nanoid";
import File from "../models/File.js";

// Avoid ambiguous chars (0/O, 1/I/L) for codes read aloud over a call
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generateShortCode = customAlphabet(CODE_ALPHABET, 6);

// Link tokens can be longer/URL-safe since they're never typed by hand
const generateLinkToken = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  16
);

/**
 * Generates a unique 6-character code, retrying on collision.
 */
export async function createUniqueCode() {
  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    code = generateShortCode();
    exists = await File.exists({ code });
    attempts++;
  }

  if (exists) {
    throw new Error("Could not generate a unique code, please try again.");
  }

  return code;
}

/**
 * Generates a unique link token, retrying on collision.
 */
export async function createUniqueLinkToken() {
  let token;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    token = generateLinkToken();
    exists = await File.exists({ linkToken: token });
    attempts++;
  }

  if (exists) {
    throw new Error("Could not generate a unique link, please try again.");
  }

  return token;
}
