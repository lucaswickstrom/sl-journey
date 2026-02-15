# Spec: Design System

## Goal
A standalone design system package with color tokens, Tailwind config, and reusable UI components.

## Structure
```
packages/ui/
├── src/
│   ├── index.ts              # Re-exports all
│   ├── colors.ts             # Color tokens
│   ├── types.ts              # Shared types (TransportMode, etc.)
│   ├── tailwind-preset.ts    # Tailwind preset config
│   └── components/
│       ├── index.ts
│       ├── VStack.tsx
│       ├── HStack.tsx
│       ├── Card.tsx
│       ├── List.tsx
│       ├── ListItem.tsx
│       ├── ListItemLabel.tsx
│       ├── ListItemValue.tsx
│       ├── Button.tsx
│       ├── ButtonText.tsx
│       └── Divider.tsx
├── package.json
└── tsconfig.json
```

## Usage in App
```typescript
// Import components
import { VStack, Card, Button } from "@sl-journey/ui";

// Use Tailwind preset in tailwind.config.js
const { preset } = require("@sl-journey/ui/tailwind-preset");
module.exports = {
  presets: [preset],
  // ...
};
```

## Color Palette

### Radix Gray Dark Scale
```
gray-1:  #111111  (App background)
gray-2:  #191919  (Subtle background)
gray-3:  #222222  (UI element background)
gray-4:  #2a2a2a  (Hovered UI element)
gray-5:  #313131  (Active/selected UI element)
gray-6:  #3a3a3a  (Subtle borders, separators)
gray-7:  #484848  (UI element border, focus rings)
gray-8:  #606060  (Hovered borders)
gray-9:  #6e6e6e  (Solid backgrounds)
gray-10: #7b7b7b  (Hovered solid backgrounds)
gray-11: #b4b4b4  (Low-contrast text)
gray-12: #eeeeee  (High-contrast text)
```

### Radix Gray Dark Alpha Scale
```
gray-a1:  rgba(0,0,0,0)
gray-a2:  rgba(255,255,255,0.034)
gray-a3:  rgba(255,255,255,0.071)
gray-a4:  rgba(255,255,255,0.105)
gray-a5:  rgba(255,255,255,0.134)
gray-a6:  rgba(255,255,255,0.172)
gray-a7:  rgba(255,255,255,0.231)
gray-a8:  rgba(255,255,255,0.332)
gray-a9:  rgba(255,255,255,0.391)
gray-a10: rgba(255,255,255,0.445)
gray-a11: rgba(255,255,255,0.685)
gray-a12: rgba(255,255,255,0.929)
```

### SL Transport Colors
```
Metro:
  blue:   #0077C8  (T10, T11 - Kungsträdgården/Hjulsta/Akalla)
  red:    #E4002B  (T13, T14 - Norsborg/Fruängen/Mörby)
  green:  #009E49  (T17, T18, T19 - Skarpnäck/Farsta/Hagsätra)

Commuter Rail (Pendeltåg):
  pink:   #EC619F  (J-lines)

Light Rail (Tvärbanan/Spårväg):
  orange: #ED8B00  (L-lines)

Bus:
  red:    #E4002B  (Regular buses)
  blue:   #0077C8  (Trunk lines / Blåbuss)

Ferry:
  cyan:   #00A3E0  (Boat lines)
```

## Semantic Usage

| Purpose | Color |
|---------|-------|
| App background | gray-1 |
| Card background | gray-a4 |
| Card border | gray-a6 |
| Divider/separator | gray-a6 |
| Interactive element | gray-3 |
| Hover state | gray-4 |
| Active/pressed | gray-5 |
| Focus ring | gray-7 |
| Secondary text | gray-11 |
| Primary text | gray-12 |

## Component Patterns

### Cards
```typescript
{
  backgroundColor: grayA4,
  borderColor: grayA6,
  borderWidth: StyleSheet.hairlineWidth,
  borderRadius: 12,
}
```

### Dividers/Separators
```typescript
{
  backgroundColor: grayA6,
  height: StyleSheet.hairlineWidth,
}
```

### Borders
- Always use `StyleSheet.hairlineWidth` for border width
- Use `gray-a6` for border color (alpha for better layering)

### Buttons
Use `pressto` for all buttons (better press feedback than Pressable).

```typescript
import { PressableScale } from "pressto";

<PressableScale
  style={{
    backgroundColor: grayA4,
    borderColor: grayA6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }}
  onPress={handlePress}
>
  <Text style={{ color: gray12 }}>Button</Text>
</PressableScale>
```

## Common Components

Components exported from `@sl-journey/ui`:

### Layout Components

