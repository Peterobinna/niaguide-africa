export type CollectionStatus = "available" | "review" | "coming";
export type Expert = {
  id: string;
  name: string;
  field: string;
  country: string;
  status: CollectionStatus;
  synthetic: boolean;
  description: string;
};
const entries = [
  ["Aliko Dangote", "Entrepreneurship and Industry", "Nigeria"],
  ["Ngozi Okonjo-Iweala", "Economics and Global Leadership", "Nigeria"],
  ["Tony Elumelu", "Entrepreneurship and Investment", "Nigeria"],
  ["Ibukun Awosika", "Leadership and Business", "Nigeria"],
  ["Chimamanda Ngozi Adichie", "Writing and Creative Practice", "Nigeria"],
  ["Ndidi Nwuneli", "Social Entrepreneurship and Food Systems", "Nigeria"],
  ["Akinwumi Adesina", "Agriculture and Development", "Nigeria"],
  ["Mo Abudu", "Media and Creative Business", "Nigeria"],
  ["Iyinoluwa Aboyeji", "Technology and Startups", "Nigeria"],
  ["Tara Fela-Durotoye", "Beauty Entrepreneurship", "Nigeria"],
  ["Strive Masiyiwa", "Telecommunications and Entrepreneurship", "Zimbabwe"],
  ["Fred Swaniker", "Education and Leadership", "Ghana"],
  ["Patrick Awuah Jr.", "Education and Ethical Leadership", "Ghana"],
  ["Bethlehem Tilahun Alemu", "Manufacturing and Entrepreneurship", "Ethiopia"],
  ["Rebecca Enonchong", "Technology Entrepreneurship", "Cameroon"],
  ["Juliana Rotich", "Technology and Innovation", "Kenya"],
  ["Wanjira Mathai", "Sustainability and Leadership", "Kenya"],
  ["James Mwangi", "Banking and Financial Inclusion", "Kenya"],
  ["Rapelang Rabana", "Technology and Education", "South Africa"],
  ["Tsitsi Masiyiwa", "Social Impact and Philanthropy", "Zimbabwe"],
];
export const demoId = "00000000-0000-4000-8000-000000000021";
export const experts: Expert[] = [
  ...entries.map(([name, field, country], i): Expert => ({
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    name,
    field,
    country,
    status: i < 10 ? "review" : "coming",
    synthetic: false,
    description: `A proposed ${field.toLowerCase()} collection connected to ${name}. Published materials have not yet been approved for use. Catalogue inclusion does not imply endorsement or authorisation.`,
  })),
  {
    id: demoId,
    name: "Amara Okeke",
    field: "Career Development and Leadership",
    country: "Fictional",
    status: "available",
    synthetic: true,
    description:
      "Fictional Demonstration Expert. This invented profile and its original synthetic learning materials exist only to demonstrate retrieval, citations, and the question flow. It does not represent a real person.",
  },
];
export const statusLabel: Record<CollectionStatus, string> = {
  available: "Available",
  review: "Sources Under Review",
  coming: "Coming Soon",
};
export const disclosure =
  "AI-generated guidance based on selected published sources. NiaGuide does not represent, impersonate or speak on behalf of the featured expert. Check the cited sources before making important decisions.";
export const privacyWarning =
  "Do not share passwords, financial details, medical records or other sensitive personal information.";
export const insufficient =
  "I could not find enough reliable information in this expert’s approved sources to answer that question. Try asking in a different way or choose another expert.";
export const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export type Source = {
  id: string;
  title: string;
  type: string;
  published_at: string;
  url: string | null;
  content: string;
  synthetic: boolean;
};
export const demoSources: Source[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    title: "Small experiments, clearer career choices",
    type: "Synthetic learning note",
    published_at: "2026-09-28",
    url: null,
    synthetic: true,
    content:
      "To explore a career direction, choose a small project that uses a skill you want to develop. Set aside two weeks, define a useful outcome, and ask someone to review your work. Record what energised you, what challenged you, and what you would practise next. Compare these observations before choosing your next experiment.",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    title: "Learning through useful feedback",
    type: "Synthetic learning note",
    published_at: "2026-09-28",
    url: null,
    synthetic: true,
    content:
      "When building a skill or exploring a career, ask a peer or mentor for feedback on one specific piece of work. Ask what is clear, what is missing, and which improvement would matter most. Turn that feedback into one action for the next week. Keep a record of your practice and progress.",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    title: "Leading a student project",
    type: "Synthetic learning note",
    published_at: "2026-09-28",
    url: null,
    synthetic: true,
    content:
      "For a student leadership project, agree on a shared goal and divide responsibilities clearly. Invite each team member to describe what support they need. Use a short weekly check-in to discuss progress and blockers. If a commitment cannot be met, communicate early and agree on a revised plan together.",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    title: "Listening before starting a venture",
    type: "Synthetic learning note",
    published_at: "2026-09-28",
    url: null,
    synthetic: true,
    content:
      "Before starting an entrepreneurship project or business idea, speak with people who experience the problem you want to solve. Ask about their current approach and the difficulties they encounter. Test one small, low-cost prototype with their consent, then use their feedback to improve the idea. Do not assume enthusiasm is proof of demand.",
  },
];
