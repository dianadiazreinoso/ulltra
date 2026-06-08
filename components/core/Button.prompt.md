Pill action button — mono, uppercase, wide-tracked; use `volt` for the one primary CTA, `solid` on paper sections, `ghost` for secondary actions on dark.

```jsx
<Button intent="volt" href="#contact">Get started</Button>
<Button intent="solid">Book a discovery call</Button>
<Button intent="ghost">View work</Button>
```

Variants: `intent` (volt / solid / ghost). Renders as `<a>` when `href` is set, else `<button>`. `disabled` dims to 0.45 and removes hover. Keep volt to a single instance per screen — it's the high-voltage lime note.
