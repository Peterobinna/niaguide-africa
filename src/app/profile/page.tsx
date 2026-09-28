import { ProfileSettings } from "@/components/profile-settings";
import { WorkspaceNav } from "@/components/workspace-nav";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "Profile & privacy" };
export default function Profile() {
  return (
    <div className="container page-shell">
      <WorkspaceNav />
      <PageHeading
        eyebrow="YOUR SPACE, YOUR CHOICES"
        title="Profile & privacy"
        description="Manage your profile and understand what happens to your questions."
      />
      <ProfileSettings />
    </div>
  );
}
