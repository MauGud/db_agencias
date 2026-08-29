---
version: 0.8.0
name: Nexcar
description: Nexcar's design system — Light + Dark in one file. Built on Next.js + Tailwind CSS v4 + shadcn/ui, icons by Phosphor, tokens in OKLCH.
stack:
  framework: "Next.js 16 — App Router, React Server Components"
  language: "TypeScript, React 19"
  styling: "Tailwind CSS v4 — tokens via @theme in src/app/globals.css, no tailwind.config file"
  components: "shadcn/ui (radix-nova style) — copied into src/components/ui, not installed as a dependency"
  composed: "Nexcar composites in src/components/composed (Logo, Upload, DocumentCard, StatusPill, Badge, Avatar, CopilotSuggestion)"
  primitives: "Radix UI (avatar, dialog, tabs, tooltip, checkbox, collapsible, label, progress, separator, slot)"
  avatars: "avvvatars-react — deterministic generated avatar fallback (character or shape), seeded by name/email"
  variants: "class-variance-authority (cva) + clsx + tailwind-merge, exposed as the cn() helper in @/lib/utils"
  icons: "Phosphor Icons (@phosphor-icons/react) — default weight fill"
  fonts: "Geist Sans + Geist Mono via next/font/google (self-hosted)"
  theming: "next-themes — class strategy (.dark), system default"
  toasts: "Sonner (bottom-right)"
  drawer: "Vaul"
  docs: "MDX (@next/mdx) + rehype-pretty-code + Shiki + remark-gfm"
  agentic: "Build-time Markdown endpoints for AI agents (src/lib/llms.ts): /llms.txt (llmstxt.org index), /llms-full.txt (design.md + every page in one file), /md/<route> (one page as Markdown; home is /md/index). Discoverable via <link rel=alternate type=text/markdown> in the head and public/robots.txt."
  mcp: "MCP server at /api/mcp (mcp-handler, Streamable HTTP, stateless — no Redis) in src/app/api/[transport]/route.ts. Tools: list_pages, get_page, search_docs, get_design_tokens, get_customer_theme. Connect: claude mcp add --transport http nexcar-ds <site>/api/mcp"
  aliases: "@/components, @/components/ui, @/lib, @/lib/utils, @/hooks"
  preset: "npx shadcn@latest apply --preset b4N0ODb2R — radix-nova style, purple theme, Geist font, Phosphor icons. After applying, only the brand primary is re-injected into globals.css (#7D69C3 light / #9889D0 dark); every other token (surfaces, dark neutrals, charts, ring, sidebar) is the preset's."
  menu: "menuColor inverted-translucent, menuAccent subtle (shadcn nova menu tokens)"
colors:
  # Surfaces (Light) — nova preset neutrals
  background: "oklch(1 0 0)"               # #ffffff
  foreground: "oklch(0.145 0 0)"           # near-black ink
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  # Semantic / brand (Light)
  primary: "#7D69C3"            # Púrpura · marca · 253°
  primary-foreground: "#ffffff"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  # Accents derived from the brand purple in OKLCH — they inherit its chroma
  # (~0.14–0.15), lightness tuned per hue. Not a library palette.
  info: "#2686CB"               # Azul · oklch(0.600 0.135 245)
  info-foreground: "#ffffff"
  success: "#219761"            # Verde · oklch(0.600 0.130 158)
  success-foreground: "#ffffff"
  warning: "#EB992E"            # Ámbar · oklch(0.750 0.150 68)
  warning-foreground: "#1F1F0F"
  destructive: "#CF5A55"        # Rojo · error · oklch(0.615 0.150 25)
  destructive-foreground: "#ffffff"
  ring: "oklch(0.708 0 0)"                  # preset neutral focus ring
  # Charts — preset purple ramp (chartColor: purple)
  chart-1: "oklch(0.827 0.119 306.383)"
  chart-2: "oklch(0.627 0.265 303.9)"
  chart-3: "oklch(0.558 0.288 302.321)"
  chart-4: "oklch(0.496 0.265 301.924)"
  chart-5: "oklch(0.438 0.218 303.724)"
  # Brand ladder — Púrpura (canonical 15-step scale, absolute across themes)
  purpura-0: "#FFFFFF"
  purpura-0.5: "#F2F0F9"
  purpura-1: "#E5E1F3"
  purpura-1.5: "#D8D3ED"
  purpura-2: "#CBC4E7"
  purpura-3: "#B2A6DC"
  purpura-4: "#9889D0"
  purpura-5: "#7E6BC4"
  purpura-6: "#65569E"
  purpura-7: "#4D4178"
  purpura-8: "#342C51"
  purpura-8.5: "#28223E"
  purpura-9: "#1C172B"
  purpura-9.5: "#0F0D18"
  purpura-10: "#030205"
  # Canonical anchors (shade 5) of the four accent families — derived from the purple
  azul-5: "#2686CB"
  verde-5: "#219761"
  ambar-5: "#EB992E"
  rojo-5: "#CF5A55"
  # Sidebar (shadcn nova tokens) — preset values
  sidebar: "oklch(0.985 0 0)"
  sidebar-foreground: "oklch(0.145 0 0)"
  sidebar-primary: "oklch(0.558 0.288 302.321)"
  sidebar-primary-foreground: "oklch(0.977 0.014 308.299)"
  sidebar-accent: "oklch(0.97 0 0)"
  sidebar-accent-foreground: "oklch(0.205 0 0)"
  sidebar-border: "oklch(0.922 0 0)"
  sidebar-ring: "oklch(0.708 0 0)"
colorsDark:
  # Nova preset neutral dark — only `primary` carries the brand (purpura shade 4).
  background: "oklch(0.145 0 0)"
  foreground: "oklch(0.985 0 0)"
  card: "oklch(0.205 0 0)"
  card-foreground: "oklch(0.985 0 0)"
  popover: "oklch(0.205 0 0)"
  popover-foreground: "oklch(0.985 0 0)"
  muted: "oklch(0.269 0 0)"
  muted-foreground: "oklch(0.708 0 0)"
  accent: "oklch(0.269 0 0)"
  accent-foreground: "oklch(0.985 0 0)"
  border: "oklch(1 0 0 / 0.1)"                 # translucent white
  input: "oklch(1 0 0 / 0.15)"
  primary: "#9889D0"            # purpura-4 — brand primary on dark
  primary-foreground: "#0F0D18"
  secondary: "oklch(0.274 0.006 286.033)"
  secondary-foreground: "oklch(0.985 0 0)"
  info: "#2686CB"
  info-foreground: "#ffffff"
  success: "#219761"
  success-foreground: "#ffffff"
  warning: "#EB992E"
  warning-foreground: "#1F1F0F"
  destructive: "#CF5A55"                       # Rojo de marca — same in both themes
  destructive-foreground: "#ffffff"
  ring: "oklch(0.556 0 0)"                     # preset neutral
  # Sidebar (Dark) — preset values
  sidebar: "oklch(0.205 0 0)"
  sidebar-foreground: "oklch(0.985 0 0)"
  sidebar-primary: "oklch(0.627 0.265 303.9)"
  sidebar-primary-foreground: "oklch(0.977 0.014 308.299)"
  sidebar-accent: "oklch(0.269 0 0)"
  sidebar-accent-foreground: "oklch(0.985 0 0)"
  sidebar-border: "oklch(1 0 0 / 0.1)"
  sidebar-ring: "oklch(0.556 0 0)"
