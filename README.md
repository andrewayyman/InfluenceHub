# InfluenceHub — Architecture & Technical Design

This document describes the repository's architecture and the technical decisions that drive the design.

## Repository Layout

- `/InfluenceHubApi` — C# (.NET 8) backend with clean architecture (Domain, Application, Infrastructure, WebApi layers)
- `/InfluenceHubWeb` — JavaScript frontend using React 19 + Vite
- `README.md` — This architecture document

## High-Level Architecture

InfluenceHub is a two-tier application (API + SPA) with clear separation of concerns:

- **Client (SPA)**: React application built with Vite. Communicates with the backend using HTTP REST API (JSON). Handles UI rendering, forms, and client-side routing.
- **Server (API)**: C#/.NET Web API exposing resource-oriented endpoints for campaign management, applications, reports, and user authentication. Implements business logic, access control, and data persistence.
- **Database**: SQL Server relational database (using Entity Framework Core) for transactional domain data.

## Key Implemented Components

### Backend (C# / .NET 8)

**Architecture Layers:**
- **Domain Layer** (`InfluenceHub.Domain`): Entity definitions, enums (UserRole, CampaignStatus, ApplicationStatus, BudgetType), and repository interfaces
- **Application Layer** (`InfluenceHub.Application`): Service layer with business logic, DTOs for request/response, validators (using Formik/Yup-inspired patterns), and dependency injection configuration
- **Infrastructure Layer** (`InfluenceHub.Infrastructure`): Entity Framework Core DbContext, SQL Server data access, repository implementations, migrations, and file storage adapter
- **WebApi Layer** (`InfluenceHub.WebApi`): ASP.NET Core controllers, middleware, JWT authentication, CORS policy, Swagger/OpenAPI documentation, and startup configuration

**Key Technologies & Patterns:**
- **Database**: Entity Framework Core 8.0 with SQL Server
  - DbContext: `InfluenceHubDbContext` with DbSets for Users, Brands, Influencers, Campaigns, Tags, Applications, CampaignReports, ContactMessages, Reviews, Payments, CommissionSettings
  - Repository Pattern: Generic `IRepository<T>` interface with concrete implementations (UserRepository, BrandRepository, InfluencerRepository, CampaignRepository)
  - Migrations: Applied using EF Core migrations (phases tracked: Phase2, Phase3)
  - Fluent API Configuration: Entity configurations via `IEntityTypeConfiguration<T>` for constraints, indexes, and relationships

- **Authentication & Authorization**:
  - JWT Bearer token authentication (configurable via appsettings)
  - Claims-based authorization with role extraction (NameIdentifier, Role claims)
  - Role-based access control: Admin, Brand, Influencer roles
  - Seed system data on startup (admin user, predefined tags)

- **API Design**:
  - RESTful endpoints grouped by domain (campaigns, brands, influencers, applications, reports, etc.)
  - BaseApiController with protected UserId property for extracting authenticated user identity
  - Global exception handling via `GlobalExceptionHandler` middleware (maps domain exceptions to HTTP status codes)
  - CORS policy enabled for local development (localhost:5173, localhost:4173)
  - Swagger/OpenAPI integration for API documentation

- **Business Logic**:
  - Campaign management: Create, update, list campaigns with tag association and budget tracking
  - Influencer applications: Apply for campaigns (minimum 10k followers requirement), accept/reject applications
  - Report submission: Influencers submit campaign reports with screenshots and platform insights (JSON)
  - Payment processing and commission settings (Commission: 10% default)
  - Review and rating system
  - File storage: Local file upload/download via `/uploads` endpoint

- **Data Handling**:
  - JSON serialization for complex fields (Platforms array, Links array, MediaFiles array, PlatformInsights)
  - Decimal precision for financial data (Budget, ProposedBudget: 18,2 precision)
  - Timestamp tracking (CreatedAt, UpdatedAt) on most entities
  - Soft relationships via foreign keys with cascade/restrict delete behavior

### Frontend (JavaScript / React 19)

**Architecture & Setup:**
- **Build Tool**: Vite (v7.1)
- **Framework**: React 19 with Functional Components and Hooks
- **Routing**: React Router v7 (BrowserRouter with AppRouter)
- **Styling**: Tailwind CSS v4 with Vite integration

**UI Components & Libraries:**
- **Form Handling**: Formik (v2.4.9) for form state + Yup (v1.7.1) for validation
- **Charts & Data Visualization**: Recharts (v3.8.1) for dashboard analytics
- **Icons**: Lucide React (v0.577) and React Icons (v5.6)
- **Animations**: Framer Motion (v12.38) for smooth transitions
- **CSS**: Tailwind CSS (v4.2) with PostCSS and Autoprefixer

**Project Structure:**
- `/src/Components` — Reusable UI components
- `/src/Pages` — Page-level components (routes)
- `/src/layouts` — Layout wrappers
- `/src/routes` — AppRouter configuration with route definitions
- `/src/services` — API client layer for backend communication
- `/src/context` — React Context for global state (AuthContext for authentication state)
- `/src/hooks` — Custom React hooks
- `/src/utils` — Helper functions and utilities
- `/src/assets` — Images and static assets

**State Management:**
- React Context API (AuthContext) for authentication state
- Component-level state via React hooks (useState, useReducer, useEffect)
- No external state manager (Redux/Zustand) implemented

**Development & Quality:**
- ESLint (v9) with React hooks plugin for code quality
- Vite dev server with HMR (Hot Module Replacement)
- Build optimization via Vite
- Scripts: `dev` (start dev server), `build` (production build), `lint`, `preview` (preview build)

