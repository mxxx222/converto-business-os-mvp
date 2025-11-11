# 🧪 Frontend UI Test Guide

## How to Test New UI Components

### 1. Start the Frontend

```bash
cd frontend
npm install  # If not done yet
npm run dev
```

Open: http://localhost:3000/dashboard

---

## 2. What You Should See

### **Dashboard Header (Top Right)**

You should see these chips:

1. **🇫🇮 Local Intelligence 🔒** (if using Ollama)
   - Green badge
   - Appears when AI_PROVIDER=ollama and VISION_PROVIDER=ollama

2. **🤖 openai** or **🦙 ollama** (AI Provider)
   - Shows current AI provider
   - Shows latency (e.g., "234ms")
   - Hover for cost info

3. **🔍 openai** or **🔍 ollama** (Vision Provider)
   - Shows current vision provider
   - Hover for model info

### **Quick Actions Bar**

Horizontal scrollable buttons:
- 📸 Kuitti
- 🧾 ALV
- 💾 Backup
- ⚙️ Asetukset

Click any to navigate!

### **Command Palette**

Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux)

You should see:
- Search box at top
- Commands grouped by category
- Keyboard navigation (↑↓)
- Enter to execute

Try searching: "kuitti", "alv", "backup"

---

## 3. Test Each Component

### Test 1: Status Chips

**Check:**
- [ ] Provider chips visible in dashboard header
- [ ] Local Intelligence badge shows (if using Ollama)
- [ ] Latency updates every 5 seconds
- [ ] Hover shows tooltips with cost info

**Expected:**
```
[🇫🇮 Local Intelligence 🔒] [🤖 ollama 234ms] [🔍 ollama]
```

### Test 2: Command Palette

**Steps:**
1. Press **⌘K** (or Ctrl+K)
2. Palette opens with search box
3. Type "kuitti"
4. Press Enter or click
5. Should navigate to /selko/ocr

**Check:**
- [ ] Opens with ⌘K
- [ ] Closes with ESC
- [ ] Search filters commands
- [ ] Arrow keys navigate
- [ ] Enter executes command
- [ ] Clicking backdrop closes

### Test 3: Quick Replies

**Check:**
- [ ] Buttons visible below header
- [ ] Horizontal scroll on mobile
- [ ] Click navigates to correct page
- [ ] Hover effect works
- [ ] Icons + labels visible

### Test 4: Empty States

**Navigate to pages with no data:**

1. **/selko/ocr** (if no receipts)
   - Should see: "Ei vielä kuitteja"
   - "Skannaa kuitti" button
   - "Lataa demo-data" button

2. **/chat** (if empty)
   - Should see: "Aloita keskustelu"
   - 4 example prompts

3. **/dashboard** (first time)
   - Should see: 3-step onboarding
   - "Aloita nyt 🚀" button

---

## 4. Browser Console Test

Open DevTools Console (F12):

```javascript
// Check if providers are loaded
fetch('/api/v1/ai/whoami').then(r => r.json()).then(console.log)
fetch('/api/v1/vision/whoami').then(r => r.json()).then(console.log)

// Should show:
// { default_provider: "openai" or "ollama", providers: {...} }
```

---

## 5. Mobile Test

**Open DevTools → Toggle device toolbar (Ctrl+Shift+M)**

Set to: iPhone 14 Pro

**Check:**
- [ ] Quick Replies scroll horizontally
- [ ] Status chips stack vertically
- [ ] Command Palette is responsive
- [ ] Touch tap works (not just hover)
- [ ] Labels hide on small screens (icons only)

---

## 6. Keyboard Navigation Test

**Tab through elements:**
1. Tab key should highlight each interactive element
2. Focus rings visible (blue outline)
3. Enter key activates buttons
4. Space key for checkboxes

**Command Palette shortcuts:**
- **⌘K** - Open
- **↑↓** - Navigate
- **Enter** - Execute
- **ESC** - Close

---

## 7. Dark Mode / Contrast Test

**Open DevTools → Rendering → Emulate vision deficiencies**

Test:
- [ ] Protanopia (red-blind)
- [ ] Deuteranopia (green-blind)
- [ ] Tritanopia (blue-blind)

All chips should still be distinguishable by shape/icon, not just color!

---

## 8. Screenshot Test

Take screenshots and verify:

### Dashboard Header
![Expected](docs/screenshots/dashboard-header.png)
- Status chips visible
- Properly aligned
- No overflow

### Command Palette
![Expected](docs/screenshots/command-palette.png)
- Centered on screen
- Search box focused
- Categories visible

### Quick Replies
![Expected](docs/screenshots/quick-replies.png)
- Horizontal layout
- Scrollable on mobile
- All icons visible

---

## 9. Performance Test

**Open DevTools → Performance → Record**

Interact with UI for 10 seconds, then stop.

**Check:**
- [ ] No long tasks (>50ms)
- [ ] Smooth 60fps animations
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast TTI (Time to Interactive < 2s)

---

## 10. Network Test

**Open DevTools → Network → Throttle to "Slow 3G"**

**Check:**
- [ ] Skeleton loaders show while loading
- [ ] UI doesn't freeze
- [ ] Optimistic updates work
- [ ] Error states handled gracefully

---

## Troubleshooting

### Status chips not showing?

1. Check API is running:
   ```bash
   curl http://localhost:8000/api/v1/ai/whoami
   ```

2. Check .env configuration:
   ```bash
   cat .env | grep PROVIDER
   ```

3. Check browser console for errors (F12)

### Command Palette not opening?

1. Check layout.tsx has `<CommandPalette />`
2. Try clicking instead: Add a button with `<CommandPalette />` trigger
3. Check browser console for errors

### Styling looks broken?

1. Check Tailwind is compiled:
   ```bash
   npm run dev  # Should auto-compile
   ```

2. Check globals.css is imported in layout.tsx

3. Clear .next cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## Expected Final Look

### Desktop View:
```
┌─────────────────────────────────────────────────────┐
│ Dashboard    [🇫🇮 Local] [🤖 ollama] [🔍 ollama]    │
│                                                     │
│ [📸 Kuitti] [🧾 ALV] [💾 Backup] [⚙️ Asetukset]   │
│                                                     │
│ ┌──────────────┐  ┌──────────────┐                │
│ │ Impact Card  │  │ Health Card  │                │
│ └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

### Press ⌘K:
```
┌─────────────────────────────────────┐
│ 🔍 Hae komentoa...            [ESC] │
├─────────────────────────────────────┤
│ Toiminnot                           │
│ > 📸 Uusi kuitti                    │
│   🧾 ALV-raportti                   │
│   💾 Varmuuskopio                   │
├─────────────────────────────────────┤
│ [↑↓] Navigoi  [↵] Valitse  [ESC]   │
└─────────────────────────────────────┘
```

---

## Success Criteria

✅ All chips visible in dashboard header
✅ Command Palette opens with ⌘K
✅ Quick Replies navigate correctly
✅ Empty states show helpful messages
✅ Mobile responsive (no horizontal scroll)
✅ Keyboard navigation works
✅ Focus rings visible
✅ No console errors
✅ Animations smooth (60fps)
✅ Works on Chrome, Firefox, Safari

---

## Next Steps After Testing

1. Take screenshots of each component
2. Test on real mobile device
3. Share with beta testers
4. Gather feedback
5. Iterate on UX improvements

---

**Questions? Check:**
- Component code: `frontend/components/`
- Styles: `frontend/lib/ui.ts`
- Translations: `frontend/lib/i18n.ts`
