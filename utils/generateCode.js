import { randomBytes } from "crypto";
import File from "../models/File.js";

// Avoid ambiguous chars (0/O, 1/I/L) for codes read aloud over a call
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LINK_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateFromAlphabet(alphabet, length) {
  let result = "";
  while (result.length < length) {
    const byte = randomBytes(1)[0];
    // Reject bytes that would cause modulo bias
    const limit = 256 - (256 % alphabet.length);
    if (byte < limit) {
      result += alphabet[byte % alphabet.length];
    }
  }
  return result;
}

const generateShortCode = () => generateFromAlphabet(CODE_ALPHABET, 6);
const generateLinkToken = () => generateFromAlphabet(LINK_ALPHABET, 16);

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
