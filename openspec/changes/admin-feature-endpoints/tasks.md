## 1. Admin contract alignment

- [x] 1.1 Review current `AdminController` (`api/admin`) endpoints and ensure they match the spec paths/methods exactly
- [x] 1.2 Add/adjust role guards so enable/disable endpoints return `400 Bad Request` when the target user has role `Admin` (spec requirement)
- [x] 1.3 Add/extend `IAdminService` interface methods required by the new endpoints (users list/delete, campaigns list/close/delete, reports list)

## 2. Implement missing admin endpoints

- [x] 2.1 Add `GET /api/admin/GetUsers` to `AdminController` and implement service logic to return Brand/Influencer users as `id/email/role/isEnabled/createdAt`
- [x] 2.2 Add `DELETE /api/admin/DeleteUser/{userId}` to `AdminController` and implement safe deletion rules (return `404` when missing, `400` when admin role or blocked by dependencies)
- [x] 2.3 Add `GET /api/admin/GetCampaigns` to `AdminController` with optional `status` query and implement service logic returning `CampaignListResponse` items
- [x] 2.4 Add `PATCH /api/admin/CloseCampaign/{campaignId}` to `AdminController` and implement service logic to set `CampaignStatus.Closed`
- [x] 2.5 Add `DELETE /api/admin/DeleteCampaign/{campaignId}` to `AdminController` and implement dependency checks so delete returns `400` when applications exist
- [x] 2.6 Add `GET /api/admin/GetReports` to `AdminController` with optional `status` query and implement service logic returning `ReportResponse` (default: `Pending`)

## 3. Documentation: BE/FE endpoint mapping

- [x] 3.1 Create `Docs/Endpoints-Contract/admin-controller.md` with a one-to-one mapping of every admin endpoint in the spec to:
      - method and route
      - query/path parameters
      - request/response types
      - FE usage notes (what screens/actions should call it)
- [x] 3.2 Ensure the mapping doc uses the exact route patterns from controllers (`api/admin/...`) including param names like `isReplied`

## 4. Verification

- [x] 4.1 Build the backend solution (`InfluenceHubApi`) to ensure the new DTOs/controller/service methods compile
- [ ] 4.2 Manually verify admin endpoints behavior via Swagger/curl for at least:
      - `/api/admin/GetDashboard`
      - `/api/admin/GetContactMessages`
      - `/api/admin/GetUsers` + enable/disable/delete
      - `/api/admin/GetCampaigns` + close/delete
      - `/api/admin/GetReports` + approve/reject

