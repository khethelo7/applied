const EMAIL_COOKIE =
  'applied-user-email';


const ONE_YEAR =
  60 * 60 * 24 * 365;


// Normalisation

export function normaliseEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}


// Read identity

export function getCurrentEmail():
string | null {
  if (
    typeof document ===
    'undefined'
  ) {
    return null;
  }

  const cookies =
    document.cookie.split(';');

  for (
    const cookie of cookies
  ) {
    const [
      rawName,
      ...rawValue
    ] =
      cookie
        .trim()
        .split('=');

    if (
      rawName ===
      EMAIL_COOKIE
    ) {
      const value =
        rawValue.join('=');

      return value
        ? decodeURIComponent(
            value
          )
        : null;
    }
  }

  return null;
}


// Save identity

export function setCurrentEmail(
  email: string
): void {
  const cleanEmail =
    normaliseEmail(email);

  document.cookie =
    `${EMAIL_COOKIE}=` +
    `${encodeURIComponent(
      cleanEmail
    )}; ` +
    `Path=/; ` +
    `Max-Age=${ONE_YEAR}; ` +
    `SameSite=Lax`;
}


// Remove identity

export function clearCurrentEmail():
void {
  document.cookie =
    `${EMAIL_COOKIE}=; ` +
    `Path=/; ` +
    `Max-Age=0; ` +
    `SameSite=Lax`;
}