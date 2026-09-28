import { PageHeading } from "@/components/ui";
import { WorkspaceNav } from "@/components/workspace-nav";
import { History } from "@/components/history";
export const metadata = { title: "My Questions" };
export default function Questions() {
  return (
    <div className="container page-shell">
      <WorkspaceNav />
      <PageHeading
        eyebrow="YOUR REFLECTIONS"
        title="My questions"
        description="A record of the questions you’ve explored and the sources behind each answer."
      />
      <History kind="questions" />
    </div>
  );
}
