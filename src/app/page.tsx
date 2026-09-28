import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Quote,
  ShieldCheck,
  Sparkles,
  Check,
} from "lucide-react";
import { Disclosure, ExpertCard } from "@/components/ui";
import { experts } from "@/lib/catalogue";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> AFRICAN PERSPECTIVES. YOUR POSSIBILITIES.
            </div>
            <h1>
              Your questions.
              <br />
              African wisdom.
              <br />
              <em>A clearer path.</em>
            </h1>
            <p className="hero-lead">
              Explore ideas from African leaders and experts. Find thoughtful
              guidance grounded in published sources — and see where every
              insight comes from.
            </p>
            <div className="button-row">
              <Link className="button" href="/experts">
                Explore Experts <ArrowUpRight size={18} />
              </Link>
              <Link className="button secondary" href="/ask">
                Ask NiaGuide <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-trust">
              <ShieldCheck size={17} />
              <span>
                AI-generated guidance. Source-grounded. Never impersonation.
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-compass">
              <Compass size={34} />
            </span>
            <div className="sample-label">
              <span /> A LITTLE CLARITY, BACKED BY SOURCES
            </div>
            <div className="sample-question">
              <span className="sample-avatar">YOU</span>
              <p>
                How can I explore a career
                <br />
                before committing to it?
              </p>
            </div>
            <div className="sample-answer">
              <div className="sample-answer-title">
                <span>
                  <Sparkles size={18} /> A starting point
                </span>
                <span className="badge available">Synthetic demo</span>
              </div>
              <p>
                Start with a small project. Give yourself two weeks to try a
                skill, then reflect on what energised you and what you want to
                practise next.{" "}
                <a href="/sources#10000000-0000-4000-8000-000000000001">[1]</a>
              </p>
              <div className="sample-source">
                <BookOpen size={19} />
                <span>
                  <strong>Small experiments, clearer career choices</strong>
                  <small>Original fictional learning note · View source</small>
                </span>
                <ArrowUpRight size={17} />
              </div>
              <div className="sample-note">
                <Check size={14} /> Supporting passage included
              </div>
            </div>
            <div className="art-caption">
              <Quote size={19} />
              <span>
                Not someone else’s voice.
                <br />
                <strong>Knowledge you can explore for yourself.</strong>
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        <Disclosure />
      </div>
      <div className="values-strip">
        <div className="container">
          <span>
            <BookOpen />
            Sources you can inspect
          </span>
          <span>
            <Compass />
            Perspectives across Africa
          </span>
          <span>
            <ShieldCheck />
            Clarity about what AI can do
          </span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START WITH CURIOSITY</span>
            <h2>Whose ideas will you explore?</h2>
            <p>
              Discover perspectives across leadership, enterprise, and creative
              life.
            </p>
          </div>
          <Link className="text-link" href="/experts">
            View all collections <ArrowRight size={17} />
          </Link>
        </div>
        <div className="grid-3">
          {[experts[1], experts[4], experts[20]].map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
        <p className="section-footnote">
          Real-expert collections are in preparation. Inclusion does not imply
          participation, approval, or endorsement.
        </p>
      </section>
      <section className="steps-section">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">FROM A QUESTION TO A NEXT STEP</span>
            <h2>A little guidance. A clear trail.</h2>
            <p>Understand the ideas, then make your own informed choices.</p>
          </div>
          <div className="grid-3 steps">
            {[
              [
                "01",
                "Choose a collection",
                "Find an expert’s field of work that connects with what you’re thinking about.",
              ],
              [
                "02",
                "Ask what matters to you",
                "Bring a question about your career, leadership, learning, or a new idea.",
              ],
              [
                "03",
                "Explore the evidence",
                "Read the guidance, open the supporting passages, and consider your next step.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="trust-panel">
          <div>
            <span className="eyebrow">TRUST IS PART OF THE DESIGN</span>
            <h2>
              Good guidance should
              <br />
              show its working.
            </h2>
            <p>
              NiaGuide retrieves relevant passages before generating an answer.
              If the collection doesn’t contain enough evidence, it says so.
            </p>
            <Link className="text-link" href="/how-it-works">
              Meet the process <ArrowRight size={17} />
            </Link>
          </div>
          <div className="trust-points">
            {[
              [
                "Published sources, visible evidence",
                "Every supported answer includes passages you can inspect.",
              ],
              [
                "AI guidance, clearly identified",
                "NiaGuide never represents or speaks on behalf of an expert.",
              ],
              [
                "Your judgment comes first",
                "Use these perspectives to reflect. Check sources before important decisions.",
              ],
            ].map(([t, d]) => (
              <div key={t}>
                <ShieldCheck />
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section container">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>
            You don’t need every answer.
            <br />
            Just a place to start.
          </h2>
        </div>
        <Link className="button gold" href="/ask">
          Ask your first question <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
