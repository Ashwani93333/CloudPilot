# Git Branching Strategy & Contribution Guidelines

## 1. Branching Model

CloudPilot follows a trunk-based branching model with short-lived feature branches, ideal for iterative weekly deliverables and automated CI verification:

```
main (Production-ready, protected)
 │
 ├── release/v1.0 (Stabilization & hardening)
 │
 ├── feat/week-01-scaffolding-and-design
 ├── feat/week-02-auth-and-foundation
 ├── feat/week-03-billing-ingestion
 ├── feat/week-04-dedup-and-summaries
 ...
 └── fix/bug-description
```

## 2. Branch Naming Conventions
- Features: `feat/week-<XX>-<short-description>` (e.g. `feat/week-01-design-and-skeleton`)
- Bug fixes: `fix/<issue-description>` (e.g. `fix/csv-malformed-line-parser`)
- Documentation / Chore: `docs/<description>` or `chore/<description>`

## 3. Commit Message Standards (Conventional Commits)
Each commit should follow the format:
```
<type>(<scope>): <short imperative description>

[optional body explaining rationale and trade-offs]
```

### Allowed Types:
- `feat`: New capability or feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `test`: Adding or refactoring tests
- `refactor`: Code reorganization without functional change
- `chore`: Build system, dependencies, or Docker configuration

## 4. Definition of Done (DoD) per Branch
1. Code compiles without warnings (`./mvnw clean compile` and `npm run build`).
2. Automated unit & integration tests pass cleanly (`./mvnw test` and `npm run test`).
3. Database migrations are forward-compatible and tested via Flyway.
4. No hardcoded credentials, API keys, or raw secrets are present.
5. All public endpoints adhere to Swagger / OpenAPI standards with standard error shapes.
