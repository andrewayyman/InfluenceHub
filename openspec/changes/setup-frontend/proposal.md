## Why

The InfluenceHub platform currently consists only of backend services. To enable user interaction for Brands, Influencers, and Admins, a web-based frontend is required. This change establishes the foundational React application, enabling development of user-facing features.

## What Changes

- Initialize a new React.js application in `InfluenceHubWeb`.
- configure project structure (folders for components, pages, hooks, services).
- Implement core routing using React Router.
- Create a shared layout system with Header, Footer, and navigation.
- Set up a styling framework (Tailwind CSS) for consistent, simple design.
- Configure a base HTTP client (Axios) for API communication.

## Capabilities

### New Capabilities

- `frontend-core`: Foundation of the web application including routing, state management setup, and API client configuration.
- `ui-components`: Reusable design system components (buttons, inputs, cards) and structural layouts (header, footer).

### Modified Capabilities

<!-- No existing capabilities are being modified as this is a greenfield frontend setup. -->
None.

## Impact

- **New Code**: Complete React application structure in `InfluenceHubWeb/`.
- **Dependencies**: New `package.json` with React, React Router, Tailwind CSS, Axios, and other standard frontend libraries.
- **System**: Enbles the UI layer to communicate with the existing `InfluenceHubApi`.
