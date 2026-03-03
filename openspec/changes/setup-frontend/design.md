## Context

InfluenceHub requires a frontend interface to allow Brands, Influencers, and Admins to interact with the system. Currently, only the backend API projects exist. This design outlines the setup of a new React.js application within the `InfluenceHubWeb` directory.

## Goals / Non-Goals

**Goals:**
- Initialize a production-ready React + TypeScript application using Vite.
- Establish a scalable folder structure.
- Implement client-side routing with React Router v6.
- Create a reusable layout system (Header, Footer).
- Configure Tailwind CSS for styling.
- Set up Axios for API communication.

**Non-Goals:**
- Implementing full business logic for all features (Campaigns, Matching, etc.) - this is just the setup.
- Advanced state management (Redux/Zustand) setup - will be added when needed.
- Server-Side Rendering (SSR) or Next.js - sticking to SPA for simplicity as per requirements.

## Decisions

### Build Tool: Vite
- **Rationale**: Vite offers significantly faster build and hot module replacement (HMR) times compared to Create React App (CRA).
- **Alternative**: Create React App (slower, deprecated), Next.js (too complex for this MVP phase).

### Routing: React Router v6
- **Rationale**: The standard routing library for React SPAs.
- **Strategy**: Define routes in a central `App.tsx` or `routes.tsx` file.

### Styling: Tailwind CSS
- **Rationale**: Provides a utility-first approach that speeds up development and ensures design consistency without writing custom CSS files.
- **Configuration**: Standard `tailwind.config.js` setup.

### Project Structure
- **Strategy**: Standard directory structure:
    - `/src/components`: Reusable UI components (Button, Input, Header, Footer)
    - `/src/pages`: Page-level components (Home)
    - `/src/layouts`: Layout wrapper components
    - `/src/services`: API services
    - `/src/types`: TypeScript interfaces/types

### HTTP Client: Axios
- **Rationale**: Better default handling of JSON data and easier interceptor configuration than native `fetch`.

## Risks / Trade-offs

**Risk**: Backend Integration
- **Description**: The frontend might be ready before all backend endpoints are finalized.
- **Mitigation**: Mock API responses or handle errors gracefully when endpoints are missing. This setup focuses on structure, not full integration.
