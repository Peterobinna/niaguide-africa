import { Explorer } from "@/components/explorer";
import { PageHeading } from "@/components/ui";
import { getCatalogue } from "@/lib/server/catalogue";
export const metadata = { title: "Explore Experts" };
export default async function Experts() {
  return (
    <div className="container page-shell">
      <PageHeading
        eyebrow="A CONTINENT OF PERSPECTIVES"
        title="Find ideas for your next chapter."
        description="Explore selected African leaders and experts by field, country, and collection status. Start with our fictional collection to try the experience."
      />
      <Explorer experts={await getCatalogue()} />
      <p className="section-footnote">
        Catalogue profiles use only basic information supplied for this project.
        No participation or endorsement is implied.
      </p>
    </div>
  );
}
