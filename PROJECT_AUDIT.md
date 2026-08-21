# PROJECT_AUDIT — WalletIQ (Phase 0)

Repository: harshajith-lakshan/Experience_Pro
Branch audited: walletiq/phase1-initial
Repo ID: 1322684218
Date: 2026-08-21

Summary
-------
This audit inspects the repository to locate existing functionality that can be migrated, reused, or must be rewritten for the WalletIQ Flutter Android application. The repo contains an existing web app (HTML/CSS/JS) and a Flutter project scaffold (lib/, pubspec.yaml) added on the phase1 branch. We must preserve useful business logic from the web app while implementing a native Flutter app using Clean Architecture, secure Firebase, and an offline-first local database.

Top-level files & directories discovered
--------------------------------------
- Logo.webp
- index.html
- app.js
- script.js
- styles.css
- firebase-db.js
- assets/ (directory)
- lib/
- pubspec.yaml

lib/ contents (top-level)
- lib/core/
- lib/features/
- lib/main.dart

What this tells us
------------------
- There is a full web application present (index.html, styles.css, app.js, script.js) that implements UI and business logic in JS and likely already integrates with Firebase via firebase-db.js.
- The repository already contains a Flutter scaffold on branch walletiq/phase1-initial (lib/, pubspec.yaml and additional files pushed earlier). That scaffold includes an initial Clean/feature-based layout, theming, localization, Hive local DB usage and basic auth wiring.
- The web app likely contains reusable business logic (financial calculations, Firebase usage patterns, data models and validations) which should be examined and ported into Dart domain/data layers where appropriate.

Files/features likely reusable
-----------------------------
- firebase-db.js: likely contains Firestore data model and data access logic (security patterns, document structure, sync ideas) which can guide Firestore schema design and server timestamps usage.
- app.js and script.js: may contain business rules, validation, monetary calculation logic, and UI flows. These should be reviewed and ported to Dart domain logic where appropriate.
- styles.css and assets: UI assets (icons, images) and visual design cues can be reused to build Flutter assets and theme tokens.

Immediate risks & concerns
-------------------------
- If the web app contains financial business logic implemented with floating-point math or JS number semantics, we must not port that logic blindly; we must replace unsafe monetary arithmetic with a safe decimal/minor-unit approach in Dart (e.g., integer representing minor units or a decimal package like decimal).
- The web app may store secrets or client-only Firebase config. We must not commit any private keys or service account files into the repo.
- Branch permissions: earlier attempts to push additional CI/workflow files encountered permission errors for pushes. We must confirm we have proper write access or use PR flow.
- FlutterFire config: firebase_options.dart and google-services.json are required for full Firebase usage; these should be generated/added securely by the owner.

Initial reusable migration strategy
----------------------------------
1. Inventory: extract business logic from app.js / firebase-db.js (models, validation, calculations). Create a mapping document (web-js -> Dart) enumerating functions/classes to port.
2. Data model design: design canonical Firestore and local DB schemas, inspired by firebase-db.js but adapted for nested Firestore collections under users/{userId}/...
3. Monetary representation: adopt integer minor-unit strategy across all models and calculations (e.g., store amounts as int cents/paise/LKR cents). Create a Money utility class and unit tests.
4. Local DB: use Hive or Isar for mobile local persistence. We already scaffolded Hive usage for wallets; plan schema versioning and migrations.
5. Sync design: implement a robust sync queue with per-record sync metadata (id, createdAt, updatedAt, deletedAt, syncStatus, serverRev). Document conflict resolution strategy (optimistic with versioning + server timestamp fallback + UI conflict resolution when needed).
6. Authentication: preserve existing Firebase auth patterns used in firebase-db.js but implement them properly with FirebaseAuth in Flutter (email/password, Google, phone). Use server-side security rules.
7. Assets: reuse Logo.webp and other assets; convert CSS tokens into Material 3 theme tokens.
8. Tests: create unit tests for core financial calculations before migrating UI.

Phase 0 deliverables (this audit) — what I will add to the repo
---------------------------------------------------------------
- PROJECT_AUDIT.md (this file) written to walletiq/phase1-initial branch.
- A short checklist of next tasks and prioritized Phase 1 items.

