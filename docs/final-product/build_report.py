"""Generate the five-page assessment report from observed results. No secret reads."""
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'NiaGuide_Africa_Final_Technical_Report.pdf'
navy = colors.HexColor('#102742')
teal = colors.HexColor('#007D81')
muted = colors.HexColor('#52647A')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyReport', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=navy, spaceAfter=8))
styles.add(ParagraphStyle(name='SmallReport', fontName='Helvetica', fontSize=8, leading=11, textColor=navy, spaceAfter=5))
styles.add(ParagraphStyle(name='TableReport', fontName='Helvetica', fontSize=8, leading=10.8, textColor=navy))
styles.add(ParagraphStyle(name='SectionReport', fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=teal, spaceBefore=9, spaceAfter=7))
styles.add(ParagraphStyle(name='TitleReport', fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=navy, spaceAfter=10))
story=[]
def p(text, style='BodyReport'):
    story.append(Paragraph(text,styles[style]))
def h(text): p(text,'SectionReport')
def table(headers, rows, widths):
    data=[[Paragraph('<b>'+escape(str(x))+'</b>',styles['TableReport']) for x in headers]]
    data += [[Paragraph(escape(str(x)), styles['TableReport']) for x in row] for row in rows]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#DDEFEF')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F5F7FA')]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,0),0.8,teal)]))
    story.append(t);story.append(Spacer(1,8))
def page(title):
    if story: story.append(PageBreak())
    p(title,'TitleReport')
def footer(c,d):
    c.setStrokeColor(teal);c.line(44,43,A4[0]-44,43)
    c.setFont('Helvetica',8);c.setFillColor(muted)
    c.drawString(44,29,'NiaGuide Africa | Peter Nnamchukwu | 31 October 2026')
    c.drawRightString(A4[0]-44,29,str(d.page)+' / 5')

page('NiaGuide Africa')
p('<b>Final product technical report</b> | Software Engineering capstone<br/>Peter Nnamchukwu | African Leadership University, Kigali')
p('NiaGuide helps Nigerian university students aged 18-25 explore selected African expert materials through questions, AI-generated guidance and inspectable sources. It does not impersonate experts or train a new model. This report describes the current implementation and observed limitations, not a claim of full production readiness.')
h('1. Scope alignment and feature validation')
p('Baseline: supplied complete research proposal FR1-FR10 and archived brief. Supervisor approval/version precedence was not revalidated. Evidence paths below are relative to the repository root. Full mapping: docs/final-product/SCOPE_ALIGNMENT.md.','SmallReport')
table(['Planned feature / purpose','Status','Evidence and qualification'],[
('FR1: about 20 approved collections; discover experts','Partial','24 real profiles; 16 available; 211 approved documents; 3,880 passages (live aggregate query, Oct 31). Inactive cards remain visible with labels.'),
('FR2-FR3: ask questions; collection-scoped search','Implemented','ask-form.tsx; api/ask/route.ts; ranked retrieval SQL. Input and unit checks pass; full remote account isolation pending.'),
('FR4-FR5: grounded answer and source previews','Partial / working path','Joyce answer, citations and original-source preview passed. Adesina generation verified but persistence failed 22P05.'),
('FR6: refuse weak evidence','Implemented','Unit tests cover genuine insufficiency and invalid output. No fresh live unanswerable benchmark.'),
('FR7: ratings and problem reports','Partial validation','UI and activity API implemented. Save journey checked; full feedback/report persistence not freshly verified.'),
('FR8: manage experts and documents','Partial','Protected overview/status API; operator SQL ingestion. Full document upload/review UI and audit workflow absent.'),
('FR9: embedding rebuild / semantic search','Not implemented','Ranked full-text search plus query reformulation replaces planned vectors; no embedding calls/rebuild UI.'),
('FR10: coded research evaluation logs','Partial','User-owned history, model, citations and latency exist; no complete coded research export/study evidence.')
],[155,78,274])
p('<b>Additional gaps:</b> current mobile validation, public application deployment evidence, voice input and audio output. Changes in search approach, admin tooling and study sample require supervisor agreement.','SmallReport')

