Site A: https://luminous-sanctuary-copy-copy-c-d44ac1
b2.base44.app/

Site B: https://beauty-salon.jesspete.shop/

## F04: Contact page content not observed
Description. Multiple independent fetches of Site B /contact returned only the global footer (“Begin your transformation”) and no “Find us in the light” address module that Site A renders on the same route.

Evidence. web_fetch markdown/html and a JS-executing reader all omitted the contact body on Site B; Site A /contact extracted the full address, tel, mail, Instagram, hours, and directions link.

Impact. If the body is missing or non-semantic, the primary conversion-adjacent page is broken. If it is canvas/shadow-DOM only, it is invisible to assistive tech and crawlers.

Fix. Render contact details as semantic HTML. Match Site A’s information architecture, with corrected NAP.
Confidence · Reasoned

## F05: "Seamless Scheduler" is not a schedular (`/book` , `/book/confirmation`)
Description. The booking UI is a request form (name, email, phone, stylist, service, preferred date/time, notes) promising confirmation “within 2 business hours.” There is no slot inventory, no payment, no conflict check. Site A’s confirmation is reachable without submitting a booking and still announces success, with an ICS that timestamps “now” rather than a chosen appointment.

Evidence. Form field labels on both /book pages; Site A confirmation copy and data:text/calendar UID 1791240259072; cancellation policy 24h / 50% / no-show full charge.

Impact. Customers believe they have reserved time. Staff receive unstructured requests, or nothing. Cancellation fees are asserted without a real booking record.

Fix. Integrate a real booking engine (or clearly label “request only”), persist submissions, gate confirmation on a real ID, and stop generating dummy calendar events.
Confidence · Verified

## F07: No sitemap; mixed SEO hygience
Description. Site B 404s on /sitemap.xml. Homepage title is correctly branded. Site A has a sitemap of all 12 routes but a generic title and a noscript directory.

Evidence. GET /sitemap.xml on Site B returned unavailable; Site A sitemap.xml lists 12 URLs with weekly changefreq.

Impact. Site B’s SSR advantage is partly wasted without a sitemap and with thin confirmation/contact HTML.

Fix. Add sitemap.xml and robots.txt that point to it. Unique titles and descriptions per route.
Confidence · Verified 
