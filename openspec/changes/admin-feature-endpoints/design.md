## Context

The backend currently contains an `AdminController` (`api/admin`) with the following admin capabilities:
- Dashboard statistics (`GET /api/admin/GetDashboard`)
- Contact message management: list + mark replied (`GET /api/admin/GetContactMessages`, `PATCH /api/admin/MarkContactReplied/{messageId}`)
- User enable/disable (`PATCH /api/admin/EnableUser/{userId}`, `PATCH /api/admin/DisableUser/{userId}`)
- Report review: approve/reject (`PATCH /api/admin/ApproveReport/{reportId}`, `PATCH /api/admin/RejectReport/{reportId}`)

From `Docs/Proposal.txt`, the admin panel also requires:
- User deletion (in addition to enable/disable)
- Campaign management (close/delete, plus listing so the FE can build workflows)
- Report review queue/listing (so the FE can display items to approve/reject)

The domain model includes referential constraints that can block hard deletes (notably `Application` relationships using `DeleteBehavior.Restrict`), so delete operations must validate dependencies and return safe failures.

## Goals / Non-Goals

**Goals:**
- Define a complete Admin API contract (endpoints + behavior) that the FE can rely on.
- Implement missing admin endpoints required by the admin panel:
  - Admin user listing + delete
  - Admin campaign listing + close/delete
  - Admin report listing (review queue) + approve/reject (already present)
- Produce `Docs/Endpoints-Contract/admin-controller.md` mapping each BE endpoint to expected FE usage.
- Align the API contract precisely with the current routing/authorization style in the repo (`[Authorize(Roles = "Admin")]`, `api/[controller]/[action]` routing).

**Non-Goals:**
- Implement the FE admin UI itself.
- Add pagination/filtering frameworks beyond simple `status` query parameters (unless required by existing code patterns).
- Change the authentication mechanism or role claims.

## Decisions

1. Extend the existing `AdminController` rather than introducing new admin controllers.
   - Rationale: all current admin endpoints already live under `api/admin`, and keeping one controller reduces FE mapping complexity.

2. Keep business logic in `InfluenceHub.Application.Services.AdminService` (and extend `IAdminService`).
   - Rationale: controller methods should remain thin and consistent with existing patterns.

3. Reuse existing DTOs where they fit:
   - Campaign listing responses will reuse `CampaignListResponse`.
   - Report listing responses will reuse `ReportResponse`.
   - Admin dashboard responses already use `AdminDashboardResponse`.

4. Introduce a new DTO for admin user listing (since there is no existing user-list response type).
   - Example fields: `Id`, `Email`, `Role`, `IsEnabled`, `CreatedAt`.

5. Implement delete operations with explicit integrity checks before calling repository `Delete(...)`.
   - Campaign delete:
     - If the campaign has related `Application` rows, treat as invalid operation and fail safely.
   - User delete:
     - If the user is a Brand/Influencer that participates in campaigns with applications, treat as invalid operation and fail safely.

6. Use enum-typed query parameters for listing filters:
  - `GET /api/admin/GetCampaigns?status=<CampaignStatus>`
  - `GET /api/admin/GetReports?status=<ReportStatus>`

## Risks / Trade-offs

- [Risk] Hard deletes can fail due to `DeleteBehavior.Restrict` on `Application` relationships.
  - [Mitigation] Validate dependencies in service methods and return a safe `400` via thrown `InvalidOperationException`.
- [Risk] Listing endpoints without pagination can return large result sets.
  - [Mitigation] Keep the initial contract simple; if result sizes become large, introduce pagination later without breaking the endpoint shapes.
- [Risk] FE/BE contract drift if response DTOs are changed without updating mapping docs.
- [Mitigation] Generate/maintain `Docs/Endpoints-Contract/admin-controller.md` as a single source of truth tied to the spec.

## Migration Plan

- No DB migration is expected (endpoint changes reuse existing entities/fields).
- Code changes will be limited to:
  - controller/service/DTO additions
 - new `Docs/Endpoints-Contract/admin-controller.md`

Rollout:
1. Deploy BE changes.
2. Update the FE admin panel to use the documented endpoints and response shapes.

## Open Questions

- Should campaign listing default to `Open` only, or return all statuses when `status` is omitted?
- Should user listing exclude `Admin` role users by default (to prevent accidental admin deletion)?

