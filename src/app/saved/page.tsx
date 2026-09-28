import { PageHeading } from "@/components/ui";
import { WorkspaceNav } from "@/components/workspace-nav";
import { History } from "@/components/history";
export const metadata = { title: "Saved Answers" };
export default function Saved() {
  return (
    <div className="container page-shell">
      <WorkspaceNav />
      <PageHeading
        eyebrow="IDEAS WORTH RETURNING TO"
        title="Saved answers"
        description="Keep useful perspectives close. Revisit their sources whenever you need them."
      />
      <History kind="saved" />
    </div>
  );
}
