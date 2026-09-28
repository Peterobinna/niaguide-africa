"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page-shell">
      <div className="empty">
        <h1>Something interrupted your visit.</h1>
        <p>Please try again. Your saved information has not been changed.</p>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
