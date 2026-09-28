"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { browserDb } from "@/lib/supabase/client";
import { demoMode } from "@/lib/catalogue";
export function WorkspaceNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <nav className="workspace-nav" aria-label="Student navigation">
      {[
        ["/dashboard", "Dashboard"],
        ["/experts", "Explore Experts"],
        ["/ask", "Ask NiaGuide"],
        ["/questions", "My Questions"],
        ["/saved", "Saved Answers"],
        ["/profile", "Profile"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
      {!demoMode && (
        <button
          className="text-link"
          onClick={async () => {
            await browserDb().auth.signOut();
            router.push("/");
            router.refresh();
          }}
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
