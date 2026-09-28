"use client";
import { useEffect, useState } from "react";
import { demoMode } from "@/lib/catalogue";
import { clearLocal } from "@/lib/local-history";
import { browserDb } from "@/lib/supabase/client";
export function ProfileSettings() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    async function loadProfile() {
      if (demoMode) return;
      try {
        const db = browserDb();
        const { data } = await db.auth.getUser();
        if (data.user)
          setName(String(data.user.user_metadata.display_name ?? ""));
        else setMessage("Sign in to edit your profile.");
      } catch {
        setMessage("Authentication is not configured.");
      }
    }
    void loadProfile();
  }, []);
  return (
    <section className="panel">
      <h2>{demoMode ? "Your demonstration data" : "Your profile"}</h2>
      {demoMode ? (
        <>
          <p>
            Demo history, saved answers, and feedback are stored in this
            browser’s local storage. They are not sent to an administrator or
            linked to an account.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              clearLocal();
              setMessage(
                "Demo history, saves, and feedback have been cleared.",
              );
            }}
          >
            Clear demo data
          </button>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const { error } = await browserDb().auth.updateUser({
                data: { display_name: name },
              });
              setMessage(
                error
                  ? "Unable to update your profile."
                  : "Display name updated.",
              );
            } catch {
              setMessage("Unable to connect.");
            }
          }}
        >
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            maxLength={80}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="button" style={{ marginTop: 15 }}>
            Save profile
          </button>
        </form>
      )}
      <p role="status" className="success" style={{ marginTop: 15 }}>
        {message}
      </p>
      <h3 style={{ marginTop: 30 }}>Privacy and your choices</h3>
      <p>
        Live questions and answers are stored with your account. Relevant source
        passages and your question are sent to OpenAI to prepare guidance. Avoid
        sensitive personal information. Ask your project administrator about
        access or deletion before participating in research.
      </p>
    </section>
  );
}
