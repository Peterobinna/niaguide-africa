// This page gives the student a place to edit their display name and read the privacy information.
import Link from "next/link";
import { ProfileSettings } from "@/components/profile-settings";
import { WorkspaceNav } from "@/components/workspace-nav";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "Profile & privacy" };
export default function Profile() {
  return (
    <div className="container page-shell">
      <WorkspaceNav />
      <PageHeading eyebrow="YOUR SPACE, YOUR CHOICES" title="Profile & privacy" description="Manage your profile and understand what happens to your questions." />
      <ProfileSettings />
      <p style={{ marginTop: 20 }}><Link href="/privacy">Read the full privacy policy and how to request deletion</Link></p>
    </div>
  );
}
