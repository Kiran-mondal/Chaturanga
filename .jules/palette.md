## 2024-05-19 - ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only interactive elements (like hamburger menus) must have explicit `aria-label` attributes for screen readers, and SVG icons inside them should use `aria-hidden="true"` to prevent redundant/confusing announcements. The button state (like menu open/closed) must also be reflected dynamically using attributes like `aria-expanded`.
**Action:** Always verify that buttons relying solely on visual icons have semantic labels and state indicators for assistive technologies.

## 2025-02-14 - Keyboard Accessibility in Re-rendering Game Boards
**Learning:** Custom game boards or complex interactive components that completely destroy and re-create the DOM on every state change (e.g., after each move in a game) will inherently break keyboard accessibility by destroying the active element. Screen readers and keyboard users will lose their place.
**Action:** When working with components that completely re-render, you must actively track `document.activeElement.id` (or similar identifier) before the re-render, assign consistent IDs to the new DOM nodes, and programmatically restore focus to the previously active element after the new DOM is mounted. Also, interactive grid items must have `tabindex="0"`, `role="button"`, and listen for `Enter`/`Space` events.

## 2024-05-24 - ARIA roles for dynamic mode toggle and auto-reading game logs
**Learning:** For game state changes and mode toggles, dynamically setting `aria-pressed` on the buttons combined with `role="group"` clarifies to screen reader users which mode is active. Furthermore, auto-announcing move histories with `aria-live="polite"`, `role="log"` and `aria-atomic="false"` dramatically improves the accessibility of turn-based web games without manual re-reading.
**Action:** When implementing custom toggle groups or history feeds, ensure ARIA attributes like `aria-pressed`, `role="group"`, and `role="log"` with `aria-live="polite"` are applied to provide continuous context for screen readers.
