## Why

The platform already has partial admin support in `InfluenceHubApi`, but the admin panel requirements (from `Docs/Proposal.txt`) include additional capabilities: full user management (enable/disable/delete), campaign management (close/delete), and a complete report review workflow (review queue).

This change validates the admin contract end-to-end by:
- Defining the complete set of required Admin API endpoints and their behaviors (what the FE should rely on).
- Aligning those requirements with the current backend implementation.
- Adding any missing backend endpoints and producing a BE/FE endpoint mapping document under `Docs/` for consistent implementation.

## What Changes

- Extend existing admin API (`api/admin/...`) to cover the full admin requirements.
- Add missing admin endpoints for campaign management, user deletion, and report queue retrieval.
- Introduce/extend application-layer services and DTOs needed to support the endpoints.
- Create `Docs/` documentation that maps each BE admin endpoint to its expected FE usage.

## Capabilities

### New Capabilities
- `admin-endpoints`: Define and implement the full Admin API contract (dashboard, contact messages, user management, campaign management, report review queue + approve/reject) including request/response behavior that the FE can consume.

### Modified Capabilities
<!-- None. We are defining a new consolidated admin endpoint contract for this change. -->

## Impact

- **Backend**: `InfluenceHubApi/InfluenceHub.WebApi`, `InfluenceHubApi/InfluenceHub.Application`
- **New API surface**: `api/admin/...` endpoints used by the admin panel FE
- **Documentation**: `Docs/admin-endpoints-mapping.md` (BE/FE endpoint mapping)

