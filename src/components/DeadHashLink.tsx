"use client";

// The reference's dead "#" links resolve through its SPA router, not the
// browser's anchor semantics (live-measured session 15): clicking one makes
// NO URL change (no hash appended), pushes NO history entry, and scrolls
// INSTANTLY to the top (scrollY reads 0 synchronously — the instant read
// distinguishes it from the smooth restores under the shared
// html { scroll-behavior: smooth }). The browser default would append "#"
// and push a history entry. The island replicates the router's semantics:
// preventDefault + instant scrollTo(0, 0). The href ATTRIBUTE stays "#"
// (the links-parity href census pins it); only the click semantics change.
// Modifier-clicks / middle-clicks fall through to the browser default —
// the island only handles plain left-clicks.
export function DeadHashLink({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <a
      href="#"
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return;
        }
        e.preventDefault();
        window.scrollTo(0, 0);
      }}
    >
      {text}
    </a>
  );
}