typography:
  display:
    fontFamily: Geist Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 56px
    letterSpacing: -1.2px
  h1:
    fontFamily: Geist Sans
    fontSize: 36px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: -0.9px
  h2:
    fontFamily: Geist Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.6px
  h3:
    fontFamily: Geist Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0px
  body-large:
    fontFamily: Geist Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 28px
  small:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 24px
  caption:
    fontFamily: Geist Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.6px
    textTransform: uppercase
  button:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  mono:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
spacing:
  0.5: 2px
  1: 4px
  1.5: 6px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  20: 80px
  base: 4px
containers:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
  sidebar: 256px
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px
density:
  default: 1
  compact: 0.75
icons:
  library: "Phosphor (@phosphor-icons/react)"
  defaultWeight: fill
  outlineWeight: regular
  sizes: "16 / 20 / 24 / 32 / 48px (Tailwind size-4 / size-5 / size-6 / size-8 / size-12)"
  serverImport: "@phosphor-icons/react/dist/ssr (with explicit weight=fill)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: 40px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: 40px
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.input}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: 40px
  button-ghost:
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: 40px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: 40px
  button-link:
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    padding: "0"
    height: auto
  button-sm:
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: 36px
  button-lg:
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: 44px
  button-icon:
    rounded: "{rounded.md}"
    height: 40px
    width: 40px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.input}"
    typography: "{typography.small}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: 40px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-compact:
    padding: 16px
  avatar:
    size: 40px
    rounded: "{rounded.full}"
    fallback: "avvvatars (character | shape) — deterministic per value/name"
  tabs-list:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 4px
  tabs-trigger-active:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    typography: "{typography.small}"
voice:
  personality: "El experto de la mesa de análisis — domina la inspección vehicular y la detección de fraude, da certeza donde hay dinero y riesgo, sin drama ni tecnicismos."
  dimensions:
    formality: "Formalidad profesional, sin acartonarse"
    humor: "Serio, con calidez (no bromeamos con el riesgo)"
    respect: "Respetuoso"
    energy: "Seguro y directo, con energía contenida"
  traits:
    - "Experto, no sabelotodo"
    - "Claro por respeto al tiempo"
    - "Confiable y sereno"
    - "Cercano, humano"
  framework: "Quién (la persona · ¿es confiable?) → Qué (el vehículo · ¿está en orden?) → Cruces (contraste contra +80 fuentes)"
  address: "tú, profesional (never usted / vosotros)"
  market: "Español neutro de LatAm; today we write for Mexico"
  fraudRule: "Certeza, nunca miedo; concreto y demostrable; sereno ante lo delicado; preventivo, no reactivo"
  productNames: "Buró de Fraude · Antifraude Documental — mayúsculas iniciales, con artículo, sin traducir"
  metricsRule: "Public figures (85% menos tiempo, +80 fuentes, <10 min) need source, owner+expiry, and are qualified when from a single client"
  use: "certeza · certidumbre · control · trazabilidad · inspección documental · detección de fraude · antifraude · forense · listas negras compartidas · el nuevo estándar · copiloto · mesa de control · expediente ('Case' en inglés, nunca 'caso') · dictaminar · dictamen · expediente vehicular · siniestro · préstamo prendario · toma de usado · REPUVE"
  avoid: "revolucionario · disruptivo · sinergia · de clase mundial · solución integral 360° · líder indiscutible · best-in-class · empoderar · leverage · jerga vacía"
  legalRule: "NEVER promise absolute outcomes: no 'garantizamos la detección', 'detección 100 %', 'cero fraude', 'infalible', 'elimina el fraude', 'nunca se equivoca'. Detection is probabilistic — say detectar/reducir/anticipar with substantiated figures. Absolute claims in commercial material are a contractual risk."
  emojis: "Prohibited on EVERY brand surface — product UI, website, marketing, presentations/decks, sales material, emails, LinkedIn/social posts, documentation, contracts. No exceptions. In interfaces use a Phosphor icon; in decks/emails/posts use words."
  b2c: "Nexcar does NOT speak to its customers' end users (that copy adapts to each whitelabel's voice, /customers/[slug]). Nexcar's own B2C is selling verifications to consumers via marketplace alliances (e.g. Seminuevos.com: a private seller verifies their car's documents and the listing stands out with the Certificación Nexcar). Rules: personal benefit not operational ('los compradores confían más y preguntan menos', 'Compra con certeza, no con fe'), zero internal jargon (say 'verificado contra +80 fuentes oficiales'; REPUVE/OCR/motor/confianza invisible), simple steps + clear price, certainty that unlocks — never fear-selling, the brand fronts it (la Certificación Nexcar, badge Verificado por Nexcar — capitalized, with article). If a document fails: say what happens next, never accuse ('No pudimos verificar tu factura. Revisa que sea la versión más reciente o escríbenos.'). Brand laws travel: tú, serene, no absolute promises ('se vende más rápido' ok, 'garantizamos la venta' never), no emojis, substantiated figures."
  glossary: "Official product terms at /guidelines/glosario — Expediente (unit of work, 'Case' in code, never 'caso') · Dictaminar (the act of ruling on an expediente; the dictamen is NOT a separate object — it is defined by the state the case lands in) · case states are a finite state machine, always exactly one, with no separate 'outcome' family: Sin documentos (no-documents — a claim exists but the end user hasn't uploaded their documents yet; nothing to validate) · Procesando (processing — the engine is running the validations) · Nuevo (new — engine done, ready for the desk, nobody has taken it) · En revisión (pending) · Retenido (held — set aside so only a specialist in difficult cases can take it; same state formerly labeled 'Escalado', escalar remains the verb that sends a case there) · Corrección (correction — a document is missing or impossible to validate; blocked until replaced) · Aprobado (approved) · Rechazado (rejected) · Fraude (fraud — the dictamen confirmed fraud; feeds the Buró de Fraude and shared blacklists, not just another rejection) · Cancelado (cancelled — closed without dictamen: withdrawal, claim retired, duplicate) · Vencido (expired — deadline ran out for documents or correction) · Reapertura (reopened — a closed case back at the desk with full history: new evidence, appeal, or dictamen reversal) · Ancla / datos ancla / documento ancla (anchor data: the primary data required for a correct validation; arrives via Integración — the customer's system sends it over the API, even as Base64 — or via an uploaded Documento) · Alerta (`alert` — fraud/risk indicator, never 'señal'; carries a Severidad/severity when the finding comes from blacklists — internal, external, or partner lists: a match, not a model suspicion; three levels for now: Alta/high · Media/medium · Baja/low, always shown with the list that originated it) · Validación (the act, counted per document or per source — '13 validaciones' are 13 crosses; the whole capability is the validación documental; never 'verificación' in product — that word lives in marketing/B2C alongside 'inspección documental') · Confianza (model certainty %) · Analista · Mesa de control. One concept, one word: Spanish for UI labels, English for code keys; terms from explorations get added to the glossary before shipping."
  antiSlop: "Aquí no lanzamos AI slop (/guidelines/anti-slop): use AI for all your work (10x leverage), but never ship purely AI-generated content without human taste and filtering. AI content is cheap to create and expensive to consume — raw output passed along transfers the review burden to the reader. Trim before sharing (10 pages is probably 2), add the judgment AI doesn't have, and at a bare minimum don't make your stuff look like AI: generate WITH the real tokens (/design.md, each customer's 'Copiar branding', /llms.txt) instead of the model's default aesthetics."
  reference: "/brand/voice (full brand guide) · /guidelines/microcopy (product UI microcopy) · /guidelines/glosario (product glossary) · /guidelines/anti-slop (AI content norm)"
