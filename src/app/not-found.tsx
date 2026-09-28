import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container page-shell">
      <div className="empty">
        <h1>A different path, perhaps?</h1>
        <p>We couldn’t find this page or collection.</p>
        <Link className="button" href="/experts">
          Explore collections
        </Link>
      </div>
    </div>
  );
}
