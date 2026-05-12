// scripts/codegen-swift.ts
//
// Reads shared/tutor-schema.ts and emits ios/App/App/Generated/Schema.swift.
// Run via: `npm run codegen:swift`
//
// v0 (this PR): scaffolds the runner; emits a header-only stub. The full Drizzle
// → Swift codegen lands in PR #3 once the schema stabilizes after migration.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve(import.meta.dirname, "../ios/App/App/Generated/Schema.swift");

const banner = `// Generated/Schema.swift
//
// AUTO-GENERATED — DO NOT EDIT BY HAND.
// Source of truth: ../../../../shared/tutor-schema.ts
// Regenerate via: \`npm run codegen:swift\` from repo root.
//
// CI runs the generator on every PR and fails if this file differs from
// what's committed — that's the schema-drift catch.

import Foundation

// PR #2 scaffold — full Drizzle-to-Swift emission lands in PR #3 after the
// schema migration stabilizes. v0 models live in Core/Models.swift.
`;

writeFileSync(OUT, banner);
console.log(`wrote ${OUT}`);
