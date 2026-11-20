import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Create account" };
export default function Register() {
  return (
    <div className="container page-shell">
      <AuthForm register />
      <p className="muted" style={{ textAlign: "center", marginTop: 20 }}>
        Read our <Link href="/privacy">privacy policy</Link> to understand how we use your information.
      </p>
    </div>
  );
}
