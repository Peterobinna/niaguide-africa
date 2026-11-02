import { PageHeading } from "@/components/ui";
import { WorkspaceNav } from "@/components/workspace-nav";
import { History } from "@/components/history";
import { getCatalogue } from "@/lib/server/catalogue";
export const metadata = { title: "Dashboard" };
export default async function Dashboard() {
  return (
    <div className="container page-shell">
      <WorkspaceNav />
      <PageHeading
        eyebrow="YOUR LEARNING SPACE"
        title="Welcome to your next chapter."
        description="Return to a question, keep a useful perspective, or explore something new."
      />
      <History kind="dashboard" collections={await getCatalogue()} />
    </div>
  );
}
