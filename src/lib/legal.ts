// Legal page content — mirrors the reference app's Wix-template legal pages
// (extracted verbatim 2026-10-05; these are template disclaimers, not legal
// advice). The block model mirrors the reference's own DOM conventions,
// which differ per page (live-measured session 7):
//   - privacy/terms: a section wraps its h2 + FIRST paragraph; later
//     paragraphs are hoisted to the top level (40px gaps via space-y-10)
//   - accessibility: sections keep all their children (subsequent mt-3),
//     carry a checklist ul, small-italic "[only add if relevant]" notes,
//     and a <br>-separated coordinator block; its intro renders plain
//     (the serif-italic disclaimer styling belongs to the other pages)

export interface LegalPBlock {
  kind: "p";
  text: string;
  /** plain (default) | disclaimer (serif-xl italic 60%) | note (sm italic 50%) */
  variant?: "plain" | "disclaimer" | "note";
  /** render as a top-level prose-div child, closing the open section (privacy/terms) */
  hoist?: boolean;
  /** render newline-separated text with <br> separators (the coordinator block) */
  br?: boolean;
  /** an inline <a> rendered around a SUBSTRING of text — the accessibility
   *  page's article link (the reference's own dead "#" href, live-measured
   *  session 11; replicated faithfully like the dead manifest declaration) */
  link?: { text: string; href: string; className?: string };
}

export interface LegalH2Block {
  kind: "h2";
  text: string;
}

export interface LegalUlBlock {
  kind: "ul";
  items: string[];
  className: string;
}

export type LegalBlock = LegalPBlock | LegalH2Block | LegalUlBlock;

export interface LegalPageData {
  title: string;
  blocks: LegalBlock[];
}

const legalPrivacyPolicy: LegalPageData = {
  title: "Privacy Policy",
  blocks: [
    { kind: "p", text: "A legal disclaimer", variant: "disclaimer" },
    { kind: "p", text: "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Privacy Policy. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific privacy policies you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Privacy Policy." },
    { kind: "h2", text: "Privacy Policy — the basics" },
    { kind: "p", text: "Having said that, a privacy policy is a statement that discloses some or all of the ways a website collects, uses, discloses, processes, and manages the data of its visitors and customers. It usually also includes a statement regarding the website's commitment to protecting its visitors' or customers' privacy, and an explanation about the different mechanisms the website is implementing in order to protect privacy." },
    { kind: "p", text: "Different jurisdictions have different legal obligations of what must be included in a Privacy Policy. You are responsible to make sure you are following the relevant legislation to your activities and location.", hoist: true },
    { kind: "h2", text: "What to include in the Privacy Policy" },
    { kind: "p", text: "Generally speaking, a Privacy Policy often addresses these types of issues: the types of information the website is collecting and the manner in which it collects the data; an explanation about why is the website collecting these types of information; what are the website's practices on sharing the information with third parties; ways in which your visitors and customers can exercise their rights according to the relevant privacy legislation; the specific practices regarding minors' data collection; and much, much more." },
  ],
};

const legalTermsConditions: LegalPageData = {
  title: "Terms & Conditions",
  blocks: [
    { kind: "p", text: "A legal disclaimer", variant: "disclaimer" },
    { kind: "p", text: "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of Terms & Conditions. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific terms you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Terms & Conditions." },
    { kind: "h2", text: "Terms & Conditions — the basics" },
    { kind: "p", text: "Having said that, Terms and Conditions (\"T&C\") are a set of legally binding terms defined by you, as the owner of this website. The T&C set forth the legal boundaries governing the activities of the website visitors, or your customers, while they visit or engage with this website. The T&C are meant to establish the legal relationship between the site visitors and you as the website owner." },
    { kind: "p", text: "T&C should be defined according to the specific needs and nature of each website. For example, a website offering products to customers in e-commerce transactions requires T&C that are different from the T&C of a website only providing information (like a blog, a landing page, and so on).", hoist: true },
    { kind: "p", text: "T&C provide you as the website owner the ability to protect yourself from potential legal exposure, but this may differ from jurisdiction to jurisdiction, so make sure to receive local legal advice if you are trying to protect yourself from legal exposure.", hoist: true },
    { kind: "h2", text: "What to include in the T&C document" },
    { kind: "p", text: "Generally speaking, T&C often address these types of issues: Who is allowed to use the website; the possible payment methods; a declaration that the website owner may change his or her offering in the future; the types of warranties the website owner gives his or her customers; a reference to issues of intellectual property or copyrights, where relevant; the website owner's right to suspend or cancel a member's account; and much, much more." },
  ],
};

