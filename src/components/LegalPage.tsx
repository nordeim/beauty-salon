// Shared legal-page layout — h1, italic serif disclaimer line, then prose
// sections (each h2 groups with its following paragraphs, mirroring the
// reference's <section><h2/><p/></section> structure).
import type { LegalBlock, LegalPageData } from "@/lib/legal";

interface Section {
  heading?: string;
  paragraphs: string[];
}

function groupBlocks(blocks: LegalBlock[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { paragraphs: [] };
  for (const b of blocks) {
    if (b.kind === "h2") {
      if (current.heading || current.paragraphs.length) sections.push(current);
      current = { heading: b.text, paragraphs: [] };
    } else {
      current.paragraphs.push(b.text);
    }
  }
  if (current.heading || current.paragraphs.length) sections.push(current);
  return sections;
}

export function LegalPage({ data }: { data: LegalPageData }) {
  const [disclaimerBlock, ...rest] = data.blocks;
  const disclaimer = disclaimerBlock?.kind === "p" ? disclaimerBlock.text : null;
  const sections = groupBlocks(disclaimerBlock && disclaimer ? rest : data.blocks);

  return (
    <section className="pt-40 md:pt-52 pb-28 px-6 md:px-10">
      <div className="max-w-[800px] mx-auto">
        <h1 className="mt-6 font-serif text-5xl md:text-7xl">{data.title}</h1>
        <div className="mt-12 space-y-10 text-foreground/75 leading-[1.8]">
          {disclaimer && <p className="font-serif text-xl italic text-foreground/60">{disclaimer}</p>}
          {sections.map((section, i) =>
            section.heading ? (
              <section key={i}>
                <h2 className="font-serif text-2xl mb-3 text-foreground">{section.heading}</h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className={j > 0 ? "mt-4" : ""}>
                    {p}
                  </p>
                ))}
              </section>
            ) : (
              <div key={i}>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className={j > 0 ? "mt-4" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
