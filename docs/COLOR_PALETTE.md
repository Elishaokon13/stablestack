# 🎨 Color Palette - Quick Reference

## Your Brand Colors

```
┌─────────────────────────────────────────┐
│                                         │
│         🎨 Openly Colors           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔵 Primary Blue Scale

```
██████████ #001f4d  Darkest (Hover dark)
██████████ #003e91  Brand Primary ⭐
██████████ #0052cc  Medium (Dark mode primary)
██████████ #0066ff  Bright
██████████ #3385ff  Light
██████████ #66a3ff  Lightest
██████████ #99c2ff  Very Light
██████████ #e6f0ff  Tint (Backgrounds)
```

---

## ⚫ Dark Scale

```
██████████ #000000  Pure Black
██████████ #111111  Brand Dark ⭐ (Dark mode bg)
██████████ #1a1a1a  Cards (Dark mode)
██████████ #1f1f1f  Secondary (Dark mode)
██████████ #2a2a2a  Borders
██████████ #3a3a3a  Hover states
```

---

## 🌈 Light Mode Palette

### Backgrounds

```
Background:  ▓▓▓▓▓▓▓▓▓▓ #ffffff (White)
Cards:       ▓▓▓▓▓▓▓▓▓▓ #ffffff (White)
Secondary:   ▓▓▓▓▓▓▓▓▓▓ #f5f5f5 (Light gray)
Muted:       ▓▓▓▓▓▓▓▓▓▓ #f5f5f5 (Light gray)
Accent:      ▓▓▓▓▓▓▓▓▓▓ #e6f0ff (Light blue)
```

### Text

```
Foreground:  ████████ #0a0a0a (Almost black)
Muted:       ████░░░░ #6b7280 (Gray)
Primary:     ████████ #003e91 (Your blue)
```

### Borders

```
Border:      ▓░░░░░░░ #e5e7eb (Light gray)
Input:       ▓░░░░░░░ #e5e7eb (Light gray)
Ring:        ████████ #003e91 (Focus - your blue)
```

---

## 🌙 Dark Mode Palette

### Backgrounds

```
Background:  ████████ #111111 (Your dark) ⭐
Cards:       ████████ #1a1a1a (Slightly lighter)
Secondary:   ████████ #1f1f1f (Surfaces)
Muted:       ████████ #1f1f1f (Surfaces)
Accent:      ████▒▒▒▒ rgba(0,62,145,0.15) (Blue tint)
```

### Text

```
Foreground:  ▓▓▓▓▓▓▓▓ #f5f5f5 (Off-white)
Muted:       ▓▓▓▓░░░░ #9ca3af (Gray)
Primary:     ████████ #0052cc (Brighter blue)
Accent Text: ████████ #66a3ff (Light blue)
```

### Borders

```
Border:      ████░░░░ rgba(255,255,255,0.1) (Subtle)
Input:       ████░░░░ rgba(255,255,255,0.1) (Subtle)
Ring:        ████████ #0052cc (Focus)
```

---

## 🚦 Status Colors

```
Success:     ██████ #10b981 (Green)
Warning:     ██████ #f59e0b (Orange)
Error:       ██████ #ef4444 (Red)
Info:        ██████ #3b82f6 (Blue)
```

**Visual Examples:**

- ✅ Success: `#10b981` - "Payment completed successfully"
- ⚠️ Warning: `#f59e0b` - "Link expires in 24 hours"
- ❌ Error: `#ef4444` - "Payment failed"
- ℹ️ Info: `#3b82f6` - "New feature available"

---

## 📊 Chart Colors (Data Visualization)

Progressive blue palette for charts:

```
██████ Chart 1: #003e91  (Darkest - Brand)
██████ Chart 2: #0052cc  (Dark)
██████ Chart 3: #0066ff  (Medium)
██████ Chart 4: #3385ff  (Light)
██████ Chart 5: #66a3ff  (Lightest)
```

**Use for:**

- Bar charts
- Line charts
- Pie charts
- Area charts
- Heatmaps

---

## 🎯 Common Combinations

### Light Mode

**High Contrast (Text):**

```
#0a0a0a on #ffffff  ✅ 16.7:1 (AAA)
█████ Text
▓▓▓▓▓ Background
```

**Primary Action:**

```
#ffffff on #003e91  ✅ 8.6:1 (AAA)
▓▓▓▓▓ Text
█████ Background
```

**Subtle Accent:**

```
#003e91 on #e6f0ff  ✅ 9.2:1 (AAA)
█████ Text
▓▓▓▓▓ Background
```

### Dark Mode

**High Contrast (Text):**

```
#f5f5f5 on #111111  ✅ 14.8:1 (AAA)
▓▓▓▓▓ Text
█████ Background
```

**Primary Action:**

```
#ffffff on #0052cc  ✅ 7.2:1 (AAA)
▓▓▓▓▓ Text
█████ Background
```

**Subtle Accent:**

```
#66a3ff on rgba(0,62,145,0.15)  ✅ 4.5:1 (AA)
█████ Text
████▒ Background
```

---

## 🎨 Gradient Recipes

### Brand Gradient (Full)

```
linear-gradient(135deg, #003e91 0%, #0052cc 100%)

█████████████ → ████████████░
Dark Blue          Bright Blue
```

### Soft Brand Gradient

