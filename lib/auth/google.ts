import { Google } from "arctic";

export const googleOAuth = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.APP_URL}/api/auth/google/callback`
);
