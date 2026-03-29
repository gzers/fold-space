# Design System Document

## 1. Overview & Creative North Star: "The Celestial Archive"

This design system is not a utility; it is a sanctuary. To design for "Fold-Space" is to design the architecture of a memory—an expansive, quiet, and ethereal environment where the user feels both the vastness of the cosmos and the intimacy of their own thoughts. 

**The Creative North Star: The Celestial Archive.**
We move away from the "SaaS Dashboard" aesthetic by rejecting rigid grids and heavy borders. Instead, we embrace **Intentional Asymmetry** and **Tonal Depth**. The UI should feel like it is floating in a vacuum, held together by gravitational pull rather than CSS boxes. We prioritize breathing room (negative space) to ensure the "Personal Universe" feels safe and uncluttered. Elements should overlap slightly, creating a sense of three-dimensional "folding" in space.

---

## 2. Colors & Atmospheric Depth

The palette mimics the shifting light of a cosmic day cycle. We use deep, saturated base tones punctuated by vibrant, energetic accents.

### The Palette (Material Design Mapping)
*   **Background (Deep Space):** `#13131b` (The foundation of the universe).
*   **Primary (Morning/Active):** `#ffb59d` (Derived from `#ff6b35` for softer accessibility).
*   **Secondary (Evening/Melancholy):** `#cfbdfe` (Derived from `#6b5b95`).
*   **Tertiary (Cool/Night):** `#c3c3eb` (Derived from `#1a1b3a`).
*   **Surface:** `#13131b` (Seamless integration with background).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions. Use `surface-container-low` against `surface` to define areas. A line is a cage; we are creating an expanse.

### The "Glass & Gradient" Rule
To achieve the "Ethereal" feel, all floating containers must use **Glassmorphism**:
*   **Backdrop Blur:** 20px to 40px.
*   **Fill:** Use `surface-variant` or `surface-container-highest` at 40-60% opacity.
*   **Signature Textures:** Apply a subtle linear gradient (0% opacity to 10% opacity) of the `primary` color across large hero sections to simulate distant starlight.

---

## 3. Typography: The Editorial Voice

Typography is our primary tool for establishing the "Personal Universe" feel. We mix the technical precision of mono-spacing with the expressive geometry of space-age headings.

*   **Display & Headlines (Space Grotesk):** These are your "Galaxies." Use `display-lg` (3.5rem) with wide letter-spacing (-0.02em) for high-impact entry points. It feels futuristic and architectural.
*   **Titles & Body (Manrope / PingFang SC):** These are your "Stars." Manrope provides a clean, humanist touch to English text, while PingFang SC ensures Chinese characters maintain a high-end, modern weight.
*   **Data & Info (JetBrains Mono):** Use for timestamps, coordinates, or memory metadata. This adds a "recording instrument" feel to the product, grounding the ethereal visuals in technical reality.

---

## 4. Elevation & Depth: Tonal Layering

We do not use shadows to lift objects; we use light and opacity to "unfold" them.

*   **The Layering Principle:** Depth is achieved by "stacking" surface-container tiers. 
    *   *Base:* `surface` (#13131b)
    *   *Middle:* `surface-container-low`
    *   *Top (Interactive):* `surface-container-highest`
*   **Ambient Shadows:** For floating elements, use a 60px blur with only 4% opacity, using the `primary` color (warm) or `tertiary` (cool) as the shadow tint. This simulates a "glow" rather than a drop shadow.
*   **The "Ghost Border":** If accessibility requires a stroke, use `outline-variant` at 15% opacity. It should look like a faint reflection on the edge of a glass pane.
*   **Roundedness:** All containers must use the **xl (1.5rem / 16px)** radius to soften the futuristic aesthetic, making it feel "safe" and "personal" rather than cold and industrial.

---

## 5. Components: Floating Primitives

### Buttons
*   **Primary:** A gradient fill from `primary` to `primary-container`. No border. High contrast text (`on-primary-fixed`).
*   **Tertiary (Ghost):** No background. Use `JetBrains Mono` for the label to indicate a "technical action." Hover state triggers a subtle `surface-bright` glow.

### Cards & Lists
*   **Forbid Dividers:** Use vertical whitespace (Spacing Scale `6` or `8`) to separate list items.
*   **Memory Cards:** Must use the glassmorphism stack. Use `surface-container-lowest` for the card body to create a "sunken" or "deep" effect when nested within a brighter section.

### Input Fields
*   **Style:** Minimalist. Only a bottom "Ghost Border" that illuminates (increases opacity) when focused. 
*   **Helper Text:** Always in `label-sm` using `JetBrains Mono`.

### The "Fold" Component (Product Specific)
A unique transition element. When navigating between memories, elements should not "slide"; they should "scale and fade" simultaneously, as if folding into a higher dimension.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. Place a heading on the far left and the body text on the mid-right to create "negative space" tension.
*   **Do** use `JetBrains Mono` for all numbers and dates.
*   **Do** prioritize `surface-bright` for hover states to give the illusion of an object catching light.

### Don't
*   **Don't** use pure black (#000000) or pure white (#FFFFFF). Use the provided tokens to maintain the "atmospheric" tint.
*   **Don't** use 100% opaque cards. The "Floating" feel is lost if the background cannot bleed through.
*   **Don't** use standard icons. Use thin-stroke (1px or 1.5px) custom iconography that feels airy and light.
*   **Don't** use "Alert Red" for errors if possible; use the `error` token (#ffb4ab) which is softened to fit the ethereal palette.

---

**Director's Final Note:** 
Remember, you are not building a tool; you are building a telescope for the soul. Every pixel should feel like it has been placed with the quiet intentionality of a curator. If the UI feels "busy," remove a line and add 2rem of space. Let the universe breathe.