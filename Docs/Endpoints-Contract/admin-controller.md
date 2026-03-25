# Admin Endpoints Mapping (BE <-> FE)

All endpoints below are under `InfluenceHubApi` and require an authenticated user with role `Admin` (`[Authorize(Roles = "Admin")]` at `api/admin` controller level).

Base route: `/api/admin`

## Dashboard

### `GET /api/admin/GetDashboard`
- Parameters: none
- Response: `AdminDashboardResponse`
  - `totalUsers` (int)
  - `totalBrands` (int)
  - `totalInfluencers` (int)
  - `totalCampaigns` (int)
  - `totalApplications` (int)
  - `pendingReports` (int)
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
- FE usage:
  - Admin dashboard “overview” widget; fetch once on page load and refresh after admin actions.

## Contact Us Messages

### `GET /api/admin/GetContactMessages?isReplied={bool}`
- Parameters:
  - `isReplied` (optional, boolean)
    - omitted: returns both replied and unreplied messages
    - `true`: replied only
    - `false`: unreplied only
- Response: array of `ContactResponse`
  - `id`, `name`, `email`, `subject`, `message`, `isReplied`, `createdAt`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: invalid `isReplied` query value (cannot be parsed as boolean)
- FE usage:
  - Admin “Contact Messages” list page with optional filter.

### `PATCH /api/admin/MarkContactReplied/{messageId}`
- Parameters:
  - `messageId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: request is invalid (service raised `InvalidOperationException`/`ArgumentException`)
  - `400 Bad Request`: `messageId` is not a valid GUID
  - `404 Not Found`: messageId does not exist
- FE usage:
  - Admin “Mark replied” action; after success, refresh the contact messages list (or update row state).

## User Management (Non-Admin Users)

### `GET /api/admin/GetUsers`
- Parameters: none
- Response: array of `AdminUserResponse`
  - `id`, `email`, `role`, `isEnabled`, `createdAt`
  - Note: excludes users with role `Admin` by contract.
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
- FE usage:
  - Admin user management table/list.

### `PATCH /api/admin/EnableUser/{userId}`
- Parameters:
  - `userId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `404 Not Found`: user does not exist
  - `400 Bad Request`: target user is an `Admin`
  - `400 Bad Request`: `userId` is not a valid GUID
- FE usage:
  - “Enable” toggle in user management.

### `PATCH /api/admin/DisableUser/{userId}`
- Parameters:
  - `userId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `404 Not Found`: user does not exist
  - `400 Bad Request`: target user is an `Admin`
  - `400 Bad Request`: `userId` is not a valid GUID
- FE usage:
  - “Disable” toggle in user management.

### `DELETE /api/admin/DeleteUser/{userId}`
- Parameters:
  - `userId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `404 Not Found`: user does not exist
  - `400 Bad Request`: target user is an `Admin` or deletion blocked by dependent rows (e.g., applications)
  - `400 Bad Request`: `userId` is not a valid GUID
- FE usage:
  - “Delete user” action (admin should only show non-admin users; still handle errors).

## Campaign Management

### `GET /api/admin/GetCampaigns?status={CampaignStatus}`
- Parameters:
  - `status` (optional): `CampaignStatus` enum name
    - omitted: returns all campaigns
    - example values: `Open`, `InfluencerSelected`, `ReportSubmitted`, `Completed`, `Closed`
- Response: array of `CampaignListResponse`
  - `id`, `title`, `budget`, `deadline`, `platform`, `location`, `status`, `applicationCount`, `tags`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: invalid `status` query value (cannot be parsed as `CampaignStatus`)
- FE usage:
  - Admin campaign list page; status filter optional.

### `PATCH /api/admin/CloseCampaign/{campaignId}`
- Parameters:
  - `campaignId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: request is invalid (service raised `InvalidOperationException`/`ArgumentException`)
  - `400 Bad Request`: `campaignId` is not a valid GUID
  - `404 Not Found`: campaign not found
- FE usage:
  - “Close campaign” action.

### `DELETE /api/admin/DeleteCampaign/{campaignId}`
- Parameters:
  - `campaignId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `404 Not Found`: campaign not found
  - `400 Bad Request`: deletion blocked because applications exist
  - `400 Bad Request`: `campaignId` is not a valid GUID
- FE usage:
  - “Delete campaign” action (ensure FE handles the 400 case).

## Report Review (Admin)

### `GET /api/admin/GetReports?status={ReportStatus}`
- Parameters:
  - `status` (optional): `ReportStatus` enum name
    - omitted: returns only `Pending` reports (review queue)
    - example values: `Pending`, `Approved`, `Rejected`
- Response: array of `ReportResponse`
  - `id`, `applicationId`, `postUrl`, `postingDate`, `startDate`, `endDate`
  - `views`, `likes`, `comments`, `shares`
  - `screenshotPath`, `status`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: invalid `status` query value (cannot be parsed as `ReportStatus`)
- FE usage:
  - Admin report review queue page.
  - Use without `status` to show the pending review queue.

### `PATCH /api/admin/ApproveReport/{reportId}`
- Parameters:
  - `reportId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: request is invalid (service raised `InvalidOperationException`/`ArgumentException`)
  - `400 Bad Request`: `reportId` is not a valid GUID
  - `404 Not Found`: report not found
- FE usage:
  - Approve report action; after success, refresh the queue/list.

### `PATCH /api/admin/RejectReport/{reportId}`
- Parameters:
  - `reportId` (path, GUID)
- Response: `204 No Content`
- Error mapping:
  - `401 Unauthorized`: missing/invalid JWT
  - `403 Forbidden`: authenticated user does not have role `Admin`
  - `400 Bad Request`: request is invalid (service raised `InvalidOperationException`/`ArgumentException`)
  - `400 Bad Request`: `reportId` is not a valid GUID
  - `404 Not Found`: report not found
- FE usage:
  - Reject report action; after success, refresh the queue/list.

