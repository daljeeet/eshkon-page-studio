"use client";

import {
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from "@/store/hooks";
import {
  publishStarted,
  publishSucceeded,
  publishFailed,
} from "@/store/publishSlice";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/rbac";

export function PublishPanel({ role }: { role: Role }) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const status = useAppSelector((s) => s.publish.status);
  const version = useAppSelector((s) => s.publish.version);
  const bump = useAppSelector((s) => s.publish.bump);
  const changelog = useAppSelector((s) => s.publish.changelog);
  const error = useAppSelector((s) => s.publish.error);

  const canPublish = role === "publisher";

  const onPublish = async () => {
    const page = store.getState().draftPage.page;
    if (!page) return;
    dispatch(publishStarted());
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      dispatch(
        publishSucceeded({
          version: data.version,
          bump: data.bump,
          changelog: (data.changelog ?? []).join("\n"),
        }),
      );
    } catch (e) {
      dispatch(publishFailed(e instanceof Error ? e.message : "Publish failed"));
    }
  };

  return (
    <section aria-labelledby="publish-heading" className="space-y-3 border-t pt-4">
      <h2 id="publish-heading" className="font-semibold">
        Publish
      </h2>

      {!canPublish && (
        <p className="text-sm text-muted-foreground">
          Your role (<strong>{role}</strong>) cannot publish. The server will also
          reject the request — UI is not the security boundary.
        </p>
      )}

      <Button
        type="button"
        onClick={onPublish}
        disabled={!canPublish || status === "publishing"}
      >
        {status === "publishing" ? "Publishing…" : "Publish release"}
      </Button>

      {/* Announce results to assistive tech. */}
      <div aria-live="polite" className="space-y-1 text-sm">
        {status === "done" && version && (
          <>
            <p className="text-foreground">
              Published <strong>v{version}</strong> ({bump}).
            </p>
            {changelog && (
              <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-xs text-muted-foreground">
                {changelog}
              </pre>
            )}
          </>
        )}
        {status === "error" && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
