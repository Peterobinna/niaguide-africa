"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Wordmark } from "./ui";
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="header">
      <div className="container header-inner">
        <Wordmark />
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
            <Link href="/sign-in" onClick={() => setOpen(false)}>
              Sign In
            </Link>
            <Link
              className="button small"
              href="/ask"
              onClick={() => setOpen(false)}
            >
              Get Started <ArrowUpRight size={15} />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
