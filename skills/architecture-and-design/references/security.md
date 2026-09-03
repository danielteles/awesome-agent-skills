# Security by Design — why

The rules are in the `architecture-and-design` Ruleset (`security` group). The browser runs your code next to the user's session, so a small gap becomes account
access.

- **Never build HTML from untrusted input.** Injected markup runs as script. Sanitize with DOMPurify; avoid `dangerouslySetInnerHTML` (React), `[innerHTML]`
  (Angular), `v-html` (Vue). Keep the framework's default text escaping — any bypass (`bypassSecurityTrust*`, `dangerouslySetInnerHTML`) needs a review.
- **Keep secrets out of the bundle.** Everything in the frontend build is public. A third-party key lives on a server.
- **`rel="noopener noreferrer"` on every `target="_blank"`** — otherwise the new tab can script the opener.
- **Validate a redirect URL** from a query param against an allowlist (an open redirect helps phishing), and **reject `javascript:` / `data:` URLs** from user
  data before navigating to them or rendering them as a link (`javascript:` in an href is script execution).
- **Choose token storage on purpose** and write down the trade-off. `localStorage` is readable by any XSS; an httpOnly cookie is not.
- **CSP in enforcing mode, nonce-based for scripts** — it blocks an injected script even after an escaping mistake. Turn on **Trusted Types** where the browser
  supports it: it makes a DOM-XSS sink a build-time-style error.
- **With cookie auth, add an anti-CSRF token** to every state-changing request and set `SameSite`. The cookie is sent automatically; the token proves the
  request came from your app.
- **Sandbox a third-party `<iframe>`** with only the capabilities it needs, so a compromised embed is contained.
- **Review a dependency before adding it** — maintenance, transitive weight, provenance. A supply-chain compromise ships straight to every user. Prefer fewer,
  larger, well-kept packages.
