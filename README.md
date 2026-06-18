# InfluenceHub — Architecture & Technical Design

This document describes the repository's architecture, code organization, and the technical decisions that drive the design. It is intended as a living reference for maintainers and contributors who need to understand how the system is organized and why certain choices were made. This is *not* an onboarding or installation guide.

## Repository layout (high level)

- /InfluenceHubApi — C# (.NET) backend project(s). Responsible for core business logic, data access, API surface, background processing, and integrations with external systems (social platforms, data pipelines, 3rd-party APIs).
- /InfluenceHubWeb — JavaScript frontend (React + Vite). Responsible for the user interface, dashboards, data visualizations, and client-side interactions.
- README.md — this architecture & decisions document.
- .gitignore and other repo-level config files

Note: Directory names are authoritative for the current codebase: the backend is implemented in C# and the web UI in JavaScript.

## High-level architecture

InfluenceHub is split as a two-tier application (API + SPA) with clear separation of concerns:

- Client (SPA): Single Page Application built with React and Vite. Talks to the backend using a well-defined HTTP API (JSON REST). Responsible for rendering dashboards, charts, and interactive management views.
- Server (API): C#/.NET Web API exposing domain endpoints for campaign management, attribution, analytics, and integrations. Implements business rules, access control, persistence, and background processing.
- Persistence & Analytics: The repository does not contain a concrete DB schema here, but the architecture assumes a hybrid data strategy: a relational database for transactional domain data and a purpose-built store or analytics pipeline (e.g., time-series DB, data warehouse, or Elasticsearch) for analytics and reporting.
- Background processing / integration workers: For long-running tasks (ingesting platform webhooks, processing event streams, aggregation), background jobs are preferred over synchronous requests.

This separation supports independent development, scaling, and deployment of the API and UI.

## Key components and responsibilities

- InfluenceHubApi
  - API controllers: expose endpoints grouped by domain (campaigns, creators, metrics, integrations).
  - Application / Service layer: orchestrates use cases, enforces business rules, and coordinates persistence and external calls.
  - Domain models / DTOs: domain entities and data transfer objects.
  - Persistence layer: repository pattern or ORM layer (likely Entity Framework Core for a .NET project) to interact with a relational database.
  - Integration adapters: connector modules for social platforms and tracking providers. Keep adapters small and replaceable.
  - Background workers: scheduled or queue-driven jobs for ingestion, aggregation, and export tasks. These should be isolated from the request path and idempotent.

- InfluenceHubWeb
  - Page-level routes and views: dashboards, campaign explorer, creator profiles, and reporting pages.
  - Component library: shared UI primitives, charts, and data table components.
  - Data layer: API client(s) that centralize communication with the backend; optimistic UI updates and cache strategies are handled here.
  - State management: prefer local component state and React Context for simple needs; introduce a dedicated state manager only when the app complexity requires it.

## Data model & storage decisions (guiding principles)

- Primary transactional data (campaigns, creators, assignments, payments, configuration) should live in a relational database (SQL Server or PostgreSQL). Relational guarantees and strong consistency are valuable for correctness of campaign management and billing.
- Event and time-series analytics (engagement events, impressions, conversions) should be ingested into an analytics pipeline separate from the transactional DB. Options include:
  - Stream ingestion (Kafka, Kinesis) into a data warehouse (BigQuery, Snowflake) or time-series DB.
  - ElasticSearch / OpenSearch for search-backed analytics and ad-hoc queries.
- Use Redis (or similar) for short-lived caching, rate-limiting counters, and leader-election for scheduled jobs.
- Design for data retention policies: analytics data should be partitioned and TTLed as appropriate to control cost.

## API design & versioning

- Use clear resource-oriented REST endpoints (e.g., GET /api/v1/campaigns, POST /api/v1/campaigns/:id/actions/activate).
- Include API versioning in the URL (v1) to allow iterative, non-breaking changes.
- Favor small, well-scoped endpoints that return only the data the client needs. Provide aggregation endpoints for dashboard tiles to avoid over-fetching.
- Use consistent error payloads and HTTP status codes. Include error codes in responses to enable programmatic handling by the frontend.

## Authentication & Authorization

- Authenticate requests with JWT bearer tokens or OAuth2 where applicable. For server-to-server integrations, use short-lived client credentials.
- Use role-based access control (RBAC) on top of authentication. Map permissions to domain actions (e.g., campaign.create, campaign.update, campaign.read.analytics).
- For endpoints returning sensitive PII, apply additional authorization checks and logging.

## Integration & External APIs

- Encapsulate each external integration behind a small adapter module. The adapter interface should define:
  - send(payload) / fetch(params)
  - retry/backoff behavior
  - idempotency keys for safe retries
  - transformation between the external model and the internal domain model
