import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Create account" };
export default function Register() {
  return (
    <div className="container page-shell">
      <AuthForm register />
    </div>
  );
}
