import Link from "next/link";
import { ArrowUpRight, Compass, BookOpen, ShieldCheck } from "lucide-react";
import { disclosure, statusLabel, type Expert } from "@/lib/catalogue";
export function Wordmark() {
  return (
    <Link href="/" className="wordmark">
      <span className="brand-icon">
        <Compass size={23} />
      </span>
      <span>
        NiaGuide<span className="brand-africa"> Africa</span>
      </span>
    </Link>
  );
}
export function Disclosure() {
  return (
    <aside className="disclosure">
      <ShieldCheck size={19} />
      <p>{disclosure}</p>
    </aside>
  );
}
export function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <Link
      className={`expert-card ${expert.synthetic ? "demo-card" : ""}`}
      href={`/experts/${expert.id}`}
    >
      <div className="card-top">
        <span className="avatar">
          {expert.name
            .split(" ")
            .slice(0, 2)
            .map((s) => s[0])
            .join("")}
        </span>
        <ArrowUpRight size={20} />
      </div>
      <span className={`badge ${expert.status}`}>
        {statusLabel[expert.status]}
      </span>
      <h3>{expert.name}</h3>
      <p>{expert.field}</p>
      <div className="card-bottom">
        <span>{expert.country}</span>
        <span>
          <BookOpen size={14} />
          {expert.synthetic ? "4 demo notes" : "Collection in preparation"}
        </span>
      </div>
      {expert.synthetic && <small>Fictional Demonstration Expert</small>}
    </Link>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="button secondary" href="/ask">
        Ask your first question <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