- Queue or buffer webhook and streaming events to avoid blocking incoming requests and to provide resilience against transient downstream failures.

## Background jobs and async processing

- All heavy or long-running work (bulk imports, data aggregation, enrichment, external API polling) should be executed in background jobs.
- Prefer message queues (RabbitMQ, SQS) or durable job processors (Hangfire, Azure Functions, or Kubernetes CronJobs) to implement retries, backoff, and failure handling.
- Design jobs to be idempotent and to expose progress and status for troubleshooting.

## Observability (logging, metrics, tracing)

- Structured logging (JSON) with correlation IDs propagated from the frontend through the API and background jobs.
- Request correlation header (e.g., X-Request-ID) to connect logs, traces and metrics.
- Instrument key events and latencies with metrics (Prometheus-friendly metrics, or cloud provider metrics).
- Distributed tracing (OpenTelemetry) to debug cross-service flows (UI → API → integrations).
- Capture business metrics separately (campaign completions, payouts, ingestion lag) and expose them to dashboards.

## Error handling & resiliency

- Use standardized error responses with machine-friendly error codes and human readable messages.
- Implement retries with exponential backoff for transient external failures.
- Circuit-breaker patterns for unstable third-party APIs to prevent cascading failures.
- Graceful shutdown for in-process background workers to finish inflight work or checkpoint progress.

## Security considerations

- Keep secrets out of the repository. Use a secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) and inject secrets at runtime.
- Enforce TLS for all transport and secure cookies for any session usage.
- Apply least-privilege principles to DB users and external API credentials.
- Protect webhooks endpoints with verification (HMAC signatures, token checks) and rate-limit them.
- Regularly scan dependencies for vulnerabilities and keep the stacks up to date.

## Testing strategy

- Unit tests for business logic in the API and for critical UI components.
- Integration tests for persistence boundaries (run against a disposable DB or in-memory provider) and contract tests for external adapters (mocked endpoints).
- End-to-end tests for critical user flows in the SPA against a staging backend.
- Maintain a test-data strategy that avoids leaking production PII to test environments.

## CI / CD and deployment

- Use GitHub Actions (recommended) or another CI system to run linting, unit tests, and build steps. Gate merges on tests and static analysis.
- Build and publish container images for the API and static assets for the web UI. Store artifacts in a registry (GitHub Container Registry, Docker Hub, or cloud provider registry).
- Deployments may target a container platform (Kubernetes, Azure App Service, AWS ECS) or serverless hosting depending on operational needs. Use infrastructure-as-code (Terraform, ARM templates) for reproducible environments.
- Run database migrations as part of the deployment pipeline; ensure migrations are backward compatible where possible.

## Code quality and conventions

- API: follow .NET naming and architecture conventions (layered architecture, DI for services, small controllers, thin controllers / thick services pattern).
- Web: follow React best practices (component composition, prop-driven components, single-responsibility components). Prefer functional components and hooks.
- Use linting (ESLint / StyleCop) and formatters (Prettier / dotnet-format) in CI to maintain consistent style.

## Technical decisions — rationale

- C#/.NET for the backend: chosen for strong typing, productivity for API development, mature ecosystem for background processing and enterprise integrations, and first-class support for async processing.
- React + Vite for the frontend: fast development experience, modern bundling, and excellent integration with modern toolchains and component libraries.
- Two-tier separation (API + SPA): simplifies scaling, allows independent deployments and clearer security boundaries, and makes it easier to support multiple client types in the future (mobile apps, third-party integrations).
- Hybrid storage (relational + analytics pipeline): balances need for transactional correctness with scale & cost trade-offs for analytics workloads.
- Background jobs and adapters: keeps external integration complexity isolated and improves resiliency.

## Guidelines for contributors (architecture-aware)

- Keep changes small and focused; prefer several small PRs over a single large change.
- When adding integrations, add them as adapters following the existing adapter contract and include unit and integration tests for failure modes.
- For schema changes, include migration scripts and consider the impact on analytics pipelines and downstream consumers.
- Add architecture notes to this document when introducing new cross-cutting concerns or changing major design choices.

## Open questions / TODOs

- Define the authoritative persistence engine and include the DB schema and migration tooling in the repo.
- Formalize the integrations list and the adapter contracts for each external platform.
- Add CI configuration files and a deployment guide that maps repo artefacts to target environments.
- Add observability dashboards and sample traces to speed up on-call support.

---

If you'd like, I can:
- Commit this README update to the repository (I will update README.md in the default branch).
- Or, adjust the document to match concrete implementation details (for example, list the exact DB engine, queue system, and adapters used) if you can point me to files in the repo that confirm them.
