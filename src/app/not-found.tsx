import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="page-shell">
      <p className="eyebrow">404</p>
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="lede">This page may have moved or is not published yet.</p>
      <Link className="button" href="/">
        Back to home
      </Link>
    </main>
  );
}