page('How the product works')
h('2. Frontend, backend and data flow')
table(['Stage','Implementation and responsibility'],[
('1. Browser form','React AskForm stores the draft, selected expert and visible messages. POST /api/ask sends question, expertId and at most two recent exchanges as context.'),
('2. Server checks','Next.js route bounds request bytes, validates the schema, checks authentication, reserves a question attempt and loads expert status/field.'),
('3. Plan and retrieve','OpenAI prepares a clarification or search plan. PostgreSQL retrieves approved, rights-cleared passages belonging to that expert. Original query and reformulations are deduplicated/rank-fused.'),
('4. Generate and check','Server builds original-text evidence windows. Model returns claims and evidence IDs; server attaches quotations and checks references. Invalid output gets one retry; genuine insufficiency remains a limitation.'),
('5. Store and display','store_guidance saves question, answer, model, latency and citation IDs under the signed-in user. The response displays sources, disclosure, save and feedback controls. Storage failure returns an error.')
],[105,402])
h('Tools and deployment responsibilities')
p('<b>Frontend:</b> Next.js 16.3.6, React 19.3.0, TypeScript 6.0.3 and Tailwind CSS 4.3.3. <b>Backend:</b> Node.js, Next.js routes and Zod validation. <b>Services:</b> Supabase Auth/PostgreSQL and the server-side OpenAI SDK. Observed answer model: gpt-4.1-mini. Existing credentials were not read or printed.')
p('Supabase is live. Vercel is the intended application host, but no public application URL was supplied or verified. Local production build/start was verified on Windows with Node 24.11.1 and npm 11.6.2. No APK is needed for this web product.')
h('Data relationships and source preparation')
p('<b>experts -> source_documents -> passages</b>; <b>queries -> answers -> citations -> passages</b>. Foreign keys link each passage to a document and expert, and each answer to its evidence. Source records include URLs, rights and review metadata. Original transcripts are divided into timestamped passages; source text is not replaced by an AI summary.')
p('The owner confirmed reuse scope during imports. This task did not independently audit permission documents, every spoken word or speaker attribution. Historical figures and third-party narration require context. Account history is not a coded, anonymous research dataset.')
h('Security boundaries')
p('OpenAI calls run server-side. Database RLS, user ownership, source approval and rights checks remain in place. Rate reservation allows 10 question attempts per hour per account. Inputs/outputs are bounded and rendered as text. Two-account isolation, production security settings and semantic answer evaluation remain release checks.')

page('Testing and observed results')
h('3. Relevant testing approaches')
table(['Approach / reason','How conducted','Observed result'],[
('Unit/regression: protect deterministic logic','npm test; tests/grounding.test.ts','19 passed, 0 failed. Covers plans, context, evidence, quote/index rejection, retries and four-source storage cap. Uses synthetic/mocked cases.'),
('HTTP functional/integration: built routes','check-http.mjs against production localhost:3100','17/17 passed: ten page GETs; valid signed-out request 401; six invalid/cross-origin/oversize cases 400.'),
('Signed-in browser: real user journey','Joyce question, citation expansion and Save','Practical answer with four passages; original-source preview opened. Save acknowledged. Persistence/history reload checked in supplementary record.'),
('Negative live observation','Adesina leadership question','Generation verified with four sources; storage failed 22P05. Draft preserved; error shown. Cause unresolved.'),
('Static/build checks','lint; typecheck; production build','All passed Oct 31. Compile phase 15.4 seconds; then type checking and generation. No fresh dependency-install audit.')
],[131,173,203])
h('Performance: measured limits')
p('Ten sequential local GETs to the home page: <b>median 10 ms, p95 13 ms, range 7-13 ms</b>. Initial dynamic page requests were 690 ms (experts), 427 ms (ask) and 529 ms (dashboard). This small local experiment includes cache/order effects; it is not browser page-load time, internet speed, concurrency capacity or AI latency.')
p('The single successful Joyce answer displayed <b>8,758 ms</b> server/model-path latency. One case cannot establish average speed, reliability or answer quality. No load/stress test was performed.')
h('Improvements and retests')
p('Today: lint found 24 CommonJS-rule errors in 12 offline transcript helpers. Narrow comments now explain the Node-only syntax; lint rerun passed. Earlier: evidence selection was reduced from six to four to match storage limits; regression passes. Repeated clarification was bounded by schema, and continuous chat replaced separate panels. The 22P05 failure remains an open defect.')
p('<b>Evidence:</b> docs/final-product/evidence/http-results.json; unit-tests.txt; lint.txt; typecheck.txt; TESTING_AND_RESULTS.md. Historical checks are in docs/VERIFICATION.md and are not presented as fresh results.','SmallReport')

