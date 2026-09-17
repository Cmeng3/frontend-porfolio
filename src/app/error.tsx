"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="main-content" className="page-shell">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="lede">The content could not be loaded. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
