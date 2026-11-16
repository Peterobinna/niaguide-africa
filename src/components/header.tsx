"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Wordmark } from "./ui";
export function Header({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="header">
      <div className="container header-inner">
        <Wordmark />
        <Link
          className="mobile-account-link"
          href={signedIn ? "/dashboard" : "/sign-in"}
          onClick={() => setOpen(false)}
        >
          {signedIn ? "Dashboard" : "Sign In"}
        </Link>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          aria-label="Main navigation"
          className={open ? "main-nav open" : "main-nav"}
        >
          {[
            ["/", "Home"],
            ["/experts", "Explore Experts"],
            ["/how-it-works", "How It Works"],
            ["/about", "About"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="nav-auth">
            <Link href={signedIn ? "/dashboard" : "/sign-in"} onClick={() => setOpen(false)}>
              {signedIn ? "Dashboard" : "Sign In"}
            </Link>
            <Link
              className="button small"
              href="/ask"
              onClick={() => setOpen(false)}
            >
              Ask NiaGuide <ArrowUpRight size={15} />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