page('Engineering and problem-solving')
h('4. Appropriate algorithms')
table(['Logic','How it works / trade-off'],[
('Ranked lexical retrieval','PostgreSQL English full-text search matches query terms. Candidate threshold requires at least min(2,total terms) matches and at least 50% term coverage; then ranks coverage and text relevance. Filters preserve expert, rights and approval boundaries.'),
('Multi-query evidence selection','Search original plus at most three reformulations. Map deduplicates passage IDs. Accumulate (1.2 for original, otherwise 1)/(rank+1), sort, cap source characters at 30,000 and select at most four passages. This is weighted reciprocal-rank fusion, not vector search.'),
('Evidence windows and bounded repair','Overlapping word-boundary excerpts up to 600 characters preserve exact source text. Model selects IDs. Unknown IDs or invalid claim references fail; one repair attempt. No-source and genuine insufficiency outcomes remain distinct.'),
('Conversation control','Keep the visible chat for the tab session, send only two bounded exchanges to the model, reset on expert change/new chat/refresh. After an exchange, response schema disallows another clarification.')
],[133,374])
p('Candidate processing uses a Map plus sorting: for n returned candidates, fusion is approximately O(n) and sorting O(n log n). At most four searches return four candidates each. Database query time still depends on corpus size, indexes and network; no broad scalability benchmark was run. Query expansion improves wording coverage but can still miss relevant material.')
h('Code quality, abstraction and OOP relevance')
p('The application primarily uses <b>functional modules and composition</b>. AskForm and AnswerCard are reusable components. serverDb hides Supabase connection setup; retrieveWithPlan accepts a search function, separating ranking from the database adapter; checkedGeneration accepts generation/report callbacks. These boundaries support focused tests and single responsibilities.')
p('Strict TypeScript, Zod schemas, named exports, typed data contracts and separate UI/API/data modules improve readability. There is <b>no custom class-inheritance hierarchy</b>; class inheritance and subtype polymorphism should not be claimed. Composition and interface boundaries are used where relevant rather than forcing an OOP design.')
p('<b>Main code:</b> src/components/ask-form.tsx; src/app/api/ask/route.ts; src/lib/conversation.ts; src/lib/evidence-generation.ts; src/lib/checked-generation.ts; src/lib/supabase/server.ts; supabase/migrations/202610130001_ranked_retrieval.sql.','SmallReport')

page('Compatibility and delivery')
h('5. Current evidence and remaining work')
table(['Area','Verified / outstanding'],[
('Desktop environment','In-app Chromium, observed 1280x720; document width 1265 px, no document horizontal overflow in observed chat. Exact engine version/CPU/RAM not collected.'),
('Mobile and hardware','Requested 390x844 override did not apply; viewport stayed 1280x720. No new mobile pass. Historical Sep 28 screenshots do not verify the new chat. Real-phone keyboard, low/high-end comparison and second OS/browser remain pending.'),
('Public deployment','Supabase backend live. Vercel intended host. Public application URL, host settings, TLS/auth callbacks and external reachability not verified in this task.'),
('Release validation','Resolve intermittent 22P05; test two ordinary accounts/admin access; feedback/report persistence; semantic grounding benchmark; current mobile/accessibility and source/audio review.'),
('Repository and media','Current local source includes changes not yet published. README links this PDF and walkthrough guide. Actual video, accessible video URL and final ZIP remain to be supplied after recording. No LMS submission made.')
],[134,373])
h('Reproduction and submission')
p('Install with npm ci using a supported Node.js version (tested 24.11.1). Demo: npm run setup:demo, then npm run dev in a fresh copy without an existing environment file. Live setup uses server-only credentials and reviewed ordered migrations on a new database. Never rerun foundation/catalogue migrations on the existing live project.')
p('Primary submission: repository URL with README, accessible report and video links. Second submission: ZIP of the same source with the report and actual video file. Exclude credentials, caches, node_modules and private research data. Source imports contain licensed text: confirm repository redistribution scope before publicly publishing those artifacts.')
h('Interpretation and acknowledgement')
p('Passing checks demonstrate specific behaviors, not universal correctness, legal clearance or production readiness. Exact source provenance does not prove semantic entailment. No completed student study, full mobile certification, penetration test or comparative hardware result is claimed.')
p('OpenAI Codex assisted with implementation, debugging, testing and this documentation. The student must review the report against the approved proposal, rehearse the actual code, acknowledge assistance according to course requirements and take responsibility for the submission. No declaration of independent authorship or full personal code review is made.')
p('<b>Supporting files:</b> SCOPE_ALIGNMENT.md; TESTING_AND_RESULTS.md; VIDEO_WALKTHROUGH_GUIDE.md; evidence/*. All are in docs/final-product. This report is five pages; supplementary records are separate.','SmallReport')

doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=40,bottomMargin=57,title='NiaGuide Africa - Final Product Technical Report',author='Peter Nnamchukwu')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
