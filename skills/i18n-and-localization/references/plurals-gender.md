# Plural Rules and Selection — why

The rules are in the `i18n-and-localization` Ruleset (`plurals-gender` group).

- **English has two plural forms; many languages have more.** Arabic has six (`zero`, `one`, `two`,
  `few`, `many`, `other`); Polish and Russian have four; Japanese has one. `count === 1 ? x : y`
  produces wrong grammar in most of the world. ICU `plural` delegates the choice to CLDR data for
  the locale.
- **The translator owns the whole sentence.** Passing `count` as an argument and using `#` inside
  the message means the translator writes each form's full text, including where the number goes and
  what agrees with it. Formatting the number outside and passing a string takes that control away.
- **Ordinals are their own rule.** "1st, 2nd, 3rd, 4th" is `selectordinal`, and other locales do
  not follow the English pattern at all.
- **Gender and enums use `select`.** "He / She / They replied", "left the group" vs "leave the
  group" for a role — `select` with an `other` fallback, decided in the message, not with `if` in
  the component.
- **`=0` is a special case, not a replacement for `other`.** Use `=0 {No messages}` for a nicer
  empty sentence, but keep the category branches so every locale still works.

```tsx
// ❌ hand-rolled pluralization; number formatted outside the message
const text = count === 1 ? `1 file selected` : `${count.toLocaleString()} files selected`;

// ✅ ICU plural, number inside the message as #
t('files.selected', { count });
// en:  "{count, plural, =0 {No files selected} one {# file selected} other {# files selected}}"
// pl:  "{count, plural, one {# plik zaznaczony} few {# pliki zaznaczone} many {# plików zaznaczonych} other {# pliku zaznaczonego}}"
```
