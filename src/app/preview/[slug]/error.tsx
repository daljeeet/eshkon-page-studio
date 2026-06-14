"use client";

// Route-level error boundary: any uncaught render error in the preview subtree
// lands here instead of crashing the app.
export default function PreviewError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main role="alert" className="mx-auto max-w-2xl p-12 text-center">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        This page could not be rendered.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2"
      >
        Try again
      </button>
    </main>
  );
}
