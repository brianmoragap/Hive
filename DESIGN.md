# Design System Documentation: The High-Performance Hive

## 1. Overview & Creative North Star: "The Kinetic Pulse"
The Creative North Star for this design system is **"The Kinetic Pulse."** We are moving away from the static, boxed-in layouts of traditional safety apps. Instead, we are building a high-performance, editorial-grade experience that mirrors the rhythm of an active lifestyle. 

This system breaks the "template" look by prioritizing **intentional asymmetry** and **breathable depth**. By utilizing extreme roundedness (`rounded-full`) alongside high-contrast typography, we create an environment that feels both protective and empowering. The vibe is "Athletic Elegance"—professional enough for high-level performance tracking, but soft enough to feel like a supportive community.

---

## 2. Color Philosophy: Tonal Vibrancy
We have transitioned from deep violets to a high-energy, feminine-forward coral palette. This isn't just a color swap; it’s a shift in energy.

### The Palette (Core Tokens)
*   **Primary (`#af232b`):** The "Pulse." Used for high-impact actions and critical brand moments.
*   **Surface (`#fff4f4`):** A warm, flesh-toned neutral that feels more human and approachable than "digital white."
*   **Secondary (`#575b6d`):** A grounded slate that provides the professional, athletic contrast required for data-heavy views.

### The "No-Line" Rule
**Strict Mandate:** Traditional 1px solid borders are prohibited for sectioning. 
Structure must be defined by **Tonal Shifts**. To separate a content block, place a `surface-container-low` card against a `surface` background. If you need more definition, use a `surface-container-high` element. Boundaries are felt, not seen.

### The "Glass & Gradient" Rule
To elevate the "Hive" app above standard utility tools, use semi-transparent surfaces with a `12px` to `20px` backdrop blur for floating navigation or overlays. 
*   **Signature Texture:** Use a subtle linear gradient from `primary` (#af232b) to `primary-container` (#ff7672) at a 135-degree angle for hero CTAs. This creates a "glow" that feels like kinetic energy.

---

## 3. Typography: Editorial Authority
We utilize **Plus Jakarta Sans** not as a standard sans-serif, but as a bold, editorial typeface.

*   **Display (L/M/S):** Used for "Big Wins" and high-impact stats. Use tight letter-spacing (-0.02em) to mimic premium sports journalism.
*   **Headline (L/M/S):** The voice of the community. Bold, assertive, and clean.
*   **Title & Body:** Optimized for legibility during movement. Body-lg (`1rem`) is the default for readability while walking or running.
*   **Label (M/S):** Used exclusively for metadata and micro-copy. 

**Typography as Brand:** By pairing a `display-lg` stat with a `label-md` uppercase descriptor, we create the high-contrast "Strava-esque" look that signals professional-grade performance.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is biological, not mechanical. We avoid harsh drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** 
    *   Base: `surface`
    *   Content Sections: `surface-container-low`
    *   Interactive Cards: `surface-container-lowest` (This creates a "lifted" white-on-pink effect that looks premium and clean).
*   **Ambient Shadows:** If a floating action button (FAB) or modal requires a shadow, it must use the `on-surface` color at 6% opacity with a `32px` blur and `8px` Y-offset. It should look like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a border (e.g., in high-contrast modes), use `outline-variant` at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components: The Athletic Toolkit

### Buttons & Interaction
*   **Primary Action:** `rounded-full`. High-contrast `primary` background with `on-primary` text. No border.
*   **Secondary Action:** `rounded-full`. `surface-container-highest` background. This feels integrated into the UI rather than "tacked on."
*   **The Hive Pulse (Custom Component):** A specialized "Active State" indicator for community safety features using a `surface-tint` pulsing glow effect.

### Inputs & Selection
*   **Input Fields:** Use `surface-container-low` with a `rounded-xl` (3rem) or `full` corner. Labels should sit above the field in `label-md`, never inside as placeholder text.
*   **Chips:** Essential for filtering community activity. Use `secondary-container` for unselected and `primary` for selected.
*   **Checkboxes/Radios:** Must be `rounded-full`. The "check" is a minimalist dot or tick in `on-primary`.

### Cards & Lists
*   **Zero-Divider Policy:** List items are separated by `16px` of vertical white space or subtle shifts from `surface-container-low` to `surface-container-lowest`. 
*   **The "Performance Card":** A signature card style using a subtle gradient background and `display-sm` typography for immediate data recognition.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., a wider left-hand gutter for headlines) to create a premium editorial feel.
*   **Do** lean into the `rounded-full` aesthetic for all interactive containers; it communicates safety and approachability.
*   **Do** use `primary-fixed-dim` for inactive but important states to maintain color harmony.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#4d212a) to maintain the warm, high-end tonal balance.
*   **Don't** use sharp corners (0px to 8px). It breaks the "safe community" visual metaphor.
*   **Don't** use standard "Material Design" shadows. If the element doesn't feel like it's floating in a soft, lit room, the shadow is too heavy.