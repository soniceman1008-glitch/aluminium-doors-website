# Premium Aluminium Doors Website — Project Instructions

## Project Goal

Build a premium, modern, trustworthy and conversion-focused aluminium doors and windows business website inspired by the overall quality and structure of https://aludoors.com.au, but DO NOT copy its text, images, branding, code, or copyrighted design.

The website must be:
- Budget-friendly to build and maintain
- Fast and lightweight
- Fully responsive
- Mobile-first
- SEO-friendly
- Accessible
- Secure by default
- Easy to maintain
- Professional and premium-looking
- Designed to generate enquiries and quote requests

## Development Principles

1. Prefer simple, stable and cost-effective technologies.
2. Avoid unnecessary dependencies and third-party services.
3. Do not add an AI chatbot, database, payment system, CMS or other expensive infrastructure unless explicitly requested later.
4. Keep hosting and maintenance costs as close to zero as practical.
5. Never expose secrets, API keys, passwords or private credentials in source code.
6. Never commit .env files or secrets.
7. Validate and sanitize all user-controlled input.
8. Protect forms against spam, abuse and malicious input.
9. Do not trust client-side validation alone.
10. Follow least-privilege principles.
11. Do not collect unnecessary customer personal information.
12. Use HTTPS in production.
13. Do not introduce tracking/analytics unless explicitly approved.

## Website Quality

The final website should feel like a genuine Australian aluminium doors/windows company:
- Clean
- Premium
- Trustworthy
- Professional
- Easy to navigate
- Strong typography
- High-quality imagery
- Clear calls to action
- Excellent mobile experience

Do not make the website look like a generic AI-generated template.

## Conversion Goals

Primary conversion:
- Request a quote

Secondary conversions:
- Phone call
- WhatsApp enquiry
- Contact form
- Product enquiry

Important CTAs should remain easy to find on mobile.

## Performance

- Minimize JavaScript.
- Optimize images.
- Use lazy loading where appropriate.
- Avoid unnecessary animations.
- Avoid large libraries when CSS/HTML can solve the problem.
- Target excellent Core Web Vitals.
- Keep initial page load lightweight.

## Responsive Design

The website must work correctly on:
- Mobile phones
- Tablets
- Laptops
- Desktop monitors

Test common widths including:
- 360px
- 375px
- 390px
- 768px
- 1024px
- 1280px
- 1440px

No horizontal scrolling should occur.

## Accessibility

Follow WCAG principles:
- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Useful alt text
- Sufficient contrast
- Buttons must be accessible
- Forms must be accessible

## SEO

Implement:
- Proper title
- Meta description
- Semantic headings
- Clean URLs where applicable
- Open Graph metadata
- Sitemap
- robots.txt
- Local-business SEO structure where appropriate
- Structured data only when accurate

Never invent business information.

## Security

Security is a priority.

Never:
- Hard-code secrets
- Expose API keys
- Trust user input
- Use unsafe HTML rendering unnecessarily
- Add insecure third-party scripts unnecessarily

For forms:
- Validate input
- Limit input length
- Reject malformed input
- Add reasonable anti-spam protection
- Return safe error messages
- Never expose stack traces or internal implementation details

## Forms

Quote/contact forms should collect only necessary information.

Potential fields:
- Name
- Phone
- Email
- Suburb/Postcode
- Product interest
- Message

Do not make any field mandatory unless there is a clear business reason.

## Code Quality

- Keep code readable.
- Use clear naming.
- Avoid unnecessary abstraction.
- Avoid duplicated logic.
- Keep components/modules focused.
- Comment only where useful.
- Do not leave debugging code in production.

## Testing

Before declaring the project complete, verify:
- All navigation links
- All CTA buttons
- Phone links
- WhatsApp links
- Contact/quote forms
- Form validation
- Mobile responsiveness
- Desktop responsiveness
- Accessibility basics
- SEO basics
- Security basics
- Broken links
- Console errors
- Performance
- No exposed secrets

## Change Control

Before making major architectural changes:
- Explain why the change is necessary.
- Prefer the simplest solution.
- Do not introduce paid services without approval.

## Important Rule

Do not begin building the website until the user explicitly gives the next phase instruction.
