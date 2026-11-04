import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Sign In" };
export default async function SignIn({
  searchParams,
}: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error } = await searchParams;
  return (
    <div className="container page-shell">
      <AuthForm confirmationError={error === "confirmation"} />
    </div>
  );
}
