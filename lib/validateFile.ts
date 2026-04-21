const ACCEPTED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export type ValidateFileResult =
  | { valid: true }
  | { valid: false; reason: "format" | "size" };

export function validateFile({
  type,
  size,
}: {
  type: string;
  size: number;
}): ValidateFileResult {
  if (!ACCEPTED_FORMATS.includes(type)) {
    return { valid: false, reason: "format" };
  }

  if (size > MAX_SIZE_BYTES) {
    return { valid: false, reason: "size" };
  }

  return { valid: true };
}
