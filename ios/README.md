# TripSpanishTutor — iOS (SwiftUI)

Native SwiftUI client. Talks to the existing Express API in `../server/` over HTTPS.
This directory is the **fourth peer** alongside `client/`, `server/`, `shared/`, and `db/`.

## What's here

```
ios/
└── App/
    ├── App.xcodeproj/             # Xcode project (generate via `npm run ios:project`)
    ├── App/
    │   ├── TripSpanishTutorApp.swift
    │   ├── ContentView.swift
    │   ├── Info.plist
    │   ├── Features/
    │   │   ├── Chat/              # Augmented chat card + conversation view
    │   │   ├── Trails/            # Trail list, trail detail, stop player
    │   │   └── Drills/            # Unevaluative drill UI
    │   ├── Core/
    │   │   ├── Networking/        # SwarmClient — typed Swift mirror of server/swarm/contracts.ts
    │   │   └── Storage/           # LocalStore — GRDB actor, offline cache
    │   └── Generated/
    │       └── Schema.swift       # Codegen target — DO NOT edit by hand
    └── Tests/
```

## Setup (when you're at a Mac)

```bash
# 1. From repo root, generate Swift structs from Drizzle schema.
npm run codegen:swift

# 2. Open in Xcode.
open ios/App/App.xcodeproj

# 3. Pick the iPhone 16 Pro simulator. Cmd+R.
```

The app talks to your local Express API by default (`http://localhost:5000`). To point at
the Replit-hosted API, edit `Core/Networking/SwarmClient.swift` (`baseURL`).

## The codegen contract

`scripts/codegen-swift.ts` reads `shared/tutor-schema.ts` and emits
`ios/App/App/Generated/Schema.swift`. CI re-runs codegen on every PR; if the emitted Swift
differs from what's committed, the build fails. This catches schema drift between
TypeScript and Swift before it ships.

**Rule:** never edit `Generated/Schema.swift` by hand. Change the Drizzle schema, re-run
codegen, commit both.

## Offline mode

See `Core/Storage/LocalStore.swift`. The trail is the cache: when a learner starts a trail,
the client streams the full content bundle from the API and persists it to a local SQLite
database via GRDB. After that, drills, conjugator lookups, and pre-baked chat surfaces all
work with no network. Free-form chat queues for later swarm validation when network returns.

## Status

This PR scaffolds the project structure, the `ChatTurnCard` from the project plan PDF,
the codegen pipeline, and stub `SwarmClient` + `LocalStore` types. Wiring to a live API
and rendering an actual conversation comes in PR #3.
