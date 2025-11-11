# 🎨 Converto™ Brand Assets Guide

## Logo Specifications

### Primary Logo (Instagram Profile)

**Dimensions:** 320x320px (minimum)
**Recommended:** 1024x1024px (high-res)
**Format:** PNG with transparency
**Background:** Black (#0f2027)
**Icon:** Neon Green "C" (#39FF14)

**Design Elements:**
```
- Rounded corners (20% border-radius)
- Subtle glow effect on "C"
- Minimalist, modern
- Scalable (works at 40x40px)
```

### Logo Variations

**Primary:**
- Black BG + Neon C (Instagram, dark themes)

**Secondary:**
- White BG + Dark C (light themes, documents)

**Monochrome:**
- All black (print, formal documents)

**Icon Only:**
- Just the "C" (favicons, small spaces)

---

## Color Palette

### Primary Colors

```css
/* Neon Green - Primary Brand */
--neon-green: #39FF14;
--neon-green-glow: rgba(57, 255, 20, 0.5);

/* Dark Background */
--bg-dark: #0f2027;
--bg-darker: #050a0d;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
--gradient-accent: linear-gradient(135deg, #39FF14 0%, #22D3EE 100%);
```

### Secondary Colors

```css
/* Purple Accent */
--purple-500: #A855F7;
--purple-600: #9333EA;

/* Blue Accent */
--blue-500: #3B82F6;
--blue-600: #2563EB;

/* Cyan Accent */
--cyan-400: #22D3EE;
--cyan-500: #06B6D4;
```

### Neutral Colors

```css
/* Grays */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-600: #4B5563;
--gray-900: #111827;
```

---

## Typography

### Font Stack

**Headlines:**
```
font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
font-weight: 700;
```

**Body:**
```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 400;
```

**Monospace (code):**
```
font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
```

### Type Scale

```
3XL (Hero):    48px / 60px line-height
2XL (Title):   36px / 44px
XL (Heading):  24px / 32px
LG (Subhead):  20px / 28px
BASE (Body):   16px / 24px
SM (Caption):  14px / 20px
XS (Meta):     12px / 16px
```

---

## Instagram-Specific Specs

### Post Sizes

**Square Post:**
- Size: 1080x1080px
- Aspect: 1:1
- Format: JPG (quality 90%)

**Portrait Post:**
- Size: 1080x1350px
- Aspect: 4:5
- Format: JPG

**Landscape Post:**
- Size: 1080x566px
- Aspect: 1.91:1
- Format: JPG

### Story/Reel Sizes

**Story:**
- Size: 1080x1920px
- Aspect: 9:16
- Format: JPG/PNG

**Reel:**
- Size: 1080x1920px
- Aspect: 9:16
- Format: MP4 (H.264)
- Max length: 90s
- FPS: 30

### Carousel

**Slides:**
- Size: 1080x1080px each
- Max slides: 10
- Format: JPG

---

## Visual Guidelines

### Do's ✅

- Use neon green (#39FF14) sparingly for emphasis
- Dark backgrounds for contrast
- Clean, minimalist layouts
- Plenty of white space
- High-contrast text (WCAG AA)
- Consistent icon style (outline, 2px stroke)

### Don'ts ❌

- Don't use busy patterns
- Don't use more than 3 colors per post
- Don't use low-contrast text
- Don't clutter the composition
- Don't use Comic Sans 😅

---

## Post Template Structure

### Standard Post Layout

```
┌─────────────────────────┐
│                         │ (Top 20%: Breathing room)
│    [Icon/Emoji]         │
│                         │
│    MAIN MESSAGE         │ (Center 60%: Content)
│    Supporting text      │
│                         │
│    → CTA                │ (Bottom 20%: Action)
└─────────────────────────┘
```

### Reel Layout

```
┌─────────────────────────┐ (Safe zone: center 1080x1350)
│  [Skip ahead]           │ Top 200px (UI clearance)
│                         │
│                         │
│    Visual Content       │ Main area
│    (Demo/Animation)     │
│                         │
│                         │
│  [Text Overlay]         │ Bottom 300px
│  @converto.fi           │ Branding
└─────────────────────────┘
```

---

## Content Style Guide

### Voice & Tone

**Voice:** Professional but approachable
**Tone:** Confident, helpful, Finnish-proud

**Example:**
```
❌ "Our cutting-edge AI-powered solution..."
✅ "Tekoäly joka ymmärtää suomalaista liiketoimintaa."

❌ "Leverage our platform for optimal ROI..."
✅ "Säästä aikaa ja rahaa – automaattisesti."
```

### Writing Style

- **Short sentences** (max 15 words)
- **Active voice** ("Automaatio hoitaa" not "Hoidetaan automaatiolla")
- **Benefit-focused** ("Säästät 10h/kk" not "Meillä on nopea AI")
- **Finnish-first** (English terms only if no good translation)

### Emoji Usage

**Approved emojis:**
```
🇫🇮 Finland
🚀 Launch/Speed
🔒 Security
💰 Money/Savings
⚡ Speed/Power
✨ Magic/Quality
🎮 Gamification
📊 Analytics
🤖 AI
```

**Use sparingly:** Max 3 emojis per post

---

## Photography Style

### Product Screenshots

- **Background:** Gradient (dark to darker)
- **Device:** MacBook/iPhone mockup
- **Angle:** Slightly tilted (5-10°)
- **Shadow:** Soft drop shadow
- **Padding:** 10% around device

### Behind-the-Scenes

- **Lighting:** Natural, bright
- **Composition:** Rule of thirds
- **Color grading:** Slightly cooled (blue tint)
- **People:** Candid, not posed

### Icons & Graphics

- **Style:** Outline, 2px stroke
- **Colors:** Monochrome or single accent
- **Size:** 64x64px minimum
- **Padding:** 15% internal padding

---

## Animation Guidelines

### Micro-interactions

**Duration:** 200-300ms
**Easing:** ease-out
**Effects:**
- Hover: scale(1.02)
- Active: scale(0.98)
- Fade in: opacity 0→1

### Reels Transitions

**Style:** Clean cuts, minimal effects
**Duration:** 0.5-1s per scene
**Music:** Minimal, ambient (avoid vocals)

---

## File Naming Convention

```
Format: [type]_[platform]_[date]_[title].ext

Examples:
- logo_instagram_profile.png
- post_ig_20250113_launch.jpg
- reel_ig_20250115_ocr-demo.mp4
- story_ig_20250117_beta-cta.jpg
- carousel_ig_20250119_5-reasons.zip
```

---

## Asset Library Structure

```
marketing/
├── assets/
│   ├── logos/
│   │   ├── converto-logo-primary.png
│   │   ├── converto-logo-secondary.png
│   │   ├── converto-icon.png
│   │   └── converto-icon.svg
│   ├── instagram/
│   │   ├── profile/
│   │   ├── posts/
│   │   ├── reels/
│   │   ├── stories/
│   │   └── highlights/
│   └── templates/
│       ├── post-template.fig
│       ├── reel-template.fig
│       └── story-template.fig
└── brand-guidelines.pdf
```

---

## Quick Reference

### Instagram Post Checklist

- [ ] Size: 1080x1080px
- [ ] Brand colors used
- [ ] Readable text (min 24px)
- [ ] CTA included
- [ ] Hashtags prepared
- [ ] Caption written
- [ ] Alt text added
- [ ] Scheduled time set

### Reel Checklist

- [ ] Size: 1080x1920px
- [ ] Safe zone respected
- [ ] Captions/text overlays
- [ ] Brand watermark
- [ ] Audio included
- [ ] Length: 15-30s
- [ ] First 3s engaging
- [ ] CTA in caption

---

## Tools & Resources

**Design:**
- Figma (templates): [link.converto.fi/figma]
- Canva (quick edits): [canva.com]
- Adobe Express (mobile)

**Stock Resources:**
- Unsplash (photos)
- Undraw (illustrations)
- Lucide (icons)
- Google Fonts (typography)

**Mockups:**
- Shots.so (device mockups)
- Mockuuups (scene creator)
- Cleanmock (simple mockups)

---

## Support

**Questions about brand assets?**
Email: brand@converto.fi

**Need custom designs?**
Contact: design@converto.fi

**License & Usage:**
All Converto™ brand assets are proprietary.
Usage requires written permission.
