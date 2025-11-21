# 🎨 Color System Guide - 60-30-10 Rule

## Overview
This design follows the **60-30-10 color rule** for professional, balanced aesthetics:
- **60%** Main color (backgrounds, large areas)
- **30%** Secondary color (cards, sections, text)
- **10%** Accent color (CTAs, highlights, important elements)

---

## 🎯 Color Palette

### 1. Main Colors (60% Usage)
**Purpose**: Backgrounds, large surfaces, creating space

```tsx
// Light Mode
bg-main-white           // #FFFFFF - Primary background
bg-main-lightGrey       // #F5F5F5 - Subtle background
bg-main-background      // #FAFAFA - Alternative background

// Usage Examples:
<div className="bg-main-white">...</div>
<section className="bg-main-lightGrey">...</section>
<main className="bg-main-background">...</main>
```

**Where to use:**
- Page backgrounds
- Main content areas
- Large containers
- Card backgrounds (light grey variant)

---

### 2. Secondary Colors (30% Usage)
**Purpose**: Text, borders, cards, secondary elements

```tsx
// Charcoal & Grey Shades
text-secondary-charcoal     // #2C2C2C - Primary text
text-secondary-darkGrey     // #424242 - Secondary text
text-secondary-mediumGrey   // #757575 - Muted text
border-secondary-lightGrey  // #E0E0E0 - Borders

// Usage Examples:
<h1 className="text-secondary-charcoal">Heading</h1>
<p className="text-secondary-mediumGrey">Description</p>
<div className="border border-secondary-lightGrey">...</div>
```

**Where to use:**
- Primary text (charcoal)
- Secondary text (dark grey)
- Captions, timestamps (medium grey)
- Borders, dividers (light grey)
- Card shadows
- Icons (non-interactive)

---

### 3. Accent Color - Pink (10% Usage) ⚡
**Purpose**: Call-to-action, highlights, interactive elements

```tsx
// Pink Accent
bg-pink-primary       // #FF1744 - Main CTA
bg-pink-light         // #FF4569 - Hover state
bg-pink-dark          // #E01038 - Active state
bg-pink-background    // #FFE8ED - Subtle highlight

// Usage Examples:
<button className="bg-pink-primary hover:bg-pink-light">
  Add to Cart
</button>
<span className="text-pink-primary">$299</span>
<div className="bg-pink-background">...</div>
```

**Where to use:**
- Primary buttons (Add to Cart, Buy Now, Submit)
- Prices
- Important badges (NEW, SALE, HOT)
- Active states
- Links (on hover)
- Progress indicators
- Important icons (heart, star ratings)
- Notifications dots

**❌ DON'T overuse:**
- Not for large backgrounds
- Not for body text
- Not for all buttons (only primary actions)

---

### 4. Complementary Colors (Strategic Use)

#### Navy Blue - Professional & Premium
```tsx
// Navy
bg-navy-primary    // #1A237E
bg-navy-light      // #3949AB
text-navy-dark     // #0D1B5E

// Usage Examples:
<div className="bg-navy-primary text-white">
  Premium Section
</div>
<p className="text-navy-primary">Professional text</p>
```

**Where to use:**
- Premium features section
- Trust badges
- Professional headings
- Secondary CTAs
- Car dealership branding elements

---

#### Gold - Attention & Value
```tsx
// Gold
bg-gold-primary    // #FFB300
text-gold-light    // #FFC107
border-gold-dark   // #FF8F00

// Usage Examples:
<span className="bg-gold-primary text-secondary-charcoal px-2 py-1">
  SALE 20% OFF
</span>
<div className="border-2 border-gold-primary">
  Featured Product
</div>
```

**Where to use:**
- Sale badges (SALE, 20% OFF)
- Featured tags (FEATURED, TOP SELLER)
- Star ratings (⭐)
- Premium badges
- Discount indicators
- Special offers

---

## 📐 Usage Distribution Examples

### ✅ Good Example - Product Card
```tsx
<div className="bg-main-white border border-secondary-lightGrey rounded-lg">
  {/* 60% - White background */}
  
  <img src="car.jpg" alt="Car" />
  
  {/* 30% - Charcoal text */}
  <h3 className="text-secondary-charcoal font-bold">
    BMW M3 2023
  </h3>
  <p className="text-secondary-mediumGrey text-sm">
    Sport sedan with premium features
  </p>
  
  {/* 10% - Pink accent on price & button */}
  <p className="text-pink-primary text-2xl font-bold">
    R 899,000
  </p>
  
  <button className="bg-pink-primary hover:bg-pink-light text-white">
    View Details
  </button>
  
  {/* Strategic gold accent */}
  <span className="bg-gold-primary text-secondary-charcoal px-2">
    SALE
  </span>
</div>
```

---

