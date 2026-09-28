const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const run = async () => {
  const cases = [
    [
      "relevant",
      {
        expertId: "00000000-0000-4000-8000-000000000021",
        question: "How can I explore a career and practise a new skill?",
      },
      200,
      false,
    ],
    [
      "unrelated",
      {
        expertId: "00000000-0000-4000-8000-000000000021",
        question: "What is quantum entanglement?",
      },
      200,
      true,
    ],
    [
      "real expert",
      {
        expertId: "00000000-0000-4000-8000-000000000001",
        question: "How can I lead a student project?",
      },
      200,
      true,
    ],
    ["invalid", { expertId: "wrong", question: "short" }, 400, null],
  ];
  for (const [label, body, status, insufficient] of cases) {
    const r = await fetch(base + "/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (
      r.status !== status ||
      (insufficient !== null && j.insufficient !== insufficient)
    )
      throw new Error(label + " failed");
    console.log(label + ": PASS " + r.status);
  }
  for (const [label, headers, body] of [
    [
      "cross origin",
      { "Content-Type": "application/json", Origin: "https://other.example" },
      "{}",
    ],
    [
      "oversized",
      { "Content-Type": "application/json", Origin: base },
      "x".repeat(9000),
    ],
    ["malformed", { "Content-Type": "application/json", Origin: base }, "{"],
  ]) {
    const r = await fetch(base + "/api/ask", { method: "POST", headers, body });
    if (r.status !== 400) throw new Error(label + " failed");
    console.log(label + ": PASS " + r.status);
  }
  for (const path of [
    "/",
    "/experts",
    "/ask",
    "/dashboard",
    "/questions",
    "/saved",
    "/profile",
    "/admin",
    "/sign-in",
    "/register",
    "/sources",
    "/about",
    "/how-it-works",
    "/experts/00000000-0000-4000-8000-000000000021",
  ]) {
    const r = await fetch(base + path);
    if (r.status !== 200) throw new Error(path + " failed");
    console.log(path + ": 200");
  }
};
run().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
