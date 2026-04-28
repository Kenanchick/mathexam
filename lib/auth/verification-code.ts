import bcrypt from "bcryptjs";

export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_CODE_TTL_MINUTES = 10;
export const VERIFICATION_CODE_MAX_ATTEMPTS = 5;

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashVerificationCode(code: string) {
  return bcrypt.hash(code, 10);
}

export async function verifyCodeHash(code: string, codeHash: string) {
  return bcrypt.compare(code, codeHash);
}

export function getVerificationCodeExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + VERIFICATION_CODE_TTL_MINUTES);

  return expiresAt;
}

export function normalizeVerificationCode(code: string) {
  return code.replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
}
