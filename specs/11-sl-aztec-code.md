# Spec: SL Aztec Code Library

## Goal
A standalone package for generating, decoding, and verifying SL Aztec barcodes used in mobile tickets.

## Structure
```
packages/sl-aztec-code/
├── src/
│   ├── index.ts           # Public API exports
│   ├── generator.ts       # Generate Aztec codes
│   ├── decoder.ts         # Decode Aztec images
│   ├── verifier.ts        # Verify ticket authenticity
│   ├── signatures.ts      # Signature handling
│   ├── cbor.ts            # CBOR encoding/decoding
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Helper functions
│   ├── cli.ts             # CLI tool
│   └── __tests__/
│       ├── generator.test.ts
│       └── fixtures.ts
├── scripts/
│   ├── analyze-refs.ts
│   ├── extract-references.ts
│   └── test-barcode.ts
├── test-data/             # Sample Aztec images
├── mts1.md                # MTS1 specification docs
├── package.json
└── vitest.config.ts
```

## Features
- **Generate**: Create valid SL Aztec barcodes
- **Decode**: Parse Aztec images to extract ticket data
- **Verify**: Validate ticket signatures and authenticity
- **CLI**: Command-line tool for testing/debugging

## Acceptance Criteria
- [ ] Generate valid Aztec codes matching SL format
- [ ] Decode Aztec images from camera/screenshots
- [ ] Verify ticket signatures
- [ ] CBOR encoding/decoding for ticket data
- [ ] CLI tool for manual testing
- [ ] Tests pass with sample fixtures
- [ ] Exported as standalone package for use in mobile app

## Dependencies
- Aztec barcode library (encoding/decoding)
- CBOR library
- vitest (testing)

## Usage in App

### React Native MTB Generator
```typescript
// src/lib/mtbGenerator.ts
import { createHmac } from "react-native-quick-crypto";
import type { CryptoProvider } from "sl-aztec-code/src/generator";
import { generateDeviceSignedMTB } from "sl-aztec-code/src/generator";
import type { GeneratorConfig } from "sl-aztec-code/src/types";
import { zlibCompress } from "sl-aztec-code/src/utils";

const reactNativeCryptoProvider: CryptoProvider = {
  createHmac(algorithm: string, key: Uint8Array) {
    const hmac = createHmac(algorithm, Buffer.from(key));
    return {
      update(data: Uint8Array) {
        hmac.update(Buffer.from(data));
      },
      digest() {
        return new Uint8Array(hmac.digest());
      },
    };
  },
};

export function generateMTBForReactNative(
  config: GeneratorConfig,
  timestamp?: Date,
): Uint8Array {
  return generateDeviceSignedMTB({
    config,
    timestamp,
    crypto: reactNativeCryptoProvider,
    compression: {
      deflate: (data: Uint8Array) => zlibCompress(data),
    },
  });
}
```

### AztecBarcode Component
```tsx
// src/components/AztecBarcode.tsx
import bwipjs, { type DataURL } from "@bwip-js/react-native";
import { useQuery } from "@tanstack/react-query";
import { Image, PixelRatio, useWindowDimensions, View } from "react-native";
import type { GeneratorConfig } from "sl-aztec-code/src/types";
import { generateMTBForReactNative } from "../lib/mtbGenerator";

interface AztecBarcodeProps {
  barcolor: "FFFFFF" | "000000";
  config: GeneratorConfig;
}

export const AztecBarcode = ({ config, barcolor }: AztecBarcodeProps) => {
  const { data: source, isLoading, error } = useQuery({
    queryKey: ["aztecBarcode", config.mtb],
    queryFn: async (): Promise<DataURL> => {
      const compressed = generateMTBForReactNative(config, new Date());

      return bwipjs.toDataURL({
        bcid: "azteccode",
        text: String.fromCharCode(...compressed),
        scale: PixelRatio.get(),
        binarytext: true,
        barcolor,
      });
    },
    refetchInterval: 5000, // Regenerate every 5 seconds (rolling code)
  });

  // ... render Image with source.uri
};
```

### Decoding & Verification
```typescript
import { decode, verify } from "@sl-journey/sl-aztec-code";

// Decode scanned barcode
const ticket = await decode(imageData);

// Verify authenticity
const isValid = await verify(ticket);
```

## Dependencies
- @bwip-js/react-native (Aztec rendering)
- react-native-quick-crypto (HMAC for device signing)
- CBOR library
- vitest (testing)

## Notes
- Based on MTS1 (Mobile Ticket Standard) specification
- Used by shared tickets feature (spec 12)
- Should work offline for verification
- Rolling codes regenerate every 5 seconds using device key + timestamp
