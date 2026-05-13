# Vallarta Voz - Travel Spanish Companion

## Overview

Vallarta Voz is a therapeutic Spanish learning companion designed for travelers visiting Puerto Vallarta, Mexico. The application combines language learning with mindfulness practices, drawing from ACT (Acceptance and Commitment Therapy) and DBT (Dialectical Behavior Therapy) frameworks to create a gentle, anxiety-aware learning experience.

The app provides multiple learning modalities including:
- **Dictionary & Conjugation** (primary feature): AI-powered word lookup with full conjugation tables across 5 tenses, examples, related words. Personal dictionary for saving words.
- **Text/URL Import**: Paste text from ebooks, emails, articles or provide a URL. Extracts vocabulary AND grammar patterns (verb tenses used, sentence structures, frequency analysis) with explanations.
- Tense-focused journaling with therapeutic prompts (mixed English/Spanish input, AI teaches corrections)
- Interactive sentence building with verb conjugations
- Real-world situation practice scenarios
- AI-powered translation and grammar feedback
- Conversational AI chatbot for practice
- Context-aware vocabulary organized by interests (art, music, food, travel)
- No audio capability (all text-based)

The design philosophy centers on making Spanish practice feel safe, relevant, and connected to the user's personal interests and values, with particular attention to managing anxiety around language learning and social interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite as the build tool.

**UI Component System**: Shadcn UI (New York style variant) with Radix UI primitives for accessible, customizable components. The design system uses:
- CSS variables for theming with a Puerto Vallarta-inspired color palette (terra cotta, agave blue, marigold, warm sand)
- Tailwind CSS for utility-first styling
- Custom fonts: DM Sans for body text, Outfit for display/headings
- Responsive mobile-first design with bottom navigation on mobile, sidebar on desktop

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. No global state management library is used; component-level state with React hooks suffices for UI state.

**Routing**: Wouter for lightweight client-side routing. Main routes include Home, Learn, Situations, and Journal pages.

**Animation**: Framer Motion for smooth transitions and micro-interactions, enhancing the therapeutic feel of the application.

**Key Components**:
- `ChatWidget`: Floating AI conversational assistant for Spanish practice (bottom-right bubble)
- `TranslatorPanel`: Slide-out translation interface with context presets (journal, travel, arts) and mindful tone toggle for softer alternatives
- `SentenceBuilder`: Interactive verb conjugation and sentence construction tool - helps practice specific tenses with draggable tiles
- `Journal`: Travel journal and itinerary planner with Spanish learning:
  - Write in any mix of English and Spanish you know
  - AI recognizes correct Spanish usage, corrects mistakes, and teaches new words/verbs
  - Tense-guided sections: What I Notice (present), What I Did (pretérito), What I'd Like to Do (conditional), What I Could've Done (conditional perfect), Tomorrow's Plan (future)
  - "Hum meter" for anxiety awareness with mindfulness prompts
  - Interest themes (Books/Film, Jazz/Music, Galleries/Art, Food Tours, Beach/Nature)
  - Links to Sentence Builder for verb practice
- `Layout` + `Navigation`: Persistent navigation wrapper with responsive bottom/side navigation

**Design Rationale**: The component-based architecture allows for modular, reusable UI elements. Shadcn UI was chosen for its accessibility-first approach and easy customization. The mobile-first responsive design ensures the app works well for travelers on-the-go.

### Backend Architecture

**Runtime**: Node.js with Express.js server framework using TypeScript throughout.

**API Design**: RESTful API with the following key endpoints:
- `POST /api/journal/analyze` - Analyzes Spanish text with AI grammar feedback
- `GET /api/journal/entries` - Retrieves journal entries
- `POST /api/chat` - Conversational AI assistant endpoint
- `POST /api/translate` - Translation service with context presets

**Development Server**: Custom Vite integration for HMR (Hot Module Replacement) in development mode, with middleware mode for serving the React app.

**Build Process**: Custom build script using esbuild for server bundling and Vite for client bundling. Server dependencies are selectively bundled to reduce cold start times (reducing openat syscalls).

**Code Organization**:
- `/server` - Express server, routes, AI service integration, storage layer
- `/client` - React frontend application
- `/shared` - Shared TypeScript types and schemas (database schema, validation)
- `/db` - Database client configuration
- `/VallartaVoxVault` - **Canonical content tree.** Mirrors the user's offline Obsidian vault one-to-one (twelve numbered folders: `00_Inbox`, `01_Constitution`, `02_DailyPrep`, `03_DailyDebriefs`, `04_Trails`, `05_WordLens`, `06_Atelier/<Author>`, `07_CreativeWriting`, `08_ProjectPacks`, `09_Grammar`, `10_Flashcards`, `11_Research`, `12_Schemas/Templates`). Perplexity drops research into `11_Research/YYYY-MM-DD/`. The app's day-pack builder reads from there and writes to `08_ProjectPacks/`. Content rules live in `01_Constitution/SPEC.md`; folder map in `01_Constitution/VAULT.md`; learner profile in `01_Constitution/learner-profile.md`. Three modes drive `/learn`: **airport**, **atelier** (Borges/Neruda/Cortázar/Paz/Rulfo + murals/music/film), **bridge**. Two-way sync with the user's offline Obsidian vault runs through the Obsidian Git plugin — see `docs/obsidian-sync.md` for setup; vault contract in `VallartaVoxVault/.obsidian-vault.yml`; health check via `scripts/vault-doctor.sh`.