---

# Nexcar

## Overview

Nexcar is the design system for Nexcar's platform — document intelligence, fraud detection, and decisioning for analysts, compliance officers, and underwriting teams who resolve cases under time pressure with high stakes. The aesthetic is calm and high-contrast: generous whitespace, restrained color, content on near-neutral surfaces, and color used to signal state and the single most important action rather than decoration.

**This file documents both themes.** The Light theme is the default and canonical; the Dark theme (activated by the `.dark` class via `next-themes`) is captured in the `colorsDark` front-matter map and the [Dark theme](#dark-theme) section below — it reuses every other token (type, spacing, radius, motion, components) unchanged. Color tokens are authored in OKLCH for neutrals and hex for the brand palette; consume them through the semantic tokens (`bg-primary`, `text-muted-foreground`), never the raw values.

## Stack & conventions

The system is implemented as a Next.js app; treat these as the defaults when building product UI:

- **Framework** — Next.js 16 (App Router, React Server Components), React 19, TypeScript.
- **Styling** — Tailwind CSS v4. There is **no `tailwind.config` file**; design tokens are declared as CSS variables in `src/app/globals.css` and exposed to Tailwind via `@theme inline`. Compose classes with the `cn()` helper (`clsx` + `tailwind-merge`) from `@/lib/utils`.
- **Components** — [shadcn/ui](https://ui.shadcn.com) in the **radix-nova** style, **copied into `src/components/ui`** (not installed as a dependency — you own and edit the source). Nexcar-specific composites live in `src/components/composed` (Logo, Upload, DocumentCard, StatusPill, Badge, Avatar, CopilotSuggestion). Variants are built with `class-variance-authority`.
- **Theme preset** — the base theme is a shadcn preset applied with `npx shadcn@latest apply --preset b4N0ODb2R` (radix-nova style · purple theme · Geist · Phosphor · `menuColor: inverted-translucent`, `menuAccent: subtle`). The preset IS the theme: neutral surfaces, neutral dark mode, purple chart ramp, neutral focus ring. On top of it, **only the brand primary is injected** into `src/app/globals.css` — `--primary: #7D69C3` (light) / `#9889D0` (dark) with their foregrounds. The `success`/`warning`/`info` extras, shadow scale, and `--density` are Nexcar additions the preset does not manage. If you re-run the preset, re-apply the primary override.
- **Primitives** — Radix UI underpins the interactive components (avatar, dialog, tabs, tooltip, checkbox, collapsible, label, progress, separator, slot).
- **Avatars** — [`avvvatars-react`](https://avvvatars.com) generates the Avatar fallback: a unique, deterministic mark (initials or shape) seeded by name/email, shown when there's no photo. Wrapped by the composed `Avatar` over the shadcn/Radix avatar primitive.
- **Icons** — **Phosphor Icons** (`@phosphor-icons/react`), the only icon family. Default weight is **`fill`**; use `regular` (outline) only for occasional accents, never mixed in one view. Sizes map to Tailwind `size-4` (16) / `size-5` (20) / `size-6` (24) / `size-8` (32) / `size-12` (48). Icons inherit `currentColor`; reserve the brand purpura for selected/important state. In Server Components and MDX, import from `@phosphor-icons/react/dist/ssr` with an explicit `weight="fill"` (those don't read `IconContext`). Add `aria-hidden` when decorative, `aria-label` when the icon is the only signal.
- **Fonts** — Geist Sans (UI/prose) and Geist Mono (code, tokens, tabular numbers) via `next/font/google`, self-hosted.
- **Theming** — `next-themes`, class strategy, system default; dark mode toggles the `.dark` class on `<html>`.
- **Toasts** — Sonner (`<Toaster position="bottom-right" />`). **Drawer/Sheet** — Vaul. **Docs** — MDX (`@next/mdx`) with `rehype-pretty-code` + Shiki for code blocks.
- **Path aliases** — `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.

```tsx
import { Button } from "@/components/ui/button";
import { Car } from "@phosphor-icons/react/dist/ssr"; // server-safe
import { cn } from "@/lib/utils";

<Button className={cn("w-full")}>
  <Car weight="fill" className="size-4" aria-hidden /> Aprobar expediente
</Button>
```

## Colors

The Nexcar palette is **five families derived from the brand purple**. The purple's OKLCH signature is `oklch(0.580 0.135 292)`; every accent **inherits its chroma (~0.14–0.15)** and stays near its lightness (0.60–0.62; ámbar rises to 0.75 because yellows need light to breathe), rotating only the hue. Holding the brand chroma is what keeps the accents balanced and unmistakably Nexcar — library palettes (Tailwind/Radix step-9s run chroma 0.19+) read vivid but generic next to the soft purple. Each family owns a meaning:

- **Púrpura** — `oklch(0.580 0.135 292)` — brand: CTAs, links, active state. The only accent for the primary action on a view.
- **Azul** (`#2686CB`) — `oklch(0.600 0.135 245)` — `info`: non-urgent information, tooltips, informational badges.
- **Verde** (`#219761`) — `oklch(0.600 0.130 158)` — `success`: real confirmations only, never decoration.
- **Ámbar** (`#EB992E`) — `oklch(0.750 0.150 68)` — `warning`: reversible risk or review signals.
- **Rojo** (`#CF5A55`) — `oklch(0.615 0.150 25)` — `destructive`: errors and destructive actions; the brand red and the UI error state are the same value.

### Semantic tokens

These are the names the UI uses. Surfaces and ink are neutral OKLCH; the five accents carry meaning. Foreground tokens are the accessible text/icon color to place on top of their pair. Values below are the Light theme; the Dark column is in the [Dark theme](#dark-theme) section.

| Token | Light value | Use |
|---|---|---|
| `background` / `foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | Page surface and primary ink |
| `card` / `popover` | `oklch(1 0 0)` | Raised surfaces (same as background in light) |
| `muted` / `muted-foreground` | `oklch(0.97 0 0)` / `oklch(0.556 0 0)` | Subtle fills and secondary text |
| `accent` | `oklch(0.97 0 0)` | Hover fill for ghost/outline controls |
| `border` / `input` | `oklch(0.922 0 0)` | Hairlines and field outlines |
| `primary` | `#7D69C3` | Brand action, links, active — the only brand override on the preset |
| `info` | `#2686CB` | Informational state |
| `success` | `#219761` | Confirmed / verified |
| `warning` | `#EB992E` | Reversible risk (text needs shade 8+) |
| `destructive` | `#CF5A55` | Errors, destructive actions (brand rojo) |
| `ring` | `oklch(0.708 0 0)` | Focus ring (preset neutral) |

### Brand ladder — Púrpura

The canonical 15-step lightness ladder for the brand. **Shade 5 (`#7E6BC4`) is the brand value**; the semantic `primary` token resolves to `#7D69C3`. Shades `0–4` are tints (mixed toward white); `6–10` are shades (mixed toward black). Each accent family generates its own 15-step ladder from its anchor hex (its shade 5). In the current theme the purpura ladder feeds `primary` (shade 5 in light, shade 4 in dark); the dark surfaces are the nova preset's neutrals.

| Step | Hex | Role |
|---|---|---|
| 0 | `#FFFFFF` | White |
| 0.5 | `#F2F0F9` | Tinted background, hover |
| 1 | `#E5E1F3` | Active card / subtle fill |
| 1.5 | `#D8D3ED` | |
| 2 | `#CBC4E7` | Tinted surface |
| 3 | `#B2A6DC` | |
| 4 | `#9889D0` | Dark theme `primary` |
| **5** | **`#7E6BC4`** | **Brand / canonical** |
| 6 | `#65569E` | Solid hover |
| 7 | `#4D4178` | |
| 8 | `#342C51` | Dark text / deep fill |
| 8.5 | `#28223E` | Deep fill |
| 9 | `#1C172B` | Marketing hero surface |
| 9.5 | `#0F0D18` | Dark `primary-foreground` |
| 10 | `#030205` | Near-black |

### Print & brand reference

Each accent family ships a closest Pantone (with ΔE) and CMYK build for print and merch. Request a color proof before any large run; ΔE > 5 is noticeable to the eye.

| Color | Brand hex | Hue | Pantone (ΔE) | CMYK | RGB |
|---|---|---|---|---|---|
| Púrpura | `#7D69C3` | 253° | 2665 C (8.6) | 36 / 46 / 0 / 24 | 125, 105, 195 |
| Azul | `#2686CB` | 205° | Process Blue C (2.2) | 81 / 34 / 0 / 20 | 38, 134, 203 |
| Verde | `#219761` | 153° | 340 C (3.0) | 78 / 0 / 36 / 41 | 33, 151, 97 |
| Ámbar | `#EB992E` | 34° | 7550 C (10.3) | 0 / 35 / 80 / 8 | 235, 153, 46 |
| Rojo | `#CF5A55` | 2° | 2035 C (5.8) | 0 / 57 / 59 / 19 | 207, 90, 85 |

The accent shades (azul/verde/ámbar/rojo steps other than 5) are generated at runtime from each anchor hex; when you need an exact tint compute it with `color-mix(in oklch, var(--primary) 60%, white)` and adjust the percentage.

## Dark theme

Dark is activated by adding `.dark` to `<html>` (handled by `next-themes`, system default). **Only color values change** — every type, spacing, radius, motion, and component token is identical to Light. The full set of dark values is in the `colorsDark` front-matter map; the table below is the same data in prose.

The dark surfaces come from the nova preset's neutral scale — `background` `oklch(0.145 0 0)`, `card`/`popover` `oklch(0.205 0 0)`, `muted`/`accent` `oklch(0.269 0 0)` — with foregrounds inverted to near-white. **The brand carry-overs are `primary`** — purpura shade **4** (`#9889D0`), a lighter step than light's 5 for legibility on dark, paired with the deep `#0F0D18` foreground — **and the accent set** (`info`/`success`/`warning`/`destructive`), which keeps the same values and foregrounds in both themes. `border`/`input` become translucent white so hairlines show on any surface.

| Token | Dark value | Note |
|---|---|---|
| `background` / `foreground` | `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | preset neutral, near-white ink |
| `card` / `popover` | `oklch(0.205 0 0)` | preset neutral |
| `muted` / `accent` | `oklch(0.269 0 0)` | preset neutral |
| `secondary` | `oklch(0.274 0.006 286.033)` | |
| `muted-foreground` | `oklch(0.708 0 0)` | |
| `border` / `input` | `oklch(1 0 0 / 0.1)` / `/ 0.15` | translucent white |
| `primary` / `primary-foreground` | `#9889D0` / `#0F0D18` | purpura 4 — the brand override |
| `info` (fg) | `#2686CB` (`#ffffff`) | same as light |
| `success` (fg) | `#219761` (`#ffffff`) | same as light |
| `warning` (fg) | `#EB992E` (`#1F1F0F`) | same as light, dark text |
| `destructive` (fg) | `#CF5A55` (`#ffffff`) | brand rojo, white text |
| `ring` | `oklch(0.556 0 0)` | preset neutral |

Shadows are **not** redefined in dark, so depth leans on the tonal steps of the neutral scale (background `0.145` → card `0.205` → menu on card with a translucent border) rather than `box-shadow`. Don't reuse light's white label on the dark `primary` — use `primary-foreground` (`#0F0D18`).

## Typography

**Geist Sans** sets UI and prose; **Geist Mono** sets code, design tokens, and tabular numbers. Both load via `next/font/google` with auto-hosting — no external requests. Use a single family; if another brand must appear, frame it as a logo. The `typography` tokens above carry concrete `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing`:

- `display` `48/56` and `h1`–`h3` title pages and sections at weight `600`; `letterSpacing` tightens (`tracking-tight`) as size grows.
- `body-large`, `body`, and `small` set multi-line text with generous line-height (`body` is `16/28`); `small` is muted secondary copy.
- `caption` is `12px`, weight `500`, uppercase with wider tracking — labels, metadata, table headers.
- `button` is the medium-weight `14/500` label for buttons and compact controls; `mono` pairs Geist Mono at the same `14px` metric for IDs, prices, and code.

Communicate hierarchy with size and weight, not color — color decorates, size/weight ranks. Keep `body` at `leading-7` minimum. Limit weights to **400** (body), **500** (labels, soft emphasis), and **600** (headings, CTAs); reserve `700+` for rare extra presence.

## Layout

Spacing follows Tailwind's 4px base scale (`--spacing: 0.25rem`). Use only the steps above; if something falls between two steps, pick the nearest — never invent `p-[13px]`. **4 / 8 / 16 / 24px cover ~90% of cases.** Keep a vertical rhythm: paragraphs at `gap-4` (16px), section to content at `gap-8`–`gap-12` (32–48px), page footer at `mt-24` (96px).

Each route declares a max width by content type; the sidebar is always `256px` (`w-64`). Use `max-w-md` (768px) for docs and articles, `max-w-lg`–`max-w-xl` for dashboards, and `max-w-2xl` (1536px) for dense full-bleed data tables. Breakpoints are `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536px; every layout must work on mobile and desktop. Lay out on Tailwind `grid` with `gap-6` — most views fit `grid-cols-{1|2|3|4}`, dashboards use `grid-cols-12`.

Component padding defaults (don't change without reason): `Card` `24px` (compact `16px`), `Dialog` content `24px`, `Alert` `16px`, `Button` `0 16px`, `Input` `0 12px`.

## Density

A `--density` multiplier (default `1`) scales horizontal/vertical spacing in components that opt in, exposed as `--density-sm/md/lg`. Add `.density-compact` (`0.75`) to a container to tighten data-heavy views — tables, case lists, dashboards — without changing the components themselves. Use compact deliberately, not as a global default.

## Elevation & Depth

Hierarchy comes from tonal surfaces and borders first, so shadows stay subtle. The shadow scale keys off a single near-black blue `--shadow-color: 224 14% 14%`. Apply these `box-shadow` values in the light theme:

- `xs` — `0 1px 2px 0 hsl(224 14% 14% / 0.06)` — resting affordance on inputs/buttons.
- `sm` — `0 1px 3px 0 hsl(… / 0.08), 0 1px 2px -1px hsl(… / 0.08)` — raised cards.
- `md` — `0 4px 6px -1px hsl(… / 0.08), 0 2px 4px -2px hsl(… / 0.06)` — dropdowns, hover lift.
- `lg` — `0 10px 15px -3px hsl(… / 0.08), 0 4px 6px -4px hsl(… / 0.05)` — popovers and menus.
- `xl` — `0 20px 25px -5px hsl(… / 0.10), 0 8px 10px -6px hsl(… / 0.06)` — modals and sheets.
- `2xl` — `0 25px 50px -12px hsl(… / 0.25)` — full-screen overlays only.

Pair each elevation with the matching radius below. In dark these values are unchanged but read faintly, so lean on `card`/`border` contrast instead (see [Dark theme](#dark-theme)).

## Motion

Nexcar is a tool used under pressure — **animation confirms what happened, it does not entertain.** Subtle, fast, purposeful. Durations: `instant` 75ms (trivial state/color), `short` 150ms (tooltips, badges, toggles), `medium` 250ms (default — dialogs, dropdowns, sheets, accordion), `long` 400ms (page/illustration), `epic` 800ms (marketing hero only, never in product).

Easings — ~90% of animations are ease-out (enter with energy, settle):

- `ease-out` `cubic-bezier(0, 0, 0.2, 1)` — default for entrances.
- `ease-in` `cubic-bezier(0.4, 0, 1, 1)` — exits; start slow, accelerate away.
- `ease-in-out` `cubic-bezier(0.4, 0, 0.2, 1)` — two-way transitions (toggles, swaps).
- `spring` `cubic-bezier(0.34, 1.56, 0.64, 1)` — slight overshoot for toasts/new badges, sparingly.
- `anticipate` `cubic-bezier(0.68, -0.6, 0.32, 1.6)` — celebration moments only, never in dense flows.
- `linear` — infinite loops only (spinners).

When several elements appear, stagger `75ms` each, max 5 animated (the rest are instant). Don't animate dense table/list data changes, multi-element moves without coordination, decoration in critical approve/reject flows, or sidebar/header on navigation. Honor `prefers-reduced-motion`: all motion drops to `0.01ms`, no exceptions — use the `motion-reduce:` prefix for custom animation.

## Shapes

Radii key off `--radius: 0.625rem` (10px): `sm` 6px (radius−4) for inputs, badges, small controls; `md` 8px (radius−2) for buttons and most controls; `lg` 10px for cards and dialogs; `xl` 14px (radius+4) for large surfaces; `full` 9999px for pills, avatars, and circular dots. Keep one radius family per view rather than mixing rounded and sharp corners.

## Illustration

Three asset classes, each with its own territory (full system at `/brand/illustrations`):

- **Editorial system** (marketing, landing, verticals, blog, social — PNG/WebP @2x in `public/brand/illustrations/editorial/`, named `nx-ill-[register]-[category]-[slug]-v[n].png`). Flat mid-century screen-print style: no outlines, forms as color blocks, hard-edged **colored shadows (violet/purple — never gray or black)**, one warm amber light source, uniform fine risograph grain, max 3–4 elements and one focal point per scene. Illustration palette derives from the brand OKLCH system — core: deep violet `#1C1434`, rich violet `#352661`, brand purple `#7E6BC4`, pale lavender `#B8B0E1`, amber `#EB992E`, warm cream `#F9EDD9`; supports (max two per scene, ≤15% of area): sky blue `#B3D1F1`, dawn pink `#EDC1C0`, light amber `#EDC793`, sage `#ABCEB6`, success green `#269E5F`, info blue `#4687D8`, muted coral `#CA564D`. Five light registers set the mood mix: **R1 Rise Up** (sunrise — success stories, ~15%), **R2 Mañana** (bright high-key default, ~50%), **R3 Golden Hour** (prestige heroes, ~15%), **R4 Noche** (fraud/security "positive surveillance", ~20%), **R5 Warhol** (pop-art brand-color remix — social/celebration only, never fraud or hard moments). Hard rules: never depict the fraudster (no hooded figures — depict the detection); prendarias always in daylight (no R4); post-crash scenes show resolution, never impact; emotion lives in posture, not faces; document types (IDs, invoices, tarjeta de circulación, póliza, CFDI, título) are recognizable **by geometric layout only — never readable text**; generated pieces validate direction — final assets are commissioned. Two abstract categories extend the system without people or cars: **Flujos** (the product as monumental sculpture — floating paper cards linked by threads of light, the expediente flowing through rules) and **Redes** (how the system thinks — concentric waves, orbits, convergences, constellations, risograph overprints); their translation rule renders glow as **flat concentric hard-edged color bands** (never blur/airbrush) and translucency as **risograph overprint** (overlaps print in a distinct palette color), assembled with their own BASE/negative variant (UI-element veto lifted, realistic-screenshot veto added). An **experimental technique modifier** ("Gradiente riso") is available in the assembler: it swaps the single flat shadow color for **risograph dither gradients** — one palette color grain-fading into the next with coarse visible grain, silhouettes keeping hard cut-out edges — as an optional append (placed after the light register so it also overrides the Warhol remix's flat-technique note) that leaves the canonical BASE untouched while the treatment is evaluated. The whole editorial system generates in a **single 16:9 format** (crops for cards/social happen in editing). Prompts and the assembler (83 scenes, 13 categories, plus the "Nexi en escena" category — assembled with the mascot BASE, always attaching Nexi's canonical reference, Warhol vetoed since Nexi's colors are canonical — with compact ≤1500-char variants for Figma) live at `/brand/illustrations`.
- **Pixel-art mascot — Nexi** (emotional moments: success, celebration, empty states — transparent PNG in `public/brand/mascot/`, native scale or integer multiples only, purple palette untouched). New poses are generated from a canonical character prompt (17 pose recipes in `src/lib/illustration-prompts.ts`), always against the canonical reference image. Two extra renditions: a **flat mid-century pose** (Nexi translated into the editorial language, for blog/social spots) and **Nexi-in-scene editorial pieces** (18 scene recipes, generated from the main assembler's "Nexi en escena" category, light register selectable) where Nexi's fixed role is *the detective* — searching, finding clues, hunting fraud with a magnifying glass, flashlight, binoculars or radar (the "never depict the fraudster, depict the detection" rule embodied). Nexi cameos never appear in hard moments (sad scenes, post-crash) or serious compliance surfaces; the magnifying glass is reserved exclusively as Nexi's prop.
- **Product spot illustrations** (onboarding, empty states, soft errors — SVG with `viewBox`, no fixed root size, colors via `currentColor`/`var(--primary)`; Phosphor filled icons at `size-16`–`size-24` in primary as the stand-in until assets exist).

## Components

The `components` tokens above give ready-to-use values per element. Defaults are the medium `40px` size; use `button-sm` (36px) and `button-lg` (44px) for the other sizes. All are shadcn/ui sources in `src/components/ui` — edit them directly.

- **Primary button** — solid `primary` fill with white label, for the single most important action. Hover drops opacity to 90%.
- **Secondary button** — `secondary` (neutral) fill; hover to 80% opacity.
- **Outline button** — `background` fill with a `1px` `input` border; hover tints with `accent`.
- **Ghost button** — transparent; tints with `accent` on hover, for low-emphasis actions.
- **Destructive button** — solid `destructive` fill with white text, for destructive actions.
- **Link button** — `primary` text with underline on hover.
- **Input** — `background` fill, `1px` `input` border, `8px` radius, `0 12px` padding; text is `16px` shrinking to `14px` from `md` up.
- **Card** — `card` surface, `1px` `border`, `10px` radius, `24px` padding (`16px` compact).
- **Avatar** — `40px` circle by default, `size` in px. Photo via `src`; when absent it falls back to a deterministic `avvvatars` mark (initials or shape) seeded by `name`/`value`, never an empty chip. Composed `Avatar` over the shadcn/Radix primitive.
- **Tabs** — horizontal section switcher: `muted` list, active trigger on `background` with `shadow-sm`. The **standard for sectioning a sheet/Drawer** (Resumen / Documentos / Actividad) — never hand-rolled buttons; you get `tab`/`tabpanel` roles and arrow-key nav for free. shadcn/Radix.

Focus shows a two-layer ring on `:focus-visible` (`ring-2 ring-ring ring-offset-2`): a 2px gap in the surface color, then a 2px `ring` (preset neutral — `oklch(0.708 0 0)` light / `oklch(0.556 0 0)` dark). Disabled uses `opacity-50` and `cursor-not-allowed`. Icons inside buttons are `16px` and inherit text color.

## Patterns

- **Drawer** — creating/editing or viewing detail opens a right-side slide-out (shadcn Drawer / `vaul`, `direction="right"`, `w-full sm:max-w-md`), never a new page or centered dialog. Header (title + close), scrollable body, pinned footer (Cancelar + primary action). Short confirmations use `Dialog`/`Alert`; long multi-step flows get a dedicated page. No nested drawers.
- **Copiloto** — the contract for how Nexcar's AI communicates in-product. The copilot **proposes, never rules**: the dictamen belongs to the analyst. Every suggestion is **sugerencia + evidencia + salida** — a clear verb with numeric confidence to one decimal ("Aprobar expediente · confianza 94.2 %"), the why in Quién → Qué → Cruces order (with related expediente IDs), and actions (primary executes the suggested dictamen, secondary opens the evidence — never auto-executed). Copilot text is labeled as such ("Sugerencia del copiloto" / "Alerta detectada"), speaks as "el motor" or first-person plural with no persona/emojis/exclamations, stays sober on fraud alerts, states low confidence honestly and routes to human review (the suggested-dictamen shortcut is disabled below the customer's threshold), and both the suggestion and the analyst's dictamen are kept in the historial. It never questions the analyst's ruling. Implemented as the composed `CopilotSuggestion` component (`kind: suggestion | alert`, `title`, `confidence`, `evidence`, `primaryAction`/`secondaryAction`, `belowThreshold`).

## Voice & Content

Nexcar's voice is **the expert at the analysis desk** — it masters vehicle inspection and fraud detection, gives certainty where money and risk are on the line, and does it without drama or needless jargon. **Voice is constant; tone flexes** by context (more aspirational in marketing, soberer in a fraud case, more empathetic in support). The full brand guide lives at `/brand/voice`; product UI microcopy rules (buttons, inputs, currency, timescales) at `/guidelines/microcopy`. The four voice dimensions: **professional formality** (not stiff), **serious with warmth** (no jokes about risk), **respectful**, and **confident & direct** with contained energy.

### The four personality traits

- **Expert, not know-it-all** — prove knowledge with data and operational detail, never credentials. _"El REPUVE reporta el auto sin adeudos, pero el folio de la factura muestra inconsistencias."_
- **Clear out of respect for time** — analysts work under load; fewer words, more certainty. _"Expediente validado. Dos alertas: factura y tarjeta de circulación."_
- **Trustworthy & calm** — convey control, never alarmism. _"Detectamos una alteración en el documento. Esto es lo que sigue."_ — never _"¡ALERTA! …"_.
- **Close, human** — the operating team's ally, on `tú` terms, warm without being buddy-buddy.

### The framework — Quién → Qué → Cruces

Every inspection is told in three steps, in this order (the same the product shows): **Quién** — the person behind the operation, _¿es confiable?_ → **Qué** — the vehicle, _¿está en orden?_ → **Cruces** — contrast both against +80 sources. Always start with the person, close with the cross-check; never just "documents."

### Writing principles

- **Benefit first, feature second** — "reduce el tiempo de inspección de días a minutos", then the how; not "usamos IA para leer documentos."
- **Proof, not adjectives** — show "85% menos tiempo" and "+80 fuentes", not "somos rápidos y precisos." Public figures need a source, an owner + quarterly expiry, and are qualified when they come from one client ("clientes como X lograron…").
- **Certainty, not fear** — sell control, not panic. On fraud specifically: concrete and demonstrable (forense, listas negras compartidas, detección de IA), sober when describing a detection, preventive ("antes de", "en tiempo real", "en el punto de decisión").
- **Never absolute promises (legal wording)** — never "garantizamos la detección", "detección 100 %", "cero fraude", "infalible", or "elimina el fraude". Detection is probabilistic: speak of **detecting, reducing, anticipating** with substantiated figures and numeric confidence. An absolute claim in commercial material is a contractual risk — applies to web, sales, product, and contracts without exception.
- **The customer is the protagonist** — write about _su_ operación; Nexcar is the copilot, the analyst drives.
- **Talk about cars, not generic "assets"** — name the vehicle and the decision behind it (siniestro, prenda, financiamiento, toma de usado).
- **Double benefit** — never only "stop fraud"; always pair it with speeding up the legitimate ("el asegurado legítimo cobra en días; el montachoques no cobra").
- Address the reader as **"tú"** (professional), avoid gratuitous anglicisms ("flujo" not "workflow"), and never use double exclamation marks or sustained caps — security doesn't shout. Product names **Buró de Fraude** and **Antifraude Documental** are capitalized, carry an article, and are never translated.

### Sí / No

| Nexcar voice | Not this |
|---|---|
| "Reduce el tiempo de inspección de días a minutos." | "Nuestra revolucionaria plataforma optimiza sinérgicamente sus flujos." |
| "Valida el expediente del auto antes de pagar el siniestro." | "Gestiona tus procesos documentales de forma integral." |
| "Detecta fraude documental antes de que llegue a tu mesa de control." | "Evita que los malos actores perpetren ilícitos en su contra." |
| "Lo que una institución detecta protege a toda la red." | "Aprovechamos un robusto ecosistema colaborativo de inteligencia." |

**Vocabulary — use:** certeza · certidumbre · control · inspección documental · detección de fraude · listas negras compartidas · el nuevo estándar · copiloto · mesa de control · expediente vehicular · siniestro · préstamo prendario · toma de usado · REPUVE. **Avoid:** revolucionario · disruptivo · sinergia · de clase mundial · solución integral 360° · líder indiscutible · empoderar · leverage.

### In product (UI microcopy)

Inside the platform the voice tightens to functional microcopy — no emojis (prohibited across every channel and interface; use a Phosphor icon instead), no greetings, no "have a nice day":

- **Precise** — "13 alertas" means 13; confidence always carries one decimal (`94.2 %`, never `~94%`).
- **Actionable** — every string leads to a dictamen (aprobar, rechazar, escalar); don't describe the problem, resolve it. Name actions verb + noun (`Dictaminar expediente`, `Aprobar expediente`, `Marcar como fraude`), never `OK`, `Submit`, or `Continuar`.
- Write validations as what happened plus what to do: `El CURP no coincide con el INE. Verifica antes de aprobar.` Empty states point to the first action: `Aún no hay expedientes en revisión. Sube documentos para empezar.`
- Use ISO dates in tables (`2026-05-12`) and conversational dates in UI (`12 may 2026`). Render IDs in `mono`, truncated with a tooltip past 12 chars. **Never** show a full CURP/RFC/CLABE by default — always mask (`XAXX••••••AB1`).

Core product vocabulary (full glossary at `/guidelines/glosario`): **Expediente** (unit of work; "Case" in English — never "caso"), **Dictaminar** (the act of ruling on an expediente; the **dictamen** is not a separate object — it is defined by the state the case lands in), **Alerta** (`alert` — fraud/risk indicator, never "señal"; carries a **Severidad** (`severity`) when the finding comes from blacklists — internal, external, or partner lists: a match against a list, not a model suspicion; three levels for now — **Alta** (`high`), **Media** (`medium`), **Baja** (`low`) — always shown with the list that originated it), **Confianza** (model certainty, always a %), **Documento** (not "archivo"), **Validación** (the act, counted per document or per source — "13 validaciones" are 13 crosses; the whole capability is the **validación documental**; never "verificación" in product — that word lives in marketing/B2C), **Analista** (not "agente" or "usuario"). Case states form a **finite state machine** — always exactly one state, and the dictamen outcomes are states like the others: **Sin documentos** (`no-documents` — a claim exists but the end user hasn't uploaded their documents yet), **Procesando** (`processing`), **Nuevo** (`new` — engine done, nobody has taken it), **En revisión** (`pending`), **Retenido** (`held` — set aside so only a specialist in difficult cases can take it; the same state formerly labeled "Escalado" — *escalar* remains the verb that sends a case there), **Corrección** (`correction` — a document is missing or impossible to validate; blocked until replaced), **Aprobado** (`approved`), **Rechazado** (`rejected`), **Fraude** (`fraud` — confirmed fraud; feeds the Buró de Fraude and shared blacklists), **Cancelado** (`cancelled` — closed without dictamen), **Vencido** (`expired` — deadline ran out), **Reapertura** (`reopened` — a closed case back at the desk with full history). Transitions (v1, pending product validation): happy path `no-documents → processing → new → pending → approved`; from `pending` also → `held` (specialist rules), `correction` (replaced document re-enters `processing`), or a dictamen to `approved`/`rejected`/`fraud`; `no-documents`/`correction` expire to `expired`; any open state can be `cancelled`; the five terminal states (`approved`, `rejected`, `fraud`, `cancelled`, `expired`) exit only via `reopened` (confirmed for the dictamen states; whether `cancelled`/`expired` can reopen is an open question), and `reopened` returns to `pending`. A transition not on this map gets proposed in the glossary first — never invented in a screen. **Whitelabel aliases:** a customer may rename a state's visible label (defined in their /customers/[slug] sheet, next to their theming) but never its semantics — canonical keys are network-wide because metrics, API, webhooks, and the Buró de Fraude speak them; custom per-customer states do not exist. A flow that truly doesn't fit the 12 gets absorbed into the canonical FSM or modeled as a **motivo** (reason code) within a state — motivos do admit per-customer variation. **Ancla / datos ancla / documento ancla** — the primary data required for a correct validation; arrives via integration (the customer's system sends it over the API, even as Base64) or via an uploaded document.

### Selling to B2C (consumer verifications)

Nexcar does **not** speak to its customers' end users — that copy adapts to each whitelabel's voice (`/customers/[slug]`). Nexcar's own B2C is different: **selling verifications directly to consumers through marketplace alliances**. Canonical example: Seminuevos.com — a private seller verifies their car's documents and the listing stands out with the **Certificación Nexcar**, so it sells faster. The reader is a person selling (or buying) a car: they don't know what an expediente is and don't care about REPUVE — they care about selling fast, at a good price, without surprises. The rules: **personal benefit, not operational** (seller: "los compradores confían más y preguntan menos"; buyer: "Compra con certeza, no con fe"), **zero internal jargon** ("verificado contra +80 fuentes oficiales" is the phrase that lands; REPUVE/OCR/motor/confianza stay invisible), **simple steps and a clear price** ("Sube la factura y la tarjeta de circulación. En minutos tienes tu resultado."), **certainty that unlocks, never fear-selling** (fear scares the buyer away too), and **here the brand fronts it** — unlike whitelabel: **la Certificación Nexcar** and the badge **Verificado por Nexcar**, capitalized with article, never translated (same rules as the Buró de Fraude). If a document fails verification, the seller is never accused — say what happens next: "No pudimos verificar tu factura. Revisa que sea la versión más reciente o escríbenos — lo resolvemos contigo." Brand laws travel unchanged: `tú`, serene, no absolute promises ("se vende más rápido" ok; "garantizamos la venta" never), no emojis, figures with sustento.

### Aquí no lanzamos AI slop (anti-slop)

Nexcar's working norm for AI-generated content ("we don't ship slop here"), documented at `/guidelines/anti-slop`: **use AI for all of your work — it should make the team move 10x faster — but never ship purely AI-generated content without a layer of human taste and filtering.** AI content is very cheap to create and incredibly expensive to consume; passing raw output to coworkers or clients transfers the review burden to them. In practice: trim before sharing (what came out as 10 pages is probably 2 — the reviewer's time is worth more than the time you saved generating), add the judgment AI doesn't have (client context, real figures under the substantiation rule), and at a bare minimum don't make your stuff look like AI. The design system is the anti-slop toolkit: feed agents the real tokens **before** generating — `/design.md` (or the home page's "Copiar todo el branding" button) for Nexcar materials, each customer's "Copiar branding" button on `/customers/[slug]` for whitelabel materials, and `/llms.txt` · `/llms-full.txt` · `/md/*` for the full system in Markdown — so output uses the brand's colors, type, components, and voice instead of the model's defaults (purple gradients, glassmorphism, emojis, inflated filler prose).

## Whitelabel / Customer themes

Nexcar ships as a themeable base: customers re-skin the system by overriding `primary`/`ring` (and `radius`) on top of the shared neutral surfaces — keeping every component, spacing, and type token intact. Customer themes are **light-only** (whitelabels don't expose dark mode; only Nexcar's own theme carries a dark pair); **override only the brand token, never fork the component layer.** Current customers:

- **Montepío** — `primary` granate `oklch(0.4538 0.1412 22.8009)`, radius `0.375rem`, Inter.
- **ANA Seguros** — colors extracted from the real site (anaseguros.com.mx): carmine `#BE0F34` as `primary`/`ring`, orange `#F1844D` as `accent`, gray `#DDDDDE` (their tab/menu surface) as `secondary` with their text gray `#555559` as its foreground. Voice & tone documented (draft pending client validation): promise **#EstásEnBuenasManos**; three pillars — **cercana** (accompanies, not a contract), **clara** (insurance in plain Spanish, no disguised fine print), **serena y experta** (30 years felt as calm and control); calibration — serious humor, neutral-to-casual formality (`tú` always), respectful, neutral enthusiasm (up in welcome/renewal, down in claims); claims context gets maximum serenity, numbered steps, zero selling.
- **HDI Seguros** — green `#006B2D`.
- **Elektra** — red `#EA2629`.

Each customer's brand kit is one click away: every `/customers/[slug]` page and every card on the `/customers` index has a **"Copiar branding"** button (`CopyCustomerBranding`) that copies the customer's theme tokens (light + dark CSS variables from `src/lib/customers.ts`) plus the customer page's Markdown — voice & tone included — as a single AI-ready document. It's the whitelabel counterpart of the Nexcar-wide "Copiar todo el branding" (`/design.md`) button: use the Nexcar one for materials in Nexcar's brand, the customer one for materials in that customer's brand.

## Do's and Don'ts

- Use the neutral scale to rank information: `foreground` for primary text, `muted-foreground` for secondary.
- Keep the brand purpura for the single most important action, links, and active state — not for large fills or decorative icons.
- For text on `warning` (ámbar), use shade 8 or darker — shade 5 fails contrast on white.
- Hold WCAG AA (4.5:1 body text); measure with DevTools before merging when unsure.
- Show the focus ring on every interactive element at `:focus-visible`; never remove an outline without a visible replacement.
- Apply the typography and spacing tokens instead of hand-setting size, line-height, or custom pixel spacing.
- Use Phosphor at weight `fill`, sized with `size-*`, inheriting `currentColor`; don't mix icon families or hardcode icon colors outside state.
- Don't signal state with color alone; pair it with an icon or text label.
- Don't mix rounded and sharp corners, or more than two font weights, in one view.
- Don't animate dense data or critical decision flows; don't ignore `prefers-reduced-motion`.
- Don't fork shadcn components for a whitelabel — override the brand token only. Don't reinstall shadcn components; the copies in `src/components/ui` are the source of truth.
- Don't ship raw AI output — trim it, add human judgment, and generate with the real tokens (Nexcar's or the customer's) so it doesn't look like AI. Aquí no lanzamos AI slop (`/guidelines/anti-slop`).
