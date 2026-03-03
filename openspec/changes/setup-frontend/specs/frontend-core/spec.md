## ADDED Requirements

### Requirement: React Environment Setup

The frontend application SHALL be initialized using Vite with React and TypeScript, ensuring a modern and type-safe development environment.

#### Scenario: Package installation
- **WHEN** `npm install` runs in the `InfluenceHubWeb` directory
- **THEN** core dependencies including `react`, `react-dom`, `react-router-dom`, `axios`, and `tailwindcss` SHALL be installed without errors

### Requirement: Application Routing

The application SHALL use React Router for client-side navigation, providing seamless transitions between views without full page reloads.

#### Scenario: Home Route Definition
- **WHEN** a user navigates to the root path `/`
- **THEN** the `Home` page component SHALL be rendered within the main layout

#### Scenario: 404 Handling
- **WHEN** a user navigates to a non-existent route
- **THEN** a `NotFound` or fallback page SHALL be displayed indicating the content is missing

### Requirement: API Client Configuration

The application SHALL use a centralized Axios instance for all backend communication to ensure consistent request handling.

#### Scenario: Base URL Configuration
- **WHEN** an HTTP request is made using the configured API client
- **THEN** the request URL SHALL be prefixed with the configured backend API base URL
