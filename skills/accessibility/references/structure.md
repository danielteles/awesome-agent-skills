# Semantic HTML and Structure — why

The rules are in the `accessibility` Ruleset (`structure` group).

- **The native element for the job** — `<button>`, `<a href>`, `<input>`, `<nav>`, `<table>` — brings the role, the keyboard behavior, and focus with it. A
  `<div>` with a handler brings none: the keyboard skips it and a screen reader does not announce it (WCAG 4.1.2, 2.1.1).
- **A link navigates to a URL; a button performs an action.** Do not fake either — no `<a href="#">` acting as a button, no `<button>` that navigates. A user
  expects "open in new tab" to work on a link and Space to activate a button. Empty and mislabeled links are a top real-world failure (WebAIM Million).
- **One `<h1>` per page; headings step down by one**, never skipped for styling — a screen-reader user navigates by the heading outline (WCAG 1.3.1, 2.4.6).
- **Landmarks** (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) are the "jump to section" map for assistive technology. Exactly one `<main>`; two
  landmarks of the same type get a distinguishing `aria-label` ("Primary", "Breadcrumb") (WCAG 1.3.1).
- **A list is marked up as a list; tabular data as a `<table>`** with `<th>` and `scope`. A styled `<div>` grid is silent to a screen reader (WCAG 1.3.1).
- **`lang` on `<html>`** (and on any foreign-language element) picks the right screen-reader voice; a **unique, descriptive `<title>`** makes the browser tab
  identifiable (WCAG 3.1.1, 2.4.2).
- **A link that opens a new tab or downloads a file says so**, in visible or screen-reader text — the user did not ask for the context switch.
- **A help mechanism** (contact link, chat entry) stays in the same place on every page that has one, so a user in trouble does not hunt for it (WCAG 3.2.6).
