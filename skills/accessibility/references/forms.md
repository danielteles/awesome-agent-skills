# Forms — why

The rules are in the `accessibility` Ruleset (`forms` group). This file is the reasoning and the
finer criteria.

- **Every field has a programmatically associated `<label>`** — `for` and `id`, or the input wrapped in the label. A placeholder is not a label: it disappears on input and usually fails contrast (WCAG 1.3.1, 3.3.2).
- **Related fields are grouped in a `<fieldset>` with a `<legend>`** — a radio group, an address block — so the group's purpose is announced with each field (WCAG 1.3.1).
- **Instructions and format hints come before the field**, linked with `aria-describedby`, so the user hears them before typing, not after the error (WCAG 3.3.2).
- **On error:** state it in text, link it with `aria-describedby`, set `aria-invalid` on the field, and suggest the fix. A red border and color alone are invisible to many users (WCAG 3.3.1, 3.3.3, 1.4.1).
- **On a failed submit, render an error summary at the top of the form** — a heading, then one link per error that moves focus to its field — and move focus to the summary. This is the tested pattern for finding and fixing errors with a screen reader or keyboard (GOV.UK Design System).
- **Do not disable the submit button to signal an invalid form.** A disabled button is not focusable, gives no feedback, and hides why it is blocked. Let the submit happen and show the error summary.
- **Mark a required field in the visible label and with `aria-required`**, not with an asterisk alone — "asterisk means required" is a convention, not a guarantee (WCAG 3.3.2).
- **Set `autocomplete` tokens** on identity and contact fields, and do not ask for the same information twice in one flow — it cuts typing and cognitive load (WCAG 1.3.5, 3.3.7).
- **Do not require a cognitive test to log in.** Allow paste and password managers, set `autocomplete="current-password"` and `autocomplete="one-time-code"`, and offer a passkey or email-link path; a puzzle CAPTCHA needs a non-cognitive alternative. Recalling a password or transcribing a code is a barrier for many cognitive and memory disabilities (WCAG 3.3.8).
- **A submission with a legal, financial, or destructive consequence is reversible, checked for errors, or confirmed** before it commits — a slip should not cost the user money or data (WCAG 3.3.4).
