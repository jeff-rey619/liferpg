# Life RPG — Specification

This folder contains the planning documents for the Life RPG project. It describes a greenfield responsive web application; no application code is included here.

## Documents

- [Product requirements and roadmap](PRD.md) — vision, principles, MVP, exclusions, phases, flows, and interaction/design requirements.
- [Technical architecture](architecture.md) — recommended stack, modular boundaries, domain model, schema relationships, API/security model, data consistency, testing, and risks.
- [Atomic implementation backlog](backlog.md) — dependency-linked tasks with scope, data/API changes, test coverage, acceptance criteria, and definition of done.

## Planning assumptions

- Initial client: responsive web, usable on desktop and mobile browsers.
- Recommended architecture: TypeScript modular monolith, Next.js, PostgreSQL, Drizzle migrations, and Auth.js-backed sessions.
- MVP excludes public social features, native apps, push/email/SMS delivery, arbitrary achievement scripting, and health/finance records.
- This folder is planning documentation only. Implementation should begin only after this plan is reviewed and approved.
