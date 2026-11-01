part 1: Our Vision: Our vision is to grow dev.NeloStudios into a recognised photography and videography studio known for creativity, professionalism, modern equipment and excellent customer service. Target Audience: • Individuals and families • Weddings and special events • Businesses and brands • Models, artists and content creators • Schools and organisations • Social-media creators

Startup Budget Example: A realistic professional startup should budget for the camera system, drone, lighting, audio, stabilisation, storage, editing computer, cases and studio accessories. Depending on the selected camera/drone tier, the equipment investment can easily move into the R200 000–R350 000+ range before premises, insurance, website costs and other business expenses. Website Features: • Homepage with hero photography/video • About page • Services and packages • Portfolio gallery • Booking/enquiry form • Testimonials • Contact and social media links • Mobile responsive design • Optimised photography and video galleries Timeline and Milestones: • Week 1: Business research, service planning and equipment requirements • Week 2: Website structure, branding and portfolio planning • Week 3: HTML/CSS development, responsive design and JavaScript • Week 4: Testing, debugging and final content

Technical Requirements: • Domain: To be confirmed • HTML, CSS and JavaScript • Responsive desktop/tablet/mobile design • Image compression and optimisation • Video optimisation • Git/GitHub repository • Secure booking/contact form

Website Goals and Objectives: • Build brand awareness • Showcase a professional portfolio • Display services and packages • Allow booking and quotation enquiries • Build trust through testimonials • Create a fast, responsive mobile-friendly website

Part 2 Update Notes

This covers the changes made to the site to align it with the Part 2 brief (CSS Styling and Responsive Design) required from the guidelines/rubric. Every image tag was left in its original position in the layout nothing was added, removed, or reordered only attributes on those tags were extended.

1
my nav links pointed to About Us.html, Products & Services.html and News & Updates.html, but spaces and & in filenames break links on real web servers (the & especially, since it's a reserved URL character). The files are renamed to URL-safe names and every href across all six pages now points to the correct one

2. Body classes added
style.css already had a full set of per page rules (body.page-index, body.page-about, body.page-contact, body.page-gallery, body.page-news, body.page-products) but none of the HTML body tags actually carried those classes, so none of that page specific CSS backgrounds, page specific colours, form styling was being applied. Each page now has its matching class, e.g. <body class="page-gallery">.

3. rel="Stylesheet" casing
Index.html had rel="Stylesheet" (capital S). Browsers accept it, but it's fixed to lowercase rel="stylesheet" for standards consistency with the other five pages.

4. Relative units (brief 3.2)
Several fixed-pixel sizes in style.css were converted to rem so they scale with the base font size instead of staying rigid, per the "use relative units like em/rem" requirement:

Logo (header img): 110px → 6.875rem (desktop), 90px → 5.625rem (mobile breakpoint)
Instagram image: 500px → 31.25rem
Gallery video width: 500px → 31.25rem
Gallery "creative work" images: 500px → 31.25rem
Photography grid image height: 300px → 18.75rem
Packages/pricing image: 900px → 56.25rem
News page pricing image inline style: 700px → 43.75rem
Widths/heights that were already %-based (main content, forms, lists, videos) were left as-is — they already satisfy this requirement.

5. Responsive images with srcset/sizes (brief 3.3)
This was the one requirement not implemented anywhere in the original markup. It's now added in two patterns:

Logo and pricing images (header img, packages image, news pricing image): a 1x/2x srcset for high-density (retina) screens, e.g. srcset="images/photo.jpg 1x, images/photo@2x.jpg 2x".
Photography grid images (Gallery.html): a full width-descriptor srcset with a matching sizes attribute, so the browser picks the right file for the column width at each breakpoint:
srcset="images/studio1-480w.jpg 480w, images/studio1-800w.jpg 800w, images/studio1-1200w.jpg 1200w"
sizes="(max-width: 768px) 100vw, (max-width: 1100px) 33vw, 350px"
Action needed from you: the srcset markup references extra image files (e.g. photo@2x.jpg, studio1-480w.jpg, studio1-800w.jpg, studio1-1200w.jpg) that don't exist in your images/ folder yet. The code is correct and will work as soon as you export those extra resolutions from your originals and drop them into images/ alongside the existing files. Until then, browsers will just fall back to the plain src image, so nothing is broken in the meantime.

6. & escaped in page titles/headings
Products & Services and News & Updates (and similar) now i use &amp; in the HTML text content (<title>, <h1>, <h2>) &

What was left untouched
All image src positions and the surrounding markup structure every <img> still sits exactly where you placed it. The overall colour palette, grid/flexbox layout, and breakpoints in style.css these already matched the brief. The booking form fields and video placeholders.

//PART 3(POE) NOTES
(Part 3) 
I made changes to the price list and figures; from being an image to an interactive code that can estimate the cost of our services and calculate the estimated total along with the addition of late/shortnotice fee and additional hours from 1-10 hours as well as the following: 
  in js i added all JavaScript: accordion, tabs, modal, lightbox, search/filter/sort, Leaflet map, form validation, AJAX Part 3 functionality requirements
CSS/style.css i added styles for accordion, tabs, modal, lightbox, filter cards, map, validation states and animations; fixed image paths (../images/), removed invalid P/S logo rule, fixed .submit-button:hover | Support new interactive elements and fix broken CSS |
enquiry.html | New page with enquiry form that returns cost and availability | Part 3 form requirement |
Contact.html | I added form id, map, validation + compiled email preview | Feedback / form requirement
All pages | I added completed meta descriptions, script + CSS links, nav link to enquiry | SEO + functionality |
robots.txt, sitemap.xml | Created | SEO additional requests |

SEO
Unique <title> (46 to 57 characters), <meta name="description"> (142 to 160 characters) and <meta name="keywords"> on every page.
One <h1> per page and a logical h1 > h2 > h3 order.
Descriptive image file names (for example photography-packages-prices.png) and meaningful alt text on every image.
Clean, lower-case, hyphenated URLs and internal links between all pages.
robots.txt, sitemap.xml and schema.org JSON-LD (ProfessionalService) on the home page.
Mobile-friendly (responsive CSS, viewport meta tag), local SEO (Johannesburg) in titles and descriptions.
Accessibility, performance and security
Accessibility: skip link, labelled form controls, fieldset/legend for radio groups, aria-invalid, aria-describedby, role="alert" errors, aria-live regions, focus outlines, text contrast of about 9:1.
Performance: defer on scripts, loading="lazy" on images, preload="metadata" on video, width/height on logo, one stylesheet and one script.
Security: all user text is escaped before being inserted into the page, no inline event handlers, rel="noopener noreferrer" on external links, Subresource Integrity on Leaflet, referrer policy meta tag, no secrets in client code, HTTPS via GitHub Pages.

References: Agafonkin, V. 2023. Leaflet: an open-source JavaScript library for interactive maps. Available at: https://leafletjs.com/ [Accessed 21 OCT 2026].
Google. n.d. Google Search Central: influencing your title links and snippets. Available at: https://developers.google.com/search/docs/appearance/title-link [Accessed 21 OCT 2026].
JSONPlaceholder. n.d. Free fake API for testing and prototyping. Available at: https://jsonplaceholder.typicode.com/ 
Mozilla. n.d. MDN Web Docs: Intersection Observer API. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
World Wide Web Consortium. n.d. WAI-ARIA Authoring Practices Guide: accordion, tabs and dialog patterns. Available at: https://www.w3.org/WAI/ARIA/apg/

