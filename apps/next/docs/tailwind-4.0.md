
## 1. Introduction and Context

**Purpose:**  
Ensure the LLM fully understands that Tailwind CSS 4.0 is a major update, with a new high‑performance engine, modernized configuration, and a host of new utilities and features. The goal is to avoid any generation of outdated or deprecated v3.0 code.

**Context Overview:**  
- **Tailwind CSS 4.0** replaces older practices with a streamlined, CSS‑first approach.
- It introduces improved build speeds, modern CSS features (e.g., native cascade layers, container queries), dynamic utility generation, and enhanced configuration using the new `@theme` directive.
- The LLM must strictly generate code and examples based on these new conventions and refrain from any practices associated with v3.0.

---

## 2. Key Changes in Tailwind CSS 4.0

### A. Performance and Engine Enhancements
- **New High‑Performance Engine:**  
  - Full builds are up to 5× faster, and incremental builds can be over 100× faster compared to v3.0.  
  - Leverages modern CSS features such as native cascade layers and registered custom properties.  
  - *Reference:* [citeturn0search1]

### B. Simplified Installation and Modern Setup
- **Streamlined Installation:**  
  - Instead of multiple directives (like `@tailwind base;`, etc.), a single‑line import is now used:  
    ```css
    @import "tailwindcss";
    ```  
  - For Vite users, first‑party integration via `@tailwindcss/vite` minimizes configuration.  
  - Automatic content detection is built in, reducing manual configuration.  
  - *Reference:* [citeturn0search2]

### C. CSS‑First Configuration with `@theme`
- **Unified Configuration:**  
  - Tailwind CSS 4.0 now allows you to define design tokens and configuration directly in your CSS using the new `@theme` directive.  
  - Example:
    ```css
    @import "tailwindcss";

    @theme {
      --font-display: "Satoshi", sans-serif;
      --color-primary: hsl(210, 100%, 56%);
    }
    ```  
  - This eliminates the need for a separate `tailwind.config.js` file when using the CSS‑first approach.  
  - *Reference:* [citeturn0search6]

### D. Enhanced Utilities and Variant Capabilities
- **Dynamic Utility Values:**  
  - Utility classes now dynamically accept arbitrary values based on a unified spacing scale.
- **New Variant Features:**  
  - **Container Queries:** Built‑in support for responsive designs without extra plugins.
  - **3D Transform Utilities:** New classes (e.g., `rotate-x-*`, `rotate-y-*`) enable direct 3D transformations.
  - **Expanded Gradient APIs:** Enhanced support for linear, radial, and conic gradients, with modifiers for color interpolation.
  - **Additional Variants:** New `@starting-style` support for entry transitions and `not-*` variants for negation.  
  - *References:* [citeturn0search1] and [citeturn0search8]

### E. Deprecations and Legacy Code Removal
- **Removed or Updated Utilities:**  
  - Deprecated utilities like `text-opacity-*` and outdated `flex-grow-*` classes have been removed or replaced by simplified alternatives.
  - The default border color now uses `currentColor`, and ring utilities default to a 1px width rather than 3px.
- **Separation of Tools:**  
  - The CLI and PostCSS plugin are now maintained as separate packages, enhancing flexibility and clarity in configuration.  
  - *Reference:* [citeturn0search8]

---

## 3. Strict Guidelines for LLM Code Generation

### A. Use Only Tailwind CSS 4.0 Syntax and Conventions
- **Installation and Import:**  
  - Always generate examples with a single-line import:
    ```css
    @import "tailwindcss";
    ```
- **Configuration:**  
  - Encourage the use of the new `@theme` directive for defining design tokens.  
  - Avoid generating any references to a `tailwind.config.js` file when using CSS‑first configuration.
  
### B. Exclude All v3.0–Specific or Deprecated Features
- **Do Not Generate:**  
  - Multiple `@tailwind` directives (such as `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`).
  - Deprecated utility classes (e.g., `text-opacity-*`, old flex or decoration utilities).
  - Configuration patterns that belong exclusively to v3.0.
  
### C. Reference the Latest Documentation and Guidelines
- **Verification:**  
  - When uncertain, the LLM should rely on the official Tailwind CSS 4.0 documentation and upgrade guides for the most up‑to‑date practices.
  - Ensure that every code snippet and instruction aligns with the new features like container queries, 3D transforms, and dynamic utility generation.
  
### D. Emphasize Modern Features in All Examples
- **Examples Must Demonstrate:**  
  - Automatic content detection.
  - CSS‑first configuration via `@theme`.
  - New utilities and variants such as container queries and dynamic classes.
  - No legacy v3.0 examples should be provided under any circumstances.

---

## 4. Example Instructions for LLM Output

### Correct Example (Tailwind CSS 4.0):
```css
@import "tailwindcss";

@theme {
  --color-primary: hsl(210, 100%, 56%);
  --font-display: "Satoshi", sans-serif;
}
```
*This example leverages the new CSS‑first configuration and modern design token approach, with no references to a JavaScript config file.*

### Incorrect Example (v3.0 Code to Avoid):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
*This older syntax is specific to Tailwind CSS 3.0 and must not be generated.*

---

## 5. Final Summary and Directive for the LLM

**Summary Directive:**  
When addressing queries or generating code related to Tailwind CSS, always adhere to the Tailwind CSS 4.0 conventions. Emphasize:
- The streamlined installation process and single‑line import.
- The CSS‑first configuration using `@theme` to define design tokens.
- The new utilities, variants (container queries, 3D transforms, advanced gradient APIs), and performance improvements.
- Exclude any deprecated or v3.0–specific code or practices.

*Remember:* Every output must reflect the modern, efficient, and simplified approach of Tailwind CSS 4.0. If a query involves generating code, ensure that the latest best practices are followed without referencing any legacy v3.0 methodologies.

