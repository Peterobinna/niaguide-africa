import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How NiaGuide Africa uses account details, questions, AI services and research information, and how to request deletion.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="container page-shell prose">
      <PageHeading eyebrow="YOUR INFORMATION, YOUR CHOICES" title="Privacy policy" description="How NiaGuide Africa uses your information and how to contact the researcher." />
      <p>Last updated <time dateTime="2026-11-20">20 November 2026</time>.</p>
      <section aria-labelledby="who-runs-niaguide-africa">
        <h2 id="who-runs-niaguide-africa">Who runs NiaGuide Africa</h2>
        <p>NiaGuide Africa is a student research project by Peter Nnamchukwu at African Leadership University, supervised by Mr Neza David Tuyishimire. It helps students explore guidance from published expert sources. Inclusion of an expert does not imply their endorsement. Check important advice with a qualified person where needed.</p>
      </section>
      <section aria-labelledby="information-we-use">
        <h2 id="information-we-use">Information we use</h2>
        <p>When you register, Supabase handles your email, password and sign-in details. The app uses your display name and account ID. It stores questions, generated answers, source references, saved-answer links, helpfulness feedback and reports you submit. Answer records also include the model name, response time and creation date. We use this information to provide the service, show your history and investigate problems.</p>
      </section>
      <section aria-labelledby="how-ai-answers-are-prepared">
        <h2 id="how-ai-answers-are-prepared">How AI answers are prepared</h2>
        <p>The server sends your question, the selected expert name, relevant source passages and up to your last two question-and-answer exchanges to OpenAI. This helps it understand follow-up questions and draft guidance. We do not deliberately include your account email or display name in these requests, but anything you type in a question may be sent. Please avoid passwords, medical records, bank details and private information about yourself or others.</p>
      </section>
      <section aria-labelledby="service-providers-and-overseas-processing">
        <h2 id="service-providers-and-overseas-processing">Service providers and overseas processing</h2>
        <p>Supabase provides authentication and database storage. Vercel hosts the application. OpenAI processes requests used to prepare answers. These providers may process information outside your country. Their processing locations, logs, backups and retention depend on their services and account settings. This page does not promise storage in one country. The app requests that OpenAI not store Responses API application state by setting store to false. Provider security and abuse-monitoring records may still be retained under the provider&apos;s policies.</p>
      </section>
      <section aria-labelledby="cookies-and-browser-storage">
        <h2 id="cookies-and-browser-storage">Cookies and browser storage</h2>
        <p>The app uses sign-in cookies to keep your session working. It uses session storage to recover chat content in the current browser tab. Starting a new chat clears that chat context but does not delete stored account history. The clearly labelled fictional demonstration uses local storage for demo history, saves and feedback. You can clear demo data from Profile & privacy. Clearing browser data can remove browser copies and sign you out, but does not delete database records.</p>
      </section>
      <section aria-labelledby="who-can-access-information">
        <h2 id="who-can-access-information">Who can access information</h2>
        <p>The app uses account checks and database access rules to restrict ordinary users to their own records. The researcher and people authorised to operate the project may access records when needed for support, administration or investigating problems. Service providers process information to run their services. Research response files are intended for the researcher and supervisor under the separate consent information. Security measures reduce risks, but cannot guarantee complete protection.</p>
      </section>
      <section aria-labelledby="research-participation">
        <h2 id="research-participation">Research participation</h2>
        <p>Creating an account is separate from agreeing to participate in research. A research invitation or form should explain the study, tasks, information collected and consent choice. You may decline research participation. Research findings should use summaries or anonymised examples rather than publish your account details. Questions and feedback submitted through the app should not be treated as research consent.</p>
      </section>
      <section aria-labelledby="how-long-information-is-kept">
        <h2 id="how-long-information-is-kept">How long information is kept</h2>
        <p>The research plan is to keep research data for one year after the study ends, then arrange its deletion. The researcher must record the study end date and carry out that process. Account history is separate from this research retention period. The app currently has no automatic expiry for account records. They remain until removed through project administration, an applicable deletion request or closure of the service. Provider logs and backups follow their own retention schedules, so deletion from the active app does not mean every provider copy disappears immediately.</p>
      </section>
      <section aria-labelledby="access-corrections-and-deletion">
        <h2 id="access-corrections-and-deletion">Access, corrections and deletion</h2>
        <p>You can update your display name in Profile & privacy. To request access to your information, a correction, account deletion or withdrawal of identifiable research data, email p.nnamchukw@alustudent.com with the subject NiaGuide privacy request. Send the request from your registered email where possible and describe what you want removed or corrected. Do not send your password. The researcher will check account ownership, review the request and reply with the action taken or explain any limits. Requests are handled manually. This page does not promise automatic deletion or a fixed completion time. Anonymous research summaries may no longer be traceable to an individual.</p>
      </section>
      <section aria-labelledby="saved-answers-and-external-links">
        <h2 id="saved-answers-and-external-links">Saved answers and external links</h2>
        <p>Removing a saved-answer bookmark removes the bookmark, not the underlying question and answer. To remove account history, use the contact process above. Opening an expert source takes you to another website, such as YouTube, which applies its own privacy policy and may collect information about your visit.</p>
      </section>
      <section aria-labelledby="contact-and-changes">
        <h2 id="contact-and-changes">Contact and changes</h2>
        <p>For questions about this policy or your information, contact Peter Nnamchukwu at p.nnamchukw@alustudent.com. This address appears in the project&apos;s university correspondence. If this policy changes, the updated page will show a new revision date.</p>
      </section>
      <p><a href="mailto:p.nnamchukw@alustudent.com?subject=NiaGuide%20privacy%20request">Email a privacy request</a></p>
      <h2>Provider information</h2>
      <ul>
        <li><a href="https://supabase.com/privacy">Supabase privacy policy</a></li>
        <li><a href="https://vercel.com/legal/privacy-policy">Vercel privacy policy</a></li>
        <li><a href="https://developers.openai.com/api/docs/guides/your-data">OpenAI API data controls</a></li>
      </ul>
      <p><Link href="/profile">Open Profile &amp; privacy</Link></p>
    </article>
  );
}
