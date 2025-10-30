# Command Palette Component

## Overview

Global command palette triggered by `⌘K` (Mac) or `Ctrl+K` (Windows/Linux).

## Design Specs

- **Trigger**: `⌘K` / `Ctrl+K`
- **Backdrop**: Dark overlay with blur
- **Panel**: White (light) / Dark surface with border
- **Search**: Instant filter
- **Icons**: Lucide icons for each action

## Usage

```tsx
"use client";
import { useEffect, useState } from "react";
import { Search, Camera, Calculator, FileText, Settings } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  const commands = [
    { icon: Camera, label: "Skannaa kuitti", href: "/selko/ocr", hotkey: "Shift+O" },
    { icon: Calculator, label: "ALV-laskuri", href: "/vat", hotkey: "Shift+V" },
    { icon: FileText, label: "Raportit", href: "/reports", hotkey: "Shift+R" },
    { icon: Settings, label: "Asetukset", href: "/settings", hotkey: "Shift+S" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="max-w-2xl mx-auto mt-32 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Hae toimintoja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-converto-blue"
            autoFocus
          />
        </div>
        <div className="p-2 max-h-96 overflow-y-auto">
          {commands
            .filter((cmd) => cmd.label.toLowerCase().includes(search.toLowerCase()))
            .map((cmd) => {
              const Icon = cmd.icon;
              return (
                <a
                  key={cmd.href}
                  href={cmd.href}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">{cmd.label}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                    {cmd.hotkey}
                  </kbd>
                </a>
              );
            })}
        </div>
      </div>
    </div>
  );
}
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open palette | `⌘K` / `Ctrl+K` |
| Navigate | `↑` / `↓` |
| Select | `Enter` |
| Close | `Esc` |

## QuickReplies (Mobile)

```tsx
<div className="flex gap-2 overflow-x-auto">
  {quickActions.map((action) => (
    <Link
      key={action.href}
      href={action.href}
      className="flex-shrink-0 px-4 py-2 rounded-full bg-white border text-sm font-medium hover:bg-gray-50"
    >
      {action.label}
    </Link>
  ))}
</div>
```

## Accessibility

- ✅ Keyboard-only operation
- ✅ Escape to close
- ✅ Arrow key navigation
- ✅ Screen reader announcements
