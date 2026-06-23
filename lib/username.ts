export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateUsername(username: string): string | null {
  const value = username.trim();

  if (!value) {
    return 'Username is required.';
  }
  if (value.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`;
  }
  if (/\s/.test(value)) {
    return 'Username cannot contain spaces.';
  }
  if (!USERNAME_PATTERN.test(value)) {
    return 'Username can only use letters, numbers, underscores, and hyphens.';
  }

  return null;
}