Phase 1 plan (foundation) — prioritized tasks
--------------------------------------------
1. Finalize and lock data model prototypes (Transaction, Wallet, Category, User, Goal, Budget, Loan, RecurringTransaction, Attachment).
2. Create Money utility and unit tests for monetary arithmetic (minor-unit storage + formatting service).
3. Harden Flutter scaffold:
   - Ensure theme controller persists user theme preferences locally.
   - Add localization calls in all UI scaffolds (replace hardcoded strings with translations).
   - Add an authenticated route guard and a lightweight splash/onboarding entry.
4. Implement robust local DB foundation (Hive/Isar) with versioning and migrations.
5. Implement Auth flows (Email/Password + Google + phone skeleton) and test with Firebase test project.
6. Add CI workflow to produce debug APK artifacts on pushes to walletiq/phase1-initial (we attempted to add one — confirm permission or PR flow).
7. Create Firestore schema draft and propose Firestore security rules in a separate file (firestore.rules.example).
8. Create unit tests for core financial logic (money math, transfer rules, budget calculations).

Short-term milestones (2-week-ish cadence per milestone)
------------------------------------------------------
Milestone A (Week 1):
- Money utility + tests
- Data model prototypes
- Persist theme settings
- CI workflow for debug APK build (or PR to add if permissions missing)
- Firebase onboarding instructions for owner (how to add google-services.json and generate firebase_options.dart)

Milestone B (Week 2):
- Auth flows wired to Firebase
- Local DB schema with wallets and transactions table/box
- Add/Listing wallets and adding a basic transaction (create + update balances)
- Basic sync queue skeleton (local only)

Milestone C (Week 3):
- Dashboard totals and simple analytics using local data
- Unit tests for calculation rules
- Basic UI polishing and localization coverage for key screens

Repository changes made so far
-----------------------------
- A phase1 Flutter scaffold was added to branch walletiq/phase1-initial (app structure, theme controller, localization files and simple pages). Ensure these files are preserved and iteratively extended.

Permissions & CI note
---------------------
- I attempted to push a CI workflow and a small Dashboard UI fix; that push failed due to write-permission restrictions for some operations. If you want me to add CI files and further commits directly, either grant collaborator write access or accept a pull request from my fork. I can create a PR automatically if you prefer that flow.

Action items for the repository owner (recommended now)
-----------------------------------------------------
1. Confirm whether I may open a PR to this repository from my fork (I will commit CI files, firebase_options template, firestore rules example). Reply: YES/NO.
2. Create a Firebase project and provide either:
   - google-services.json (place it in android/app/) and confirm it will be kept out of public forks; OR
   - the Android applicationId so I can generate a firebase_options.dart template and include instructions to replace with real values.
3. Grant collaborator access if you want me to push directly (GitHub username: copilot or provide a machine user). Otherwise, PR flow is safer.
4. If you prefer to add sensitive files yourself, I will continue to produce code and CI that assumes google-services.json will be added by you.

Next immediate steps I will perform when you confirm
---------------------------------------------------
- If you allow PRs: fork the repository, commit these Phase 1 CI and small UI fixes, open a PR to walletiq/phase1-initial. I will follow up with automated checks and iterate until green.
- If you grant write access: I will push the CI workflow and dashboard fix directly to walletiq/phase1-initial and trigger a build.
- In either case I will create:
  - Money utility (lib/core/utils/money.dart) + unit tests
  - Data model stubs for Transaction, Wallet, Category (lib/models/)
  - Firestore schema draft and example security rules (firestore.rules.example)
  - CI workflow (.github/workflows/flutter_build.yml) to build a debug APK artifact

Remaining risks and open questions
---------------------------------
- Confirm branch to target (walletiq/phase1-initial) — current work uses this branch.
- Firebase credentials: do not commit google-services.json publicly. Provide a secure way to add these to CI if needed.
- Confirm whether we should use Hive or Isar for local DB. Hive is already scaffolded; Isar may offer faster queries for large datasets. My recommendation: start with Hive (already present) and move to Isar if performance issues appear.

Audit completion
----------------
This PROJECT_AUDIT.md was added to the walletiq/phase1-initial branch to document the current state and recommended migration path. Confirm the next preferred action (PR, grant access, or manual file addition) and I will proceed with the first Phase 1 implementation step: Money utility + unit tests and data model stubs.

---
Signed: Senior Flutter Architect / Full-stack Copilot
