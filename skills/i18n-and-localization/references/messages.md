# ICU Messages — why

The rules are in the `i18n-and-localization` Ruleset (`messages` group).

- **Concatenation destroys grammar.** `"You have " + n + " new " + noun` assumes English word order,
  no gendered article, no case inflection, and that the count sits where English puts it. A single
  ICU message with placeholders lets the translator move, inflect, and agree everything.
- **Whole sentences, not fragments.** Translating `"new"` and `"message"` separately gives the
  translator no way to know they combine, or how. One message per user-visible sentence.
- **Key by meaning.** `checkout.payButton` survives a copy edit; a key that *is* the English text
  (`"Pay now"`) orphans every translation the moment someone changes it to `"Pay"`.
- **Descriptions are not optional.** `{count} left` — left where? A stock count, a queue, time
  remaining? The translator needs a `description` and ideally a screenshot, or they guess.
- **Rich text via tags, not HTML strings.** Splicing `"<a href=...>" + t('terms') + "</a>"` hides
  markup from the extractor and lets a translation break the tag. ICU rich-text tags
  (`<link>…</link>`) or component interpolation keep it safe.

```tsx
// ❌ concatenated fragments, English-shaped, markup spliced in
const label = t('greeting') + ' ' + user.name + '! ' + t('youHave') + ' ' + count + ' ' + t('items');
const terms = t('agreePrefix') + '<a href="/terms">' + t('terms') + '</a>';

// ✅ one message, named placeholders, ICU rich text
t('dashboard.greeting', { name: user.name, count });
// en: "Hi {name}! You have {count, plural, one {# item} other {# items}}."
t('signup.terms', { link: (chunks) => <a href="/terms">{chunks}</a> });
// en: "I agree to the <link>terms of service</link>."
```
