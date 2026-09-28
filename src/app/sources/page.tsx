import { PageHeading } from "@/components/ui";
import { demoSources } from "@/lib/catalogue";
export const metadata = { title: "Synthetic source notes" };
export default function Sources() {
  return (
    <div className="container page-shell prose">
      <PageHeading
        eyebrow="TRANSPARENT BY DESIGN"
        title="The demonstration source library"
        description="Original synthetic notes written for this project. These are not quotations, real publications, or materials by a real expert."
      />
      {demoSources.map((s) => (
        <article className="panel source-note" id={s.id} key={s.id}>
          <span className="badge available">Original synthetic content</span>
          <h2>{s.title}</h2>
          <p>
            {s.type} · Created {s.published_at}
          </p>
          <p>{s.content}</p>
        </article>
      ))}
    </div>
  );
}
