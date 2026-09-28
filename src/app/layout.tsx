import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import Link from "next/link";
import { Header } from "@/components/header";
import { Wordmark } from "@/components/ui";
import { demoMode } from "@/lib/catalogue";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata: Metadata = {
  title: {
    default: "NiaGuide Africa — Guidance rooted in African wisdom",
    template: "%s | NiaGuide Africa",
  },
  description:
    "Explore African expert collections and source-grounded guidance. A student capstone with transparent citations and a clearly labelled fictional demonstration.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {demoMode && (
          <div className="demo-banner">
            CAPSTONE PREVIEW{" "}
            <span>
              Explore freely. Answers use fictional, synthetic demonstration
              material.
            </span>
            <Link href="/dashboard">My workspace →</Link>
          </div>
        )}
        <main id="main">{children}</main>
        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <Wordmark />
              <p>
                Guidance rooted in African wisdom.
                <br />A clearer next step starts with a better question.
              </p>
            </div>
            <div>
              <strong>Explore</strong>
              <Link href="/experts">Expert collections</Link>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/about">About the project</Link>
            </div>
            <div>
              <strong>Your space</strong>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/saved">Saved answers</Link>
              <Link href="/profile">Profile & privacy</Link>
            </div>
            <div>
              <strong>Built on transparency</strong>
              <p>
                Independent academic project.
                <br />
                No expert endorsement implied.
              </p>
              <Link href="/admin">Collection administration →</Link>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>
              © {new Date().getFullYear()} NiaGuide Africa · Capstone project
            </span>
            <span>Learn thoughtfully. Check the sources.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
