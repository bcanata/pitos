export const DEMO_EMAIL = "demo@pitos.8092.tr";

export function isDemoUser(email: string | null | undefined): boolean {
  return email === DEMO_EMAIL;
}
