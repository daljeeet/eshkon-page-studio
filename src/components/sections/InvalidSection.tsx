export const InvalidSection = ({ type }: { type: string }) => {
  return (
    <aside
      role="note"
      className="mx-auto my-4 max-w-2xl rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive"
    >
      Section “{type}” has invalid or missing content and can’t be displayed.
    </aside>
  );
};
