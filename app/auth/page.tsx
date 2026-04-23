import AuthForm from "./auth-form";
import { EN_BUNDLE } from "@/lib/i18n/server";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AuthForm error={error} bundle={EN_BUNDLE} />;
}
