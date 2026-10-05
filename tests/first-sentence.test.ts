import { describe, expect, it } from "vitest";
import { firstSentence } from "@/lib/content";

// The service-detail description-heading contract (session 7, F1a):
// the reference renders the FIRST SENTENCE of longDescription as the
// giant serif H2 of the description section (live-measured 8/8 —
// e.g. balayage: "Our Signature Balayage is a freehand color
// application performed by our master colorists."), NOT a composed
// "name — tagline" line. The helper must split at the first ". "
// boundary and never throw.

describe("firstSentence (the service detail description heading)", () => {
  it("returns the first sentence of a multi-sentence text", () => {
    expect(firstSentence("One sentence. Two sentences. Three sentences.")).toBe("One sentence.");
  });

  it("splits at the FIRST period-space boundary only", () => {
    const balayage =
      "Our Signature Balayage is a freehand color application performed by our master colorists. Each strand is hand-selected and painted to create movement, dimension, and a finish that grows out beautifully for up to four months.";
    expect(firstSentence(balayage)).toBe(
      "Our Signature Balayage is a freehand color application performed by our master colorists.",
    );
  });

  it("returns the whole text when there is no sentence boundary", () => {
    expect(firstSentence("A single unbroken statement")).toBe("A single unbroken statement");
  });

  it("handles a trailing-only period (no second sentence)", () => {
    expect(firstSentence("Designed for the bride who wants to feel unmistakably herself.")).toBe(
      "Designed for the bride who wants to feel unmistakably herself.",
    );
  });

  it("handles the empty string without throwing", () => {
    expect(firstSentence("")).toBe("");
  });
});
