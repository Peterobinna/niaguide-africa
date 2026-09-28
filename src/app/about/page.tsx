import { PageHeading, Disclosure } from "@/components/ui";
export const metadata = { title: "About the project" };
export default function About() {
  return (
    <div className="container page-shell prose">
      <PageHeading
        eyebrow="BUILT FOR CURIOSITY AND PURPOSE"
        title="African perspectives. A more accessible starting point."
        description="NiaGuide Africa is an independent final-year Full Stack capstone project exploring source-grounded AI guidance."
      />
      <h2>The problem we’re exploring</h2>
      <p>
        Young people often admire African leaders and experts but cannot speak
        with them directly. Useful ideas are spread across interviews, speeches,
        articles, books, podcasts, and videos. Finding a relevant passage — and
        knowing whether it supports an answer — takes time.
      </p>
      <h2>Who it is for</h2>
      <p>
        The platform is designed for young Africans aged 18–25 exploring
        careers, leadership, entrepreneurship, personal development, and
        purposeful living. The initial research population is Nigerian
        university students aged 18–25, studying in Nigeria or abroad.
      </p>
      <h2>A software engineering project</h2>
      <p>
        The live architecture uses an existing OpenAI model with
        retrieval-augmented generation. No custom model is trained or
        fine-tuned. This initial build prioritises usable interfaces,
        transparent sources, safe demonstrations, and a secure database
        foundation.
      </p>
      <h2>Independent and transparent</h2>
      <p>
        Listed experts have not endorsed this project. Their draft catalogue
        entries use basic information supplied in the project brief. No
        quotations, permissions, or source documents have been invented for
        them. Amara Okeke is explicitly fictional.
      </p>
      <Disclosure />
    </div>
  );
}