const legalAccessibilityStatement: LegalPageData = {
  title: "Accessibility Statement",
  blocks: [
    { kind: "p", text: "The purpose of the following template is to assist you in writing your accessibility statement. Please note that you are responsible for ensuring that your site's statement meets the requirements of the local law in your area or region." },
    { kind: "p", text: "*Note: This page currently has several sections. Once you complete editing the Accessibility Statement below, you need to delete this section.", variant: "note" },
    { kind: "p", text: "To learn more about this, check out our article \"Accessibility: Adding an Accessibility Statement to Your Site\".", link: { text: "\"Accessibility: Adding an Accessibility Statement to Your Site\"", href: "#", className: "underline hover:text-foreground" } },
    { kind: "h2", text: "Accessibility Statement" },
    { kind: "p", text: "This statement was last updated on [enter relevant date]." },
    { kind: "p", text: "We at [enter organization / business name] are working to make our site [enter site name and address] accessible to people with disabilities." },
    { kind: "h2", text: "What Web Accessibility Is" },
    { kind: "p", text: "An accessible site allows visitors with disabilities to browse the site with the same or a similar level of ease and enjoyment as other visitors. This can be achieved with the capabilities of the system on which the site is operating, and through assistive technologies." },
    { kind: "h2", text: "Accessibility Adjustments on This Site" },
    { kind: "p", text: "We have adapted this site in accordance with WCAG [2.0 / 2.1 / 2.2 — select relevant option] guidelines, and have made the site accessible to the level of [A / AA / AAA — select relevant option]. This site's contents have been adapted to work with assistive technologies, such as screen readers and keyboard use. As part of this effort, we have also [remove irrelevant information]:" },
    { kind: "ul", className: "list-disc pl-6 mt-3 space-y-1", items: [
      "Used the Accessibility Wizard to find and fix potential accessibility issues",
      "Set the language of the site",
      "Set the content order of the site's pages",
      "Defined clear heading structures on all of the site's pages",
      "Added alternative text to images",
      "Implemented color combinations that meet the required color contrast",
      "Reduced the use of motion on the site",
      "Ensured all videos, audio, and files on the site are accessible",
    ] },
    { kind: "h2", text: "Declaration of Partial Compliance With the Standard Due to Third-Party Content" },
    { kind: "p", text: "[only add if relevant]", variant: "note" },
    { kind: "p", text: "The accessibility of certain pages on the site depend on contents that do not belong to the organization, and instead belong to [enter relevant third-party name]. The following pages are affected by this: [list the URLs of the pages]. We therefore declare partial compliance with the standard for these pages." },
    { kind: "h2", text: "Accessibility Arrangements in the Organization" },
    { kind: "p", text: "[only add if relevant]", variant: "note" },
    { kind: "p", text: "[Enter a description of the accessibility arrangements in the physical offices / branches of your site's organization or business. The description can include all current accessibility arrangements — starting from the beginning of the service (e.g., the parking lot and / or public transportation stations) to the end (such as the service desk, restaurant table, classroom etc.). It is also required to specify any additional accessibility arrangements, such as disabled services and their location, and accessibility accessories (e.g. in audio inductions and elevators) available for use]" },
    { kind: "h2", text: "Requests, Issues, and Suggestions" },
    { kind: "p", text: "If you find an accessibility issue on the site, or if you require further assistance, you are welcome to contact us through the organization's accessibility coordinator:" },
    { kind: "p", text: "[Name of the accessibility coordinator]\n[Telephone number of the accessibility coordinator]\n[Email address of the accessibility coordinator]\n[Enter any additional contact details if relevant / available]", br: true },
  ],
};

const legalRefundPolicy: LegalPageData = {
  title: "Refund Policy",
  blocks: [
    { kind: "p", text: "A legal disclaimer", variant: "disclaimer" },
    { kind: "p", text: "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Refund Policy. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific refund policies that you wish to establish between your business and your customers. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Refund Policy." },
    { kind: "h2", text: "Refund Policy — the basics" },
    { kind: "p", text: "Having said that, a Refund Policy is a legally binding document that is meant to establish the legal relations between you and your customers regarding how and if you will provide them with a refund. Online businesses selling products are sometimes required (depending on local laws and regulations) to present their product return policy and refund policy. In some jurisdictions, this is needed in order to comply with consumer protection laws. It may also help you avoid legal claims from customers that are not satisfied with the products they purchased." },
    { kind: "h2", text: "What to include in the Refund Policy" },
    { kind: "p", text: "Generally speaking, a Refund Policy often addresses these types of issues: the timeframe for asking for a refund; will the refund be full or partial; under which conditions will the customer receive a refund; and much, much more." },
    { kind: "h2", text: "Payment Method Disclaimer" },
    { kind: "p", text: "These payment methods are for illustrative purposes only. Update this section to show the payment methods your website accepts based on your payment processor(s)." },
  ],
};

export const LEGAL_PAGES = {
  privacy: legalPrivacyPolicy,
  terms: legalTermsConditions,
  accessibility: legalAccessibilityStatement,
  refund: legalRefundPolicy,
} as const;
