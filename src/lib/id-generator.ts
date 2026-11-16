import crypto from 'crypto';

// Crockford's Base32 excluding I, L, O, 0 to eliminate confusion when reading/typing
const CHARSET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

function getRandomString(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generates an unpredictable, hyphen-free student ID
 * Format: PHR + YY + 4 Base32 chars (e.g., PHR27K8M4)
 */
export function generateStudentNumber(intakeYear: number = 2027): string {
  const yearShort = String(intakeYear).slice(-2);
  const randomSuffix = getRandomString(4);
  return `PHR${yearShort}${randomSuffix}`;
}

/**
 * Generates an unpredictable staff ID
 * Format: PHR + Role Code + 3 Base32 chars (e.g., PHRTCH8K3, PHRADM5X9)
 */
export function generateStaffNumber(role: 'ADMIN' | 'TEACHER' | 'FINANCE' | 'LIBRARIAN'): string {
  const roleMap: Record<string, string> = {
    ADMIN: 'ADM',
    TEACHER: 'TCH',
    FINANCE: 'ACC',
    LIBRARIAN: 'LIB',
  };

  const code = roleMap[role] || 'STF';
  const randomSuffix = getRandomString(3);
  return `PHR${code}${randomSuffix}`;
}