# Schema Selection Guide

Structured data must describe the visible, truthful page. It is not a ranking spell and must not claim entities, offers, reviews, credentials, or FAQs that the user cannot see on the page.

## Selection Rules

- `Organization`: use for the brand/company entity when name, URL, logo, contact, and sameAs profiles are known.
- `Person`: use for real authors, founders, professionals, or profile pages with visible identity.
- `WebSite`: use on sitewide metadata, often with `SearchAction` only when real site search exists.
- `WebPage`: use to identify a page and connect it to the organization or breadcrumb.
- `Article` or `BlogPosting`: use for editorial content with visible headline, dates, author/publisher, and body.
- `BreadcrumbList`: use when breadcrumb navigation is visible or the information architecture is explicit.
- `Product`: use when the page sells or describes a specific product with visible product details.
- `Offer`: attach to `Product` or `Service` only when price/availability or offer terms are visible and true.
- `Service`: use for a service page with visible service description and provider.
- `LocalBusiness`: use for a local business page with visible NAP/location/service-area details; prefer a specific subtype when clearly applicable.
- `FAQPage`: use only for visible, genuine FAQ pairs on the page.
- `HowTo`: use only for visible step-by-step instructions.
- `VideoObject`, `ImageObject`, `Event`, `JobPosting`: use only when the page visibly contains the matching object.

## Validation Checklist

- JSON-LD parses.
- URLs are absolute where schema expects URLs.
- `@type` matches the page purpose.
- Entity identity is stable through `@id`.
- Duplicates are intentional and connected, not conflicting.
- Dates match visible publication/update dates.
- Images exist and are representative.
- Offers, prices, availability, reviews, and ratings are visible and current.
- Schema does not include fake testimonials, aggregate ratings, locations, people, or credentials.

## Common Problems

- Adding many unrelated schema types to every page.
- Marking hidden or non-existent FAQs.
- Using `Product` for a category, article, or service page without product detail.
- Declaring local business data while the page has no address, service area, or contact evidence.
- Copying competitor schema without matching visible content.
