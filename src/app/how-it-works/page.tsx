import Link from "next/link";
import { PageHeading, Disclosure } from "@/components/ui";
export const metadata = { title: "How It Works" };
export default function How() {
  return (
    <div className="container page-shell prose">
      <PageHeading
        eyebrow="KNOW WHERE THE GUIDANCE COMES FROM"
        title="A question. A source. A clearer next step."
        description="NiaGuide is designed to make the connection between an answer and its evidence visible."
      />
      {[
        [
          "01 · Choose a collection",
          "Explore a field and select an expert collection. Draft collections are unavailable for answers until sources and usage rights have been reviewed.",
        ],
        [
          "02 · Ask a focused question",
          "The server searches only the selected expert’s active collection and approved documents. If there are no relevant passages, NiaGuide explains that it lacks evidence.",
        ],
        [
          "03 · Read with the sources beside you",
          "In live mode, the retrieved passages are sent to the OpenAI Responses API. The answer includes numbered citations and expandable passages so you can inspect the evidence.",
        ],
      ].map(([t, d]) => (
        <section className="panel" key={t}>
          <h2>{t}</h2>
          <p>{d}</p>
        </section>
      ))}
      <h2>What the current demonstration shows</h2>
      <p>
        The fictional Amara Okeke collection uses four original synthetic notes.
        The demonstration retrieves and displays matching excerpts without
        calling a model. It demonstrates the question, retrieval,
        evidence-insufficiency, and citation flow. It must not be mistaken for
        live expert guidance.
      </p>
      <h2>What citations can and cannot tell you</h2>
      <p>
        A citation helps you inspect a source; it is not a guarantee that an AI
        interpretation is correct. Automated checks verify source indices and
        matching quotes. Human review is still necessary to assess whether a
        claim follows from its evidence.
      </p>
      <Disclosure />
      <Link className="button" href="/ask">
        Try the demonstration →
      </Link>
    </div>
  );
}
