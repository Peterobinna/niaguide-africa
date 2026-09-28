import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Sign In" };
export default function SignIn() {
  return (
    <div className="container page-shell">
      <AuthForm />
    </div>
  );
}
