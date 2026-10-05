// Shared legal-page layout — h1, then the prose div. Mirrors the
// reference's own DOM conventions (live-measured session 7):
//   - an h2 opens a <section> that keeps its children until the next h2
//     or a hoisted paragraph (privacy/terms hoist later paragraphs to the
//     top level; accessibility keeps them in-section)
//   - in-section children after the first carry mt-3; top-level paragraphs
//     are direct prose-div children spaced by its space-y-10
//   - the disclaimer variant (serif-xl italic) and the note variant
//     (sm italic 50% ink) carry the reference's own classes
import type { LegalBlock, LegalPageData, LegalPBlock, LegalUlBlock } from "@/lib/legal";
import { cn } from "@/lib/utils";
import { DeadHashLink } from "@/components/DeadHashLink";

interface Section {
  heading?: string;
  children: Array<LegalPBlock | LegalUlBlock>;
}

/** Group the flat block list into (headingless) top-level runs + sections. */
function groupBlocks(blocks: LegalBlock[]) {
  const sections: Section[] = [];
  let current: Section = { children: [] };
  const push = () => {
    if (current.heading || current.children.length) sections.push(current);
  };
  for (const b of blocks) {
    if (b.kind === "h2") {
      push();
      current = { heading: b.text, children: [] };
    } else if (b.kind === "p" && b.hoist) {
      // A hoisted paragraph closes the open section and renders at the
      // top level (the reference's privacy/terms convention).
      push();
      current = { children: [b] };
    } else {
      current.children.push(b);
    }
  }
  push();
  return sections;
}

const variantClass: Record<NonNullable<LegalPBlock["variant"]>, string> = {
  plain: "",
  disclaimer: "font-serif text-xl italic text-foreground/60",
  note: "text-sm text-foreground/50 italic",
};

function Paragraph({ block, className }: { block: LegalPBlock; className?: string }) {
  // The inline link (accessibility article link): render the link text as
  // an <a> INSIDE the paragraph, splitting on the substring — the sentence
  // text is unchanged (live-measured session 11: the reference wraps the
  // quoted title in a dead "#" link with underline hover:text-foreground).
  const link = block.link;
  let content: React.ReactNode = block.text;
  if (link && block.text.includes(link.text)) {
    const [before, ...rest] = block.text.split(link.text);
    const after = rest.join(link.text);
    content = (
      <>
        {before}
        {/* The dead-# link renders through the DeadHashLink island: the
            reference's SPA router resolves "#" to the current path (no URL
            change, no history entry, instant scroll to top — live-measured
            session 15); the browser's default anchor semantics would append
            "#" and push a history entry. The href ATTRIBUTE stays "#" (the
            links-parity href census pins it). */}
        <DeadHashLink text={link.text} className={link.className} />
        {after}
      </>
    );
  }
  return (
    <p className={cn(variantClass[block.variant ?? "plain"], className)}>
      {block.br
        ? block.text.split("\n").map((line, i, lines) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))
        : content}
    </p>
  );
}

export function LegalPage({ data }: { data: LegalPageData }) {
  const sections = groupBlocks(data.blocks);

  return (
    <section className="pt-40 md:pt-52 pb-28 px-6 md:px-10">
      <div className="max-w-[800px] mx-auto">
        <h1 className="mt-6 font-serif text-5xl md:text-7xl">{data.title}</h1>
        <div className="mt-12 space-y-10 text-foreground/75 leading-[1.8]">
          {sections.map((section, i) =>
            section.heading ? (
              <section key={i}>
                <h2 className="font-serif text-2xl mb-3 text-foreground">{section.heading}</h2>
                {section.children.map((child, j) =>
                  child.kind === "p" ? (
                    <Paragraph block={child} className={j > 0 ? "mt-3" : undefined} key={j} />
                  ) : (
                    <ul className={cn(child.className, j > 0 && "mt-3")} key={j}>
                      {child.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ) : (
              // Top-level run: paragraphs render as DIRECT prose-div children
              // (the reference wraps them in nothing).
              section.children.map((child, j) => (
                <Paragraph block={child as LegalPBlock} key={`${i}-${j}`} />
              ))
            ),
          )}
        </div>
      </div>
    </section>
  );
}
