## 2024-05-19 - ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only interactive elements (like hamburger menus) must have explicit `aria-label` attributes for screen readers, and SVG icons inside them should use `aria-hidden="true"` to prevent redundant/confusing announcements. The button state (like menu open/closed) must also be reflected dynamically using attributes like `aria-expanded`.
**Action:** Always verify that buttons relying solely on visual icons have semantic labels and state indicators for assistive technologies.
