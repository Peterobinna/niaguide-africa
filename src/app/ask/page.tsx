import { AskForm } from "@/components/ask-form";
import { PageHeading } from "@/components/ui";
import { getCatalogue } from "@/lib/server/catalogue";
export const metadata = { title: "Ask NiaGuide" };
export default async function Ask({
  searchParams,
}: {
  searchParams: Promise<{ expert?: string }>;
}) {
  const { expert } = await searchParams;
  return (
    <div className="container page-shell">
      <PageHeading
        eyebrow="A SPACE FOR YOUR QUESTIONS"
        title="What’s your next step?"
        description="Start with a question. Explore the evidence. Make the perspective your own."
      />
      <div className="two-col">
        <div>
          <AskForm initialExpert={expert} experts={await getCatalogue()} />
        </div>
        <aside>
          <div className="panel soft-panel">
            <span className="eyebrow">A BETTER QUESTION, A USEFUL START</span>
            <h2 style={{ marginTop: 16 }}>Keep it specific.</h2>
            <p>
              Ask about one challenge or idea at a time. You don’t need to
              include personal details.
            </p>
            <h3>What happens next?</h3>
            <p>
              1. We search the selected collection.
              <br />
              2. We check for relevant evidence.
              <br />
              3. You get guidance with supporting passages, or a clear
              explanation that evidence is missing.
            </p>
          </div>
          <p className="muted">
            Each follow-up is a new question. Previous conversation content is
            not sent to the answer model.
          </p>
        </aside>
      </div>
    </div>
  );
}
