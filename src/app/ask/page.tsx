import { AskForm } from "@/components/ask-form";
import { getCatalogue } from "@/lib/server/catalogue";
export const metadata = { title: "Ask NiaGuide" };
export default async function Ask({
  searchParams,
}: {
  searchParams: Promise<{ expert?: string }>;
}) {
  const { expert } = await searchParams;
  return (
    <div className="container chat-page">
      <header className="chat-heading">
        <h1>Ask NiaGuide</h1>
        <p>Practical guidance, grounded in expert sources.</p>
      </header>
      <AskForm initialExpert={expert} experts={await getCatalogue()} />
    </div>
  );
}