**Design Rationale**: Express provides a minimal, flexible foundation. TypeScript across the stack ensures type safety. The custom build process optimizes for production deployment while maintaining excellent DX in development.

### Data Storage

**Database**: PostgreSQL (via Neon serverless driver) with Drizzle ORM for type-safe database queries.

**Schema Design**:
- `users` table: Basic authentication (id, username, password)
- `journal_entries` table: Stores journaling practice with original text, corrected text, tense focus, AI feedback JSON, and timestamps

**ORM Choice**: Drizzle ORM provides:
- Type-safe query building
- Schema-first design with TypeScript inference
- Lightweight runtime overhead
- Easy migrations via drizzle-kit

**Data Access Pattern**: Repository pattern implemented in `storage.ts` with an `IStorage` interface and `DatabaseStorage` implementation, allowing for potential storage swapping and easier testing.

**Design Rationale**: PostgreSQL provides robust relational data handling. Drizzle was chosen over heavier ORMs (like Prisma) for its performance and TypeScript-native approach. The schema stores AI feedback as JSON to maintain flexibility as feedback structure evolves.

### Authentication & Sessions

**Current State**: Basic username/password authentication schema exists in the database, but session management is not fully implemented in the codebase shown.

**Infrastructure Present**:
- User schema with username/password fields
- Storage methods for user CRUD operations
- `connect-pg-simple` dependency for PostgreSQL-backed sessions
- Session types defined in dependencies

**Design Rationale**: The groundwork is laid for session-based authentication using PostgreSQL for session storage (avoiding memory-based sessions in production). This approach ensures sessions persist across server restarts and scale horizontally.

### AI Integration

**Provider**: OpenAI API (configurable via environment variables for base URL and API key).

**AI Services** (`ai-service.ts`):
1. **Grammar Analysis**: Analyzes Spanish text with focus on specific verb tenses, returns corrections, explanations, and vocabulary
2. **Translation**: Context-aware translation with presets for different scenarios (journal, travel, arts)
3. **Chat Assistant**: Conversational practice partner for Spanish learning
4. **Dictionary Lookup**: Word/phrase lookup with conjugation tables, examples, and related words
5. **Vocabulary Extraction**: Extract vocabulary and grammar patterns from pasted text or URLs

All AI functions accept an optional `locale` parameter to generate region-specific Spanish (slang, idioms, speech patterns).

**Locale System**: Users can select a Spanish-speaking region to adjust all AI-generated content:
- Available locales: Neutral/Textbook, Puerto Vallarta/Jalisco, Mexico City, Oaxaca, Colombia, Argentina, Spain, Cuba
- Locale is stored in React context (`LocaleProvider` in `client/src/lib/locale-context.tsx`) and persists across page navigation within a session
- Locale selector appears in the sidebar navigation (desktop) and in the translator panel
- Each locale has detailed prompt instructions for regional slang, grammar variations (e.g., voseo for Argentina, vosotros for Spain)
- Translation results include `localeNotes` explaining any regional expressions used

**Prompt Engineering**: Custom system prompts guide the AI to provide:
- Tense-specific grammar feedback
- Travel-relevant vocabulary extraction
- Gentle, encouraging tone aligned with therapeutic approach
- Context-aware translations (general, journaling tone, travel phrases, arts vocabulary)
- Optional "softer alternatives" for anxiety-aware rephrasing
- Locale-specific slang, idioms, and speech patterns with explanatory notes

**Design Rationale**: OpenAI's GPT models provide high-quality language understanding and generation. The service abstraction allows swapping providers if needed. Structured JSON responses ensure predictable parsing and display in the UI.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting (via `@neondatabase/serverless`)
- **Replit Platform**: Deployment environment with custom Vite plugins for development banners, error overlays, and meta image management

### AI & Language Services
- **OpenAI API**: Language model for grammar feedback, translation, and conversational practice

### Key Libraries
- **UI Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI component library (Radix UI primitives)
- **Database ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Data Fetching**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod resolvers
- **Animation**: Framer Motion
- **Routing**: Wouter (lightweight alternative to React Router)
- **Date Handling**: date-fns

### Development Tools
- **Build Tool**: Vite for frontend, esbuild for backend
- **TypeScript**: Full-stack type safety
- **Environment Variables**: Managed via `.env` for database URL and API keys

### Design Rationale
The dependency choices prioritize developer experience, performance, and maintainability. Vite provides fast HMR and optimized builds. Drizzle offers type safety without the overhead of larger ORMs. Shadcn UI provides accessible, customizable components without runtime bundle bloat. The serverless PostgreSQL approach (Neon) simplifies database management while maintaining PostgreSQL's robustness.