## Data Model & Storage

**Entities Implemented:**
- Users: Email authentication, password hashing (SHA256 + Base64), role-based (Admin, Brand, Influencer)
- Brands: Company/brand profiles linked to users
- Influencers: Creator profiles with follower count, bio, platforms, and tags
- Campaigns: Marketing campaigns created by brands with budget, deadline, location, platforms, and tags
- Applications: Influencer applications to campaigns with proposal, budget, media files, and status tracking
- CampaignReports: Post-campaign reports with screenshots and platform-specific insights
- Tags: Predefined content tags (Lifestyle, Fashion, Beauty, Fitness, Travel, Food, Tech, Gaming, Finance, Education, Health, Parenting, Home Decor, Comedy, Music, Sports, Sustainability, Luxury)
- Relationships: CampaignTag, InfluencerTag (join tables), ContactMessages, Reviews, Payments, CommissionSettings

**Constraints & Indexes:**
- Unique indexes on Email (Users), UserId (Brands)
- Composite unique indexes on (CampaignId, InfluencerId) for Applications
- Status and Deadline indexes on Campaigns for query optimization
- Foreign key constraints with cascade/restrict delete behavior

## API Design & Endpoints

**Versioning**: v1 (in URL path: `/api/[controller]/[action]`)

**Example Endpoint Groups:**
- Campaigns: Create, update, retrieve, filter by status/tags
- Brands: Get profile, update profile, list campaigns
- Influencers: Get profile, update profile, list applications
- Applications: Submit application, accept/reject, list for campaign/user
- Reports: Submit report (with file upload), retrieve report ROI
- Auth: Register, login (JWT token response)
- Contact: Submit contact messages

**Response Format**: JSON with consistent error payloads (message field)

## Authentication & Authorization

**Token-Based**: JWT Bearer tokens with configurable issuer, audience, and signing key
**Claims**:
- NameIdentifier (user ID)
- Role (Admin, Brand, Influencer)

**Roles**:
- Admin: System administration, settings management
- Brand: Campaign creation and management
- Influencer: Apply for campaigns, submit reports

**Protected Endpoints**: Decorated with `[Authorize]` and role-specific `[Authorize(Roles = "Brand")]` attributes

## Security Considerations

- Password Hashing: SHA256 with Base64 encoding
- JWT Configuration: Issuer/Audience validation, expiry checks, signing key verification
- CORS: Restricted to configured local origins (localhost:5173, localhost:4173)
- HTTPS Redirection enabled
- File Upload Validation: Extension check and stream handling
- Secrets: Configurable via appsettings.json and environment variables (Jwt:Key, Jwt:Issuer, Jwt:Audience, ConnectionString)

## Error Handling & Validation

- **Exception Handling**: Global middleware catches InvalidOperationException, ArgumentException, UnauthorizedAccessException and maps to appropriate HTTP status codes (400, 401, 500)
- **Input Validation**: DTOs with validation attributes; service layer checks (e.g., minimum follower requirements, campaign status checks)
- **Logging**: ILogger integration in services and middleware for error tracking

## Testing Strategy

- Unit tests planned for services and validators (not yet committed to repo)
- Integration tests against Entity Framework (in-memory or LocalDb)
- Controllers tested indirectly via API calls during development

## CI / CD and Deployment

**Not yet configured** in the repository; ready for:
- GitHub Actions workflow for build, test, and publish
- Container image builds (Docker) for API and web assets
- Entity Framework migrations as part of deployment

## Code Quality & Conventions

**Backend (.NET):**
- Layered clean architecture (Domain → Application → Infrastructure → WebApi)
- Dependency Injection via ConfigureServices
- Async/await throughout
- DTOs for API request/response contracts
- Fluent API for EF Core configuration

**Frontend (React):**
- Functional components with hooks
- Component composition with single responsibility
- Formik + Yup for form handling and validation
- Tailwind CSS for styling
- ESLint for code quality

## Technical Decisions & Rationale

- **C#/.NET**: Strong typing, mature async/await support, excellent Entity Framework ecosystem, and first-class dependency injection
- **React + Vite**: Fast development experience, modern bundling, excellent dev tooling, and wide component library ecosystem
- **SQL Server + EF Core**: Relational guarantees for transactional data, migrations for schema versioning, and rich query support
- **JWT Authentication**: Stateless token-based auth, suitable for API-first architecture
- **Repository Pattern**: Abstraction layer for data access, testability, and flexibility
- **Repository Pattern**: Abstraction layer for data access, testability, and flexibility
- **React Context**: Sufficient for current auth state needs without external state manager overhead

## Not Yet Implemented

- Background job processing (mentioned in architecture but no Hangfire/queue implementation)
- Analytics pipeline (ElasticSearch, Kafka, BigQuery)
- Redis caching layer
- OpenTelemetry distributed tracing
- Circuit-breaker patterns for external APIs
- Contract tests for API integrations
- End-to-end (E2E) tests
- Production deployment configuration (Kubernetes, Azure App Service, AWS ECS)
- API versioning beyond v1

## Guidelines for Contributors

- Follow the layered architecture: changes should respect domain/application/infrastructure/presentation boundaries
- Add validators and DTOs for new request types
- Use the repository pattern for data access
- Include entity configurations for new EF Core entities
- Update migrations when modifying the database schema
- Keep controllers thin; business logic belongs in Application services
- Test critical paths and error scenarios

---

**Last Updated**: June 2026