```tsx
// VStack - Vertical stack
<VStack className="gap-3">
  <Child />
  <Child />
</VStack>

// HStack - Horizontal stack
<HStack className="gap-2 items-center">
  <Child />
  <Child />
</HStack>
```

### Card

```tsx
<Card>
  <Text>Card content</Text>
</Card>

// Card uses: bg-gray-a4, border-gray-a6, hairlineWidth, rounded-xl
```

### List Components

```tsx
<List>
  <ListItem onPress={handlePress}>
    <ListItemLabel>Label</ListItemLabel>
    <ListItemValue>Value</ListItemValue>
  </ListItem>
  <ListItem>
    <ListItemLabel>Another item</ListItemLabel>
  </ListItem>
</List>

// List: Card styling with dividers between items
// ListItem: Row with px-4 py-3, pressable only when onPress provided
// ListItemLabel: text-gray-12 (primary)
// ListItemValue: text-gray-11 (secondary)
```

### Button Components

```tsx
// Button with text child (auto-wraps in ButtonText)
<Button onPress={handlePress}>
  Submit
</Button>

// Button with explicit ButtonText
<Button onPress={handlePress}>
  <ButtonText>Submit</ButtonText>
</Button>

// Button uses: PressableScale, bg-gray-a4, border-gray-a6, rounded-xl, px-4 py-3
// ButtonText uses: text-gray-12, text-center
```

## Tailwind Preset

The package exports a Tailwind preset with all colors:

```js
// packages/ui/src/tailwind-preset.ts
export const preset = {
  theme: {
    extend: {
      colors: {
        gray: {
          1: '#111111',
          2: '#191919',
          3: '#222222',
          4: '#2a2a2a',
          5: '#313131',
          6: '#3a3a3a',
          7: '#484848',
          8: '#606060',
          9: '#6e6e6e',
          10: '#7b7b7b',
          11: '#b4b4b4',
          12: '#eeeeee',
          // Alpha scale (for overlays, borders, backgrounds)
          a1: 'rgba(0,0,0,0)',
          a2: 'rgba(255,255,255,0.034)',
          a3: 'rgba(255,255,255,0.071)',
          a4: 'rgba(255,255,255,0.105)',
          a5: 'rgba(255,255,255,0.134)',
          a6: 'rgba(255,255,255,0.172)',
          a7: 'rgba(255,255,255,0.231)',
          a8: 'rgba(255,255,255,0.332)',
          a9: 'rgba(255,255,255,0.391)',
          a10: 'rgba(255,255,255,0.445)',
          a11: 'rgba(255,255,255,0.685)',
          a12: 'rgba(255,255,255,0.929)',
        },
        sl: {
          'metro-blue': '#0077C8',
          'metro-red': '#E4002B',
          'metro-green': '#009E49',
          'commuter': '#EC619F',
          'tram': '#ED8B00',
          'bus': '#E4002B',
          'bus-trunk': '#0077C8',
          'ferry': '#00A3E0',
        },
      },
    },
  },
}
```

## Acceptance Criteria
- [x] Package created at `packages/ui`
- [x] Color tokens exported from `@sl-journey/ui`
- [x] Tailwind preset exported with Radix gray + SL colors
- [x] All UI components exported (VStack, HStack, Card, List, Button, etc.)
- [x] App imports and uses the package
- [x] Dark-only design (no light mode)

## Shared Types

Export shared TypeScript types from `@sl-journey/ui`:

```typescript
// packages/ui/src/types.ts
export type TransportMode = 'metro' | 'bus' | 'train' | 'tram' | 'ferry';

export function getTransportColor(mode: TransportMode, lineNumber?: string): string {
  switch (mode) {
    case 'metro':
      // Blue line: T10, T11
      if (lineNumber === '10' || lineNumber === '11') return '#0077C8';
      // Red line: T13, T14
      if (lineNumber === '13' || lineNumber === '14') return '#E4002B';
      // Green line: T17, T18, T19
      return '#009E49';
    case 'train':
      return '#EC619F'; // Commuter rail
    case 'tram':
      return '#ED8B00';
    case 'bus':
      // Trunk lines (Blåbuss): 1, 2, 3, 4, 6, 172, 173, 176, 177, 178, 179
      const trunkLines = ['1', '2', '3', '4', '6', '172', '173', '176', '177', '178', '179'];
      if (lineNumber && trunkLines.includes(lineNumber)) return '#0077C8';
      return '#E4002B';
    case 'ferry':
      return '#00A3E0';
    default:
      return '#6e6e6e';
  }
}
```

## Notes
- Using dark-only design for transit app (better for outdoor/low-light viewing)
- Radix scales designed for accessibility and consistent contrast
- Alpha scale useful for overlays, disabled states, and layering