### ✅ Good Example - Hero Section
```tsx
<section className="bg-main-lightGrey py-20">
  {/* 60% - Light grey background */}
  
  <div className="container mx-auto">
    {/* 30% - Charcoal heading */}
    <h1 className="text-5xl font-bold text-secondary-charcoal mb-4">
      Find Your Dream Car
    </h1>
    
    {/* 30% - Medium grey description */}
    <p className="text-xl text-secondary-mediumGrey mb-8">
      Browse thousands of verified listings
    </p>
    
    {/* 10% - Pink CTA */}
    <button className="bg-pink-primary hover:bg-pink-light text-white px-8 py-4">
      Start Browsing
    </button>
    
    {/* Navy accent for secondary action */}
    <button className="bg-navy-primary hover:bg-navy-light text-white px-8 py-4 ml-4">
      Sell Your Car
    </button>
  </div>
</section>
```

---

## 🚫 Colors to AVOID

### ❌ Don't Use These (They clash with pink)
```
Bright Green (#00FF00)     // Too neon, fights for attention
Light Red (#FF6B6B)        // Too similar to pink
Bright Orange (#FF6600)    // Clashes with pink
Light Pink (#FFB6C1)       // Weakens the accent
Purple (#9C27B0)           // Awkward with pink
```

---

## 🎨 Chart Colors (Analytics)

Our charts use a balanced palette:
```tsx
--chart-1: Pink (#FF1744)        // Primary data
--chart-2: Navy (#1A237E)        // Secondary data
--chart-3: Gold (#FFB300)        // Highlights
--chart-4: Charcoal (#2C2C2C)    // Neutral data
--chart-5: Grey (#757575)        // Background data
```

---

## 📱 Responsive & Accessibility

### Text Contrast Ratios (WCAG AA)
✅ **Charcoal on White**: 12.6:1 (Excellent)
✅ **Pink on White**: 4.5:1 (Good for large text)
✅ **White on Pink**: 4.5:1 (Good for buttons)
✅ **White on Navy**: 13.5:1 (Excellent)

### Color Blindness Considerations
- Pink + Navy = Distinguishable
- Gold + Pink = High contrast
- Use text labels, not just color coding

---

## 🎯 Quick Reference Table

| Element Type | Primary Color | Hover/Active | Text Color |
|--------------|---------------|--------------|------------|
| **Buttons (Primary)** | `bg-pink-primary` | `bg-pink-light` | White |
| **Buttons (Secondary)** | `bg-navy-primary` | `bg-navy-light` | White |
| **Headings** | - | - | `text-secondary-charcoal` |
| **Body Text** | - | - | `text-secondary-darkGrey` |
| **Muted Text** | - | - | `text-secondary-mediumGrey` |
| **Prices** | - | - | `text-pink-primary` |
| **Badges (Sale)** | `bg-gold-primary` | - | `text-secondary-charcoal` |
| **Badges (New)** | `bg-pink-primary` | - | White |
| **Borders** | `border-secondary-lightGrey` | `border-pink-primary` | - |
| **Backgrounds** | `bg-main-white` or `bg-main-lightGrey` | - | - |
| **Cards** | `bg-main-white` with `border-secondary-lightGrey` | - | - |

---

## 🛠️ Migration Tips

### Replacing Old Colors

**Old orange colors → New system:**
```tsx
// Before
<div className="bg-orange-primary">

// After (for CTAs)
<div className="bg-pink-primary">

// After (for main background)
<div className="bg-main-white">
```

**Old main.primary/secondary → New system:**
```tsx
// Before
<h1 className="text-main-primary">

// After
<h1 className="text-secondary-charcoal">
```

---

## ✨ Pro Tips

1. **Reserve pink for interactions** - Buttons, prices, badges
2. **Use white/grey for calm** - Backgrounds, cards, sections
3. **Charcoal for authority** - Headlines, important text
4. **Gold sparingly** - Only for special highlights (SALE, FEATURED)
5. **Navy for trust** - Premium features, seller badges
6. **Medium grey for hierarchy** - Descriptions, captions, metadata

---

## 🎨 Example Components

### Primary Button
```tsx
<button className="bg-pink-primary hover:bg-pink-light active:bg-pink-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Add to Cart
</button>
```

### Sale Badge
```tsx
<span className="bg-gold-primary text-secondary-charcoal font-bold text-xs px-3 py-1 rounded-full">
  SALE 20% OFF
</span>
```

### Product Price
```tsx
<p className="text-3xl font-bold text-pink-primary">
  R 899,000
</p>
```

### Card Container
```tsx
<div className="bg-main-white border border-secondary-lightGrey rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

---

## 📊 Color Distribution Checklist

Before shipping a page, verify:
- [ ] ~60% of visual space is white/light grey
- [ ] ~30% is charcoal/dark grey (text, cards)
- [ ] ~10% or less is pink (CTAs, prices, highlights)
- [ ] Gold only on 2-3 elements max
- [ ] Navy only for secondary actions or trust elements
- [ ] No clashing colors (green, orange, purple)

---

**Last Updated**: November 21, 2025
**Color System Version**: 2.0 (60-30-10 Rule)