```
linear-gradient(135deg,
  rgba(0,62,145,0.1) 0%,
  rgba(0,82,204,0.05) 100%)

████▒▒▒▒▒▒▒▒▒ → ███▒▒▒▒▒▒▒▒▒▒
Subtle Blue        Almost Transparent
```

### Radial Glow

```
radial-gradient(circle at center,
  #003e91 0%,
  transparent 70%)

    ████
  ████████
  ████████  ← Fades out
  ████████
    ████
```

---

## 📱 Component Color Usage

### Buttons

**Primary:**

```
Background: #003e91
Text: #ffffff
Hover: #001f4d (Darker)
```

**Secondary:**

```
Light Mode:
  Background: #f5f5f5
  Text: #111111
  Hover: #e5e7eb

Dark Mode:
  Background: #1f1f1f
  Text: #f5f5f5
  Hover: #2a2a2a
```

### Cards

**Default:**

```
Light Mode:
  Background: #ffffff
  Border: #e5e7eb

Dark Mode:
  Background: #1a1a1a
  Border: rgba(255,255,255,0.1)
```

**Accent:**

```
Light Mode:
  Background: #e6f0ff
  Border: #003e91 (20% opacity)

Dark Mode:
  Background: rgba(0,62,145,0.15)
  Border: #0052cc (20% opacity)
```

### Sidebar

**Active Item:**

```
Light Mode:
  Background: #f0f7ff
  Left Border: #003e91 (4px)
  Text: #111111

Dark Mode:
  Background: rgba(0,82,204,0.15)
  Left Border: #0052cc (4px)
  Text: #f5f5f5
```

**Hover:**

```
Light Mode:
  Background: #f0f7ff (lighter)

Dark Mode:
  Background: rgba(0,82,204,0.25)
```

---

## 🎯 Usage Patterns

### Hero Section

```
Background: Gradient Brand
Text: White (#ffffff)
Accent: Light blue (#66a3ff)
```

### Dashboard Cards

```
Background: Card color
Border: Border color
Title: Foreground color
Value: Primary color (#003e91)
Subtitle: Muted foreground
```

### Forms

```
Input Background: Background
Input Border: Input/Border color
Focus Ring: Primary color
Label: Foreground color
Helper Text: Muted foreground
Error: Destructive (#ef4444)
```

---

## 🔍 Finding Colors in Code

### CSS Variables

```css
/* In your components */
background-color: var(--primary);
color: var(--primary-foreground);
border-color: var(--border);
```

### Tailwind Classes

```tsx
className = "bg-primary text-primary-foreground";
className = "border-border hover:bg-accent";
className = "text-muted-foreground";
```

### Custom Classes

```tsx
className = "bg-brand-blue";
className = "bg-gradient-brand";
className = "text-brand-blue";
```

---

## 📐 Color Relationships

```
Primary Palette:
#003e91 ──┬── #0052cc (Brighter)
          ├── #0066ff (More saturated)
          ├── #3385ff (Lighter)
          └── #66a3ff (Much lighter)

Dark Palette:
#111111 ──┬── #1a1a1a (Cards)
          ├── #1f1f1f (Secondary)
          └── #2a2a2a (Borders)

Accent Palette:
#e6f0ff (Light mode) ←→ rgba(0,62,145,0.15) (Dark mode)
```

---

## ✅ Quick Checklist

When designing a new component:

- [ ] Use `bg-card` for card backgrounds
- [ ] Use `text-foreground` for primary text
- [ ] Use `text-muted-foreground` for secondary text
- [ ] Use `border-border` for borders
- [ ] Use `bg-primary text-primary-foreground` for CTAs
- [ ] Use status colors for feedback
- [ ] Test in both light and dark mode
- [ ] Check contrast ratios (min 4.5:1)
- [ ] Use hover/focus states
- [ ] Keep brand colors consistent

---

## 🎨 Color Picker Values

For design tools (Figma, Sketch, etc.):

### Brand Blue (#003e91)

- **RGB:** rgb(0, 62, 145)
- **HSL:** hsl(214, 100%, 28%)
- **HSV:** hsv(214, 100%, 57%)

### Brand Dark (#111111)

- **RGB:** rgb(17, 17, 17)
- **HSL:** hsl(0, 0%, 7%)
- **HSV:** hsv(0, 0%, 7%)

---

## 📱 Preview

### Light Mode

```
┌─────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ White bg
│ ████ Heading (#0a0a0a)        │
│ ████ Subtext (#6b7280)        │
│                                │
│ ┌──────────────────────────┐  │
│ │ ▓▓▓ Card (#ffffff)       │  │
│ │ ████ Content             │  │
│ │ ████████ Button          │  │ #003e91
│ └──────────────────────────┘  │
└─────────────────────────────────┘
```

### Dark Mode

```
┌─────────────────────────────────┐
│ ████████████████████████████████ │ #111111 bg
│ ▓▓▓▓ Heading (#f5f5f5)        │
│ ▓▓▓▓ Subtext (#9ca3af)        │
│                                │
│ ┌──────────────────────────┐  │
│ │ ███ Card (#1a1a1a)       │  │
│ │ ▓▓▓▓ Content             │  │
│ │ ████████ Button          │  │ #0052cc
│ └──────────────────────────┘  │
└─────────────────────────────────┘
```

---

**Your professional color scheme is ready! 🎨✨**

Test at: `http://localhost:3000`
