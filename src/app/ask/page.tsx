// This page gets the selected expert from the URL and passes the starting information to the chat form.
import { AskForm } from "@/components/ask-form";
import { getCatalogue } from "@/lib/server/catalogue";
import { currentUser } from "@/lib/supabase/server";
export const metadata = { title: "Ask NiaGuide" };
export default async function Ask({
  searchParams,
}: {
  searchParams: Promise<{ expert?: string }>;
}) {
  const { expert } = await searchParams;
  const [experts, user] = await Promise.all([getCatalogue(), currentUser()]);
  return (
    <div className="container chat-page">
      <header className="chat-heading">
        <h1>Ask NiaGuide</h1>
        <p>Practical guidance, grounded in expert sources.</p>
      </header>
      <AskForm key={JSON.stringify([user?.id, expert])} initialExpert={expert} experts={experts} userId={user?.id} />
    </div>
  );
}
